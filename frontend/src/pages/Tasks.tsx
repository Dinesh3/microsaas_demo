import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Label, Select } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'

type Task = {
  id: string; title: string; description?: string; due_date?: string
  priority: string; status: string; source: string
}

const PRIORITIES = ['Low', 'Medium', 'High']
const STATUSES = ['Open', 'In Progress', 'Done']

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', due_date: '', priority: 'Medium' })

  async function load() {
    const res = await api.get('/tasks')
    setTasks(res.data)
  }
  useEffect(() => { load() }, [])

  async function handleCreate() {
    await api.post('/tasks', { ...form, due_date: form.due_date ? new Date(form.due_date).toISOString() : undefined })
    setOpen(false)
    setForm({ title: '', description: '', due_date: '', priority: 'Medium' })
    load()
  }

  async function updateStatus(id: string, status: string) {
    await api.put(`/tasks/${id}`, { status })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Tasks</h1>
          <p className="text-ink-400 text-sm mt-1">Manual tasks and AI-created reminders, tracked to completion.</p>
        </div>
        <Button onClick={() => setOpen(true)}>+ New Task</Button>
      </div>

      <div className="space-y-3">
        {tasks.map((t) => (
          <Card key={t.id} className="flex items-center justify-between">
            <div>
              <p className={`font-medium ${t.status === 'Done' ? 'text-ink-400 line-through' : 'text-ink'}`}>{t.title}</p>
              {t.description && <p className="text-sm text-ink-400 mt-1">{t.description}</p>}
              <div className="flex items-center gap-2 mt-2">
                <Badge value={t.priority} />
                {t.due_date && <span className="text-xs text-ink-400">Due {new Date(t.due_date).toLocaleDateString()}</span>}
                {t.source === 'ai' && <span className="text-xs text-brass-600">AI-created</span>}
              </div>
            </div>
            <Select value={t.status} onChange={(e) => updateStatus(t.id, e.target.value)} className="!w-auto !py-1 !text-xs">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Card>
        ))}
        {tasks.length === 0 && <p className="text-ink-400 text-sm">No tasks yet.</p>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New Task">
        <div className="space-y-4">
          <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
          <div>
            <Label>Priority</Label>
            <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!form.title}>Save</Button>
        </div>
      </Modal>
    </div>
  )
}
