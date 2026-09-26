import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader'
import { useRentalData } from '../../context/RentalDataContext'
import { formatMoney, formatPeriod, isPeriodDue, isPeriodOverdue, isSameMonth } from '../../utils/format'

export function DashboardPage() {
  const { data, departmentViews, loading } = useRentalData()
  const payments = data?.payments ?? []
  const currentMonthIncome = payments
    .filter((payment) => payment.status === 'PAGADO' && isSameMonth(payment.paidAt))
    .reduce((total, payment) => total + (payment.paidAmount ?? 0), 0)
  const totalIncome = payments.reduce(
    (total, payment) => total + (payment.paidAmount ?? 0),
    0,
  )
  const pendingPayments = payments.filter(
    (payment) => payment.status === 'PENDIENTE' && isPeriodDue(payment.period),
  )
  const pendingAmount = pendingPayments.reduce(
    (total, payment) => total + payment.expectedAmount,
    0,
  )
  const summaryItems = [
    { label: 'Cobrado este mes', value: formatMoney(currentMonthIncome), detail: 'Según la fecha real de pago' },
    { label: 'Total histórico', value: formatMoney(totalIncome), detail: `${payments.filter((item) => item.status === 'PAGADO').length} pagos registrados` },
    { label: 'Por cobrar', value: formatMoney(pendingAmount), detail: `${pendingPayments.length} mensualidades pendientes` },
  ]

  return (
    <section className="space-y-7">
      <PageHeader
        eyebrow="Panel principal"
        title="Resumen de alquileres"
        description="Estado actual de los contratos y pagos registrados en Google Sheets."
      />

      <div className="grid gap-px overflow-hidden border border-[var(--border)] bg-[var(--border)] md:grid-cols-3">
        {summaryItems.map((item) => (
          <article
            key={item.label}
            className="bg-[var(--surface)] p-5"
          >
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{item.label}</p>
            <p className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[var(--text)] sm:text-3xl">
              {loading && !data ? '—' : item.value}
            </p>
            <p className="mt-2 text-xs text-[var(--muted)]">{item.detail}</p>
          </article>
        ))}
      </div>

      <div>
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">Departamentos</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">Vencimiento: último día de cada mes</p>
          </div>
          <Link to="/departamentos" className="text-sm font-bold text-[var(--primary)] hover:underline">Ver todos</Link>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {departmentViews.map((department) => {
            const currentPayment = department.payments.find((payment) => isSameMonth(payment.period))
            const contractIds = new Set(data?.contracts
              .filter((contract) => contract.departmentId === department.id)
              .map((contract) => contract.id))
            const overdueCount = payments.filter(
              (payment) => contractIds.has(payment.contractId)
                && payment.status === 'PENDIENTE'
                && isPeriodOverdue(payment.period),
            ).length
            return (
              <Link
                key={department.id}
                to={`/departamentos/${department.id}`}
                className="group border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:border-[var(--primary)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-[var(--muted)]">{department.id}</p>
                    <h4 className="mt-1 text-lg font-bold group-hover:text-[var(--primary)]">{department.name}</h4>
                    <p className="mt-1 text-sm text-[var(--muted)]">{department.tenant?.fullName || 'Sin inquilino activo'}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-[11px] font-bold ${overdueCount ? 'bg-[var(--danger-soft)] text-[var(--danger-text)]' : currentPayment?.status === 'PAGADO' ? 'bg-[var(--success-bg)] text-[var(--success-text)]' : 'bg-[var(--warning-bg)] text-[var(--warning-text)]'}`}>
                    {overdueCount ? `${overdueCount} ATRASADO${overdueCount === 1 ? '' : 'S'}` : currentPayment ? currentPayment.status : 'SIN REGISTRO'}
                  </span>
                </div>
                <div className="mt-5 flex items-end justify-between border-t border-[var(--border-soft)] pt-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">Alquiler mensual</p>
                    <p className="mt-1 font-bold">{formatMoney(department.contract?.monthlyAmount ?? 0)}</p>
                  </div>
                  <p className="text-xs font-bold text-[var(--primary)]">Abrir detalle →</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {pendingPayments[0] ? (
        <p className="text-xs text-[var(--muted)]">
          Próximo registro pendiente: {formatPeriod(pendingPayments[0].period)}.
        </p>
      ) : null}
    </section>
  )
}
