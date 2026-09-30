import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DepartmentEditorModal } from '../../components/departments/DepartmentEditorModal'
import { Icon } from '../../components/ui/Icon'
import { PageHeader } from '../../components/ui/PageHeader'
import { PaymentCell } from '../../components/ui/PaymentStrip'
import { cellLabel, findPayment } from '../../components/ui/paymentStripUtils'
import { StatusPill } from '../../components/ui/StatusPill'
import { useRentalData } from '../../context/RentalDataContext'
import type { Department, DepartmentInput } from '../../types/database'
import {
  currentPeriod,
  formatDate,
  formatMoney,
  formatMonthShort,
  initials,
  lastPeriods,
  paymentState,
  periodKey,
} from '../../utils/format'

const EMPTY_DEPARTMENT: DepartmentInput = {
  name: '',
  address: '',
  description: '',
  status: 'ACTIVO',
}

type Filter = 'todos' | 'ocupados' | 'disponibles' | 'fuera'

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'todos', label: 'Todos' },
  { id: 'ocupados', label: 'Ocupados' },
  { id: 'disponibles', label: 'Disponibles' },
  { id: 'fuera', label: 'Fuera de servicio' },
]

function occupancyLabel(department: Department) {
  if (department.status === 'MANTENIMIENTO') return 'En mantenimiento'
  return department.status === 'ACTIVO' ? 'Disponible' : 'Inactivo'
}

export function DepartmentsPage() {
  const { createDepartment, data, departmentViews } = useRentalData()
  const [showEditor, setShowEditor] = useState(false)
  const [filter, setFilter] = useState<Filter>('todos')
  const periods = lastPeriods(12)
  const thisMonth = currentPeriod()

  const matches = (occupied: boolean, department: Department, id: Filter) =>
    id === 'todos'
    || (id === 'ocupados' && occupied)
    || (id === 'disponibles' && !occupied && department.status === 'ACTIVO')
    || (id === 'fuera' && department.status !== 'ACTIVO')

  const visible = departmentViews.filter((department) => matches(Boolean(department.contract), department, filter))

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <PageHeader
          eyebrow="Inmuebles"
          title="Departamentos"
          description="Contrato vigente, inquilino y situación mensual de cada inmueble."
        />
        <button
          type="button"
          onClick={() => setShowEditor(true)}
          className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--on-primary)] hover:bg-[var(--primary-hover)] sm:w-auto"
        >
          <Icon name="plus" size={18} />
          Nuevo departamento
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar departamentos">
        {FILTERS.map((item) => {
          const count = departmentViews.filter((department) => matches(Boolean(department.contract), department, item.id)).length
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
              className={`min-h-9 rounded-full border px-4 text-[13.5px] font-semibold ${filter === item.id ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--on-primary)]' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--primary)]'}`}
            >
              {item.label}
              <small className="ml-1.5 font-mono text-[11px] opacity-80">{count}</small>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-5">
        {visible.map((department) => {
          const contractIds = new Set(
            data?.contracts.filter((contract) => contract.departmentId === department.id).map((contract) => contract.id),
          )
          const own = (data?.payments ?? []).filter((payment) => contractIds.has(payment.contractId))
          const overdueCount = own.filter((payment) => paymentState(payment) === 'late').length
          const currentPayment = own.find(
            (payment) => periodKey(payment.period) === thisMonth && payment.contractId === department.contract?.id,
          )
          const pill = department.contract
            ? overdueCount
              ? <StatusPill tone="late">{overdueCount} atrasado{overdueCount === 1 ? '' : 's'}</StatusPill>
              : currentPayment && paymentState(currentPayment) === 'due'
                ? <StatusPill tone="due">Vence este mes</StatusPill>
                : <StatusPill tone="paid">Al día</StatusPill>
            : <StatusPill tone="neutral">{occupancyLabel(department)}</StatusPill>

          return (
            <Link
              key={department.id}
              to={`/departamentos/${department.id}`}
              className="panel group flex flex-col overflow-hidden transition duration-150 hover:-translate-y-0.5 hover:border-[var(--primary)]"
            >
              <div className="grid gap-3.5 bg-gradient-to-b from-[var(--accent-soft)] to-[var(--surface)] px-5 pb-4 pt-[18px]">
                <div className="flex items-center justify-between gap-2.5">
                  <span className="eyebrow rounded-full bg-[var(--surface)] px-2.5 py-0.5 !text-[var(--text)]">{department.id}</span>
                  {pill}
                </div>
                <div>
                  <h3 className="font-display text-[1.4rem] font-semibold leading-tight tracking-[-0.015em]">{department.name}</h3>
                  <p className="mt-0.5 text-[13px] text-[var(--muted)]">{department.address || 'Sin dirección registrada'}</p>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-4 px-5 pb-[18px] pt-1">
                <div className="flex min-w-0 items-center gap-2.5 rounded-[14px] bg-[var(--sunk)] px-3 py-2.5">
                  <span aria-hidden="true" className="grid size-[30px] shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] font-display text-[11px] font-bold text-[var(--primary)]">
                    {department.tenant ? initials(department.tenant.fullName) : '–'}
                  </span>
                  <span className={`truncate text-sm ${department.tenant ? 'font-medium' : 'text-[var(--muted)]'}`}>
                    {department.tenant?.fullName ?? 'Sin inquilino activo'}
                  </span>
                </div>

                <dl className="grid grid-cols-2 gap-3">
                  <div className="rounded-[14px] border border-[var(--border-soft)] px-3 py-2.5">
                    <dt className="eyebrow">Mensual</dt>
                    <dd className="mt-0.5 font-semibold">{department.contract ? formatMoney(department.contract.monthlyAmount) : '—'}</dd>
                  </div>
                  <div className="rounded-[14px] border border-[var(--border-soft)] px-3 py-2.5">
                    <dt className="eyebrow">Contrato hasta</dt>
                    <dd className="mt-0.5 font-semibold">{formatDate(department.contract?.endDate ?? null)}</dd>
                  </div>
                </dl>

                <div>
                  <div className="grid grid-cols-12 gap-[3px]" aria-hidden="true">
                    {periods.map((period) => (
                      <PaymentCell key={period} compact label={cellLabel(department.name, period)} payment={findPayment(own, period)} />
                    ))}
                  </div>
                  <div className="mt-1.5 flex justify-between font-mono text-[10px] uppercase tracking-wide text-[var(--muted)]">
                    <span>{formatMonthShort(periods[0])} {periods[0].slice(2, 4)}</span>
                    <span>Últimos 12 meses</span>
                    <span>{formatMonthShort(periods[11])} {periods[11].slice(2, 4)}</span>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between text-[13px] font-semibold text-[var(--primary)]">
                  <span>Ver detalle</span>
                  <span className="grid size-[30px] place-items-center rounded-full bg-[var(--accent-soft)]"><Icon name="arrow" size={16} /></span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
      {!visible.length ? (
        <p className="panel p-8 text-center text-sm text-[var(--muted)]">
          {departmentViews.length ? 'No hay departamentos en este filtro.' : 'No hay departamentos registrados.'}
        </p>
      ) : null}

      {showEditor ? (
        <DepartmentEditorModal
          eyebrow="Nuevo inmueble"
          title="Crear departamento"
          initialValue={EMPTY_DEPARTMENT}
          onClose={() => setShowEditor(false)}
          onSubmit={async (input) => {
            await createDepartment(input)
            setShowEditor(false)
          }}
        />
      ) : null}
    </section>
  )
}
