import { useState } from 'react'
import type { DepartmentInput } from '../../types/database'
import { ResponsiveSheet } from '../ui/ResponsiveSheet'

interface DepartmentEditorModalProps {
  eyebrow: string
  hasActiveContract?: boolean
  initialValue: DepartmentInput
  onClose: () => void
  onSubmit: (input: DepartmentInput) => Promise<void>
  title: string
}

export function DepartmentEditorModal({
  eyebrow,
  hasActiveContract = false,
  initialValue,
  onClose,
  onSubmit,
  title,
}: DepartmentEditorModalProps) {
  const [form, setForm] = useState(initialValue)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const submit = async () => {
    if (!form.name.trim()) {
      setSaveError('Ingresá un nombre para el departamento.')
      return
    }

    setSaving(true)
    setSaveError(null)
    try {
      await onSubmit({
        name: form.name.trim(),
        address: form.address.trim(),
        description: form.description.trim(),
        status: form.status,
      })
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'No se pudo guardar el departamento.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ResponsiveSheet titleId="department-editor-title">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{eyebrow}</p>
        <h3 id="department-editor-title" className="mt-1 text-2xl font-bold">{title}</h3>

        <div className="mt-5 space-y-4">
          <label className="block text-sm font-bold">
            Nombre
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              autoFocus
              placeholder="Ej. Departamento 3"
              className="mt-2 min-h-11 w-full border border-[var(--border)] bg-[var(--surface)] px-3 outline-none focus:border-[var(--primary)]"
            />
          </label>
          <label className="block text-sm font-bold">
            Dirección
            <input
              value={form.address}
              onChange={(event) => setForm({ ...form, address: event.target.value })}
              placeholder="Opcional"
              className="mt-2 min-h-11 w-full border border-[var(--border)] bg-[var(--surface)] px-3 outline-none focus:border-[var(--primary)]"
            />
          </label>
          <label className="block text-sm font-bold">
            Descripción
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Opcional"
              className="mt-2 w-full resize-y border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-[var(--primary)]"
            />
          </label>
          <label className="block text-sm font-bold">
            Estado
            <select
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value as DepartmentInput['status'] })}
              disabled={hasActiveContract}
              className="mt-2 min-h-11 w-full border border-[var(--border)] bg-[var(--surface)] px-3 outline-none focus:border-[var(--primary)] disabled:bg-[var(--neutral-bg)]"
            >
              <option value="ACTIVO">Activo</option>
              <option value="MANTENIMIENTO">En mantenimiento</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
          </label>
        </div>

        {hasActiveContract ? (
          <p className="mt-4 bg-[var(--warning-soft)] px-3 py-2 text-xs leading-5 text-[var(--warning-text)]">
            El departamento tiene un alquiler activo. Finalizalo antes de cambiar su estado.
          </p>
        ) : null}
        {saveError ? (
          <p className="mt-4 bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-text)]">{saveError}</p>
        ) : null}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="min-h-11 border border-[var(--border)] text-sm font-bold hover:bg-[var(--canvas)]"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void submit()}
            className="min-h-11 bg-[var(--primary)] text-sm font-bold text-[var(--on-primary)] hover:bg-[var(--primary-hover)] disabled:bg-[var(--disabled)]"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
    </ResponsiveSheet>
  )
}
