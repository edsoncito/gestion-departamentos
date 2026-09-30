import type { Payment } from '../../types/database'
import { formatMoney, formatMonthShort, paymentState, type PaymentState } from '../../utils/format'
import { STATE_LABEL } from './paymentStripUtils'

const CELL_STYLE: Record<PaymentState | 'none', string> = {
  paid: 'bg-[var(--paid)] text-[var(--on-paid)]',
  due: 'bg-[var(--due)] text-[var(--on-due)]',
  late: 'bg-[var(--late)] text-[var(--on-late)]',
  future: 'border border-[var(--future-line)]',
  cancel: 'border border-dashed border-[var(--future-line)]',
  none: 'border border-dotted border-[var(--border)] opacity-70',
}

const GLYPH: Record<PaymentState, string> = { paid: '✓', due: '•', late: '!', future: '', cancel: '' }

const HATCH = 'repeating-linear-gradient(135deg, transparent 0 3px, var(--future-line) 3px 4px)'

interface CellProps {
  label: string
  payment: Payment | undefined
  compact?: boolean
  onSelect?: (payment: Payment) => void
}

export function PaymentCell({ label, payment, compact = false, onSelect }: CellProps) {
  const state = payment ? paymentState(payment) : 'none'
  const shape = compact ? 'h-3 rounded-full' : 'h-8 rounded-lg sm:h-8'
  const classes = `grid min-w-0 place-items-center font-mono text-xs font-bold ${shape} ${CELL_STYLE[state]}`
  const style = state === 'cancel' ? { backgroundImage: HATCH } : undefined
  const text = payment
    ? `${label} · ${STATE_LABEL[state as PaymentState]} · ${formatMoney(payment.expectedAmount)}`
    : `${label} · Sin contrato`

  if (compact || !payment || !onSelect) {
    return (
      <span className={classes} style={style} title={text} aria-hidden={compact || undefined}>
        {!compact && payment ? GLYPH[state as PaymentState] : ''}
      </span>
    )
  }

  const actionable = state === 'paid' || state === 'late' || state === 'due'
  return (
    <button
      type="button"
      title={text}
      aria-label={text}
      disabled={!actionable}
      onClick={() => onSelect(payment)}
      style={style}
      className={`${classes} ${actionable ? 'cursor-pointer hover:outline hover:outline-2 hover:outline-offset-1 hover:outline-[var(--text)]' : 'cursor-default'}`}
    >
      {GLYPH[state as PaymentState]}
    </button>
  )
}

export function StripHeader({ periods, showYear = true }: { periods: string[]; showYear?: boolean }) {
  return (
    <>
      {periods.map((period, index) => {
        const month = formatMonthShort(period)
        const year = period.slice(2, 4)
        const showYearMark = showYear && (index === 0 || period.endsWith('-01'))
        return (
          <span key={period} className="pb-1 text-center font-mono text-[10px] uppercase leading-tight tracking-wide text-[var(--muted)]">
            <span className="hidden sm:inline">{month}</span>
            <span className="sm:hidden">{month.charAt(0)}</span>
            {showYearMark ? <span className="hidden text-[9px] opacity-70 sm:block">{year}</span> : <span className="hidden text-[9px] sm:block">&nbsp;</span>}
          </span>
        )
      })}
    </>
  )
}

export function StripLegend() {
  const items: Array<{ key: PaymentState | 'none'; label: string }> = [
    { key: 'paid', label: 'Pagado' },
    { key: 'due', label: 'Vence este mes' },
    { key: 'late', label: 'Atrasado' },
    { key: 'future', label: 'Por vencer' },
    { key: 'cancel', label: 'Cancelado' },
    { key: 'none', label: 'Sin contrato' },
  ]
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[var(--muted)]" aria-label="Leyenda">
      {items.map((item) => (
        <li key={item.key} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={`size-3 rounded ${CELL_STYLE[item.key]}`}
            style={item.key === 'cancel' ? { backgroundImage: HATCH } : undefined}
          />
          {item.label}
        </li>
      ))}
    </ul>
  )
}
