import { formatMoney } from '../../utils/format'

interface DepartmentPaymentItem {
  amount: number
  id: string
  name: string
  paymentCount: number
}

interface DepartmentPaymentsChartProps {
  items: DepartmentPaymentItem[]
}

export function DepartmentPaymentsChart({ items }: DepartmentPaymentsChartProps) {
  const maxAmount = Math.max(0, ...items.map((item) => item.amount))

  return (
    <section className="panel p-5 sm:p-6" aria-labelledby="hist-title">
      <h3 id="hist-title" className="font-display text-base font-semibold">Cobrado por departamento</h3>
      <p className="mt-0.5 text-[13px] text-[var(--muted)]">Total pagado en todos los contratos registrados.</p>

      <div className="mt-5 space-y-4" role="img" aria-label={`Gráfico de pagos históricos de ${items.length} departamentos`}>
        {items.map((item) => {
          const percentage = maxAmount ? (item.amount / maxAmount) * 100 : 0
          const barWidth = item.amount > 0 ? Math.max(percentage, 2) : 0
          return (
            <div key={item.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold" title={item.name}>{item.name}</p>
                  <p className="text-xs text-[var(--muted)]">{item.paymentCount} pago{item.paymentCount === 1 ? '' : 's'}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums">{formatMoney(item.amount)}</p>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--sunk)]" aria-hidden="true">
                <div className="h-full rounded-full bg-[var(--primary)] transition-[width] duration-500" style={{ width: `${barWidth}%` }} />
              </div>
            </div>
          )
        })}

        {!items.length ? (
          <p className="py-6 text-center text-sm text-[var(--muted)]">Todavía no hay departamentos para comparar.</p>
        ) : null}
      </div>
    </section>
  )
}
