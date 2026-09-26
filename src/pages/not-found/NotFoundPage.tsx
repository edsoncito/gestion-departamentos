import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="py-16 text-center">
      <p className="text-sm font-bold text-[var(--primary)]">404</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text)]">
        Página no encontrada
      </h2>
      <Link
        to="/"
        className="mt-6 inline-flex bg-[var(--primary)] px-4 py-2 text-sm font-bold text-[var(--on-primary)] hover:bg-[var(--primary-hover)]"
      >
        Volver al resumen
      </Link>
    </section>
  )
}
