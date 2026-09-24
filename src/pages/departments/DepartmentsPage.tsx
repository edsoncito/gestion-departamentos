import { PageHeader } from '../../components/ui/PageHeader'

export function DepartmentsPage() {
  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Inmuebles"
        title="Departamentos"
        description="Desde aquí podrás consultar cada departamento, su inquilino actual y el historial de pagos."
      />

      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-emerald-100 text-xl font-semibold text-emerald-800">
          D
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-950">
          Esperando la estructura del Excel
        </h3>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
          La lista y el formulario se construirán con los campos reales para evitar
          información duplicada o pantallas que no necesites.
        </p>
      </div>
    </section>
  )
}
