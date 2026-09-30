export function formatMoney(value: number) {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
  }).format(value)
}

export function paymentState(payment: {
  period: string
  status: 'PAGADO' | 'PENDIENTE' | 'CANCELADO'
}): PaymentState {
  if (payment.status === 'PAGADO') return 'paid'
  if (payment.status === 'CANCELADO') return 'cancel'
  if (isPeriodOverdue(payment.period)) return 'late'
  return isPeriodDue(payment.period) ? 'due' : 'future'
}

export function formatDate(value: string | null) {
  if (!value) return '—'
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

export function formatPeriod(value: string) {
  const [year, month] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('es-BO', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1))
}

export function toDateInputValue(value = new Date()) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isSameMonth(isoDate: string | null, comparison = new Date()) {
  if (!isoDate) return false
  const [year, month] = isoDate.split('-').map(Number)
  return year === comparison.getFullYear() && month === comparison.getMonth() + 1
}

export function isPeriodDue(isoDate: string, comparison = new Date()) {
  const [year, month] = isoDate.split('-').map(Number)
  const periodValue = year * 12 + month
  const comparisonValue = comparison.getFullYear() * 12 + comparison.getMonth() + 1
  return periodValue <= comparisonValue
}

export function isPeriodOverdue(isoDate: string, comparison = new Date()) {
  const [year, month] = isoDate.split('-').map(Number)
  const periodValue = year * 12 + month
  const comparisonValue = comparison.getFullYear() * 12 + comparison.getMonth() + 1
  return periodValue < comparisonValue
}

export type PaymentState = 'paid' | 'late' | 'due' | 'future' | 'cancel'

export function periodKey(value: string) {
  return value.slice(0, 7)
}

export function currentPeriod(comparison = new Date()) {
  return `${comparison.getFullYear()}-${String(comparison.getMonth() + 1).padStart(2, '0')}`
}

/** Últimos `count` periodos (YYYY-MM), el más reciente al final. */
export function lastPeriods(count = 12, comparison = new Date()) {
  const current = comparison.getFullYear() * 12 + comparison.getMonth()
  return Array.from({ length: count }, (_, index) => {
    const value = current - (count - 1) + index
    return `${Math.floor(value / 12)}-${String((value % 12) + 1).padStart(2, '0')}`
  })
}

export function monthsLate(period: string, comparison = new Date()) {
  const [year, month] = period.split('-').map(Number)
  return comparison.getFullYear() * 12 + comparison.getMonth() + 1 - (year * 12 + month)
}

export function formatMonthShort(period: string) {
  const [year, month] = period.split('-').map(Number)
  return new Intl.DateTimeFormat('es-BO', { month: 'short' })
    .format(new Date(year, month - 1, 1))
    .replace('.', '')
}

export function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
}
