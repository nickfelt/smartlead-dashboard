import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'block w-full rounded-xl border border-[#D4C4A8] bg-white px-4 py-3 text-[#1A1A1A] placeholder-[#6B6B6B] focus:border-[#9A7E58] focus:outline-none focus:ring-2 focus:ring-[#9A7E58]/20 text-sm transition'

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-[#9A7E58] rounded-xl flex items-center justify-center">
            <span className="text-white font-serif font-bold text-lg leading-none">B</span>
          </div>
          <span className="font-serif font-semibold text-2xl text-[#1A1A1A] tracking-tight">Bookd</span>
        </Link>

        <h2 className="text-center text-2xl font-serif font-semibold text-[#1A1A1A]">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-[#6B6B6B]">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-[#9A7E58] hover:text-[#7D6440] transition-colors">
            Start your free trial
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8DDCB] py-8 px-6 sm:px-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                Email address
              </label>
              <input
                id="email" type="email" autoComplete="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                className={inputCls} placeholder="you@company.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                Password
              </label>
              <input
                id="password" type="password" autoComplete="current-password" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                className={inputCls} placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-full bg-[#D4C4A8] hover:bg-[#C4AE8A] text-[#1A1A1A] text-sm font-semibold disabled:opacity-60 transition-colors">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Sign in
            </button>
          </form>

          <div className="mt-5 p-3 bg-[#F5F0E8] rounded-xl text-xs text-[#6B6B6B]">
            <strong className="text-[#1A1A1A]">Dev mode:</strong> Enter any email to log in. Use "admin@..." for admin access.
          </div>
        </div>
      </div>
    </div>
  )
}
