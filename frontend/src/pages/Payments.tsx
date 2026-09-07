import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Label, Select } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'

type Customer = { id: string; name: string }
type Payment = {
  id: string; customer_id: string; type: string; amount_due: number; amount_paid: number
  due_date?: string; status: string
}

const TYPES = ['Advance', 'Stage Payment', 'Final Payment']

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ customer_id: '', type: 'Advance', amount_due: '', due_date: '' })

  async function load() {
    const [p, c] = await Promise.all([api.get('/payments'), api.get('/customers')])
    setPayments(p.data)
    setCustomers(c.data)
  }
  useEffect(() => { load() }, [])

  function customerName(id: string) {
    return customers.find((c) => c.id === id)?.name ?? 'Unknown'
  }

  async function handleCreate() {
    await api.post('/payments', {
      ...form,
      amount_due: Number(form.amount_due),
      due_date: form.due_date ? new Date(form.due_date).toISOString() : undefined,
    })
    setOpen(false)
    setForm({ customer_id: '', type: 'Advance', amount_due: '', due_date: '' })
    load()
  }

  async function recordPayment(id: string, currentPaid: number, dueAmount: number) {
    const amount = prompt(`Amount received (outstanding: ₹${(dueAmount - currentPaid).toLocaleString('en-IN')})`)
    if (!amount) return
    await api.put(`/payments/${id}`, { amount_paid: currentPaid + Number(amount) })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Payments</h1>
          <p className="text-ink-400 text-sm mt-1">Advance, stage and final payments — outstanding balances always visible.</p>
        </div>
        <Button onClick={() => setOpen(true)}>+ New Payment Schedule</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-400 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Customer</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-right px-4 py-3 font-medium">Due</th>
              <th className="text-right px-4 py-3 font-medium">Paid</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-t border-ink-100">
                <td className="px-4 py-3 font-medium text-ink">{customerName(p.customer_id)}</td>
                <td className="px-4 py-3 text-ink-400">{p.type}</td>
                <td className="px-4 py-3 text-right text-ink">₹{p.amount_due.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-right text-ink">₹{p.amount_paid.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3"><Badge value={p.status} /></td>
                <td className="px-4 py-3 text-right">
                  {p.status !== 'Paid' && (
                    <Button variant="ghost" className="!px-2 !py-1 !text-xs" onClick={() => recordPayment(p.id, p.amount_paid, p.amount_due)}>
                      Record payment
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-ink-400">No payment schedules yet.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="New Payment Schedule">
        <div className="space-y-4">
          <div>
            <Label>Customer</Label>
            <Select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
              <option value="">Select customer…</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>
          <div>
            <Label>Type</Label>
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>
          <div><Label>Amount Due (₹)</Label><Input type="number" value={form.amount_due} onChange={(e) => setForm({ ...form, amount_due: e.target.value })} /></div>
          <div><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!form.customer_id || !form.amount_due}>Save</Button>
        </div>
      </Modal>
    </div>
  )
}
