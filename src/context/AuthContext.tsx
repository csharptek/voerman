import { createContext, useContext, useState, ReactNode } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  user: { name: string; company: string; email: string; tier: string } | null
  login: (email: string, password: string) => boolean
  logout: () => void
  registrationData: { company: string; email: string } | null
  setRegistrationData: (data: { company: string; email: string }) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<AuthContextType['user']>(null)
  const [registrationData, setRegistrationData] = useState<{ company: string; email: string } | null>(null)

  const login = (email: string, _password: string) => {
    // Demo login — replace with real API call
    if (email) {
      setUser({ name: 'John Doe', company: 'Acme Moving Co.', email, tier: 'Gold' })
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, registrationData, setRegistrationData }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
