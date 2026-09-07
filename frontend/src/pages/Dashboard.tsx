import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Card, StatCard } from '../components/ui/Card'
import { useAuth } from '../lib/auth'

type Summary = {
  total_customers: number
  active_quotations: number
  pipeline_value: number
  outstanding_payments: number
  open_tasks: number
  upcoming_appointments: number
}

type Briefing = {
  date: string
  summary: string
  todays_appointments: { id: string; title: string; customer: string; time: string; location?: string }[]
  overdue_followups: { id: string; customer: string; type: string; days_overdue: number }[]
  stale_quotations: { id: string; quotation_number: string; customer: string; value: number; days_since_sent: number | null }[]
  overdue_payments: { id: string; customer: string; outstanding: number; due_date: string | null }[]
  high_priority_tasks: { id: string; title: string; due_date: string | null }[]
}

function fmtINR(n: number) {
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

export default function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [briefing, setBriefing] = useState<Briefing | null>(null)
  const [forgetting, setForgetting] = useState<string[]>([])

  useEffect(() => {
    api.get('/dashboard/summary').then((r) => setSummary(r.data))
    api.get('/agent/daily-briefing').then((r) => setBriefing(r.data))
    api.get('/agent/what-am-i-forgetting').then((r) => setForgetting(r.data.alerts))
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-ink">Good to see you, {user?.name?.split(' ')[0]}</h1>
        <p className="text-ink-400 text-sm mt-1">{briefing?.summary ?? 'Loading your daily briefing…'}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Customers" value={summary ? String(summary.total_customers) : '—'} />
        <StatCard label="Active quotations" value={summary ? String(summary.active_quotations) : '—'} />
        <StatCard label="Pipeline value" value={summary ? fmtINR(summary.pipeline_value) : '—'} />
        <StatCard label="Outstanding payments" value={summary ? fmtINR(summary.outstanding_payments) : '—'} />
        <StatCard label="Open tasks" value={summary ? String(summary.open_tasks) : '—'} />
        <StatCard label="Upcoming appointments" value={summary ? String(summary.upcoming_appointments) : '—'} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-display text-base font-semibold text-ink mb-1">What am I forgetting?</h2>
          <p className="text-xs text-ink-400 mb-4">AI agent scan across customers and quotations gone quiet.</p>
          {forgetting.length === 0 ? (
            <p className="text-sm text-moss">Nothing slipping through — you're on top of it.</p>
          ) : (
            <ul className="space-y-2">
              {forgetting.map((a, i) => (
                <li key={i} className="text-sm text-ink border-l-2 border-rust pl-3">
                  {a}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="font-display text-base font-semibold text-ink mb-1">Today's appointments</h2>
          <p className="text-xs text-ink-400 mb-4">{briefing?.todays_appointments.length ?? 0} scheduled today</p>
          {briefing && briefing.todays_appointments.length === 0 && (
            <p className="text-sm text-ink-400">Nothing on the calendar today.</p>
          )}
          <ul className="space-y-3">
            {briefing?.todays_appointments.map((a) => (
              <li key={a.id} className="flex items-start justify-between text-sm">
                <div>
                  <p className="font-medium text-ink">{a.title}</p>
                  <p className="text-ink-400">{a.customer} {a.location ? `· ${a.location}` : ''}</p>
                </div>
                <span className="text-ink-400 whitespace-nowrap ml-3">{a.time}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="font-display text-base font-semibold text-ink mb-1">Follow-ups overdue</h2>
          <ul className="space-y-2 mt-3">
            {briefing?.overdue_followups.length === 0 && <p className="text-sm text-moss">All caught up.</p>}
            {briefing?.overdue_followups.map((f) => (
              <li key={f.id} className="text-sm text-ink flex justify-between">
                <span>{f.customer} <span className="text-ink-400">· {f.type}</span></span>
                <span className="text-rust">{f.days_overdue}d overdue</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="font-display text-base font-semibold text-ink mb-1">Payments overdue</h2>
          <ul className="space-y-2 mt-3">
            {briefing?.overdue_payments.length === 0 && <p className="text-sm text-moss">Nothing overdue.</p>}
            {briefing?.overdue_payments.map((p) => (
              <li key={p.id} className="text-sm text-ink flex justify-between">
                <span>{p.customer}</span>
                <span className="text-rust">{fmtINR(p.outstanding)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
