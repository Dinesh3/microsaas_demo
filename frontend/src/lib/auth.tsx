import { createContext, useContext, useState, ReactNode } from 'react'
import { api } from './api'

export type AuthUser = {
  name: string
  email: string
  role: 'admin' | 'user'
}

type AuthContextType = {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })

  async function login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password })
    const { access_token, role, name, email: userEmail } = res.data
    localStorage.setItem('access_token', access_token)
    const u = { name, email: userEmail, role }
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)
  }

  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
