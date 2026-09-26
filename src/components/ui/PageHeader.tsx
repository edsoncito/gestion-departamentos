interface PageHeaderProps {
  title: string
  description: string
  eyebrow?: string
}

export function PageHeader({ title, description, eyebrow }: PageHeaderProps) {
  return (
    <header className="max-w-3xl border-l-4 border-[var(--primary)] pl-4">
      {eyebrow ? (
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--muted-strong)]">{eyebrow}</p>
      ) : null}
      <h2 className="mt-1 text-[1.4rem] font-bold leading-tight tracking-[-0.025em] text-[var(--text)] sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-5 text-[var(--muted)] sm:leading-6">
        {description}
      </p>
    </header>
  )
}
