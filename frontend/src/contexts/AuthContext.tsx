import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { User, Session, SubscriptionTier } from '../types'
import { supabase } from '../lib/supabase'
import api from '../lib/api'

// ─── Mock users ───────────────────────────────────────────────────────────────

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

// ─── Toggle ───────────────────────────────────────────────────────────────────
// Set to false when VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are configured.

const USE_MOCK = true

// ─── Context ──────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  isAdmin: boolean
  subscriptionTier: SubscriptionTier | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  setSessionFromSignup: (session: Session) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // ── Mock mode bootstrap ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!USE_MOCK) return

    const stored = localStorage.getItem('mock_session')
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Session
        // Check token not expired
        if (parsed.expires_at > Date.now()) {
          setSession(parsed)
          setUser(parsed.user)
        } else {
          localStorage.removeItem('mock_session')
        }
      } catch {
        localStorage.removeItem('mock_session')
      }
    }
    setLoading(false)
  }, [])

  // ── Real Supabase bootstrap ──────────────────────────────────────────────────
  useEffect(() => {
    if (USE_MOCK) return

    supabase.auth.getSession().then(({ data: { session: sb } }) => {
      if (sb) _applySupabaseSession(sb)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sb) => {
      if (sb) _applySupabaseSession(sb)
      else { setUser(null); setSession(null) }
    })

    return () => subscription.unsubscribe()
  }, [])

  const _applySupabaseSession = async (sb: { access_token: string; refresh_token: string; expires_at?: number; user: { id: string; email?: string } }) => {
    const appSession: Session = {
      access_token: sb.access_token,
      refresh_token: sb.refresh_token,
      expires_at: (sb.expires_at ?? 0) * 1000,
      user: null as unknown as User, // filled below
    }
    setSession(appSession)
    localStorage.setItem('supabase_session', JSON.stringify(appSession))

    // Fetch full profile from our API
    try {
      const { data } = await api.get<User>('/auth/me')
      setUser(data)
      setSession({ ...appSession, user: data })
    } catch {
      setUser(null)
    }
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  const login = async (email: string, password: string) => {
    if (USE_MOCK) {
      const mockUser = email.toLowerCase().includes('admin') ? MOCK_ADMIN_USER : MOCK_USER
      const mockUser2 = { ...mockUser, email }
      const s: Session = {
        access_token: 'mock-token-' + Date.now(),
        refresh_token: 'mock-refresh-' + Date.now(),
        expires_at: Date.now() + 3600 * 1000,
        user: mockUser2,
      }
      localStorage.setItem('mock_session', JSON.stringify(s))
      setSession(s)
      setUser(mockUser2)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    // onAuthStateChange fires and calls _applySupabaseSession
  }

  const logout = async () => {
    if (USE_MOCK) {
      localStorage.removeItem('mock_session')
      setSession(null)
      setUser(null)
      return
    }
    await supabase.auth.signOut()
    localStorage.removeItem('supabase_session')
    setSession(null)
    setUser(null)
  }

  const refreshUser = useCallback(async () => {
    if (USE_MOCK) return
    try {
      const { data } = await api.get<User>('/auth/me')
      setUser(data)
    } catch {
      // silent
    }
  }, [])

  /** Called by the Signup page after a successful mock/real payment. */
  const setSessionFromSignup = (s: Session) => {
    localStorage.setItem('mock_session', JSON.stringify(s))
    setSession(s)
    setUser(s.user)
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
        setSessionFromSignup,
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
