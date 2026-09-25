import type { ReactNode } from 'react'
import { useGoogleSession } from '../../context/GoogleSessionContext'

export function AccessGate({ children }: { children: ReactNode }) {
  const { accessToken, configured, connect, error, loading, ready } = useGoogleSession()

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f2f4ef] px-5 pt-[env(safe-area-inset-top)] text-[#1f2823]">
        <p className="text-sm">Preparando acceso seguro…</p>
      </main>
    )
  }

  if (!configured || !accessToken) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f2f4ef] px-5 py-12 pt-[calc(3rem+env(safe-area-inset-top))] text-[#1f2823]">
        <section className="w-full max-w-md border border-[#cfd6d0] bg-white p-6 shadow-[0_12px_36px_rgba(31,40,35,0.08)] sm:p-8">
          <div className="mb-8 flex items-center gap-3 border-b border-[#dce1dd] pb-5">
            <span className="grid size-10 place-items-center bg-[#315f50] text-sm font-bold text-white">GA</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#527164]">Acceso privado</p>
              <h1 className="text-xl font-bold">Gestión de alquileres</h1>
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-[-0.025em]">
            {configured ? 'Ingresá con tu cuenta de Google' : 'Falta configurar Google Identity'}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#5d6962]">
            {configured
              ? 'La información se carga desde tu hoja privada y el acceso dura únicamente durante esta sesión.'
              : 'El sistema está preparado. Solo falta agregar el OAuth Client ID autorizado para este sitio.'}
          </p>

          {error ? (
            <p className="mt-5 border-l-4 border-[#a84f45] bg-[#fff5f3] px-4 py-3 text-sm text-[#7e3029]">{error}</p>
          ) : null}

          <button
            type="button"
            onClick={connect}
            disabled={!configured || loading}
            className="mt-7 flex min-h-11 w-full items-center justify-center gap-3 bg-[#315f50] px-4 text-sm font-bold text-white transition hover:bg-[#274c40] disabled:cursor-not-allowed disabled:bg-[#aab5af]"
          >
            <span className="grid size-5 place-items-center bg-white text-xs font-black text-[#315f50]">G</span>
            {loading ? 'Conectando…' : 'Continuar con Google'}
          </button>

          {!configured ? (
            <p className="mt-4 text-xs leading-5 text-[#717b75]">
              Variable pendiente: <code className="bg-[#eef1ee] px-1.5 py-0.5">VITE_GOOGLE_CLIENT_ID</code>
            </p>
          ) : null}

          <p className="mt-8 border-t border-[#dce1dd] pt-4 text-xs leading-5 text-[#717b75]">
            No se guardan contraseñas ni tokens en este dispositivo. Google Sheets conserva los permisos reales sobre los datos.
          </p>
        </section>
      </main>
    )
  }

  return children
}
