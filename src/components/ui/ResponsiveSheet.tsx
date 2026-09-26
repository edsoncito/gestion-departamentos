import { type ReactNode, useEffect } from 'react'

interface ResponsiveSheetProps {
  children: ReactNode
  titleId: string
}

export function ResponsiveSheet({ children, titleId }: ResponsiveSheetProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-[var(--overlay)] sm:items-center sm:px-4 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="max-h-[calc(100dvh_-_env(safe-area-inset-top)_-_0.75rem)] w-full overflow-y-auto overscroll-contain rounded-t-3xl bg-[var(--surface)] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 text-[var(--text)] shadow-2xl sm:max-h-[calc(100dvh_-_3rem)] sm:max-w-lg sm:rounded-lg sm:p-6">
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-[var(--border)] sm:hidden" aria-hidden="true" />
        {children}
      </div>
    </div>
  )
}
