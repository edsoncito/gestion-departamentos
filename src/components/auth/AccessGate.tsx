import type { ReactNode } from 'react'
import { useGoogleSession } from '../../context/GoogleSessionContext'
import { ThemeToggle } from '../ui/ThemeToggle'

export function AccessGate({ children }: { children: ReactNode }) {
  const { accessToken, configured, connect, error, loading, ready } = useGoogleSession()

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--canvas)] px-5 pt-[env(safe-area-inset-top)] text-[var(--text)]">
        <p className="text-sm">Preparando acceso seguro…</p>
      </main>
    )
  }

  if (!configured || !accessToken) {
    return (
      <main className="relative grid min-h-screen place-items-center bg-[var(--canvas)] px-5 py-12 pt-[calc(3rem+env(safe-area-inset-top))] text-[var(--text)] transition-colors">
        <div className="absolute right-5 top-[calc(1rem+env(safe-area-inset-top))]">
          <ThemeToggle />
        </div>
        <section className="w-full max-w-md border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_12px_36px_var(--shadow)] sm:p-8">
          <div className="mb-8 flex items-center gap-3 border-b border-[var(--border-soft)] pb-5">
            <span className="grid size-10 place-items-center bg-[var(--primary)] text-sm font-bold text-[var(--on-primary)]">GA</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted-strong)]">Acceso privado</p>
              <h1 className="text-xl font-bold">Gestión de alquileres</h1>
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-[-0.025em]">
            {configured ? 'Ingresá con tu cuenta de Google' : 'Falta configurar Google Identity'}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            {configured
              ? 'La información se carga desde tu hoja privada y el acceso dura únicamente durante esta sesión.'
              : 'El sistema está preparado. Solo falta agregar el OAuth Client ID autorizado para este sitio.'}
          </p>

          {error ? (
            <p className="mt-5 border-l-4 border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">{error}</p>
          ) : null}

          <button
            type="button"
            onClick={connect}
            disabled={!configured || loading}
            className="mt-7 flex min-h-11 w-full items-center justify-center gap-3 bg-[var(--primary)] px-4 text-sm font-bold text-[var(--on-primary)] transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--disabled)]"
          >
            <span className="grid size-5 place-items-center bg-[var(--surface)] text-xs font-black text-[var(--primary)]">G</span>
            {loading ? 'Conectando…' : 'Continuar con Google'}
          </button>

          {!configured ? (
            <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
              Variable pendiente: <code className="bg-[var(--neutral-bg)] px-1.5 py-0.5">VITE_GOOGLE_CLIENT_ID</code>
            </p>
          ) : null}

          <p className="mt-8 border-t border-[var(--border-soft)] pt-4 text-xs leading-5 text-[var(--muted)]">
            No se guardan contraseñas ni tokens en este dispositivo. Google Sheets conserva los permisos reales sobre los datos.
          </p>
        </section>
      </main>
    )
  }

  return children
}
