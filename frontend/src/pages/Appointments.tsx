import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Label, Select } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'

type Customer = { id: string; name: string }
type Appointment = {
  id: string; customer_id: string; title: string; purpose?: string; location?: string
  scheduled_at: string; status: string
}

const STATUSES = ['Booked', 'Confirmed', 'Rescheduled', 'Cancelled', 'Completed']

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ customer_id: '', title: '', purpose: '', location: '', scheduled_at: '' })

  async function load() {
    const [a, c] = await Promise.all([api.get('/appointments'), api.get('/customers')])
    setAppointments(a.data)
    setCustomers(c.data)
  }
  useEffect(() => { load() }, [])

  function customerName(id: string) {
    return customers.find((c) => c.id === id)?.name ?? 'Unknown'
  }

  async function handleCreate() {
    await api.post('/appointments', { ...form, scheduled_at: new Date(form.scheduled_at).toISOString() })
    setOpen(false)
    setForm({ customer_id: '', title: '', purpose: '', location: '', scheduled_at: '' })
    load()
  }

  async function updateStatus(id: string, status: string) {
    await api.put(`/appointments/${id}`, { status })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Appointments</h1>
          <p className="text-ink-400 text-sm mt-1">Site visits and meetings — booked, confirmed, never double-booked.</p>
        </div>
        <Button onClick={() => setOpen(true)}>+ Book Appointment</Button>
      </div>

      <div className="space-y-3">
        {appointments.map((a) => (
          <Card key={a.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-ink">{a.title}</p>
              <p className="text-sm text-ink-400">
                {customerName(a.customer_id)} {a.location ? `· ${a.location}` : ''} · {new Date(a.scheduled_at).toLocaleString()}
              </p>
              {a.purpose && <p className="text-xs text-ink-400 mt-1">{a.purpose}</p>}
            </div>
            <div className="flex items-center gap-3">
              <Badge value={a.status} />
              <Select value={a.status} onChange={(e) => updateStatus(a.id, e.target.value)} className="!w-auto !py-1 !text-xs">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
          </Card>
        ))}
        {appointments.length === 0 && <p className="text-ink-400 text-sm">No appointments booked yet.</p>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Book Appointment">
        <div className="space-y-4">
          <div>
            <Label>Customer</Label>
            <Select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
              <option value="">Select customer…</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>
          <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Kitchen measurement" /></div>
          <div><Label>Purpose</Label><Input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} /></div>
          <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          <div><Label>Date &amp; Time</Label><Input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} /></div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!form.customer_id || !form.title || !form.scheduled_at}>Book</Button>
        </div>
      </Modal>
    </div>
  )
}
