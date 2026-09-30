import type { ReactNode } from 'react'
import { useGoogleSession } from '../../context/GoogleSessionContext'
import { ThemeToggle } from '../ui/ThemeToggle'

const DECO_ROWS: Array<[string, string]> = [
  ['Depto. 1A', '-ppppppppppp'],
  ['Depto. 2B', 'ppppppppplld'],
  ['Depto. 3A', '-----ppppppd'],
]

const DECO_CELL: Record<string, string> = {
  p: 'bg-[var(--hero-fill)]',
  l: 'bg-[#e5695a]',
  d: 'bg-[var(--due)]',
  '-': 'border border-dotted border-white/20',
}

function DecoStrip() {
  return (
    <div aria-hidden="true" className="grid gap-2">
      {DECO_ROWS.map(([name, row]) => {
        return (
          <div key={name} className="grid grid-cols-[62px_repeat(12,minmax(0,1fr))] items-center gap-1 sm:grid-cols-[74px_repeat(12,minmax(0,1fr))]">
            <span className="font-mono text-xs text-[var(--hero-dim)]">{name}</span>
            {row.split('').map((cell, index) => (
              <span key={index} className={`h-[26px] rounded-lg sm:h-[34px] ${DECO_CELL[cell]}`} />
            ))}
          </div>
        )
      })}
    </div>
  )
}

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
      <main className="relative grid min-h-screen bg-[var(--canvas)] text-[var(--text)] transition-colors lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <section className="flex min-w-0 flex-col justify-between gap-10 bg-[var(--hero)] px-4 pb-6 pt-[calc(1.75rem+env(safe-area-inset-top))] text-[var(--hero-ink)] sm:px-10 lg:px-16 lg:py-10" aria-label="Presentación">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--hero-fill)] font-display text-[13px] font-bold text-[#0c2b20]">GA</span>
            <div>
              <p className="eyebrow !text-[10px] !text-[var(--hero-dim)]">Sistema privado</p>
              <p className="font-display text-[15px] font-semibold">Gestión de alquileres</p>
            </div>
          </div>
          <div>
            <h2 className="max-w-[14ch] font-display text-[clamp(2rem,4.4vw,3.4rem)] font-semibold leading-[1.04] tracking-[-0.03em] [text-wrap:balance]">
              Quién pagó, quién debe y cuándo vence.
            </h2>
            <p className="mt-4 max-w-[44ch] text-[var(--hero-dim)]">
              Contratos, mensualidades y atrasos de tus departamentos, leídos desde tu hoja privada de Google Sheets.
            </p>
          </div>
          <DecoStrip />
        </section>

        <section className="relative grid place-items-center px-4 py-10 sm:px-10">
          <div className="absolute right-4 top-4 sm:right-8 sm:top-6">
            <ThemeToggle />
          </div>
          <div className="grid w-full max-w-[420px] gap-[18px]">
            <p className="eyebrow">Acceso privado</p>
            <h1 className="font-display text-[clamp(1.75rem,3.6vw,2.4rem)] font-semibold leading-[1.08] tracking-[-0.02em] [text-wrap:balance]">
              {configured ? 'Ingresá con tu cuenta de Google' : 'Falta configurar Google Identity'}
            </h1>
            <p className="text-[15px] leading-6 text-[var(--muted)]">
              {configured
                ? 'La información se carga desde tu hoja privada. El acceso dura solo durante esta sesión.'
                : 'El sistema está preparado. Solo falta agregar el OAuth Client ID autorizado para este sitio.'}
            </p>

            {error ? (
              <p role="alert" className="rounded-xl bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">{error}</p>
            ) : null}

            <button
              type="button"
              onClick={connect}
              disabled={!configured || loading}
              className="flex min-h-[50px] w-full items-center justify-center gap-3 bg-[var(--primary)] px-4 text-[15px] font-semibold text-[var(--on-primary)] transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--disabled)]"
            >
              <span className="grid size-[22px] place-items-center rounded-md bg-[var(--on-primary)] font-display text-[13px] font-extrabold text-[var(--primary)]">G</span>
              {loading ? 'Conectando…' : 'Continuar con Google'}
            </button>

            {!configured ? (
              <p className="text-xs leading-5 text-[var(--muted)]">
                Variable pendiente: <code className="rounded-md bg-[var(--neutral-bg)] px-1.5 py-0.5">VITE_GOOGLE_CLIENT_ID</code>
              </p>
            ) : null}

            <p className="border-t border-[var(--border-soft)] pt-4 text-[12.5px] leading-5 text-[var(--muted)]">
              Solo la cuenta autorizada puede entrar. No se guardan contraseñas ni tokens en este dispositivo, y Google Sheets conserva los permisos reales sobre los datos.
            </p>
          </div>
        </section>
      </main>
    )
  }

  return children
}
