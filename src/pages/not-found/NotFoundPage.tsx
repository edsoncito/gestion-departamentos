import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="py-16 text-center">
      <p className="text-sm font-semibold text-emerald-700">404</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
        Página no encontrada
      </h2>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        Volver al resumen
      </Link>
    </section>
  )
}
