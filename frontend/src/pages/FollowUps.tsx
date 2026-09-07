import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Label, Select, Textarea } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'

type Customer = { id: string; name: string }
type FollowUp = {
  id: string; type: string; customer_id: string; last_contact_date?: string
  next_follow_up_date?: string; last_conversation?: string; outcome: string
}

const TYPES = ['Customer', 'Quotation', 'Appointment', 'Payment']
const OUTCOMES = ['Pending', 'Contacted', 'No Response', 'Callback Requested', 'Converted', 'Cold']

export default function FollowUps() {
  const [followups, setFollowups] = useState<FollowUp[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ type: 'Customer', customer_id: '', last_conversation: '', next_follow_up_date: '' })

  async function load() {
    const [f, c] = await Promise.all([api.get('/followups'), api.get('/customers')])
    setFollowups(f.data)
    setCustomers(c.data)
  }
  useEffect(() => { load() }, [])

  function customerName(id: string) {
    return customers.find((c) => c.id === id)?.name ?? 'Unknown'
  }

  async function handleCreate() {
    await api.post('/followups', {
      ...form,
      next_follow_up_date: form.next_follow_up_date ? new Date(form.next_follow_up_date).toISOString() : undefined,
    })
    setOpen(false)
    setForm({ type: 'Customer', customer_id: '', last_conversation: '', next_follow_up_date: '' })
    load()
  }

  async function updateOutcome(id: string, outcome: string) {
    await api.put(`/followups/${id}`, { outcome })
    load()
  }

  function isOverdue(f: FollowUp) {
    return f.next_follow_up_date && new Date(f.next_follow_up_date) < new Date()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Follow-ups</h1>
          <p className="text-ink-400 text-sm mt-1">Every follow-up has a date and an owner — never based on memory.</p>
        </div>
        <Button onClick={() => setOpen(true)}>+ Log Follow-up</Button>
      </div>

      <div className="space-y-3">
        {followups.map((f) => (
          <Card key={f.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-ink">{customerName(f.customer_id)} <span className="text-ink-400 text-xs">· {f.type}</span></p>
              {f.last_conversation && <p className="text-sm text-ink-400 mt-1">{f.last_conversation}</p>}
              {f.next_follow_up_date && (
                <p className={`text-xs mt-1 ${isOverdue(f) ? 'text-rust' : 'text-ink-400'}`}>
                  Next follow-up: {new Date(f.next_follow_up_date).toLocaleDateString()}
                  {isOverdue(f) && ' — overdue'}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Badge value={f.outcome} />
              <Select value={f.outcome} onChange={(e) => updateOutcome(f.id, e.target.value)} className="!w-auto !py-1 !text-xs">
                {OUTCOMES.map((o) => <option key={o} value={o}>{o}</option>)}
              </Select>
            </div>
          </Card>
        ))}
        {followups.length === 0 && <p className="text-ink-400 text-sm">No follow-ups logged yet.</p>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Log Follow-up">
        <div className="space-y-4">
          <div>
            <Label>Type</Label>
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>
          <div>
            <Label>Customer</Label>
            <Select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
              <option value="">Select customer…</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>
          <div><Label>Conversation Notes</Label><Textarea rows={3} value={form.last_conversation} onChange={(e) => setForm({ ...form, last_conversation: e.target.value })} /></div>
          <div><Label>Next Follow-up Date</Label><Input type="date" value={form.next_follow_up_date} onChange={(e) => setForm({ ...form, next_follow_up_date: e.target.value })} /></div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!form.customer_id}>Save</Button>
        </div>
      </Modal>
    </div>
  )
}
