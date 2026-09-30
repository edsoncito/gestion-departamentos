import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description: string
  eyebrow?: string
  children?: ReactNode
}

export function PageHeader({ title, description, eyebrow, children }: PageHeaderProps) {
  return (
    <header className="max-w-3xl">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="mt-1 font-display text-[1.75rem] font-semibold leading-[1.08] tracking-[-0.02em] text-[var(--text)] [text-wrap:balance] sm:text-4xl">
        {title}
      </h2>
      <p className="mt-2 max-w-[62ch] text-[15px] leading-6 text-[var(--muted)]">{description}</p>
      {children}
    </header>
  )
}
