import { type PointerEvent, type ReactNode, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface ResponsiveSheetProps {
  children: ReactNode
  onClose: () => void
  titleId: string
}

const CLOSE_DISTANCE = 110
const CLOSE_VELOCITY = 0.5

export function ResponsiveSheet({ children, onClose, titleId }: ResponsiveSheetProps) {
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const drag = useRef<{ startY: number; startTime: number } | null>(null)
  const closeRef = useRef(onClose)

  useEffect(() => {
    closeRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    drag.current = { startY: event.clientY, startTime: event.timeStamp }
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Sin captura el gesto sigue funcionando mientras el puntero esté sobre la barra.
    }
    setDragging(true)
  }

  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    setOffset(Math.max(0, event.clientY - drag.current.startY))
  }

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    const distance = Math.max(0, event.clientY - drag.current.startY)
    const velocity = distance / Math.max(1, event.timeStamp - drag.current.startTime)
    drag.current = null
    setDragging(false)
    if (distance > CLOSE_DISTANCE || (distance > 40 && velocity > CLOSE_VELOCITY)) {
      onClose()
      return
    }
    setOffset(0)
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:px-4 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="absolute inset-0 bg-[var(--overlay)]"
        style={{ opacity: Math.max(0.2, 1 - offset / 400) }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        style={{ transform: offset ? `translateY(${offset}px)` : undefined }}
        className={`relative flex max-h-[calc(100dvh-env(safe-area-inset-top)-0.75rem)] w-full flex-col rounded-t-[28px] bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow)] sm:max-h-[calc(100dvh-3rem)] sm:max-w-lg sm:rounded-3xl ${dragging ? '' : 'transition-transform duration-200'}`}
      >
        <div
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="relative flex shrink-0 touch-none cursor-grab items-center justify-center pb-3 pt-3.5 active:cursor-grabbing sm:hidden"
        >
          <div className="h-1.5 w-12 rounded-full bg-[var(--border)]" aria-hidden="true" />
          <span className="sr-only">Deslizá hacia abajo para cerrar</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-2.5 z-10 grid size-10 place-items-center rounded-full bg-[var(--sunk)] text-[var(--muted)] hover:text-[var(--text)] sm:right-4 sm:top-4"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div className="min-h-0 flex-1 overflow-y-auto [&_h3]:pr-10 overscroll-contain px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-1 sm:p-6 sm:pt-6">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
