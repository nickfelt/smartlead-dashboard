import { useState, useEffect } from 'react'
import { Users, DollarSign, Megaphone, Mail, TrendingUp, UserPlus, Loader2, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { useToast } from '../../contexts/ToastContext'

interface OverviewData {
  total_clients: number
  active_clients: number
  mrr_cents: number
  mrr_change_pct: number
  total_active_campaigns: number
  emails_sent_today: number
  emails_sent_this_week: number
  emails_sent_this_month: number
  ai_requests_this_month: number
  new_signups_last_30_days: number
  churn_rate: number
  tier_breakdown: Record<string, number>
  mrr_history: { month: string; mrr_cents: number }[]
  recent_signups: { email: string; company: string; tier: string; joined: string }[]
}

const TIER_COLOR: Record<string, string> = {
  free:       'bg-gray-100 text-gray-600',
  starter:    'bg-blue-100 text-blue-700',
  pro:        'bg-purple-100 text-purple-700',
  enterprise: 'bg-amber-100 text-amber-700',
}

function fmt(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export default function Admin() {
  const { showToast } = useToast()
  const [data, setData]     = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get<OverviewData>('/admin/overview')
      .then(({ data }) => setData(data))
      .catch(() => showToast('Failed to load overview', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-gray-400" />
      </div>
    )
  }

  if (!data) return null

  const maxMrr = Math.max(...data.mrr_history.map((m) => m.mrr_cents), 1)

  const statCards = [
    { label: 'Active Clients',    value: data.active_clients,           sub: `${data.total_clients} total`,                  icon: <Users size={20} />,      color: 'bg-blue-500' },
    { label: 'MRR',               value: fmt(data.mrr_cents),           sub: `+${data.mrr_change_pct}% MoM`,                 icon: <DollarSign size={20} />, color: 'bg-green-500' },
    { label: 'Active Campaigns',  value: data.total_active_campaigns,   sub: 'across all clients',                           icon: <Megaphone size={20} />,  color: 'bg-purple-500' },
    { label: 'Emails Today',      value: data.emails_sent_today.toLocaleString(), sub: `${data.emails_sent_this_month.toLocaleString()} this month`, icon: <Mail size={20} />,       color: 'bg-orange-500' },
    { label: 'AI Requests / Mo',  value: data.ai_requests_this_month,   sub: 'all providers',                                icon: <TrendingUp size={20} />, color: 'bg-indigo-500' },
    { label: 'New Signups (30d)', value: data.new_signups_last_30_days, sub: `${data.churn_rate}% churn rate`,              icon: <UserPlus size={20} />,   color: 'bg-rose-500' },
  ]

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
          <p className="text-gray-500 text-sm mt-0.5">Platform health and revenue at a glance</p>
        </div>
        <button onClick={load} className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {statCards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{c.label}</p>
              <div className={`${c.color} p-2 rounded-lg text-white`}>{c.icon}</div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{c.value}</p>
            <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MRR History */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">MRR — Last 12 Months</h2>
          <div className="space-y-2">
            {data.mrr_history.map((m) => (
              <div key={m.month} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-16 shrink-0">{m.month}</span>
                <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                  <div className="bg-brand-500 h-full rounded transition-all"
                    style={{ width: `${(m.mrr_cents / maxMrr) * 100}%` }} />
                </div>
                <span className="text-xs font-medium text-gray-700 w-20 text-right">{fmt(m.mrr_cents)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          {/* Tier breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Clients by Tier</h2>
            <div className="space-y-2">
              {Object.entries(data.tier_breakdown).map(([tier, count]) => (
                <div key={tier} className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${TIER_COLOR[tier] ?? 'bg-gray-100 text-gray-600'}`}>
                    {tier}
                  </span>
                  <span className="text-sm font-semibold text-gray-700">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent signups */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700">Recent Signups</h2>
              <Link to="/admin/clients" className="text-xs text-brand-600 hover:underline">View all</Link>
            </div>
            <div className="space-y-2">
              {data.recent_signups.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-brand-700">{s.email[0].toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{s.company}</p>
                    <p className="text-xs text-gray-400 truncate">{s.email}</p>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium capitalize shrink-0 ${TIER_COLOR[s.tier] ?? 'bg-gray-100 text-gray-600'}`}>
                    {s.tier}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
