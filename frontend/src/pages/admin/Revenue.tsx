import { useState, useEffect } from 'react'
import { Loader2, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'
import api from '../../lib/api'
import { useToast } from '../../contexts/ToastContext'

interface RevenueData {
  mrr_cents: number
  arr_cents: number
  mrr_change_pct: number
  total_subscribers: number
  paying_subscribers: number
  churn_rate: number
  avg_revenue_per_user_cents: number
  tier_breakdown: { tier: string; count: number; mrr_cents: number }[]
  mrr_history: { month: string; mrr_cents: number; new_mrr_cents: number; churned_mrr_cents: number }[]
}

const TIER_COLOR: Record<string, string> = {
  free:       'bg-gray-200',
  starter:    'bg-blue-400',
  pro:        'bg-purple-500',
  enterprise: 'bg-amber-500',
}

function fmt(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export default function Revenue() {
  const { showToast } = useToast()
  const [data, setData]       = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get<RevenueData>('/admin/revenue')
      .then(({ data }) => setData(data))
      .catch(() => showToast('Failed to load revenue data', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><Loader2 size={28} className="animate-spin text-gray-400" /></div>
  }
  if (!data) return null

  const maxMrr = Math.max(...data.mrr_history.map((m) => m.mrr_cents), 1)
  const totalMrr = data.tier_breakdown.reduce((s, t) => s + t.mrr_cents, 1)

  const statCards = [
    { label: 'MRR',          value: fmt(data.mrr_cents),         sub: `${data.mrr_change_pct > 0 ? '+' : ''}${data.mrr_change_pct}% MoM`, positive: data.mrr_change_pct >= 0 },
    { label: 'ARR',          value: fmt(data.arr_cents),         sub: 'annualized', positive: true },
    { label: 'Paying Users', value: data.paying_subscribers,     sub: `${data.total_subscribers} total`, positive: true },
    { label: 'ARPU',         value: fmt(data.avg_revenue_per_user_cents), sub: 'per paying user', positive: true },
    { label: 'Churn Rate',   value: `${data.churn_rate}%`,       sub: 'last 30 days', positive: data.churn_rate < 3 },
  ]

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue</h1>
          <p className="text-gray-500 text-sm mt-0.5">Stripe subscription analytics</p>
        </div>
        <button onClick={load} className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {statCards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{c.label}</p>
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
            <p className={`text-xs mt-1 flex items-center gap-1 ${c.positive ? 'text-green-600' : 'text-red-500'}`}>
              {c.positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {c.sub}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MRR chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">MRR History</h2>
          <div className="space-y-2">
            {data.mrr_history.map((m) => (
              <div key={m.month} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-16 shrink-0">{m.month}</span>
                <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden relative">
                  <div className="bg-brand-500 h-full rounded transition-all"
                    style={{ width: `${(m.mrr_cents / maxMrr) * 100}%` }} />
                  {m.new_mrr_cents > 0 && (
                    <div className="absolute right-0 top-0 h-full bg-green-400 opacity-60"
                      style={{ width: `${(m.new_mrr_cents / maxMrr) * 100}%` }} title={`New MRR: ${fmt(m.new_mrr_cents)}`} />
                  )}
                </div>
                <span className="text-xs font-medium text-gray-700 w-20 text-right">{fmt(m.mrr_cents)}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100">
            <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded bg-brand-500" /> Total MRR</span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded bg-green-400 opacity-70" /> New MRR</span>
          </div>
        </div>

        {/* Tier breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Revenue by Tier</h2>
          <div className="space-y-4">
            {data.tier_breakdown.filter((t) => t.mrr_cents > 0).map((t) => {
              const pct = Math.round((t.mrr_cents / totalMrr) * 100)
              return (
                <div key={t.tier}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700 capitalize">{t.tier}</span>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-gray-900">{fmt(t.mrr_cents)}</span>
                      <span className="text-xs text-gray-400 ml-1">({t.count} users)</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded overflow-hidden">
                    <div className={`${TIER_COLOR[t.tier] ?? 'bg-gray-400'} h-full rounded transition-all`}
                      style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{pct}% of MRR</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
