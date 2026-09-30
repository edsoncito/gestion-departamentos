import type { ReactNode } from 'react'

export type PillTone = 'paid' | 'due' | 'late' | 'neutral'

const TONES: Record<PillTone, string> = {
  paid: 'bg-[var(--success-bg)] text-[var(--success-text)]',
  due: 'bg-[var(--warning-bg)] text-[var(--warning-text)]',
  late: 'bg-[var(--danger-soft)] text-[var(--danger-text)]',
  neutral: 'bg-[var(--neutral-bg)] text-[var(--neutral-text)]',
}

export function StatusPill({ children, tone }: { children: ReactNode; tone: PillTone }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${TONES[tone]}`}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  )
}
