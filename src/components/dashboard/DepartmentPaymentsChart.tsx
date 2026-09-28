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
    <section className="border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted-strong)]">
          Comparación histórica
        </p>
        <h3 className="mt-1 text-lg font-bold">Pagos por departamento</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Total pagado en todos los contratos registrados.
        </p>
      </div>

      <div
        className="mt-6 space-y-5"
        role="img"
        aria-label={`Gráfico de pagos históricos de ${items.length} departamentos`}
      >
        {items.map((item) => {
          const percentage = maxAmount ? (item.amount / maxAmount) * 100 : 0
          const barWidth = item.amount > 0 ? Math.max(percentage, 3) : 0
          return (
            <div key={item.id}>
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{item.name}</p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    {item.paymentCount} pago{item.paymentCount === 1 ? '' : 's'}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-bold tabular-nums">{formatMoney(item.amount)}</p>
              </div>
              <div className="mt-2 h-3 overflow-hidden bg-[var(--neutral-bg)]" aria-hidden="true">
                <div
                  className="h-full bg-[var(--primary)] transition-[width] duration-500"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          )
        })}

        {!items.length ? (
          <p className="py-6 text-center text-sm text-[var(--muted)]">
            Todavía no hay departamentos para comparar.
          </p>
        ) : null}
      </div>
    </section>
  )
}
