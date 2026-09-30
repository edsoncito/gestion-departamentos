import type { Payment } from '../../types/database'
import { formatPeriod, periodKey, type PaymentState } from '../../utils/format'

export const STATE_LABEL: Record<PaymentState, string> = {
  paid: 'Pagado',
  late: 'Atrasado',
  due: 'Vence este mes',
  future: 'Por vencer',
  cancel: 'Cancelado',
}

export function findPayment(payments: Payment[], period: string) {
  return payments.find((payment) => periodKey(payment.period) === period)
}

export function cellLabel(name: string, period: string) {
  return `${name} · ${formatPeriod(`${period}-01`)}`
}
