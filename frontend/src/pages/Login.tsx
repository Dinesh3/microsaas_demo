import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Button } from '../components/ui/Button'
import { Input, Label } from '../components/ui/Input'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Login failed. Check your email and password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-ink text-white flex-col justify-between p-12">
        <div>
          <p className="font-display text-2xl font-semibold">Site Ledger</p>
          <p className="text-ink-100/70 text-sm mt-1">AI Business Operations Agent</p>
        </div>
        <div className="space-y-6 max-w-sm">
          <p className="font-display text-3xl leading-snug">
            Your business should not depend on your memory.
          </p>
          <div className="blueprint-rule bg-white/10" />
          <p className="text-ink-100/70 text-sm leading-relaxed">
            Enquiries, site visits, quotations, follow-ups and payments — tracked in one place,
            so nothing depends on remembering it yourself.
          </p>
        </div>
        <p className="text-xs text-ink-100/50">Built for interior design &amp; UPVC contracting teams</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-semibold text-ink mb-1">Sign in</h1>
          <p className="text-sm text-ink-400 mb-6">Use your admin or team login.</p>

          {error && (
            <div className="mb-4 rounded-md bg-rust/10 text-rust text-sm px-3 py-2">{error}</div>
          )}

          <div className="mb-4">
            <Label>Email</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" />
          </div>
          <div className="mb-6">
            <Label>Password</Label>
            <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>

          <div className="mt-6 text-xs text-ink-400 border-t border-ink-100 pt-4">
            First run? Default admin login is set in <code className="bg-ink-50 px-1 rounded">backend/.env</code>{' '}
            (<code className="bg-ink-50 px-1 rounded">FIRST_ADMIN_EMAIL</code> /{' '}
            <code className="bg-ink-50 px-1 rounded">FIRST_ADMIN_PASSWORD</code>).
          </div>
        </form>
      </div>
    </div>
  )
}
