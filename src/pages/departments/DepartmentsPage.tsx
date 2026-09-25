import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader'
import { useRentalData } from '../../context/RentalDataContext'
import { formatDate, formatMoney, isPeriodOverdue, isSameMonth } from '../../utils/format'

export function DepartmentsPage() {
  const { departmentViews } = useRentalData()

  return (
    <section className="space-y-7">
      <PageHeader
        eyebrow="Inmuebles"
        title="Departamentos"
        description="Consultá el contrato vigente, el inquilino y la situación mensual de cada inmueble."
      />

      <div className="overflow-hidden border border-[#ccd4ce] bg-white">
        {departmentViews.map((department, index) => {
          const currentPayment = department.payments.find((payment) => isSameMonth(payment.period))
          const overdueCount = department.payments.filter(
            (payment) => payment.status === 'PENDIENTE' && isPeriodOverdue(payment.period),
          ).length
          return (
            <Link
              key={department.id}
              to={`/departamentos/${department.id}`}
              className={`grid gap-4 p-5 transition hover:bg-[#f7f9f6] sm:grid-cols-[1.2fr_1fr_auto] sm:items-center ${index ? 'border-t border-[#dce1dd]' : ''}`}
            >
              <div>
                <p className="text-xs font-bold text-[#6a756e]">{department.id}</p>
                <h3 className="mt-1 text-lg font-bold">{department.name}</h3>
                <p className="mt-1 text-sm text-[#657069]">{department.tenant?.fullName || 'Sin inquilino'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm sm:block">
                <p><span className="block text-[11px] uppercase text-[#758079]">Mensual</span><span className="font-bold">{formatMoney(department.contract?.monthlyAmount ?? 0)}</span></p>
                <p className="sm:mt-2"><span className="block text-[11px] uppercase text-[#758079]">Contrato hasta</span><span className="font-bold">{formatDate(department.contract?.endDate ?? null)}</span></p>
              </div>
              <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
                <span className={`inline-block px-2.5 py-1 text-[11px] font-bold ${overdueCount ? 'bg-[#f8dfdb] text-[#8a342c]' : currentPayment?.status === 'PAGADO' ? 'bg-[#e4f0e9] text-[#315f50]' : 'bg-[#fff1c9] text-[#775b12]'}`}>
                  {overdueCount ? `${overdueCount} ATRASADO${overdueCount === 1 ? '' : 'S'}` : currentPayment?.status ?? 'SIN REGISTRO'}
                </span>
                <p className="text-sm font-bold text-[#315f50] sm:mt-3">Ver detalle →</p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
