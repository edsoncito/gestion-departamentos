import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="py-16 text-center">
      <p className="text-sm font-bold text-[#315f50]">404</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#1f2823]">
        Página no encontrada
      </h2>
      <Link
        to="/"
        className="mt-6 inline-flex bg-[#315f50] px-4 py-2 text-sm font-bold text-white hover:bg-[#274c40]"
      >
        Volver al resumen
      </Link>
    </section>
  )
}
