import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader'
import { ResponsiveSheet } from '../../components/ui/ResponsiveSheet'
import { useRentalData } from '../../context/RentalDataContext'
import type { TenantInput } from '../../types/database'

const EMPTY_TENANT: TenantInput = { fullName: '', documentId: '', phone: '' }

export function TenantsPage() {
  const { createTenant, data } = useRentalData()
  const [query, setQuery] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [form, setForm] = useState<TenantInput>(EMPTY_TENANT)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const tenants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return [...(data?.tenants ?? [])]
      .filter((tenant) => !normalizedQuery || [tenant.fullName, tenant.documentId, tenant.phone]
        .some((value) => value.toLowerCase().includes(normalizedQuery)))
      .sort((left, right) => left.fullName.localeCompare(right.fullName))
  }, [data, query])

  const submitTenant = async () => {
    if (!form.fullName.trim() || !form.documentId.trim() || !form.phone.trim()) {
      setSaveError('Completá el nombre, el carné y el teléfono.')
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      await createTenant({
        fullName: form.fullName.trim(),
        documentId: form.documentId.trim(),
        phone: form.phone.trim(),
      })
      setForm(EMPTY_TENANT)
      setShowEditor(false)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'No se pudo crear el inquilino.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <PageHeader
          eyebrow="Personas"
          title="Inquilinos"
          description="Administrá sus datos, contratos y departamentos asignados sin perder el historial."
        />
        <button
          type="button"
          onClick={() => { setForm(EMPTY_TENANT); setSaveError(null); setShowEditor(true) }}
          className="min-h-11 w-full shrink-0 bg-[var(--primary)] px-5 text-sm font-bold text-[var(--on-primary)] hover:bg-[var(--primary-hover)] sm:w-auto"
        >
          Nuevo inquilino
        </button>
      </div>

      <label className="block max-w-lg text-sm font-bold">
        Buscar
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nombre, carné o teléfono"
          className="mt-2 min-h-11 w-full border border-[var(--border)] bg-[var(--surface)] px-3 outline-none focus:border-[var(--primary)]"
        />
      </label>

      <div className="overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
        {tenants.map((tenant, index) => {
          const activeContract = data?.contracts.find(
            (contract) => contract.tenantId === tenant.id && contract.status === 'ACTIVO',
          )
          const department = data?.departments.find(
            (item) => item.id === activeContract?.departmentId,
          )
          return (
            <Link
              key={tenant.id}
              to={`/inquilinos/${tenant.id}`}
              className={`grid gap-4 p-5 transition hover:bg-[var(--surface-elevated)] sm:grid-cols-[1.3fr_1fr_auto] sm:items-center ${index ? 'border-t border-[var(--border-soft)]' : ''}`}
            >
              <div>
                <p className="text-xs font-bold text-[var(--muted)]">{tenant.id}</p>
                <h3 className="mt-1 text-lg font-bold">{tenant.fullName}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">CI {tenant.documentId} · Tel. {tenant.phone}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase text-[var(--muted)]">Departamento actual</p>
                <p className="mt-1 text-sm font-bold">{department?.name ?? 'Sin asignación'}</p>
              </div>
              <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
                <span className={`inline-block px-2.5 py-1 text-[11px] font-bold ${activeContract ? 'bg-[var(--success-bg)] text-[var(--success-text)]' : 'bg-[var(--neutral-bg)] text-[var(--neutral-text)]'}`}>
                  {activeContract ? 'ALQUILANDO' : 'INACTIVO'}
                </span>
                <p className="mt-0 text-sm font-bold text-[var(--primary)] sm:mt-3">Ver detalle →</p>
              </div>
            </Link>
          )
        })}
        {!tenants.length ? (
          <p className="p-8 text-center text-sm text-[var(--muted)]">No se encontraron inquilinos.</p>
        ) : null}
      </div>

      {showEditor ? (
        <ResponsiveSheet titleId="new-tenant-title">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Nuevo registro</p>
            <h3 id="new-tenant-title" className="mt-1 text-2xl font-bold">Agregar inquilino</h3>
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-bold">Nombre completo
                <input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} autoFocus className="mt-2 min-h-11 w-full border border-[var(--border)] bg-[var(--surface)] px-3 outline-none focus:border-[var(--primary)]" />
              </label>
              <label className="block text-sm font-bold">Carné de identidad
                <input value={form.documentId} onChange={(event) => setForm({ ...form, documentId: event.target.value })} inputMode="numeric" className="mt-2 min-h-11 w-full border border-[var(--border)] bg-[var(--surface)] px-3 outline-none focus:border-[var(--primary)]" />
              </label>
              <label className="block text-sm font-bold">Teléfono
                <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} inputMode="tel" className="mt-2 min-h-11 w-full border border-[var(--border)] bg-[var(--surface)] px-3 outline-none focus:border-[var(--primary)]" />
              </label>
            </div>
            {saveError ? <p className="mt-4 bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-text)]">{saveError}</p> : null}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" disabled={saving} onClick={() => setShowEditor(false)} className="min-h-11 border border-[var(--border)] text-sm font-bold hover:bg-[var(--canvas)]">Cancelar</button>
              <button type="button" disabled={saving} onClick={() => void submitTenant()} className="min-h-11 bg-[var(--primary)] text-sm font-bold text-[var(--on-primary)] hover:bg-[var(--primary-hover)] disabled:bg-[var(--disabled)]">{saving ? 'Guardando…' : 'Guardar'}</button>
            </div>
        </ResponsiveSheet>
      ) : null}
    </section>
  )
}
