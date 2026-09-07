const STAGE_COLORS: Record<string, string> = {
  Draft: 'bg-ink-50 text-ink-400',
  Generated: 'bg-ink-50 text-ink-400',
  Sent: 'bg-brass-50 text-brass-600',
  Viewed: 'bg-brass-50 text-brass-600',
  'Follow-up Required': 'bg-brass-50 text-brass-600',
  Negotiation: 'bg-brass-50 text-brass-600',
  'Revision Required': 'bg-rust/10 text-rust',
  Accepted: 'bg-moss/10 text-moss',
  Rejected: 'bg-rust/10 text-rust',
  Expired: 'bg-rust/10 text-rust',
  'Converted to Project': 'bg-moss/10 text-moss',
  Booked: 'bg-brass-50 text-brass-600',
  Confirmed: 'bg-moss/10 text-moss',
  Cancelled: 'bg-rust/10 text-rust',
  Completed: 'bg-moss/10 text-moss',
  Rescheduled: 'bg-brass-50 text-brass-600',
  Open: 'bg-ink-50 text-ink-400',
  'In Progress': 'bg-brass-50 text-brass-600',
  Done: 'bg-moss/10 text-moss',
  Pending: 'bg-ink-50 text-ink-400',
  'Partially Paid': 'bg-brass-50 text-brass-600',
  Paid: 'bg-moss/10 text-moss',
  Overdue: 'bg-rust/10 text-rust',
}

export function Badge({ value }: { value: string }) {
  const cls = STAGE_COLORS[value] ?? 'bg-ink-50 text-ink-400'
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${cls}`}>
      {value}
    </span>
  )
}
