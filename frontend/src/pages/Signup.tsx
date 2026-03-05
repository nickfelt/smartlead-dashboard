import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Megaphone, Check, Loader2 } from 'lucide-react'

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

export default function Signup() {
  const [selectedTier, setSelectedTier] = useState('Pro')
  const [step, setStep] = useState<'info' | 'plan' | 'payment'>('info')
  const [loading, setLoading] = useState(false)
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

  const handlePlanContinue = () => {
    setStep('payment')
  }

  const handleMockPayment = async () => {
    setLoading(true)
    // Simulate payment processing delay
    await new Promise((r) => setTimeout(r, 1500))
    alert(`Mock payment successful! Account created for ${formData.email} on the ${selectedTier} plan.\n\nIn production, this will redirect to Stripe Checkout.`)
    setLoading(false)
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

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {(['info', 'plan', 'payment'] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={[
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                  step === s
                    ? 'bg-brand-600 text-white'
                    : i < ['info', 'plan', 'payment'].indexOf(step)
                    ? 'bg-brand-100 text-brand-600'
                    : 'bg-gray-200 text-gray-400',
                ].join(' ')}
              >
                {i + 1}
              </div>
              {i < 2 && <div className="w-8 h-px bg-gray-300" />}
            </div>
          ))}
        </div>

        {/* Step 1: Account Info */}
        {step === 'info' && (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Your information</h2>
            <form className="space-y-4" onSubmit={handleInfoSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-brand-500"
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company name</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-brand-500"
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-brand-500"
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-brand-500"
                  placeholder="Min 8 characters"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                Continue
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Plan Selection */}
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
                    <div className="mt-4 pt-4 border-t border-brand-100">
                      <div className="text-xs text-brand-600 font-medium text-center">Selected</div>
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
                onClick={handlePlanContinue}
                className="px-8 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                Continue with {selectedTier}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment (mock) */}
        {step === 'payment' && (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment</h2>
            <p className="text-sm text-gray-500 mb-6">
              {selectedTier} plan — ${TIERS.find((t) => t.name === selectedTier)?.price}/mo
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6 text-sm text-blue-700">
              <strong>Dev mode:</strong> Real payment will redirect to Stripe Checkout. Click the button below to simulate a successful payment.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('plan')}
                className="flex-1 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleMockPayment}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-md text-sm font-medium disabled:opacity-60"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? 'Processing...' : 'Complete signup (mock)'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
