import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader'
import { useRentalData } from '../../context/RentalDataContext'
import type { PaymentMethod } from '../../types/database'
import { formatDate, formatMoney, formatPeriod, isSameMonth, toDateInputValue } from '../../utils/format'

export function DepartmentDetailPage() {
  const { departmentId } = useParams()
  const { departmentViews, registerPayment } = useRentalData()
  const department = departmentViews.find((item) => item.id === departmentId)
  const currentPayment = department?.payments.find((payment) => isSameMonth(payment.period))
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentDate, setPaymentDate] = useState(toDateInputValue())
  const [method, setMethod] = useState<Exclude<PaymentMethod, ''>>('QR')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  if (!department) {
    return (
      <section className="py-16 text-center">
        <h2 className="text-2xl font-bold">Departamento no encontrado</h2>
        <Link to="/departamentos" className="mt-5 inline-block font-bold text-[#315f50] hover:underline">Volver</Link>
      </section>
    )
  }

  const submitPayment = async () => {
    if (!currentPayment) return
    setSaving(true)
    setSaveError(null)
    try {
      const [year, month, day] = paymentDate.split('-').map(Number)
      await registerPayment(currentPayment, new Date(year, month - 1, day), method)
      setShowPaymentForm(false)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'No se pudo registrar el pago.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-7">
      <Link
        to="/departamentos"
        className="inline-flex text-sm font-bold text-[#315f50] hover:underline"
      >
        ← Volver a departamentos
      </Link>

      <PageHeader
        eyebrow={department.id}
        title={department.name}
        description="Contrato, inquilino y registro mensual de pagos."
      />

      <div className="grid gap-px overflow-hidden border border-[#ccd4ce] bg-[#ccd4ce] sm:grid-cols-3">
        <div className="bg-white p-4"><p className="text-[11px] font-bold uppercase text-[#758079]">Inquilino</p><p className="mt-2 font-bold">{department.tenant?.fullName ?? '—'}</p><p className="mt-1 text-xs text-[#657069]">Tel. {department.tenant?.phone ?? '—'}</p></div>
        <div className="bg-white p-4"><p className="text-[11px] font-bold uppercase text-[#758079]">Alquiler mensual</p><p className="mt-2 text-xl font-bold">{formatMoney(department.contract?.monthlyAmount ?? 0)}</p><p className="mt-1 text-xs text-[#657069]">Vence el último día del mes</p></div>
        <div className="bg-white p-4"><p className="text-[11px] font-bold uppercase text-[#758079]">Contrato</p><p className="mt-2 font-bold">Hasta {formatDate(department.contract?.endDate ?? null)}</p><p className="mt-1 text-xs text-[#657069]">Estado: {department.contract?.status ?? '—'}</p></div>
      </div>

      <section className="border border-[#ccd4ce] bg-white p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#6a756e]">Mes actual</p>
            <h3 className="mt-1 text-xl font-bold">{currentPayment ? formatPeriod(currentPayment.period) : 'Sin mensualidad generada'}</h3>
            <p className="mt-1 text-sm text-[#657069]">{currentPayment ? `${formatMoney(currentPayment.expectedAmount)} · ${currentPayment.status}` : 'No hay un pago asociado al mes actual.'}</p>
          </div>
          {currentPayment?.status === 'PENDIENTE' ? (
            <button type="button" onClick={() => setShowPaymentForm(true)} className="min-h-11 bg-[#315f50] px-5 text-sm font-bold text-white hover:bg-[#274c40]">Registrar como pagado</button>
          ) : currentPayment?.status === 'PAGADO' ? (
            <span className="bg-[#e4f0e9] px-4 py-3 text-sm font-bold text-[#315f50]">✓ Pagado el {formatDate(currentPayment.paidAt)}</span>
          ) : null}
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h3 className="text-lg font-bold">Historial de pagos</h3>
          <p className="mt-1 text-sm text-[#6a756e]">Los cambios se guardan directamente en Google Sheets.</p>
        </div>
        <div className="overflow-x-auto border border-[#ccd4ce] bg-white">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <thead className="bg-[#315f50] text-white"><tr><th className="px-4 py-3">Periodo</th><th className="px-4 py-3">Esperado</th><th className="px-4 py-3">Pagado</th><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Método</th><th className="px-4 py-3">Estado</th></tr></thead>
            <tbody>
              {department.payments.map((payment) => (
                <tr key={payment.id} className="border-t border-[#e0e5e1] even:bg-[#f7f9f6]">
                  <td className="px-4 py-3 font-bold capitalize">{formatPeriod(payment.period)}</td>
                  <td className="px-4 py-3">{formatMoney(payment.expectedAmount)}</td>
                  <td className="px-4 py-3">{payment.paidAmount == null ? '—' : formatMoney(payment.paidAmount)}</td>
                  <td className="px-4 py-3">{formatDate(payment.paidAt)}</td>
                  <td className="px-4 py-3">{payment.method || '—'}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 text-[11px] font-bold ${payment.status === 'PAGADO' ? 'bg-[#e4f0e9] text-[#315f50]' : 'bg-[#fff1c9] text-[#775b12]'}`}>{payment.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showPaymentForm && currentPayment ? (
        <div className="fixed inset-0 z-30 grid place-items-center bg-[#17201b]/60 px-4" role="dialog" aria-modal="true" aria-labelledby="payment-title">
          <div className="w-full max-w-md bg-white p-6 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#66716b]">Confirmar pago</p>
            <h3 id="payment-title" className="mt-1 text-2xl font-bold">{formatPeriod(currentPayment.period)}</h3>
            <p className="mt-2 text-sm text-[#657069]">Se registrará el monto completo de {formatMoney(currentPayment.expectedAmount)}.</p>

            <label className="mt-5 block text-sm font-bold">Fecha de pago<input type="date" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} className="mt-2 min-h-11 w-full border border-[#bfc9c2] px-3 outline-none focus:border-[#315f50]" /></label>
            <label className="mt-4 block text-sm font-bold">Método<select value={method} onChange={(event) => setMethod(event.target.value as Exclude<PaymentMethod, ''>)} className="mt-2 min-h-11 w-full border border-[#bfc9c2] bg-white px-3 outline-none focus:border-[#315f50]"><option value="QR">QR</option><option value="EFECTIVO">Efectivo</option><option value="TRANSFERENCIA">Transferencia</option><option value="OTRO">Otro</option></select></label>
            {saveError ? <p className="mt-4 bg-[#fff4f2] px-3 py-2 text-sm text-[#7d312b]">{saveError}</p> : null}
            <div className="mt-6 grid grid-cols-2 gap-3"><button type="button" disabled={saving} onClick={() => setShowPaymentForm(false)} className="min-h-11 border border-[#bfc9c2] text-sm font-bold hover:bg-[#f2f4ef]">Cancelar</button><button type="button" disabled={saving || !paymentDate} onClick={() => void submitPayment()} className="min-h-11 bg-[#315f50] text-sm font-bold text-white hover:bg-[#274c40] disabled:bg-[#aab5af]">{saving ? 'Guardando…' : 'Confirmar pago'}</button></div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
