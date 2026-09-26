import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DepartmentEditorModal } from '../../components/departments/DepartmentEditorModal'
import { PageHeader } from '../../components/ui/PageHeader'
import { ResponsiveSheet } from '../../components/ui/ResponsiveSheet'
import { useRentalData } from '../../context/RentalDataContext'
import type { Payment, PaymentMethod, PaymentStatus } from '../../types/database'
import {
  formatDate,
  formatMoney,
  formatPeriod,
  isPeriodDue,
  isPeriodOverdue,
  isSameMonth,
  toDateInputValue,
} from '../../utils/format'

type EditorMode = 'register' | 'edit'

export function DepartmentDetailPage() {
  const { departmentId } = useParams()
  const { data, departmentViews, savePayment, updateDepartment } = useRentalData()
  const department = departmentViews.find((item) => item.id === departmentId)
  const departmentContracts = data?.contracts.filter(
    (contract) => contract.departmentId === departmentId,
  ) ?? []
  const departmentContractIds = new Set(departmentContracts.map((contract) => contract.id))
  const payments = data?.payments.filter((payment) => departmentContractIds.has(payment.contractId)) ?? []
  const currentPayment = department?.payments.find((payment) => isSameMonth(payment.period))
  const duePendingPayments = payments
    .filter((payment) => payment.status === 'PENDIENTE' && isPeriodDue(payment.period))
    .sort((left, right) => left.period.localeCompare(right.period))
  const overdueCount = duePendingPayments.filter((payment) =>
    isPeriodOverdue(payment.period),
  ).length
  const pendingTotal = duePendingPayments.reduce(
    (total, payment) => total + payment.expectedAmount,
    0,
  )
  const visiblePayments = [...payments].sort((left, right) =>
    right.period.localeCompare(left.period),
  )
  const contractHistory = [...departmentContracts]
    .sort((left, right) => right.startDate.localeCompare(left.startDate))

  const [showEditor, setShowEditor] = useState(false)
  const [showDepartmentEditor, setShowDepartmentEditor] = useState(false)
  const [editorMode, setEditorMode] = useState<EditorMode>('register')
  const [selectedPaymentId, setSelectedPaymentId] = useState('')
  const [paidAmount, setPaidAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(toDateInputValue())
  const [method, setMethod] = useState<Exclude<PaymentMethod, ''>>('QR')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('PAGADO')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const selectedPayment = payments.find((payment) => payment.id === selectedPaymentId)

  const preparePayment = (payment: Payment, mode: EditorMode) => {
    setEditorMode(mode)
    setSelectedPaymentId(payment.id)
    setPaidAmount(String(payment.paidAmount ?? payment.expectedAmount))
    setPaymentDate(payment.paidAt ?? toDateInputValue())
    setMethod(payment.method || 'QR')
    setPaymentStatus(mode === 'register' ? 'PAGADO' : payment.status)
    setNotes(payment.notes)
    setSaveError(null)
    setShowEditor(true)
  }

  const openRegisterPayment = (payment = duePendingPayments[0]) => {
    if (payment) preparePayment(payment, 'register')
  }

  const selectPendingPayment = (paymentId: string) => {
    const payment = duePendingPayments.find((item) => item.id === paymentId)
    if (!payment) return
    setSelectedPaymentId(payment.id)
    setPaidAmount(String(payment.expectedAmount))
    setNotes(payment.notes)
  }

  const closeEditor = () => {
    if (saving) return
    setShowEditor(false)
    setSaveError(null)
  }

  const submitPayment = async () => {
    if (!selectedPayment) return

    const numericAmount = Number(paidAmount)
    if (paymentStatus === 'PAGADO' && (!paymentDate || numericAmount <= 0)) {
      setSaveError('Ingresá una fecha y un monto pagado mayor a cero.')
      return
    }

    setSaving(true)
    setSaveError(null)
    try {
      await savePayment(selectedPayment, {
        paidAmount: paymentStatus === 'PAGADO' ? numericAmount : null,
        paidAt: paymentStatus === 'PAGADO' ? paymentDate : null,
        method: paymentStatus === 'PAGADO' ? method : '',
        status: paymentStatus,
        notes: notes.trim(),
      })
      setShowEditor(false)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'No se pudo guardar el pago.')
    } finally {
      setSaving(false)
    }
  }

  if (!department) {
    return (
      <section className="py-16 text-center">
        <h2 className="text-2xl font-bold">Departamento no encontrado</h2>
        <Link
          to="/departamentos"
          className="mt-5 inline-block font-bold text-[var(--primary)] hover:underline"
        >
          Volver
        </Link>
      </section>
    )
  }

  return (
    <section className="space-y-7">
      <Link
        to="/departamentos"
        className="inline-flex text-sm font-bold text-[var(--primary)] hover:underline"
      >
        ← Volver a departamentos
      </Link>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <PageHeader
          eyebrow={department.id}
          title={department.name}
          description={department.address || 'Sin dirección registrada'}
        />
        <button
          type="button"
          onClick={() => setShowDepartmentEditor(true)}
          className="min-h-11 w-full shrink-0 border border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-bold hover:bg-[var(--surface-elevated)] sm:w-auto"
        >
          Editar departamento
        </button>
      </div>

      <div className="border border-[var(--border)] bg-[var(--surface)] p-4">
        <p className="text-[11px] font-bold uppercase text-[var(--muted)]">Descripción del inmueble</p>
        <p className="mt-2 text-sm">{department.description || 'Sin descripción registrada.'}</p>
        <p className="mt-2 text-xs font-bold text-[var(--muted)]">ESTADO: {department.status}</p>
      </div>

      <div className="grid gap-px overflow-hidden border border-[var(--border)] bg-[var(--border)] sm:grid-cols-3">
        <div className="bg-[var(--surface)] p-4">
          <p className="text-[11px] font-bold uppercase text-[var(--muted)]">Inquilino</p>
          <p className="mt-2 font-bold">{department.tenant?.fullName ?? '—'}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Tel. {department.tenant?.phone ?? '—'}</p>
        </div>
        <div className="bg-[var(--surface)] p-4">
          <p className="text-[11px] font-bold uppercase text-[var(--muted)]">Alquiler mensual</p>
          <p className="mt-2 text-xl font-bold">{formatMoney(department.contract?.monthlyAmount ?? 0)}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Vence el último día del mes</p>
        </div>
        <div className="bg-[var(--surface)] p-4">
          <p className="text-[11px] font-bold uppercase text-[var(--muted)]">Contrato</p>
          <p className="mt-2 font-bold">Hasta {formatDate(department.contract?.endDate ?? null)}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Estado: {department.contract?.status ?? '—'}</p>
        </div>
      </div>

      <section className="border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
              Situación de pago
            </p>
            <h3 className="mt-1 text-xl font-bold">
              {duePendingPayments.length
                ? `${duePendingPayments.length} mensualidad${duePendingPayments.length === 1 ? '' : 'es'} por cobrar`
                : 'Todo al día'}
            </h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {duePendingPayments.length
                ? `${overdueCount} atrasada${overdueCount === 1 ? '' : 's'} · ${formatMoney(pendingTotal)} pendiente${duePendingPayments.length === 1 ? '' : 's'}`
                : currentPayment?.status === 'PAGADO'
                  ? `${formatPeriod(currentPayment.period)} pagado el ${formatDate(currentPayment.paidAt)}`
                  : 'No hay mensualidades vencidas o actuales pendientes.'}
            </p>
          </div>
          {duePendingPayments.length ? (
            <button
              type="button"
              onClick={() => openRegisterPayment()}
              className="min-h-11 w-full bg-[var(--primary)] px-5 text-sm font-bold text-[var(--on-primary)] hover:bg-[var(--primary-hover)] sm:w-auto"
            >
              Registrar pago
            </button>
          ) : (
            <span className="bg-[var(--success-bg)] px-4 py-3 text-sm font-bold text-[var(--success-text)]">
              ✓ Sin pagos pendientes
            </span>
          )}
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h3 className="text-lg font-bold">Historial de pagos</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Podés registrar meses atrasados y editar monto, fecha, método, estado u observaciones.
          </p>
        </div>
        <div className="space-y-3 md:hidden">
          {visiblePayments.map((payment) => {
            const paymentIsDue = isPeriodDue(payment.period)
            const paymentContract = departmentContracts.find((contract) => contract.id === payment.contractId)
            const paymentTenant = data?.tenants.find((tenant) => tenant.id === paymentContract?.tenantId)
            return (
              <article key={payment.id} className="border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase text-[var(--muted)]">Mensualidad</p>
                    <h4 className="mt-1 font-bold capitalize">{formatPeriod(payment.period)}</h4>
                    <p className="mt-1 text-xs text-[var(--muted)]">{paymentTenant?.fullName ?? '—'}</p>
                  </div>
                  <span className={`shrink-0 px-2 py-1 text-[11px] font-bold ${payment.status === 'PAGADO' ? 'bg-[var(--success-bg)] text-[var(--success-text)]' : payment.status === 'CANCELADO' ? 'bg-[var(--neutral-bg)] text-[var(--neutral-text)]' : paymentIsDue ? 'bg-[var(--warning-bg)] text-[var(--warning-text)]' : 'bg-[var(--neutral-bg)] text-[var(--neutral-text)]'}`}>
                    {payment.status}
                  </span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[var(--border-soft)] pt-4 text-sm">
                  <div><dt className="text-[11px] uppercase text-[var(--muted)]">Esperado</dt><dd className="mt-1 font-bold">{formatMoney(payment.expectedAmount)}</dd></div>
                  <div><dt className="text-[11px] uppercase text-[var(--muted)]">Pagado</dt><dd className="mt-1 font-bold">{payment.paidAmount == null ? '—' : formatMoney(payment.paidAmount)}</dd></div>
                  <div><dt className="text-[11px] uppercase text-[var(--muted)]">Fecha</dt><dd className="mt-1">{formatDate(payment.paidAt)}</dd></div>
                  <div><dt className="text-[11px] uppercase text-[var(--muted)]">Método</dt><dd className="mt-1">{payment.method || '—'}</dd></div>
                </dl>
                {payment.notes ? <p className="mt-3 text-xs leading-5 text-[var(--muted)]">{payment.notes}</p> : null}
                {payment.status === 'PAGADO' ? (
                  <button type="button" onClick={() => preparePayment(payment, 'edit')} className="mt-4 min-h-11 w-full border border-[var(--border)] font-bold text-[var(--primary)]">Editar pago</button>
                ) : payment.status === 'PENDIENTE' && paymentIsDue ? (
                  <button type="button" onClick={() => openRegisterPayment(payment)} className="mt-4 min-h-11 w-full bg-[var(--primary)] font-bold text-[var(--on-primary)]">Registrar pago</button>
                ) : null}
              </article>
            )
          })}
          {!visiblePayments.length ? <p className="border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-sm text-[var(--muted)]">Sin pagos registrados.</p> : null}
        </div>
        <div className="hidden overflow-x-auto border border-[var(--border)] bg-[var(--surface)] md:block">
          <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
            <thead className="bg-[var(--primary)] text-[var(--on-primary)]">
              <tr>
                <th className="px-4 py-3">Periodo</th>
                <th className="px-4 py-3">Inquilino</th>
                <th className="px-4 py-3">Esperado</th>
                <th className="px-4 py-3">Pagado</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Método</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Observaciones</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {visiblePayments.map((payment) => {
                const paymentIsDue = isPeriodDue(payment.period)
                const paymentContract = departmentContracts.find((contract) => contract.id === payment.contractId)
                const paymentTenant = data?.tenants.find((tenant) => tenant.id === paymentContract?.tenantId)
                return (
                  <tr key={payment.id} className="border-t border-[var(--border-soft)] even:bg-[var(--surface-elevated)]">
                    <td className="px-4 py-3 font-bold capitalize">{formatPeriod(payment.period)}</td>
                    <td className="px-4 py-3">{paymentTenant?.fullName ?? '—'}</td>
                    <td className="px-4 py-3">{formatMoney(payment.expectedAmount)}</td>
                    <td className="px-4 py-3">{payment.paidAmount == null ? '—' : formatMoney(payment.paidAmount)}</td>
                    <td className="px-4 py-3">{formatDate(payment.paidAt)}</td>
                    <td className="px-4 py-3">{payment.method || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-[11px] font-bold ${payment.status === 'PAGADO' ? 'bg-[var(--success-bg)] text-[var(--success-text)]' : payment.status === 'CANCELADO' ? 'bg-[var(--neutral-bg)] text-[var(--neutral-text)]' : paymentIsDue ? 'bg-[var(--warning-bg)] text-[var(--warning-text)]' : 'bg-[var(--neutral-bg)] text-[var(--neutral-text)]'}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="max-w-52 truncate px-4 py-3 text-[var(--muted)]" title={payment.notes}>
                      {payment.notes || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {payment.status === 'PAGADO' ? (
                        <button
                          type="button"
                          onClick={() => preparePayment(payment, 'edit')}
                          className="font-bold text-[var(--primary)] hover:underline"
                        >
                          Editar
                        </button>
                      ) : payment.status === 'PENDIENTE' && paymentIsDue ? (
                        <button
                          type="button"
                          onClick={() => openRegisterPayment(payment)}
                          className="font-bold text-[var(--primary)] hover:underline"
                        >
                          Registrar
                        </button>
                      ) : payment.status === 'CANCELADO' ? (
                        <span className="text-xs text-[var(--muted)]">Cancelado</span>
                      ) : (
                        <span className="text-xs text-[var(--muted)]">Aún no vence</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h3 className="text-lg font-bold">Historial de inquilinos</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">Ocupaciones actuales y anteriores de este departamento.</p>
        </div>
        <div className="space-y-3 md:hidden">
          {contractHistory.map((contract) => {
            const tenant = data?.tenants.find((item) => item.id === contract.tenantId)
            return (
              <article key={contract.id} className="border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase text-[var(--muted)]">Inquilino</p>
                    <Link to={`/inquilinos/${contract.tenantId}`} className="mt-1 block font-bold text-[var(--primary)]">{tenant?.fullName ?? contract.tenantId}</Link>
                  </div>
                  <span className="bg-[var(--neutral-bg)] px-2 py-1 text-[11px] font-bold text-[var(--neutral-text)]">{contract.status}</span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[var(--border-soft)] pt-4 text-sm">
                  <div><dt className="text-[11px] uppercase text-[var(--muted)]">Ingreso</dt><dd className="mt-1">{formatDate(contract.startDate)}</dd></div>
                  <div><dt className="text-[11px] uppercase text-[var(--muted)]">Fin previsto</dt><dd className="mt-1">{formatDate(contract.endDate)}</dd></div>
                  <div><dt className="text-[11px] uppercase text-[var(--muted)]">Salida real</dt><dd className="mt-1">{formatDate(contract.actualExitDate)}</dd></div>
                </dl>
              </article>
            )
          })}
          {!contractHistory.length ? <p className="border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-sm text-[var(--muted)]">Sin contratos registrados.</p> : null}
        </div>
        <div className="hidden overflow-x-auto border border-[var(--border)] bg-[var(--surface)] md:block">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-[var(--primary)] text-[var(--on-primary)]"><tr><th className="px-4 py-3">Inquilino</th><th className="px-4 py-3">Ingreso</th><th className="px-4 py-3">Vencimiento previsto</th><th className="px-4 py-3">Salida real</th><th className="px-4 py-3">Estado</th></tr></thead>
            <tbody>
              {contractHistory.map((contract) => {
                const tenant = data?.tenants.find((item) => item.id === contract.tenantId)
                return (
                  <tr key={contract.id} className="border-t border-[var(--border-soft)] even:bg-[var(--surface-elevated)]">
                    <td className="px-4 py-3"><Link to={`/inquilinos/${contract.tenantId}`} className="font-bold text-[var(--primary)] hover:underline">{tenant?.fullName ?? contract.tenantId}</Link></td>
                    <td className="px-4 py-3">{formatDate(contract.startDate)}</td>
                    <td className="px-4 py-3">{formatDate(contract.endDate)}</td>
                    <td className="px-4 py-3">{formatDate(contract.actualExitDate)}</td>
                    <td className="px-4 py-3">{contract.status}</td>
                  </tr>
                )
              })}
              {!contractHistory.length ? <tr><td colSpan={5} className="px-4 py-8 text-center text-[var(--muted)]">Sin contratos registrados.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>

      {showEditor && selectedPayment ? (
        <ResponsiveSheet titleId="payment-title">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
              {editorMode === 'register' ? 'Registrar pago' : 'Editar pago'}
            </p>
            <h3 id="payment-title" className="mt-1 text-2xl font-bold capitalize">
              {formatPeriod(selectedPayment.period)}
            </h3>

            {editorMode === 'register' ? (
              <label className="mt-5 block text-sm font-bold">
                Mensualidad
                <select
                  value={selectedPayment.id}
                  onChange={(event) => selectPendingPayment(event.target.value)}
                  className="mt-2 min-h-11 w-full border border-[var(--border)] bg-[var(--surface)] px-3 outline-none focus:border-[var(--primary)]"
                >
                  {duePendingPayments.map((payment) => (
                    <option key={payment.id} value={payment.id}>
                      {formatPeriod(payment.period)} · {formatMoney(payment.expectedAmount)}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label className="mt-5 block text-sm font-bold">
                Estado
                <select
                  value={paymentStatus}
                  onChange={(event) => setPaymentStatus(event.target.value as PaymentStatus)}
                  className="mt-2 min-h-11 w-full border border-[var(--border)] bg-[var(--surface)] px-3 outline-none focus:border-[var(--primary)]"
                >
                  <option value="PAGADO">Pagado</option>
                  <option value="PENDIENTE">Pendiente</option>
                </select>
              </label>
            )}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-bold">
                Monto pagado
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={paidAmount}
                  onChange={(event) => setPaidAmount(event.target.value)}
                  disabled={paymentStatus === 'PENDIENTE'}
                  className="mt-2 min-h-11 w-full border border-[var(--border)] bg-[var(--surface)] px-3 outline-none focus:border-[var(--primary)] disabled:bg-[var(--neutral-bg)]"
                />
              </label>
              <label className="block text-sm font-bold">
                Fecha de pago
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(event) => setPaymentDate(event.target.value)}
                  disabled={paymentStatus === 'PENDIENTE'}
                  className="mt-2 min-h-11 w-full border border-[var(--border)] bg-[var(--surface)] px-3 outline-none focus:border-[var(--primary)] disabled:bg-[var(--neutral-bg)]"
                />
              </label>
            </div>

            <label className="mt-4 block text-sm font-bold">
              Método
              <select
                value={method}
                onChange={(event) => setMethod(event.target.value as Exclude<PaymentMethod, ''>)}
                disabled={paymentStatus === 'PENDIENTE'}
                className="mt-2 min-h-11 w-full border border-[var(--border)] bg-[var(--surface)] px-3 outline-none focus:border-[var(--primary)] disabled:bg-[var(--neutral-bg)]"
              >
                <option value="QR">QR</option>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="OTRO">Otro</option>
              </select>
            </label>

            <label className="mt-4 block text-sm font-bold">
              Observaciones
              <textarea
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Opcional"
                className="mt-2 w-full resize-y border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-[var(--primary)]"
              />
            </label>

            {paymentStatus === 'PENDIENTE' ? (
              <p className="mt-4 bg-[var(--warning-soft)] px-3 py-2 text-xs leading-5 text-[var(--warning-text)]">
                Al guardar como pendiente se quitarán el monto, la fecha y el método registrados.
              </p>
            ) : null}

            {saveError ? (
              <p className="mt-4 bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-text)]">{saveError}</p>
            ) : null}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={closeEditor}
                className="min-h-11 border border-[var(--border)] text-sm font-bold hover:bg-[var(--canvas)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void submitPayment()}
                className="min-h-11 bg-[var(--primary)] text-sm font-bold text-[var(--on-primary)] hover:bg-[var(--primary-hover)] disabled:bg-[var(--disabled)]"
              >
                {saving ? 'Guardando…' : editorMode === 'register' ? 'Registrar pago' : 'Guardar cambios'}
              </button>
            </div>
        </ResponsiveSheet>
      ) : null}

      {showDepartmentEditor ? (
        <DepartmentEditorModal
          eyebrow={department.id}
          title="Editar departamento"
          hasActiveContract={Boolean(department.contract)}
          initialValue={{
            name: department.name,
            address: department.address,
            description: department.description,
            status: department.status,
          }}
          onClose={() => setShowDepartmentEditor(false)}
          onSubmit={async (input) => {
            await updateDepartment(department, input)
            setShowDepartmentEditor(false)
          }}
        />
      ) : null}
    </section>
  )
}
