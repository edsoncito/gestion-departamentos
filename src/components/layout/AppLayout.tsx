import { NavLink, Outlet } from 'react-router-dom'
import { useGoogleSession } from '../../context/GoogleSessionContext'
import { useRentalData } from '../../context/RentalDataContext'
import { capitalize, initials, paymentState } from '../../utils/format'
import { Icon, type IconName } from '../ui/Icon'
import { ThemeToggle } from '../ui/ThemeToggle'

const navigation: Array<{ label: string; to: string; icon: IconName }> = [
  { label: 'Resumen', to: '/', icon: 'home' },
  { label: 'Departamentos', to: '/departamentos', icon: 'building' },
  { label: 'Inquilinos', to: '/inquilinos', icon: 'users' },
]

function todayText() {
  const now = new Date()
  const day = new Intl.DateTimeFormat('es-BO', { day: 'numeric', month: 'long' }).format(now)
  const isLastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() === now.getDate()
  const month = new Intl.DateTimeFormat('es-BO', { month: 'long' }).format(now)
  return {
    day: capitalize(day),
    note: isLastDay ? `Hoy vence la mensualidad de ${month}.` : 'Vence el último día de cada mes.',
  }
}

export function AppLayout() {
  const { disconnect, user } = useGoogleSession()
  const { data, error, loading, refresh } = useRentalData()
  const lateCount = data?.payments.filter((payment) => paymentState(payment) === 'late').length ?? 0
  const today = todayText()
  const userName = user?.name ?? 'Cuenta de Google'

  const navClass = (isActive: boolean) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
      isActive
        ? 'bg-[var(--accent-soft)] text-[var(--primary)]'
        : 'text-[var(--muted)] hover:bg-[var(--sunk)] hover:text-[var(--text)]'
    }`

  const badge = (to: string) =>
    to === '/departamentos' && lateCount ? (
      <span
        title={`${lateCount} mensualidades atrasadas`}
        className="ml-auto min-w-5 rounded-md bg-[var(--late)] px-1.5 text-center font-mono text-[11px] font-semibold leading-5 text-[var(--on-late)]"
      >
        {lateCount}
      </span>
    ) : null

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text)] transition-colors md:grid md:grid-cols-[244px_minmax(0,1fr)] md:items-start">
      <aside className="sticky top-0 hidden h-screen flex-col gap-7 border-r border-[var(--border-soft)] bg-[var(--surface)] px-4 pb-5 pt-6 md:flex">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--primary)] font-display text-[13px] font-bold text-[var(--on-primary)]">GA</span>
          <div className="min-w-0">
            <p className="eyebrow !text-[10px]">Sistema privado</p>
            <h1 className="font-display text-[15px] font-semibold leading-tight tracking-[-0.01em]">Gestión de alquileres</h1>
          </div>
        </div>

        <nav aria-label="Navegación principal" className="flex flex-col gap-0.5">
          {navigation.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => navClass(isActive)}>
              <Icon name={item.icon} size={19} />
              {item.label}
              {badge(item.to)}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto grid gap-4">
          <div className="rounded-2xl bg-[var(--sunk)] p-3.5">
            <p className="eyebrow">Hoy</p>
            <p className="mt-0.5 font-display font-semibold">{today.day}</p>
            <p className="mt-0.5 text-[12.5px] leading-4 text-[var(--muted)]">{today.note}</p>
          </div>
          <div className="flex items-center gap-2.5">
            {user?.picture ? (
              <img src={user.picture} alt="" className="size-9 rounded-full border border-[var(--border)]" referrerPolicy="no-referrer" />
            ) : (
              <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] font-display text-[12.5px] font-bold text-[var(--primary)]">{initials(userName)}</span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-semibold leading-tight">{userName}</p>
              <p className="text-xs text-[var(--muted)]">Google conectado</p>
            </div>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <button type="button" onClick={disconnect} className="min-h-9 border border-[var(--border)] text-[13px] font-semibold hover:border-[var(--primary)]">
              Salir
            </button>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <div className="min-w-0 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-[var(--border-soft)] bg-[var(--surface)] px-4 pb-2.5 pt-[calc(0.625rem+env(safe-area-inset-top))] md:hidden">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-[10px] bg-[var(--primary)] font-display text-xs font-bold text-[var(--on-primary)]">GA</span>
            <h1 className="font-display text-[15px] font-semibold">Alquileres</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button type="button" onClick={disconnect} className="min-h-9 px-2 text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--text)]">
              Salir
            </button>
          </div>
        </header>

        {error ? (
          <div className="border-b border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
            <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4">
              <span>{error}</span>
              <button type="button" onClick={() => void refresh()} className="shrink-0 font-bold underline">Reintentar</button>
            </div>
          </div>
        ) : null}

        {loading ? <div className="h-0.5 animate-pulse bg-[var(--primary)]" /> : null}

        <main className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-8 sm:py-8 lg:px-11 lg:py-10">
          <Outlet />
        </main>
      </div>

      <nav aria-label="Navegación móvil" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-[var(--border-soft)] bg-[var(--surface)] pb-[env(safe-area-inset-bottom)] md:hidden">
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-0.5 px-1 pb-2.5 pt-3 text-[11.5px] font-semibold ${isActive ? 'text-[var(--primary)] shadow-[inset_0_2px_0_var(--primary)]' : 'text-[var(--muted)]'}`
            }
          >
            <Icon name={item.icon} size={22} />
            {item.label}
            {item.to === '/departamentos' && lateCount ? (
              <span className="absolute left-[calc(50%+6px)] top-1.5 min-w-[17px] rounded-md bg-[var(--late)] px-1 text-center font-mono text-[10px] font-semibold leading-[17px] text-[var(--on-late)]">{lateCount}</span>
            ) : null}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
