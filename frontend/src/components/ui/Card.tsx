import { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-ink-100 rounded-lg p-5 ${className}`}>
      {children}
    </div>
  )
}

export function StatCard({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-wide text-ink-400 mb-2">{label}</p>
      <p className="font-display text-2xl font-semibold text-ink">{value}</p>
      {sub && <p className="text-xs text-ink-400 mt-1">{sub}</p>}
    </Card>
  )
}
