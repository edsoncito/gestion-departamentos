interface PageHeaderProps {
  title: string
  description: string
  eyebrow?: string
}

export function PageHeader({ title, description, eyebrow }: PageHeaderProps) {
  return (
    <header className="max-w-3xl">
      {eyebrow ? (
        <p className="text-sm font-semibold text-emerald-700">{eyebrow}</p>
      ) : null}
      <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
        {description}
      </p>
    </header>
  )
}
