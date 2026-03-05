import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { User, Session, SubscriptionTier } from '../types'

// ─── Mock user for dev (USE_MOCK=true) ───────────────────────────────────────

const MOCK_USER: User = {
  id: 'mock-user-001',
  email: 'demo@example.com',
  full_name: 'Demo User',
  company_name: 'Acme Corp',
  smartlead_client_id: 42,
  stripe_customer_id: 'cus_mock123',
  subscription_tier: 'pro',
  subscription_status: 'active',
  is_admin: false,
  has_anthropic_key: true,
  has_openai_key: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const MOCK_ADMIN_USER: User = {
  ...MOCK_USER,
  id: 'mock-admin-001',
  email: 'admin@feltmarketing.com',
  full_name: 'Nick Felt',
  company_name: 'Felt Marketing',
  is_admin: true,
}

// ─── Context shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  isAdmin: boolean
  subscriptionTier: SubscriptionTier | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

const USE_MOCK = true // flip to false when wiring up real Supabase

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (USE_MOCK) {
      // Load persisted mock session from localStorage
      const stored = localStorage.getItem('mock_session')
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Session
          setSession(parsed)
          setUser(parsed.user)
        } catch {
          localStorage.removeItem('mock_session')
        }
      }
      setLoading(false)
      return
    }
    // Real Supabase auth will go here in Phase 2
    setLoading(false)
  }, [])

  const login = async (email: string, _password: string) => {
    if (USE_MOCK) {
      const mockUser = email.includes('admin') ? MOCK_ADMIN_USER : MOCK_USER
      const mockSession: Session = {
        access_token: 'mock-token-' + Date.now(),
        refresh_token: 'mock-refresh-' + Date.now(),
        expires_at: Date.now() + 3600 * 1000,
        user: mockUser,
      }
      localStorage.setItem('mock_session', JSON.stringify(mockSession))
      setSession(mockSession)
      setUser(mockUser)
      return
    }
    // Real Supabase login goes here in Phase 2
  }

  const logout = async () => {
    if (USE_MOCK) {
      localStorage.removeItem('mock_session')
      setSession(null)
      setUser(null)
      return
    }
    // Real Supabase logout goes here in Phase 2
  }

  const refreshUser = async () => {
    if (USE_MOCK) return
    // Real Supabase refresh goes here in Phase 2
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin: user?.is_admin ?? false,
        subscriptionTier: user?.subscription_tier ?? null,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
