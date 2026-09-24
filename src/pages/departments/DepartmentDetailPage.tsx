import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader'

export function DepartmentDetailPage() {
  const { departmentId } = useParams()

  return (
    <section className="space-y-8">
      <Link
        to="/departamentos"
        className="inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-800"
      >
        ← Volver a departamentos
      </Link>

      <PageHeader
        eyebrow={`Departamento ${departmentId ?? ''}`}
        title="Detalle del departamento"
        description="Aquí se mostrarán el contrato vigente, el inquilino, los vencimientos y el registro rápido de pagos."
      />
    </section>
  )
}
