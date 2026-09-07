import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Label, Select, Textarea } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'

type Customer = {
  id: string
  name: string
  phone: string
  address?: string
  requirement?: string
  budget?: number
  product_interest?: string
  lead_source?: string
  stage: string
  next_follow_up_date?: string
}

const STAGES = [
  'New Enquiry', 'Qualified Lead', 'Appointment', 'Site Visit', 'Measurement',
  'Quotation', 'Follow-up', 'Negotiation', 'Approved', 'Advance Payment',
  'Project Execution', 'Installation / Delivery', 'Final Payment', 'Completed', 'After-Sales Follow-up',
]

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', address: '', requirement: '', budget: '', product_interest: '', lead_source: '' })

  async function load() {
    const res = await api.get('/customers', { params: { search: search || undefined } })
    setCustomers(res.data)
  }

  useEffect(() => { load() }, [search])

  async function handleCreate() {
    await api.post('/customers', {
      ...form,
      budget: form.budget ? Number(form.budget) : undefined,
    })
    setOpen(false)
    setForm({ name: '', phone: '', address: '', requirement: '', budget: '', product_interest: '', lead_source: '' })
    load()
  }

  async function updateStage(id: string, stage: string) {
    await api.put(`/customers/${id}`, { stage })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Customers</h1>
          <p className="text-ink-400 text-sm mt-1">Every enquiry, in one place — nothing left to memory.</p>
        </div>
        <Button onClick={() => setOpen(true)}>+ New Customer</Button>
      </div>

      <div className="mb-4 max-w-sm">
        <Input placeholder="Search by name or phone…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-400 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Phone</th>
              <th className="text-left px-4 py-3 font-medium">Requirement</th>
              <th className="text-left px-4 py-3 font-medium">Stage</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-ink-100">
                <td className="px-4 py-3 font-medium text-ink">{c.name}</td>
                <td className="px-4 py-3 text-ink-400">{c.phone}</td>
                <td className="px-4 py-3 text-ink-400 max-w-xs truncate">{c.requirement || '—'}</td>
                <td className="px-4 py-3">
                  <Select value={c.stage} onChange={(e) => updateStage(c.id, e.target.value)} className="!py-1 !text-xs w-auto">
                    {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-ink-400">No customers yet. Add your first enquiry.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="New Customer Enquiry" wide>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="col-span-2"><Label>Address / Location</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div className="col-span-2"><Label>Requirement</Label><Textarea rows={3} value={form.requirement} onChange={(e) => setForm({ ...form, requirement: e.target.value })} /></div>
          <div><Label>Budget (₹)</Label><Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></div>
          <div><Label>Product Interest</Label><Input value={form.product_interest} onChange={(e) => setForm({ ...form, product_interest: e.target.value })} /></div>
          <div><Label>Lead Source</Label><Input value={form.lead_source} onChange={(e) => setForm({ ...form, lead_source: e.target.value })} placeholder="WhatsApp, referral, walk-in…" /></div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!form.name || !form.phone}>Save Customer</Button>
        </div>
      </Modal>
    </div>
  )
}
