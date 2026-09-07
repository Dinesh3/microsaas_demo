import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Label, Select } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'

type Customer = { id: string; name: string }
type Product = { id: string; name: string; unit: string; standard_selling_price: number }
type Item = { product_id: string; product_name: string; quantity: number; unit: string }
type Quotation = {
  id: string; quotation_number: string; customer_id: string; version: number; status: string
  total_value: number; estimated_profit: number; margin_percent: number; created_at: string
}

const STATUSES = ['Draft', 'Generated', 'Sent', 'Viewed', 'Follow-up Required', 'Negotiation', 'Revision Required', 'Accepted', 'Rejected', 'Expired', 'Converted to Project']

export default function Quotations() {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [open, setOpen] = useState(false)
  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState<Item[]>([{ product_id: '', product_name: '', quantity: 1, unit: 'Sq Ft' }])
  const [transport, setTransport] = useState('0')
  const [discount, setDiscount] = useState('0')
  const [checkModal, setCheckModal] = useState<{ id: string; result: any } | null>(null)
  const [targetPrice, setTargetPrice] = useState('')

  async function load() {
    const [q, c, p] = await Promise.all([api.get('/quotations'), api.get('/customers'), api.get('/products')])
    setQuotations(q.data)
    setCustomers(c.data)
    setProducts(p.data)
  }
  useEffect(() => { load() }, [])

  function customerName(id: string) {
    return customers.find((c) => c.id === id)?.name ?? 'Unknown'
  }

  function addItem() {
    setItems([...items, { product_id: '', product_name: '', quantity: 1, unit: 'Sq Ft' }])
  }

  function updateItem(idx: number, patch: Partial<Item>) {
    setItems(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }

  function pickProduct(idx: number, productId: string) {
    const p = products.find((pr) => pr.id === productId)
    if (!p) return
    updateItem(idx, { product_id: p.id, product_name: p.name, unit: p.unit })
  }

  async function handleCreate() {
    await api.post('/quotations', {
      customer_id: customerId,
      items: items.filter((i) => i.product_name),
      transport_cost: Number(transport),
      discount: Number(discount),
    })
    setOpen(false)
    setCustomerId('')
    setItems([{ product_id: '', product_name: '', quantity: 1, unit: 'Sq Ft' }])
    setTransport('0')
    setDiscount('0')
    load()
  }

  async function updateStatus(id: string, status: string) {
    await api.put(`/quotations/${id}`, { status })
    load()
  }

  async function downloadPdf(id: string, number: string) {
    const res = await api.get(`/quotations/${id}/pdf`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.download = `${number}.pdf`
    link.click()
  }

  async function runCheck(id: string) {
    if (!targetPrice) return
    const res = await api.post(`/quotations/${id}/check-discount`, null, { params: { target_price: Number(targetPrice) } })
    setCheckModal({ id, result: res.data })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Quotations</h1>
          <p className="text-ink-400 text-sm mt-1">Priced straight from your product master — no invented prices.</p>
        </div>
        <Button onClick={() => setOpen(true)}>+ New Quotation</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-400 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Number</th>
              <th className="text-left px-4 py-3 font-medium">Customer</th>
              <th className="text-right px-4 py-3 font-medium">Total</th>
              <th className="text-right px-4 py-3 font-medium">Margin</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((q) => (
              <tr key={q.id} className="border-t border-ink-100">
                <td className="px-4 py-3 font-medium text-ink">{q.quotation_number} <span className="text-ink-400">v{q.version}</span></td>
                <td className="px-4 py-3 text-ink-400">{customerName(q.customer_id)}</td>
                <td className="px-4 py-3 text-right font-medium text-ink">₹{q.total_value.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-right text-ink-400">{q.margin_percent}%</td>
                <td className="px-4 py-3">
                  <Select value={q.status} onChange={(e) => updateStatus(q.id, e.target.value)} className="!w-auto !py-1 !text-xs">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </td>
                <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                  <Button variant="ghost" className="!px-2 !py-1 !text-xs" onClick={() => downloadPdf(q.id, q.quotation_number)}>PDF</Button>
                  <Button variant="ghost" className="!px-2 !py-1 !text-xs" onClick={() => { setTargetPrice(''); setCheckModal({ id: q.id, result: null }) }}>Check discount</Button>
                </td>
              </tr>
            ))}
            {quotations.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-ink-400">No quotations yet.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="New Quotation" wide>
        <div className="space-y-4">
          <div>
            <Label>Customer</Label>
            <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Select customer…</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>

          <div>
            <Label>Line Items</Label>
            <div className="space-y-2">
              {items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <Select className="col-span-6" value={it.product_id} onChange={(e) => pickProduct(idx, e.target.value)}>
                    <option value="">Select product…</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name} (₹{p.standard_selling_price}/{p.unit})</option>)}
                  </Select>
                  <Input className="col-span-3" type="number" min={0} value={it.quantity} onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })} placeholder="Qty" />
                  <span className="col-span-3 text-xs text-ink-400">{it.unit}</span>
                </div>
              ))}
            </div>
            <Button variant="secondary" className="mt-2 !text-xs !py-1" onClick={addItem}>+ Add item</Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><Label>Transport Cost (₹)</Label><Input type="number" value={transport} onChange={(e) => setTransport(e.target.value)} /></div>
            <div><Label>Discount (₹)</Label><Input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} /></div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!customerId || items.every((i) => !i.product_name)}>Generate Quotation</Button>
        </div>
      </Modal>

      <Modal open={!!checkModal} onClose={() => setCheckModal(null)} title="Margin &amp; Discount Check">
        <div className="space-y-4">
          <div>
            <Label>Proposed price to offer customer (₹)</Label>
            <Input type="number" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} placeholder="e.g. 100000" />
          </div>
          <Button onClick={() => checkModal && runCheck(checkModal.id)} disabled={!targetPrice}>Check</Button>
          {checkModal?.result && (
            <div className={`rounded-md p-3 text-sm ${checkModal.result.is_safe ? 'bg-moss/10 text-moss' : 'bg-rust/10 text-rust'}`}>
              {checkModal.result.message}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
