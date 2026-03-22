import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi, tokens, type LoginResponse } from '../lib/api'

interface AuthUser {
  id: string; name: string; email: string; role: string
  company: { id: string; name: string; tier: string; pointsBalance: number }
}
interface AuthCtx {
  user: AuthUser | null; loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (tokens.access) {
      authApi.me()
        .then((u: any) => setUser({ id: u.id, name: u.name, email: u.email, role: u.role, company: u.company }))
        .catch(() => tokens.clear())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  async function login(email: string, password: string) {
    const res: LoginResponse = await authApi.login(email, password)
    tokens.set(res.accessToken, res.refreshToken)
    setUser({ id: res.user.id, name: res.user.name, email: res.user.email, role: res.user.role, company: res.user.company })
  }

  async function logout() {
    await authApi.logout().catch(() => {})
    tokens.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin: user?.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
