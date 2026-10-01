import { Link } from 'react-router-dom'
import { StatusPill, type PillTone } from '../ui/StatusPill'
import { capitalize, formatDate, formatMoney, formatPeriod } from '../../utils/format'

export interface DepartmentSnapshot {
  id: string
  name: string
  tenantName: string | null
  status: string
  tone: PillTone
  pendingCount: number
  overdueCount: number
  pendingAmount: number
  expectedThisMonth: number
  collectedThisMonth: number
  hasCurrentPeriod: boolean
  lastPaidAt: string | null
  lastPaidPeriod: string | null
  nextPaymentId: string | null
}

export function DepartmentSnapshotCard({ item }: { item: DepartmentSnapshot }) {
  const paymentLink = item.nextPaymentId
    ? `/departamentos/${item.id}?pago=${item.nextPaymentId}`
    : `/departamentos/${item.id}`

  return (
    <article className="panel flex min-w-0 flex-col p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">{item.id}</p>
          <h4 className="mt-1 font-display text-xl font-semibold leading-tight">{item.name}</h4>
          <p className="mt-1 text-[13px] text-[var(--muted)]">{item.tenantName ?? 'Sin inquilino activo'}</p>
        </div>
        <StatusPill tone={item.tone}>{item.status}</StatusPill>
      </div>

      <div className="mt-5 rounded-2xl bg-[var(--sunk)] p-4">
        <p className="eyebrow">Por cobrar hasta hoy</p>
        <p className={`mt-1 font-display text-[1.8rem] font-semibold leading-none tabular-nums ${item.overdueCount ? 'text-[var(--danger-text)]' : ''}`}>
          {formatMoney(item.pendingAmount)}
        </p>
        <p className="mt-2 text-[13px] text-[var(--muted)]">
          {item.pendingCount
            ? `${item.pendingCount} mensualidad${item.pendingCount === 1 ? '' : 'es'} pendiente${item.pendingCount === 1 ? '' : 's'}${item.overdueCount ? ` · ${item.overdueCount} atrasada${item.overdueCount === 1 ? '' : 's'}` : ''}`
            : 'Sin mensualidades pendientes'}
        </p>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="eyebrow">Este mes</dt>
          <dd className="mt-1 font-medium">
            {item.hasCurrentPeriod
              ? `${formatMoney(item.collectedThisMonth)} de ${formatMoney(item.expectedThisMonth)} cobrados`
              : 'Sin mensualidad programada'}
          </dd>
        </div>
        <div>
          <dt className="eyebrow">Último pago</dt>
          <dd className="mt-1 font-medium">
            {item.lastPaidAt && item.lastPaidPeriod
              ? `${formatDate(item.lastPaidAt)} · ${capitalize(formatPeriod(item.lastPaidPeriod))}`
              : 'Aún no hay pagos'}
          </dd>
        </div>
      </dl>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-soft)] pt-4 text-sm font-semibold">
        <Link to={`/departamentos/${item.id}`} className="text-[var(--muted)] hover:text-[var(--primary)]">
          Ver detalle
        </Link>
        {item.nextPaymentId ? (
          <Link to={paymentLink} className="inline-flex min-h-10 items-center rounded-xl bg-[var(--primary)] px-4 text-[var(--on-primary)] hover:bg-[var(--primary-hover)]">
            Registrar pago →
          </Link>
        ) : (
          <Link to={paymentLink} className="text-[var(--primary)] hover:underline">
            Abrir departamento →
          </Link>
        )}
      </div>
    </article>
  )
}
