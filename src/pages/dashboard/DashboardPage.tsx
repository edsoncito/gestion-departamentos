import { PageHeader } from '../../components/ui/PageHeader'

const summaryItems = [
  { label: 'Departamentos', value: '—', detail: 'Pendiente de importar' },
  { label: 'Pagos del mes', value: '—', detail: 'Sin datos todavía' },
  { label: 'Pagos pendientes', value: '—', detail: 'Sin datos todavía' },
]

export function DashboardPage() {
  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Panel principal"
        title="Resumen de alquileres"
        description="Una vista rápida del estado de tus departamentos, contratos y pagos mensuales."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {summaryItems.map((item) => (
          <article
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {item.value}
            </p>
            <p className="mt-2 text-sm text-slate-500">{item.detail}</p>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/60 p-6">
        <h3 className="font-semibold text-slate-950">Preparado para tus datos</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Cuando revisemos el Excel definiremos los indicadores reales, los estados
          de pago y las próximas fechas de vencimiento que aparecerán aquí.
        </p>
      </div>
    </section>
  )
}
