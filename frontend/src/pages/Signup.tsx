import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import api from '../lib/api'
import type { Session } from '../types'

interface TierCard {
  name: string
  monthlyPrice: number
  annualPrice: number
  description: string
  features: string[]
  highlighted: boolean
  cta: string
}

const TIERS: TierCard[] = [
  {
    name: 'Starter',
    monthlyPrice: 149,
    annualPrice: 119,
    description: 'Perfect for solo operators and small teams getting started with cold email.',
    features: [
      '5 mailboxes',
      '6,000 emails / month',
      '2,000 active leads',
      '3 active campaigns',
      'Unified inbox',
      'Basic analytics',
      'Email support',
    ],
    highlighted: false,
    cta: 'Start free trial',
  },
  {
    name: 'Pro',
    monthlyPrice: 249,
    annualPrice: 199,
    description: 'For growing agencies running multiple clients and high-volume campaigns.',
    features: [
      'Unlimited mailboxes',
      '150,000 emails / month',
      '30,000 active leads',
      'Unlimited campaigns',
      'AI copy engine (incl. custom first lines)',
      'Client portals',
      'Smart Senders',
      'Advanced analytics',
      'Priority support',
    ],
    highlighted: true,
    cta: 'Start free trial',
  },
  {
    name: 'Enterprise',
    monthlyPrice: 497,
    annualPrice: 397,
    description: 'Custom volume, white-label branding, and dedicated success management.',
    features: [
      'Everything in Pro',
      'Unlimited emails',
      'Unlimited active leads',
      'White-label branding',
      'Custom domain',
      'SSO / SAML',
      'Dedicated CSM',
      'SLA guarantee',
      'Custom contracts',
    ],
    highlighted: false,
    cta: 'Book a call',
  },
]

type Step = 'info' | 'plan' | 'payment'

const STEP_LABELS: Record<Step, string> = { info: 'Account', plan: 'Plan', payment: 'Payment' }
const STEPS: Step[] = ['info', 'plan', 'payment']

