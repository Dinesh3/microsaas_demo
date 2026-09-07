import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Appointments from './pages/Appointments'
import Quotations from './pages/Quotations'
import FollowUps from './pages/FollowUps'
import Payments from './pages/Payments'
import Tasks from './pages/Tasks'
import Products from './pages/Products'
import Users from './pages/Users'

function ProtectedLayout() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <AppLayout />
}

function AdminRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth()
  if (user?.role !== 'admin') return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/quotations" element={<Quotations />} />
            <Route path="/followups" element={<FollowUps />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/products" element={<Products />} />
            <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
