import { Link } from 'react-router-dom'
import { DepartmentPaymentsChart } from '../../components/dashboard/DepartmentPaymentsChart'
import { DepartmentSnapshotCard, type DepartmentSnapshot } from '../../components/dashboard/DepartmentSnapshotCard'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusPill } from '../../components/ui/StatusPill'
import { useRentalData } from '../../context/RentalDataContext'
import type { Payment } from '../../types/database'
import {
  capitalize,
  currentPeriod,
  formatMoney,
  formatPeriod,
  isSameMonth,
  monthsLate,
  paymentState,
  periodKey,
} from '../../utils/format'

const sum = <T,>(items: T[], pick: (item: T) => number) => items.reduce((total, item) => total + pick(item), 0)

function todayLabel() {
  return capitalize(
    new Intl.DateTimeFormat('es-BO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()),
  )
}

export function DashboardPage() {
  const { data, loading } = useRentalData()
  const departments = data?.departments ?? []
  const contracts = data?.contracts ?? []
  const payments = data?.payments ?? []
  const tenants = data?.tenants ?? []
  const thisMonth = currentPeriod()

  const contractById = new Map(contracts.map((contract) => [contract.id, contract]))
  const departmentById = new Map(departments.map((department) => [department.id, department]))
  const departmentOf = (payment: Payment) => departmentById.get(contractById.get(payment.contractId)?.departmentId ?? '')
  const paymentsOf = (departmentId: string) =>
    payments.filter((payment) => contractById.get(payment.contractId)?.departmentId === departmentId)

  const currentPayments = payments
    .filter((payment) => periodKey(payment.period) === thisMonth && payment.status !== 'CANCELADO')
    .sort((left, right) => (departmentOf(left)?.name ?? '').localeCompare(departmentOf(right)?.name ?? ''))
  const expected = sum(currentPayments, (payment) => payment.expectedAmount)
  const collectedPeriod = sum(currentPayments.filter((payment) => payment.status === 'PAGADO'), (payment) => payment.paidAmount ?? 0)
  const percent = expected ? Math.round((collectedPeriod / expected) * 100) : 0
  const openCurrent = currentPayments.filter((payment) => payment.status !== 'PAGADO')
  const latePayments = payments.filter((payment) => paymentState(payment) === 'late')
  const lateDepartmentCount = new Set(latePayments.map((payment) => contractById.get(payment.contractId)?.departmentId)).size
  const paidPayments = payments.filter((payment) => payment.status === 'PAGADO')
  const collectedMonth = sum(
    paidPayments.filter((payment) => isSameMonth(payment.paidAt)),
    (payment) => payment.paidAmount ?? 0,
  )
  const totalIncome = sum(paidPayments, (payment) => payment.paidAmount ?? 0)
  const occupied = departments.filter((department) => contracts.some((contract) => contract.departmentId === department.id && contract.status === 'ACTIVO')).length
  const todo = payments
    .filter((payment) => ['late', 'due'].includes(paymentState(payment)))
    .sort((left, right) => left.period.localeCompare(right.period))
  const paymentsByDepartment = departments
    .map((department) => {
      const paid = paymentsOf(department.id).filter((payment) => payment.status === 'PAGADO')
      return { amount: sum(paid, (payment) => payment.paidAmount ?? 0), id: department.id, name: department.name, paymentCount: paid.length }
    })
    .sort((left, right) => right.amount - left.amount || left.name.localeCompare(right.name))
  const departmentSnapshots: DepartmentSnapshot[] = departments.map((department) => {
    const ownPayments = paymentsOf(department.id)
    const pending = ownPayments.filter((payment) => ['late', 'due'].includes(paymentState(payment)))
      .sort((left, right) => left.period.localeCompare(right.period))
    const overdueCount = pending.filter((payment) => paymentState(payment) === 'late').length
    const current = ownPayments.filter((payment) => periodKey(payment.period) === thisMonth && payment.status !== 'CANCELADO')
    const latestPaid = ownPayments.filter((payment) => payment.status === 'PAGADO' && payment.paidAt)
      .sort((left, right) => (right.paidAt ?? '').localeCompare(left.paidAt ?? ''))[0]
    const activeContract = contracts.find((contract) => contract.departmentId === department.id && contract.status === 'ACTIVO')
    const tenant = tenants.find((item) => item.id === activeContract?.tenantId)
    const status = overdueCount
      ? { label: `${overdueCount} atrasada${overdueCount === 1 ? '' : 's'}`, tone: 'late' as const }
      : pending.length
        ? { label: 'Pendiente este mes', tone: 'due' as const }
        : current.length && current.every((payment) => payment.status === 'PAGADO')
          ? { label: 'Mes pagado', tone: 'paid' as const }
          : activeContract
            ? { label: 'Sin registro del mes', tone: 'neutral' as const }
            : { label: department.status === 'ACTIVO' ? 'Disponible' : department.status === 'MANTENIMIENTO' ? 'Mantenimiento' : 'Inactivo', tone: 'neutral' as const }

    return {
      id: department.id,
      name: department.name,
      tenantName: tenant?.fullName ?? null,
      status: status.label,
      tone: status.tone,
      pendingCount: pending.length,
      overdueCount,
      pendingAmount: sum(pending, (payment) => payment.expectedAmount),
      expectedThisMonth: sum(current, (payment) => payment.expectedAmount),
      collectedThisMonth: sum(current.filter((payment) => payment.status === 'PAGADO'), (payment) => payment.paidAmount ?? 0),
      hasCurrentPeriod: current.length > 0,
      lastPaidAt: latestPaid?.paidAt ?? null,
      lastPaidPeriod: latestPaid?.period ?? null,
      nextPaymentId: pending[0]?.id ?? null,
    }
  })
  const monthName = new Intl.DateTimeFormat('es-BO', { month: 'short' }).format(new Date()).replace('.', '')
  const line = 'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 border-t border-[var(--border-soft)] px-5 py-3.5 first:border-t-0'

  if (!data) {
    return (
      <section className="space-y-6">
        <PageHeader eyebrow={todayLabel()} title="Resumen" description="Cobros, atrasos y ocupación de tus departamentos." />
        <p className="panel p-6 text-sm text-[var(--muted)]">
          {loading ? 'Cargando la información de tus departamentos…' : 'No hay datos disponibles. Revisá la conexión con Google Sheets y volvé a intentar.'}
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={todayLabel()}
        title="Resumen"
        description="Cobros, atrasos y ocupación de tus departamentos, según tu hoja de Google Sheets."
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section aria-labelledby="hero-title" className="flex min-w-0 flex-col justify-between gap-6 rounded-[22px] border border-[var(--hero-line)] bg-[var(--hero)] p-5 text-[var(--hero-ink)] sm:p-7">
          <p id="hero-title" className="eyebrow !text-[var(--hero-dim)]">Mensualidades de {formatPeriod(`${thisMonth}-01`)}</p>
          <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
            <strong className="font-display text-[clamp(2rem,7vw,4rem)] font-bold leading-none tracking-[-0.03em]">{formatMoney(collectedPeriod)}</strong>
            <span className="text-[var(--hero-dim)]">cobrados de {formatMoney(expected)}</span>
          </div>
          <div>
            <div className="h-3 overflow-hidden rounded-full bg-[rgb(255_255_255/18%)]" role="img" aria-label={`${percent}% del importe previsto para ${formatPeriod(`${thisMonth}-01`)} cobrado`}>
              <div className="h-full rounded-full bg-[var(--hero-fill)]" style={{ width: `${Math.min(percent, 100)}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 text-[13.5px] text-[var(--hero-dim)]">
              <span><b className="font-semibold text-[var(--hero-ink)]">{percent}%</b> cobrado</span>
              <span>
                {!currentPayments.length
                  ? 'Sin mensualidades programadas'
                  : openCurrent.length
                  ? <><b className="font-semibold text-[var(--hero-ink)]">{openCurrent.length}</b> por cobrar ({formatMoney(sum(openCurrent, (payment) => payment.expectedAmount))})</>
                  : 'Todo cobrado este mes'}
              </span>
            </div>
          </div>
        </section>

        <section className="panel min-w-0 overflow-hidden" aria-label="Indicadores">
          <div className={line}>
            <span className="text-sm font-semibold">Atrasado</span>
            <span className="row-span-2 text-right font-display text-lg font-semibold tabular-nums text-[var(--danger-text)] sm:text-[1.4rem]">{formatMoney(sum(latePayments, (payment) => payment.expectedAmount))}</span>
            <span className="text-[12.5px] text-[var(--muted)]">{latePayments.length ? `${latePayments.length} mensualidad${latePayments.length === 1 ? '' : 'es'} · ${lateDepartmentCount} departamento${lateDepartmentCount === 1 ? '' : 's'}` : 'Sin atrasos'}</span>
          </div>
          <div className={line}>
            <span className="text-sm font-semibold">Cobrado en {monthName}</span>
            <span className="row-span-2 text-right font-display text-lg font-semibold tabular-nums sm:text-[1.4rem]">{formatMoney(collectedMonth)}</span>
            <span className="text-[12.5px] text-[var(--muted)]">Según la fecha real de pago</span>
          </div>
          <div className={line}>
            <span className="text-sm font-semibold">Ocupación</span>
            <span className="row-span-2 text-right font-display text-lg font-semibold tabular-nums sm:text-[1.4rem]">{occupied} de {departments.length}</span>
            <span className="text-[12.5px] text-[var(--muted)]">{departments.length - occupied ? `${departments.length - occupied} sin alquiler activo` : 'Todos con alquiler'}</span>
          </div>
          <div className={line}>
            <span className="text-sm font-semibold">Total histórico</span>
            <span className="row-span-2 text-right font-display text-lg font-semibold tabular-nums sm:text-[1.4rem]">{formatMoney(totalIncome)}</span>
            <span className="text-[12.5px] text-[var(--muted)]">{paidPayments.length} pagos registrados</span>
          </div>
        </section>
      </div>

      <section aria-labelledby="departments-title">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 id="departments-title" className="font-display text-lg font-semibold">Situación por departamento</h3>
            <p className="mt-1 text-[13px] text-[var(--muted)]">Deudas, cobros del mes y último pago, de un vistazo.</p>
          </div>
          <Link to="/departamentos" className="text-sm font-semibold text-[var(--primary)] hover:underline">Ver todos →</Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {departmentSnapshots.map((item) => <DepartmentSnapshotCard key={item.id} item={item} />)}
        </div>
        {!departments.length ? <p className="panel p-6 text-center text-sm text-[var(--muted)]">Todavía no hay departamentos registrados.</p> : null}
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section className="panel p-5 sm:p-6" aria-labelledby="todo-title">
          <h3 id="todo-title" className="font-display text-base font-semibold">Para cobrar</h3>
          <p className="mt-0.5 text-[13px] text-[var(--muted)]">Vence el último día de cada mes. Primero las más antiguas.</p>
          <div className="mt-3">
            {todo.map((payment) => {
              const department = departmentOf(payment)
              const contract = contractById.get(payment.contractId)
              const tenant = tenants.find((item) => item.id === contract?.tenantId)
              const late = paymentState(payment) === 'late'
              const months = monthsLate(periodKey(payment.period))
              return (
                <div key={payment.id} className="grid items-center gap-x-4 gap-y-2 border-t border-[var(--border-soft)] py-3.5 first:border-t-0 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <div className="min-w-0">
                    <p className="font-semibold">{department?.name} · {capitalize(formatPeriod(payment.period))}</p>
                    <p className="text-[13px] text-[var(--muted)]">{tenant?.fullName ?? '—'} · {formatMoney(payment.expectedAmount)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
                    <StatusPill tone={late ? 'late' : 'due'}>{late ? `Atrasado ${months} ${months === 1 ? 'mes' : 'meses'}` : 'Vence este mes'}</StatusPill>
                    <Link
                      to={`/departamentos/${department?.id}?pago=${payment.id}`}
                      className="inline-flex min-h-9 items-center rounded-xl bg-[var(--primary)] px-3.5 text-[13px] font-semibold text-[var(--on-primary)] hover:bg-[var(--primary-hover)]"
                    >
                      Registrar
                    </Link>
                  </div>
                </div>
              )
            })}
            {!todo.length ? <p className="py-6 text-center text-sm text-[var(--muted)]">No hay mensualidades por cobrar.</p> : null}
          </div>
        </section>

        <DepartmentPaymentsChart items={paymentsByDepartment} />
      </div>
    </section>
  )
}
