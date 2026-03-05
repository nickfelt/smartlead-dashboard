import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Megaphone, Mail, TrendingUp, Inbox, AlertTriangle, RefreshCw } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import api from '../../lib/api'
import { SkeletonCard } from '../../components/Skeleton'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OverviewStats {
  active_campaigns: number
  total_campaigns: number
  total_leads: number
  total_sent: number
  avg_open_rate: number
  avg_reply_rate: number
  unread_replies: number
  total_accounts: number
  active_accounts: number
  warmup_accounts: number
  failed_accounts: number
}

interface TopCampaign {
  id: number
  name: string
  status: string
  reply_rate: number
  open_rate: number
  leads: number
}

interface RecentReply {
  id: number
  lead_name: string
  lead_company: string
  subject: string
  timestamp: string
  campaign_name: string
}

interface OverviewData {
  stats: OverviewStats
  top_campaigns: TopCampaign[]
  recent_replies: RecentReply[]
}

const STATUS_DOT: Record<string, string> = {
  ACTIVE:    'bg-green-500',
  PAUSED:    'bg-yellow-500',
  DRAFT:     'bg-gray-400',
  COMPLETED: 'bg-blue-500',
  STOPPED:   'bg-red-500',
}

function fmtTime(iso: string) {
  try {
    const d = new Date(iso)
    const diff = Date.now() - d.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  } catch { return '' }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [data, setData]       = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get<OverviewData>('/dashboard/overview')
      .then(({ data }) => setData(data))
      .catch(() => showToast('Failed to load dashboard', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const s = data?.stats

  const statCards = s ? [
    {
      label: 'Active Campaigns',
      value: s.active_campaigns,
      sub: `${s.total_campaigns} total`,
      icon: <Megaphone size={20} />,
      color: 'bg-blue-500',
      to: '/dashboard/campaigns',
    },
    {
      label: 'Email Accounts',
      value: s.total_accounts,
      sub: s.failed_accounts > 0
        ? `${s.failed_accounts} need attention`
        : `${s.active_accounts} active`,
      subColor: s.failed_accounts > 0 ? 'text-red-500' : 'text-gray-400',
      icon: <Mail size={20} />,
      color: s.failed_accounts > 0 ? 'bg-red-500' : 'bg-green-500',
      to: '/dashboard/email-accounts',
    },
    {
      label: 'Unread Replies',
      value: s.unread_replies,
      sub: `${s.total_leads.toLocaleString()} total leads`,
      icon: <Inbox size={20} />,
      color: s.unread_replies > 0 ? 'bg-orange-500' : 'bg-gray-400',
      to: '/dashboard/inbox',
    },
    {
      label: 'Avg Reply Rate',
      value: `${s.avg_reply_rate}%`,
      sub: `${s.avg_open_rate}% open rate`,
      icon: <TrendingUp size={20} />,
      color: s.avg_reply_rate >= 5 ? 'bg-green-500' : s.avg_reply_rate >= 2 ? 'bg-brand-500' : 'bg-gray-400',
      to: '/dashboard/campaigns',
    },
  ] : []

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Here's how your campaigns are performing.</p>
        </div>
        <button onClick={load} title="Refresh"
          className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {statCards.map((card) => (
            <Link key={card.label} to={card.to}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-300 hover:shadow-sm transition-all group">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{card.label}</p>
                <div className={`${card.color} p-2 rounded-lg text-white transition-transform group-hover:scale-110`}>
                  {card.icon}
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              <p className={`text-xs mt-1 ${(card as { subColor?: string }).subColor ?? 'text-gray-400'}`}>
                {card.sub}
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* Failed accounts alert */}
      {!loading && s && s.failed_accounts > 0 && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm text-red-700">
          <AlertTriangle size={16} className="shrink-0" />
          {s.failed_accounts} email account{s.failed_accounts !== 1 ? 's' : ''} need{s.failed_accounts === 1 ? 's' : ''} attention.{' '}
          <Link to="/dashboard/email-accounts" className="underline font-medium">View accounts →</Link>
        </div>
      )}

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent replies */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800">Recent Replies</h2>
            <Link to="/dashboard/inbox" className="text-xs text-brand-600 hover:underline">View all →</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : data?.recent_replies.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No replies yet</p>
          ) : (
            <div className="space-y-1">
              {data?.recent_replies.map((r) => (
                <Link key={r.id} to="/dashboard/inbox"
                  className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-gray-50 transition-colors -mx-2">
                  <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-brand-600 text-xs font-semibold">
                      {(r.lead_name || '?')[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{r.lead_name} · {r.lead_company}</p>
                    <p className="text-xs text-gray-400 truncate">{r.subject}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{fmtTime(r.timestamp)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Top campaigns */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800">Top Campaigns</h2>
            <Link to="/dashboard/campaigns" className="text-xs text-brand-600 hover:underline">View all →</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between animate-pulse py-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-16" />
                </div>
              ))}
            </div>
          ) : data?.top_campaigns.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400 mb-3">No campaigns yet</p>
              <Link to="/dashboard/campaigns"
                className="text-xs text-brand-600 hover:underline font-medium">Create your first campaign →</Link>
            </div>
          ) : (
            <div className="space-y-0">
              {data?.top_campaigns.map((c) => (
                <Link key={c.id} to={`/dashboard/campaigns/${c.id}`}
                  className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[c.status] ?? 'bg-gray-300'}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.leads.toLocaleString()} leads · {c.open_rate}% open</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold shrink-0 ml-3 ${c.reply_rate >= 5 ? 'text-green-600' : c.reply_rate >= 2 ? 'text-brand-600' : 'text-gray-500'}`}>
                    {c.reply_rate}%
                  </span>
                </Link>
              ))}
            </div>
          )}
          {!loading && s && (
            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-xs text-gray-400">Total sent</p>
                <p className="text-base font-bold text-gray-800">{s.total_sent.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Avg open rate</p>
                <p className="text-base font-bold text-gray-800">{s.avg_open_rate}%</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Warmup health strip */}
      {!loading && s && s.warmup_accounts > 0 && (
        <div className="mt-5 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">{s.warmup_accounts}</span> account{s.warmup_accounts !== 1 ? 's' : ''} currently in warmup — sending is limited.
          </p>
          <Link to="/dashboard/email-accounts" className="text-xs text-yellow-700 underline font-medium">Manage →</Link>
        </div>
      )}
    </div>
  )
}
