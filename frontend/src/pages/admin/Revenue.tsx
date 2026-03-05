import { DollarSign } from 'lucide-react'

export default function Revenue() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Revenue</h1>
      <p className="text-gray-500 text-sm mb-8">Stripe revenue analytics and subscription data.</p>

      <div className="bg-white rounded-xl border border-gray-200 flex items-center justify-center h-64">
        <div className="text-center">
          <DollarSign size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-500">Revenue Analytics — Phase 6</h2>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            MRR, churn, LTV, and Stripe subscription data will be displayed here.
          </p>
        </div>
      </div>
    </div>
  )
}
