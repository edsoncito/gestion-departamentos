import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader'
import { useRentalData } from '../../context/RentalDataContext'
import type { ContractInput, TenantInput } from '../../types/database'
import { formatDate, formatMoney, toDateInputValue } from '../../utils/format'

function defaultEndDate() {
  const today = new Date()
  const year = today.getMonth() === 11 && today.getDate() === 31
    ? today.getFullYear() + 1
    : today.getFullYear()
  return `${year}-12-31`
}

export function TenantDetailPage() {
  const { tenantId } = useParams()
  const { assignTenant, data, finalizeContract, updateTenant } = useRentalData()
  const tenant = data?.tenants.find((item) => item.id === tenantId)
  const contracts = useMemo(
    () => [...(data?.contracts.filter((item) => item.tenantId === tenantId) ?? [])]
      .sort((left, right) => right.startDate.localeCompare(left.startDate)),
    [data, tenantId],
  )
  const activeContract = contracts.find((contract) => contract.status === 'ACTIVO')
  const currentDepartment = data?.departments.find((item) => item.id === activeContract?.departmentId)
  const occupiedDepartmentIds = new Set(
    data?.contracts.filter((item) => item.status === 'ACTIVO').map((item) => item.departmentId),
  )
  const availableDepartments = data?.departments.filter(
    (department) => department.status === 'ACTIVO' && !occupiedDepartmentIds.has(department.id),
  ) ?? []

  const [showEdit, setShowEdit] = useState(false)
  const [showAssignment, setShowAssignment] = useState(false)
  const [showFinalize, setShowFinalize] = useState(false)
  const [tenantForm, setTenantForm] = useState<TenantInput>({ fullName: '', documentId: '', phone: '' })
  const [assignment, setAssignment] = useState<ContractInput>({
    tenantId: tenantId ?? '',
    departmentId: '',
    startDate: toDateInputValue(),
    endDate: defaultEndDate(),
    monthlyAmount: 0,
    notes: 'El alquiler vence el último día de cada mes.',
  })
  const [exitDate, setExitDate] = useState(toDateInputValue())
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  if (!tenant) {
    return (
      <section className="py-16 text-center">
        <h2 className="text-2xl font-bold">Inquilino no encontrado</h2>
        <Link to="/inquilinos" className="mt-5 inline-block font-bold text-[var(--primary)] hover:underline">Volver</Link>
      </section>
    )
  }

  const openEdit = () => {
    setTenantForm({ fullName: tenant.fullName, documentId: tenant.documentId, phone: tenant.phone })
    setSaveError(null)
    setShowEdit(true)
  }

  const openAssignment = () => {
    setAssignment({
      tenantId: tenant.id,
      departmentId: availableDepartments[0]?.id ?? '',
      startDate: toDateInputValue(),
      endDate: defaultEndDate(),
      monthlyAmount: 0,
      notes: 'El alquiler vence el último día de cada mes.',
    })
    setSaveError(null)
    setShowAssignment(true)
  }

  const submitEdit = async () => {
    if (!tenantForm.fullName.trim() || !tenantForm.documentId.trim() || !tenantForm.phone.trim()) {
      setSaveError('Completá el nombre, el carné y el teléfono.')
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      await updateTenant(tenant, {
        fullName: tenantForm.fullName.trim(),
        documentId: tenantForm.documentId.trim(),
        phone: tenantForm.phone.trim(),
      })
      setShowEdit(false)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'No se pudieron guardar los datos.')
    } finally {
      setSaving(false)
    }
  }

  const submitAssignment = async () => {
    if (!assignment.departmentId || !assignment.startDate || !assignment.endDate || assignment.monthlyAmount <= 0) {
      setSaveError('Seleccioná un departamento y completá las fechas y el monto mensual.')
      return
    }
    if (assignment.endDate < assignment.startDate) {
      setSaveError('El vencimiento previsto no puede ser anterior al ingreso.')
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      await assignTenant(assignment)
      setShowAssignment(false)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'No se pudo asignar el departamento.')
    } finally {
      setSaving(false)
    }
  }

  const submitFinalize = async () => {
    if (!activeContract || !exitDate) return
    if (exitDate < activeContract.startDate) {
      setSaveError('La salida real no puede ser anterior al ingreso.')
      return
    }
    if (exitDate > toDateInputValue()) {
      setSaveError('La salida real no puede estar en el futuro.')
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      await finalizeContract(activeContract, exitDate)
      setShowFinalize(false)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'No se pudo finalizar el alquiler.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-7">
      <Link to="/inquilinos" className="inline-flex text-sm font-bold text-[var(--primary)] hover:underline">← Volver a inquilinos</Link>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <PageHeader eyebrow={tenant.id} title={tenant.fullName} description={`CI ${tenant.documentId} · Tel. ${tenant.phone}`} />
        <button type="button" onClick={openEdit} className="min-h-11 shrink-0 border border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-bold hover:border-[var(--primary)]">Editar datos</button>
      </div>

      <section className="border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Alquiler actual</p>
            <h3 className="mt-1 text-xl font-bold">{currentDepartment?.name ?? 'Sin departamento asignado'}</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {activeContract
                ? `Desde ${formatDate(activeContract.startDate)} · ${formatMoney(activeContract.monthlyAmount)} mensuales · previsto hasta ${formatDate(activeContract.endDate)}`
                : 'El inquilino está disponible para una nueva asignación.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {activeContract && currentDepartment ? (
              <>
                <Link to={`/departamentos/${currentDepartment.id}`} className="inline-flex min-h-11 items-center border border-[var(--border)] px-4 text-sm font-bold hover:border-[var(--primary)]">Ver departamento</Link>
                <button type="button" onClick={() => { setExitDate(toDateInputValue()); setSaveError(null); setShowFinalize(true) }} className="min-h-11 bg-[var(--danger-bg)] px-4 text-sm font-bold text-[var(--danger-text)] hover:outline hover:outline-1 hover:outline-[var(--danger-border)]">Finalizar alquiler</button>
              </>
            ) : (
              <button type="button" onClick={openAssignment} disabled={!availableDepartments.length} className="min-h-11 bg-[var(--primary)] px-5 text-sm font-bold text-[var(--on-primary)] hover:bg-[var(--primary-hover)] disabled:bg-[var(--disabled)]">
                {availableDepartments.length ? 'Asignar departamento' : 'No hay departamentos disponibles'}
              </button>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h3 className="text-lg font-bold">Historial de alquileres</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">Los contratos finalizados se conservan junto con sus pagos.</p>
        </div>
        <div className="overflow-x-auto border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-[var(--primary)] text-[var(--on-primary)]"><tr><th className="px-4 py-3">Departamento</th><th className="px-4 py-3">Ingreso</th><th className="px-4 py-3">Vencimiento previsto</th><th className="px-4 py-3">Salida real</th><th className="px-4 py-3">Mensual</th><th className="px-4 py-3">Estado</th></tr></thead>
            <tbody>
              {contracts.map((contract) => {
                const department = data?.departments.find((item) => item.id === contract.departmentId)
                return <tr key={contract.id} className="border-t border-[var(--border-soft)] even:bg-[var(--surface-elevated)]"><td className="px-4 py-3 font-bold">{department?.name ?? contract.departmentId}</td><td className="px-4 py-3">{formatDate(contract.startDate)}</td><td className="px-4 py-3">{formatDate(contract.endDate)}</td><td className="px-4 py-3">{formatDate(contract.actualExitDate)}</td><td className="px-4 py-3">{formatMoney(contract.monthlyAmount)}</td><td className="px-4 py-3"><span className={`px-2 py-1 text-[11px] font-bold ${contract.status === 'ACTIVO' ? 'bg-[var(--success-bg)] text-[var(--success-text)]' : 'bg-[var(--neutral-bg)] text-[var(--neutral-text)]'}`}>{contract.status}</span></td></tr>
              })}
              {!contracts.length ? <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--muted)]">Todavía no tiene contratos registrados.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>

      {showEdit ? (
        <div className="fixed inset-0 z-30 overflow-y-auto bg-[var(--overlay)] px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="edit-tenant-title">
          <div className="mx-auto w-full max-w-lg bg-[var(--surface)] p-6 shadow-2xl">
            <h3 id="edit-tenant-title" className="text-2xl font-bold">Editar inquilino</h3>
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-bold">Nombre completo<input value={tenantForm.fullName} onChange={(event) => setTenantForm({ ...tenantForm, fullName: event.target.value })} className="mt-2 min-h-11 w-full border border-[var(--border)] bg-[var(--surface)] px-3 outline-none focus:border-[var(--primary)]" /></label>
              <label className="block text-sm font-bold">Carné de identidad<input value={tenantForm.documentId} onChange={(event) => setTenantForm({ ...tenantForm, documentId: event.target.value })} className="mt-2 min-h-11 w-full border border-[var(--border)] bg-[var(--surface)] px-3 outline-none focus:border-[var(--primary)]" /></label>
              <label className="block text-sm font-bold">Teléfono<input value={tenantForm.phone} onChange={(event) => setTenantForm({ ...tenantForm, phone: event.target.value })} className="mt-2 min-h-11 w-full border border-[var(--border)] bg-[var(--surface)] px-3 outline-none focus:border-[var(--primary)]" /></label>
            </div>
            {saveError ? <p className="mt-4 bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-text)]">{saveError}</p> : null}
            <div className="mt-6 grid grid-cols-2 gap-3"><button type="button" disabled={saving} onClick={() => setShowEdit(false)} className="min-h-11 border border-[var(--border)] font-bold">Cancelar</button><button type="button" disabled={saving} onClick={() => void submitEdit()} className="min-h-11 bg-[var(--primary)] font-bold text-[var(--on-primary)] disabled:bg-[var(--disabled)]">{saving ? 'Guardando…' : 'Guardar'}</button></div>
          </div>
        </div>
      ) : null}

      {showAssignment ? (
        <div className="fixed inset-0 z-30 overflow-y-auto bg-[var(--overlay)] px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="assign-title">
          <div className="mx-auto w-full max-w-lg bg-[var(--surface)] p-6 shadow-2xl">
            <p className="text-xs font-bold uppercase text-[var(--muted)]">Nuevo contrato</p><h3 id="assign-title" className="mt-1 text-2xl font-bold">Asignar departamento</h3>
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-bold">Departamento<select value={assignment.departmentId} onChange={(event) => setAssignment({ ...assignment, departmentId: event.target.value })} className="mt-2 min-h-11 w-full border border-[var(--border)] bg-[var(--surface)] px-3"><option value="">Seleccionar</option>{availableDepartments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></label>
              <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-bold">Fecha de ingreso<input type="date" value={assignment.startDate} onChange={(event) => setAssignment({ ...assignment, startDate: event.target.value })} className="mt-2 min-h-11 w-full border border-[var(--border)] bg-[var(--surface)] px-3" /></label><label className="block text-sm font-bold">Vencimiento previsto<input type="date" value={assignment.endDate} onChange={(event) => setAssignment({ ...assignment, endDate: event.target.value })} className="mt-2 min-h-11 w-full border border-[var(--border)] bg-[var(--surface)] px-3" /></label></div>
              <label className="block text-sm font-bold">Alquiler mensual (Bs)<input type="number" min="1" step="1" value={assignment.monthlyAmount || ''} onChange={(event) => setAssignment({ ...assignment, monthlyAmount: Number(event.target.value) })} className="mt-2 min-h-11 w-full border border-[var(--border)] bg-[var(--surface)] px-3" /></label>
              <label className="block text-sm font-bold">Observaciones<textarea rows={3} value={assignment.notes} onChange={(event) => setAssignment({ ...assignment, notes: event.target.value })} className="mt-2 w-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2" /></label>
            </div>
            <p className="mt-4 bg-[var(--warning-soft)] px-3 py-2 text-xs text-[var(--warning-text)]">Se crearán automáticamente las mensualidades desde el mes de ingreso hasta el vencimiento previsto.</p>
            {saveError ? <p className="mt-4 bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-text)]">{saveError}</p> : null}
            <div className="mt-6 grid grid-cols-2 gap-3"><button type="button" disabled={saving} onClick={() => setShowAssignment(false)} className="min-h-11 border border-[var(--border)] font-bold">Cancelar</button><button type="button" disabled={saving} onClick={() => void submitAssignment()} className="min-h-11 bg-[var(--primary)] font-bold text-[var(--on-primary)] disabled:bg-[var(--disabled)]">{saving ? 'Asignando…' : 'Crear contrato'}</button></div>
          </div>
        </div>
      ) : null}

      {showFinalize && activeContract ? (
        <div className="fixed inset-0 z-30 overflow-y-auto bg-[var(--overlay)] px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="finalize-title">
          <div className="mx-auto w-full max-w-lg bg-[var(--surface)] p-6 shadow-2xl">
            <p className="text-xs font-bold uppercase text-[var(--danger-text)]">Cerrar contrato</p><h3 id="finalize-title" className="mt-1 text-2xl font-bold">Finalizar alquiler</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Se conservarán los pagos realizados y las deudas ya vencidas. Las mensualidades cuyo vencimiento sea posterior a la salida quedarán canceladas.</p>
            <label className="mt-5 block text-sm font-bold">Fecha real de salida<input type="date" min={activeContract.startDate} max={toDateInputValue()} value={exitDate} onChange={(event) => setExitDate(event.target.value)} className="mt-2 min-h-11 w-full border border-[var(--border)] bg-[var(--surface)] px-3" /></label>
            {saveError ? <p className="mt-4 bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-text)]">{saveError}</p> : null}
            <div className="mt-6 grid grid-cols-2 gap-3"><button type="button" disabled={saving} onClick={() => setShowFinalize(false)} className="min-h-11 border border-[var(--border)] font-bold">Volver</button><button type="button" disabled={saving} onClick={() => void submitFinalize()} className="min-h-11 bg-[var(--danger-text)] font-bold text-white disabled:bg-[var(--disabled)]">{saving ? 'Finalizando…' : 'Finalizar alquiler'}</button></div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