export default function Signup() {
  const { setSessionFromSignup } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [selectedTier, setSelectedTier] = useState('Pro')
  const [annual, setAnnual] = useState(false)
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
        setSessionFromSignup(data.session)
        showToast(`Welcome, ${formData.fullName}! Your account is ready.`, 'success')
        navigate('/dashboard')
      } else if (data.checkout_url) {
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

  const selectedTierData = TIERS.find((t) => t.name === selectedTier)!
  const displayPrice = annual ? selectedTierData.annualPrice : selectedTierData.monthlyPrice

  const inputCls =
    'block w-full rounded-xl border border-[#D4C4A8] bg-white px-4 py-3 text-[#1A1A1A] placeholder-[#9A9A9A] focus:border-[#9A7E58] focus:outline-none focus:ring-2 focus:ring-[#9A7E58]/20 text-sm transition'

  return (
    <div className="min-h-screen bg-[#F5F0E8] py-12 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-[#9A7E58] rounded-xl flex items-center justify-center">
              <span className="text-white font-serif font-bold text-base leading-none">B</span>
            </div>
            <span className="font-serif font-semibold text-2xl text-[#1A1A1A] tracking-tight">Bookd</span>
          </Link>
          <h1 className="text-2xl font-serif font-semibold text-[#1A1A1A]">Create your account</h1>
          <p className="mt-2 text-sm text-[#6B6B6B]">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#9A7E58] hover:text-[#7D6440] transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((s, i) => {
            const stepIndex = STEPS.indexOf(step)
            const done = i < stepIndex
            const active = step === s
            return (
              <div key={s} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div
                    className={[
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
                      active
                        ? 'bg-[#9A7E58] text-white'
                        : done
                        ? 'bg-[#D4C4A8] text-[#7D6440]'
                        : 'bg-white border border-[#D4C4A8] text-[#9A9A9A]',
                    ].join(' ')}
                  >
                    {done ? <Check size={12} /> : i + 1}
                  </div>
                  <span className={`text-xs font-medium ${active ? 'text-[#9A7E58]' : 'text-[#9A9A9A]'}`}>
                    {STEP_LABELS[s]}
                  </span>
                </div>
                {i < STEPS.length - 1 && <div className="w-8 h-px bg-[#D4C4A8]" />}
              </div>
            )
          })}
        </div>

        {/* ── Step 1: Account info ────────────────────────────────────────── */}
        {step === 'info' && (
          <div className="max-w-md mx-auto bg-white rounded-2xl border border-[#E8DDCB] shadow-sm py-8 px-6 sm:px-8">
            <h2 className="text-lg font-semibold text-[#1A1A1A] mb-6">Your information</h2>
            <form className="space-y-4" onSubmit={handleInfoSubmit}>
              {[
                { label: 'Full name', key: 'fullName', type: 'text', placeholder: 'Jane Smith' },
                { label: 'Company name', key: 'companyName', type: 'text', placeholder: 'Acme Corp' },
                { label: 'Work email', key: 'email', type: 'email', placeholder: 'you@company.com' },
                { label: 'Password', key: 'password', type: 'password', placeholder: 'Min 8 characters' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">{label}</label>
                  <input
                    type={type}
                    required
                    minLength={key === 'password' ? 8 : undefined}
                    value={formData[key as keyof typeof formData]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    className={inputCls}
                    placeholder={placeholder}
                  />
                </div>
              ))}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-full bg-[#9A7E58] hover:bg-[#7D6440] text-white text-sm font-semibold transition-colors mt-2"
              >
                Continue
              </button>
            </form>
          </div>
        )}

        {/* ── Step 2: Plan selection ──────────────────────────────────────── */}
        {step === 'plan' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Choose your plan</h2>
              {/* Annual toggle */}
              <div className="inline-flex items-center gap-3 bg-white border border-[#E8DDCB] rounded-full p-1 shadow-sm">
                <button
                  onClick={() => setAnnual(false)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    !annual ? 'bg-[#9A7E58] text-white shadow-sm' : 'text-[#6B6B6B]'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setAnnual(true)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    annual ? 'bg-[#9A7E58] text-white shadow-sm' : 'text-[#6B6B6B]'
                  }`}
                >
                  Annual
                  <span className={`ml-1.5 text-xs font-semibold ${annual ? 'text-[#E8C88A]' : 'text-[#9A7E58]'}`}>
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              {TIERS.map((tier) => {
                const price = annual ? tier.annualPrice : tier.monthlyPrice
                const isSelected = selectedTier === tier.name
                return (
                  <div
                    key={tier.name}
                    onClick={() => setSelectedTier(tier.name)}
                    className={[
                      'relative rounded-2xl border-2 p-6 cursor-pointer transition-all flex flex-col',
                      tier.highlighted
                        ? 'bg-[#3E3018] text-white border-[#9A7E58]'
                        : 'bg-white border-[#E8DDCB] hover:border-[#C4AE8A]',
                      isSelected && !tier.highlighted ? 'border-[#9A7E58] shadow-md' : '',
                    ].join(' ')}
                  >
                    {tier.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#9A7E58] rounded-full text-white text-xs font-semibold whitespace-nowrap">
                        Most Popular
                      </div>
                    )}

                    <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${tier.highlighted ? 'text-[#E8C88A]' : 'text-[#9A7E58]'}`}>
                      {tier.name}
                    </div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className={`font-serif text-4xl font-bold ${tier.highlighted ? 'text-white' : 'text-[#1A1A1A]'}`}>
                        ${price}
                      </span>
                      <span className={`text-sm ${tier.highlighted ? 'text-white/60' : 'text-[#6B6B6B]'}`}>/mo</span>
                    </div>
                    {annual && (
                      <div className={`text-xs mb-3 ${tier.highlighted ? 'text-[#E8C88A]' : 'text-[#9A7E58]'}`}>
                        Billed ${price * 12}/year
                      </div>
                    )}
                    <p className={`text-sm mb-5 leading-relaxed ${tier.highlighted ? 'text-white/70' : 'text-[#6B6B6B]'}`}>
                      {tier.description}
                    </p>

                    <ul className="space-y-2 flex-1">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <Check
                            size={14}
                            className={`flex-shrink-0 mt-0.5 ${tier.highlighted ? 'text-[#E8C88A]' : 'text-[#9A7E58]'}`}
                          />
                          <span className={tier.highlighted ? 'text-white/80' : 'text-[#4A4A4A]'}>{f}</span>
                        </li>
                      ))}
                    </ul>

                    {isSelected && (
                      <div className={`mt-4 pt-3 border-t text-xs font-semibold text-center ${
                        tier.highlighted ? 'border-white/20 text-[#E8C88A]' : 'border-[#E8DDCB] text-[#9A7E58]'
                      }`}>
                        Selected
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <p className="text-center text-sm text-[#6B6B6B] mb-6">
              All plans include a 14-day free trial. No credit card required.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setStep('info')}
                className="px-6 py-2.5 border border-[#D4C4A8] rounded-full text-sm font-medium text-[#4A4A4A] hover:border-[#9A7E58] hover:text-[#9A7E58] transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep('payment')}
                className="px-8 py-2.5 rounded-full bg-[#9A7E58] hover:bg-[#7D6440] text-white text-sm font-semibold transition-colors"
              >
                Continue with {selectedTier}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Payment ─────────────────────────────────────────────── */}
        {step === 'payment' && (
          <div className="max-w-md mx-auto bg-white rounded-2xl border border-[#E8DDCB] shadow-sm py-8 px-6 sm:px-8">
            <h2 className="text-lg font-semibold text-[#1A1A1A] mb-1">Complete your purchase</h2>
            <p className="text-sm text-[#6B6B6B] mb-6">
              {selectedTier} plan — ${displayPrice}/month{annual ? ' (billed annually)' : ''}
            </p>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Order summary */}
            <div className="bg-[#F5F0E8] rounded-xl p-4 mb-6 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Plan</span>
                <span className="font-medium text-[#1A1A1A]">{selectedTier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Billing</span>
                <span className="font-medium text-[#1A1A1A]">{annual ? 'Annual' : 'Monthly'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Account</span>
                <span className="font-medium text-[#1A1A1A] truncate max-w-[180px]">{formData.email}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E8DDCB] font-semibold text-[#1A1A1A]">
                <span>Total</span>
                <span>${displayPrice}/mo</span>
              </div>
            </div>

            <div className="bg-[#F5F0E8] rounded-xl p-3 mb-6 text-xs text-[#6B6B6B]">
              <strong className="text-[#1A1A1A]">Dev mode:</strong> Clicking below calls the API and logs you in immediately. In production this redirects to Stripe Checkout.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('plan')}
                disabled={loading}
                className="flex-1 py-3 border border-[#D4C4A8] rounded-full text-sm font-medium text-[#4A4A4A] hover:border-[#9A7E58] hover:text-[#9A7E58] disabled:opacity-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-[#9A7E58] hover:bg-[#7D6440] text-white text-sm font-semibold disabled:opacity-60 transition-colors"
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
