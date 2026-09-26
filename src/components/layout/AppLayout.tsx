import { NavLink, Outlet } from 'react-router-dom'
import { useGoogleSession } from '../../context/GoogleSessionContext'
import { useRentalData } from '../../context/RentalDataContext'
import { ThemeToggle } from '../ui/ThemeToggle'

const navigation = [
  { label: 'Resumen', to: '/' },
  { label: 'Departamentos', to: '/departamentos' },
  { label: 'Inquilinos', to: '/inquilinos' },
]

export function AppLayout() {
  const { disconnect, user } = useGoogleSession()
  const { error, loading, refresh } = useRentalData()

  return (
    <div className="min-h-screen bg-[var(--canvas)] pb-[calc(5rem+env(safe-area-inset-bottom))] text-[var(--text)] transition-colors md:pb-0">
      <header className="border-b border-[var(--border)] bg-[var(--surface-elevated)] pt-[env(safe-area-inset-top)] transition-colors">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center bg-[var(--primary)] text-xs font-black text-[var(--on-primary)]">GA</span>
            <div>
              <p className="hidden text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted-strong)] sm:block">Sistema privado</p>
              <h1 className="text-sm font-bold tracking-[-0.01em] sm:text-base"><span className="sm:hidden">Alquileres</span><span className="hidden sm:inline">Gestión de alquileres</span></h1>
            </div>
          </div>

          <nav aria-label="Navegación principal" className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  [
                    'whitespace-nowrap border-b-2 px-4 py-5 text-sm font-bold transition-colors',
                    isActive
                      ? 'border-[var(--primary)] text-[var(--primary)]'
                      : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <span className="hidden text-right sm:block">
              <span className="block text-xs font-bold">{user?.name}</span>
              <span className="block text-[11px] text-[var(--muted)]">Google conectado</span>
            </span>
            {user?.picture ? (
              <img src={user.picture} alt="" className="hidden size-8 rounded-full border border-[var(--border)] sm:block" referrerPolicy="no-referrer" />
            ) : null}
            <button type="button" onClick={disconnect} className="text-xs font-bold text-[var(--muted)] underline-offset-4 hover:text-[var(--text)] hover:underline">
              Salir
            </button>
          </div>
        </div>
      </header>

      {error ? (
        <div className="border-b border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <span>{error}</span>
            <button type="button" onClick={() => void refresh()} className="shrink-0 font-bold underline">Reintentar</button>
          </div>
        </div>
      ) : null}

      {loading ? <div className="h-0.5 animate-pulse bg-[var(--primary)]" /> : null}

      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-10">
        <Outlet />
      </main>

      <nav aria-label="Navegación móvil" className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t border-[var(--border)] bg-[var(--surface-elevated)] pb-[env(safe-area-inset-bottom)] md:hidden">
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `px-3 py-4 text-center text-xs font-bold ${isActive ? 'bg-[var(--primary)] text-[var(--on-primary)]' : 'text-[var(--muted)]'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
