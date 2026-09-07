import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Label } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'

type Product = {
  id: string; name: string; category?: string; unit: string
  purchase_cost: number; standard_selling_price: number; minimum_selling_price: number
  labour_cost: number; installation_cost: number; tax_percent: number
}

const EMPTY = {
  name: '', category: '', unit: 'Sq Ft', purchase_cost: '0', standard_selling_price: '0',
  minimum_selling_price: '0', labour_cost: '0', installation_cost: '0', tax_percent: '0',
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)

  async function load() {
    const res = await api.get('/products')
    setProducts(res.data)
  }
  useEffect(() => { load() }, [])

  async function handleCreate() {
    await api.post('/products', {
      ...form,
      purchase_cost: Number(form.purchase_cost),
      standard_selling_price: Number(form.standard_selling_price),
      minimum_selling_price: Number(form.minimum_selling_price),
      labour_cost: Number(form.labour_cost),
      installation_cost: Number(form.installation_cost),
      tax_percent: Number(form.tax_percent),
    })
    setOpen(false)
    setForm(EMPTY)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Price Master</h1>
          <p className="text-ink-400 text-sm mt-1">The single source of truth quotations are priced from. AI never invents a price.</p>
        </div>
        <Button onClick={() => setOpen(true)}>+ Add Product</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-400 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Product</th>
              <th className="text-left px-4 py-3 font-medium">Unit</th>
              <th className="text-right px-4 py-3 font-medium">Cost</th>
              <th className="text-right px-4 py-3 font-medium">Selling Price</th>
              <th className="text-right px-4 py-3 font-medium">Minimum Price</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-ink-100">
                <td className="px-4 py-3 font-medium text-ink">{p.name} {p.category && <span className="text-ink-400 text-xs">· {p.category}</span>}</td>
                <td className="px-4 py-3 text-ink-400">{p.unit}</td>
                <td className="px-4 py-3 text-right text-ink-400">₹{p.purchase_cost.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-right text-ink">₹{p.standard_selling_price.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-right text-ink-400">₹{p.minimum_selling_price.toLocaleString('en-IN')}</td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-ink-400">No products yet.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Product" wide>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
          <div><Label>Unit</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
          <div><Label>Purchase Cost (₹)</Label><Input type="number" value={form.purchase_cost} onChange={(e) => setForm({ ...form, purchase_cost: e.target.value })} /></div>
          <div><Label>Standard Selling Price (₹)</Label><Input type="number" value={form.standard_selling_price} onChange={(e) => setForm({ ...form, standard_selling_price: e.target.value })} /></div>
          <div><Label>Minimum Selling Price (₹)</Label><Input type="number" value={form.minimum_selling_price} onChange={(e) => setForm({ ...form, minimum_selling_price: e.target.value })} /></div>
          <div><Label>Labour Cost (₹)</Label><Input type="number" value={form.labour_cost} onChange={(e) => setForm({ ...form, labour_cost: e.target.value })} /></div>
          <div><Label>Installation Cost (₹)</Label><Input type="number" value={form.installation_cost} onChange={(e) => setForm({ ...form, installation_cost: e.target.value })} /></div>
          <div><Label>Tax (%)</Label><Input type="number" value={form.tax_percent} onChange={(e) => setForm({ ...form, tax_percent: e.target.value })} /></div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!form.name}>Save</Button>
        </div>
      </Modal>
    </div>
  )
}
