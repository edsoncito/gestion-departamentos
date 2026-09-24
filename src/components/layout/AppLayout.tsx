import { NavLink, Outlet } from 'react-router-dom'

const navigation = [
  { label: 'Resumen', to: '/' },
  { label: 'Departamentos', to: '/departamentos' },
]

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Gestión de alquileres
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              Mis departamentos
            </h1>
          </div>

          <nav aria-label="Navegación principal" className="flex gap-1 overflow-x-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  [
                    'whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-slate-950 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
