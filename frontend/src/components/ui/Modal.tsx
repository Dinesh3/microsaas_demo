import { ReactNode } from 'react'

export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  wide?: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4">
      <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'} rounded-lg bg-white border border-ink-100 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
          <button onClick={onClose} className="text-ink-400 hover:text-ink text-xl leading-none focus-ring" aria-label="Close">
            &times;
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
