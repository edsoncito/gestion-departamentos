export function formatMoney(value: number) {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
  }).format(value)
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
