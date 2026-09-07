import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Label, Select } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'

type User = { id: string; name: string; email: string; role: string; is_active: boolean }

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' })
  const [error, setError] = useState('')

  async function load() {
    const res = await api.get('/auth/users')
    setUsers(res.data)
  }
  useEffect(() => { load() }, [])

  async function handleCreate() {
    setError('')
    try {
      await api.post('/auth/users', form)
      setOpen(false)
      setForm({ name: '', email: '', password: '', role: 'user' })
      load()
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Could not create login')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Team Logins</h1>
          <p className="text-ink-400 text-sm mt-1">Admin and employee accounts for this business.</p>
        </div>
        <Button onClick={() => setOpen(true)}>+ New Login</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-400 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-ink-100">
                <td className="px-4 py-3 font-medium text-ink">{u.name}</td>
                <td className="px-4 py-3 text-ink-400">{u.email}</td>
                <td className="px-4 py-3"><Badge value={u.role === 'admin' ? 'Confirmed' : 'Open'} /> <span className="ml-1 capitalize text-ink-400 text-xs">{u.role}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="New Team Login">
        <div className="space-y-4">
          {error && <div className="rounded-md bg-rust/10 text-rust text-sm px-3 py-2">{error}</div>}
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          <div>
            <Label>Role</Label>
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="user">Team member</option>
              <option value="admin">Admin</option>
            </Select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!form.name || !form.email || !form.password}>Create Login</Button>
        </div>
      </Modal>
    </div>
  )
}
