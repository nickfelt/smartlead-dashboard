import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Megaphone, Check, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import api from '../lib/api'
import type { Session } from '../types'

interface TierCard {
  name: string
  price: number
  description: string
  features: string[]
  highlighted: boolean
}

const TIERS: TierCard[] = [
  {
    name: 'Starter',
    price: 97,
    description: 'Perfect for solo founders and small teams getting started.',
    features: [
      '3 active campaigns',
      '5 email accounts',
      '1,000 leads/campaign',
      '500 emails/day',
      'Master inbox',
    ],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 197,
    description: 'For growing teams running multiple outreach campaigns.',
    features: [
      '15 active campaigns',
      '25 email accounts',
      '5,000 leads/campaign',
      '2,000 emails/day',
      'AI email writer',
      'Master inbox',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 497,
    description: 'Unlimited scale for agencies and high-volume senders.',
    features: [
      'Unlimited campaigns',
      '100 email accounts',
      '25,000 leads/campaign',
      '10,000 emails/day',
      'AI email writer',
      'Smart Senders (mailbox purchasing)',
      'Priority support',
    ],
    highlighted: false,
  },
]

type Step = 'info' | 'plan' | 'payment'

export default function Signup() {
  const { setSessionFromSignup } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [selectedTier, setSelectedTier] = useState('Pro')
  const [step, setStep] = useState<Step>('info')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    companyName: '',
  })

  const handleInfoSubmit = (e: FormEvent) => {
    e.preventDefault()
    setStep('plan')
  }

  const handleCheckout = async () => {
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post<{
        checkout_url?: string
        mock?: boolean
        session?: Session
      }>('/auth/signup', {
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        company_name: formData.companyName,
        tier: selectedTier.toLowerCase(),
      })

      if (data.mock && data.session) {
        // Mock mode: backend returned a session directly — log in immediately
        setSessionFromSignup(data.session)
        showToast(`Welcome, ${formData.fullName}! Your account is ready.`, 'success')
        navigate('/dashboard')
      } else if (data.checkout_url) {
        // Real mode: redirect to Stripe Checkout
        window.location.href = data.checkout_url
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Signup failed. Please try again.'
      setError(msg)
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center">
              <Megaphone size={24} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-2 text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-medium hover:text-brand-500">
              Sign in
            </Link>
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {(['info', 'plan', 'payment'] as const).map((s, i) => {
            const stepIndex = ['info', 'plan', 'payment'].indexOf(step)
            return (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={[
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                    step === s
                      ? 'bg-brand-600 text-white'
                      : i < stepIndex
                      ? 'bg-brand-100 text-brand-600'
                      : 'bg-gray-200 text-gray-400',
                  ].join(' ')}
                >
                  {i < stepIndex ? <Check size={14} /> : i + 1}
                </div>
                {i < 2 && <div className="w-8 h-px bg-gray-300" />}
              </div>
            )
          })}
        </div>

        {/* Step 1: Account info */}
        {step === 'info' && (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Your information</h2>
            <form className="space-y-4" onSubmit={handleInfoSubmit}>
              {[
                { label: 'Full name', key: 'fullName', type: 'text', placeholder: 'Jane Smith' },
                { label: 'Company name', key: 'companyName', type: 'text', placeholder: 'Acme Corp' },
                { label: 'Work email', key: 'email', type: 'email', placeholder: 'you@company.com' },
                { label: 'Password', key: 'password', type: 'password', placeholder: 'Min 8 characters' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type={type}
                    required
                    minLength={key === 'password' ? 8 : undefined}
                    value={formData[key as keyof typeof formData]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    placeholder={placeholder}
                  />
                </div>
              ))}
              <button
                type="submit"
                className="w-full py-2 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                Continue
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Plan selection */}
        {step === 'plan' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-8">Choose your plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {TIERS.map((tier) => (
                <div
                  key={tier.name}
                  onClick={() => setSelectedTier(tier.name)}
                  className={[
                    'relative bg-white rounded-xl border-2 p-6 cursor-pointer transition-all',
                    selectedTier === tier.name
                      ? 'border-brand-600 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300',
                    tier.highlighted ? 'ring-2 ring-brand-200' : '',
                  ].join(' ')}
                >
                  {tier.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Most popular
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{tier.name}</h3>
                    <p className="text-gray-500 text-sm mt-1">{tier.description}</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">${tier.price}</span>
                    <span className="text-gray-500">/mo</span>
                  </div>
                  <ul className="space-y-2">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check size={16} className="text-brand-600 mt-0.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {selectedTier === tier.name && (
                    <div className="mt-4 pt-4 border-t border-brand-100 text-xs text-brand-600 font-medium text-center">
                      Selected
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setStep('info')}
                className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep('payment')}
                className="px-8 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                Continue with {selectedTier}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 'payment' && (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Complete your purchase</h2>
            <p className="text-sm text-gray-500 mb-6">
              {selectedTier} plan — ${TIERS.find((t) => t.name === selectedTier)?.price}/month
            </p>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            {/* Order summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Plan</span>
                <span className="font-medium">{selectedTier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account</span>
                <span className="font-medium">{formData.email}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                <span>Total</span>
                <span>${TIERS.find((t) => t.name === selectedTier)?.price}/mo</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-6 text-xs text-blue-700">
              <strong>Dev mode:</strong> Clicking below calls the API and logs you in immediately. In production this redirects to Stripe Checkout.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('plan')}
                disabled={loading}
                className="flex-1 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-md text-sm font-medium disabled:opacity-60 transition-colors"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? 'Creating account...' : 'Complete signup'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
