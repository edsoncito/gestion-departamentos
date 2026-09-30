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
      <main className="relative grid min-h-screen place-items-center bg-[var(--canvas)] bg-[radial-gradient(60rem_30rem_at_50%_-10%,var(--accent-soft),transparent)] px-4 pb-10 pt-[calc(3rem+env(safe-area-inset-top))] text-[var(--text)] transition-colors">
        <div className="absolute right-4 top-[calc(1rem+env(safe-area-inset-top))]">
          <ThemeToggle />
        </div>

        <section className="panel w-full max-w-md overflow-hidden rounded-[28px]">
          <div className="bg-[var(--hero)] px-6 py-6 text-[var(--hero-ink)] sm:px-8">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-[var(--hero-fill)] font-display text-sm font-bold text-[#0c2b20]">GA</span>
              <div>
                <p className="eyebrow !text-[10px] !text-[var(--hero-dim)]">Acceso privado</p>
                <p className="font-display text-lg font-semibold leading-tight tracking-[-0.01em]">Gestión de alquileres</p>
              </div>
            </div>
          </div>

          <div className="px-6 pb-7 pt-7 sm:px-8 sm:pb-8">
            <h1 className="font-display text-[1.7rem] font-semibold leading-[1.1] tracking-[-0.025em] [text-wrap:balance]">
              {configured ? 'Ingresá con tu cuenta de Google' : 'Falta configurar Google Identity'}
            </h1>
            <p className="mt-3 text-[15px] leading-6 text-[var(--muted)]">
              {configured
                ? 'La información se carga desde tu hoja privada y el acceso dura únicamente durante esta sesión.'
                : 'El sistema está preparado. Solo falta agregar el OAuth Client ID autorizado para este sitio.'}
            </p>

            {error ? (
              <p role="alert" className="mt-5 rounded-xl bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">{error}</p>
            ) : null}

            <button
              type="button"
              onClick={connect}
              disabled={!configured || loading}
              className="mt-7 flex min-h-[52px] w-full items-center justify-center gap-3 rounded-2xl bg-[var(--primary)] px-4 text-[15px] font-semibold text-[var(--on-primary)] transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--disabled)]"
            >
              <span className="grid size-[22px] place-items-center rounded-md bg-[var(--on-primary)] font-display text-[13px] font-extrabold text-[var(--primary)]">G</span>
              {loading ? 'Conectando…' : 'Continuar con Google'}
            </button>

            {!configured ? (
              <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
                Variable pendiente: <code className="rounded-md bg-[var(--neutral-bg)] px-1.5 py-0.5">VITE_GOOGLE_CLIENT_ID</code>
              </p>
            ) : null}

            <p className="mt-7 border-t border-[var(--border-soft)] pt-4 text-[12.5px] leading-5 text-[var(--muted)]">
              No se guardan contraseñas ni tokens en este dispositivo. Google Sheets conserva los permisos reales sobre los datos.
            </p>
          </div>
        </section>
      </main>
    )
  }

  return children
}
