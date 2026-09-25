import { NavLink, Outlet } from 'react-router-dom'
import { useGoogleSession } from '../../context/GoogleSessionContext'
import { useRentalData } from '../../context/RentalDataContext'

const navigation = [
  { label: 'Resumen', to: '/' },
  { label: 'Departamentos', to: '/departamentos' },
]

export function AppLayout() {
  const { disconnect, user } = useGoogleSession()
  const { error, loading, refresh } = useRentalData()

  return (
    <div className="min-h-screen bg-[#f2f4ef] pb-[calc(5rem+env(safe-area-inset-bottom))] text-[#1f2823] md:pb-0">
      <header className="border-b border-[#ccd4ce] bg-[#fbfcfa] pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center bg-[#315f50] text-xs font-black text-white">GA</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#688076]">Sistema privado</p>
              <h1 className="text-base font-bold tracking-[-0.01em]">Gestión de alquileres</h1>
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
                      ? 'border-[#315f50] text-[#274c40]'
                      : 'border-transparent text-[#66716b] hover:text-[#1f2823]',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden text-right sm:block">
              <span className="block text-xs font-bold">{user?.name}</span>
              <span className="block text-[11px] text-[#758079]">Google conectado</span>
            </span>
            {user?.picture ? (
              <img src={user.picture} alt="" className="size-8 rounded-full border border-[#cbd3cd]" referrerPolicy="no-referrer" />
            ) : null}
            <button type="button" onClick={disconnect} className="text-xs font-bold text-[#66716b] underline-offset-4 hover:text-[#1f2823] hover:underline">
              Salir
            </button>
          </div>
        </div>
      </header>

      {error ? (
        <div className="border-b border-[#dca9a3] bg-[#fff4f2] px-4 py-3 text-sm text-[#7d312b]">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <span>{error}</span>
            <button type="button" onClick={() => void refresh()} className="shrink-0 font-bold underline">Reintentar</button>
          </div>
        </div>
      ) : null}

      {loading ? <div className="h-0.5 animate-pulse bg-[#315f50]" /> : null}

      <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <Outlet />
      </main>

      <nav aria-label="Navegación móvil" className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-2 border-t border-[#cbd3cd] bg-[#fbfcfa] pb-[env(safe-area-inset-bottom)] md:hidden">
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `px-3 py-4 text-center text-xs font-bold ${isActive ? 'bg-[#315f50] text-white' : 'text-[#66716b]'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
