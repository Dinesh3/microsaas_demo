import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth'

const NAV_ITEMS = [
  { to: '/', label: 'Daily Briefing', end: true },
  { to: '/customers', label: 'Customers' },
  { to: '/appointments', label: 'Appointments' },
  { to: '/quotations', label: 'Quotations' },
  { to: '/followups', label: 'Follow-ups' },
  { to: '/payments', label: 'Payments' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/products', label: 'Price Master' },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 bg-ink text-white flex flex-col">
        <div className="px-5 py-6 border-b border-white/10">
          <p className="font-display text-lg font-semibold leading-tight">Site Ledger</p>
          <p className="text-xs text-ink-100/70 mt-0.5">Operations Agent</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive ? 'bg-brass text-ink font-medium' : 'text-ink-100/80 hover:bg-white/10'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive ? 'bg-brass text-ink font-medium' : 'text-ink-100/80 hover:bg-white/10'
                }`
              }
            >
              Team Logins
            </NavLink>
          )}
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <p className="px-3 text-sm font-medium">{user?.name}</p>
          <p className="px-3 text-xs text-ink-100/60 mb-3">{user?.role === 'admin' ? 'Admin' : 'Team member'}</p>
          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="w-full text-left rounded-md px-3 py-2 text-sm text-ink-100/80 hover:bg-white/10 focus-ring"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-canvas">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
