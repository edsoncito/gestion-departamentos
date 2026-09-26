import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader'
import { useRentalData } from '../../context/RentalDataContext'
import { formatDate, formatMoney, isPeriodOverdue, isSameMonth } from '../../utils/format'

export function DepartmentsPage() {
  const { data, departmentViews } = useRentalData()

  return (
    <section className="space-y-7">
      <PageHeader
        eyebrow="Inmuebles"
        title="Departamentos"
        description="Consultá el contrato vigente, el inquilino y la situación mensual de cada inmueble."
      />

      <div className="overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
        {departmentViews.map((department, index) => {
          const currentPayment = department.payments.find((payment) => isSameMonth(payment.period))
          const contractIds = new Set(data?.contracts
            .filter((contract) => contract.departmentId === department.id)
            .map((contract) => contract.id))
          const overdueCount = (data?.payments ?? []).filter(
            (payment) => contractIds.has(payment.contractId)
              && payment.status === 'PENDIENTE'
              && isPeriodOverdue(payment.period),
          ).length
          return (
            <Link
              key={department.id}
              to={`/departamentos/${department.id}`}
              className={`grid gap-4 p-5 transition hover:bg-[var(--surface-elevated)] sm:grid-cols-[1.2fr_1fr_auto] sm:items-center ${index ? 'border-t border-[var(--border-soft)]' : ''}`}
            >
              <div>
                <p className="text-xs font-bold text-[var(--muted)]">{department.id}</p>
                <h3 className="mt-1 text-lg font-bold">{department.name}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{department.tenant?.fullName || 'Sin inquilino'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm sm:block">
                <p><span className="block text-[11px] uppercase text-[var(--muted)]">Mensual</span><span className="font-bold">{formatMoney(department.contract?.monthlyAmount ?? 0)}</span></p>
                <p className="sm:mt-2"><span className="block text-[11px] uppercase text-[var(--muted)]">Contrato hasta</span><span className="font-bold">{formatDate(department.contract?.endDate ?? null)}</span></p>
              </div>
              <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
                <span className={`inline-block px-2.5 py-1 text-[11px] font-bold ${overdueCount ? 'bg-[var(--danger-soft)] text-[var(--danger-text)]' : currentPayment?.status === 'PAGADO' ? 'bg-[var(--success-bg)] text-[var(--success-text)]' : 'bg-[var(--warning-bg)] text-[var(--warning-text)]'}`}>
                  {overdueCount ? `${overdueCount} ATRASADO${overdueCount === 1 ? '' : 'S'}` : currentPayment?.status ?? 'SIN REGISTRO'}
                </span>
                <p className="text-sm font-bold text-[var(--primary)] sm:mt-3">Ver detalle →</p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
