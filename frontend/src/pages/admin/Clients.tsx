import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, RefreshCw, ShieldOff, ShieldCheck, Pencil, X, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../lib/api'
import { useToast } from '../../contexts/ToastContext'

interface Client {
  id: string
  email: string
  full_name: string
  company_name: string
  subscription_tier: string
  subscription_status: string
  smartlead_client_id: number | null
  campaigns_count: number
  email_accounts_count: number
  emails_sent_30d: number
  signup_date: string
  last_active: string
  is_suspended: boolean
}

const TIER_COLOR: Record<string, string> = {
  free:       'bg-gray-100 text-gray-600',
  starter:    'bg-blue-100 text-blue-700',
  pro:        'bg-purple-100 text-purple-700',
  enterprise: 'bg-amber-100 text-amber-700',
}

const STATUS_COLOR: Record<string, string> = {
  active:    'bg-green-100 text-green-700',
  past_due:  'bg-yellow-100 text-yellow-700',
  canceled:  'bg-red-100 text-red-700',
  trialing:  'bg-blue-100 text-blue-700',
}

const TIERS = ['free', 'starter', 'pro', 'enterprise']

// ─── Tier Override Modal ──────────────────────────────────────────────────────

function TierModal({ client, onClose, onSaved }: { client: Client; onClose: () => void; onSaved: () => void }) {
  const { showToast } = useToast()
  const [tier, setTier]     = useState(client.subscription_tier)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch(`/admin/clients/${client.id}/tier`, { subscription_tier: tier, reason })
      showToast(`Tier updated to ${tier}`, 'success')
      onSaved()
    } catch {
      showToast('Failed to update tier', 'error')
      setSaving(false)
    }
  }

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-200'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Override Subscription Tier</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-500">{client.email} · <span className="font-medium text-gray-700">{client.company_name}</span></p>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">New tier</label>
            <select value={tier} onChange={(e) => setTier(e.target.value)} className={`${inputCls} bg-white`}>
              {TIERS.map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Reason (optional)</label>
            <input type="text" value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Promotional, partnership deal" className={inputCls} />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={saving || tier === client.subscription_tier}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
            {saving && <Loader2 size={14} className="animate-spin" />} Apply Override
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const LIMIT = 20

export default function Clients() {
  const { showToast } = useToast()
  const [clients, setClients]       = useState<Client[]>([])
  const [total, setTotal]           = useState(0)
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [offset, setOffset]         = useState(0)
  const [editClient, setEditClient] = useState<Client | null>(null)
  const [actioning, setActioning]   = useState<string | null>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = (off = 0, q = search, t = tierFilter) => {
    setLoading(true)
    const params: Record<string, string | number> = { offset: off, limit: LIMIT }
    if (q) params.search = q
    if (t) params.tier = t
    api.get<{ data: Client[]; total: number }>('/admin/clients', { params })
      .then(({ data }) => { setClients(data.data); setTotal(data.total); setOffset(off) })
      .catch(() => showToast('Failed to load clients', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (q: string) => {
    setSearch(q)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => load(0, q, tierFilter), 350)
  }

  const handleTierFilter = (t: string) => {
    setTierFilter(t)
    load(0, search, t)
  }

  const handleSuspend = async (c: Client) => {
    if (!confirm(`Suspend ${c.email}?`)) return
    setActioning(c.id)
    try {
      await api.post(`/admin/clients/${c.id}/suspend`, {})
      showToast('Client suspended', 'success')
      load(offset)
    } catch {
      showToast('Action failed', 'error')
    } finally {
      setActioning(null)
    }
  }

  const handleReactivate = async (c: Client) => {
    setActioning(c.id)
    try {
      await api.post(`/admin/clients/${c.id}/reactivate`, {})
      showToast('Client reactivated', 'success')
      load(offset)
    } catch {
      showToast('Action failed', 'error')
    } finally {
      setActioning(null)
    }
  }

  const pages = Math.ceil(total / LIMIT)
  const page  = Math.floor(offset / LIMIT) + 1

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {editClient && (
        <TierModal client={editClient} onClose={() => setEditClient(null)} onSaved={() => { setEditClient(null); load(offset) }} />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} total clients</p>
        </div>
        <button onClick={() => load(offset)} className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search email, name, company…"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-brand-500" />
        </div>
        <select value={tierFilter} onChange={(e) => handleTierFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-brand-500">
          <option value="">All tiers</option>
          {TIERS.map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center h-32 items-center"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Client', 'Tier', 'Status', 'Campaigns', 'Emails (30d)', 'Last Active', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {clients.map((c) => (
                <tr key={c.id} className={`hover:bg-gray-50 transition-colors ${c.is_suspended ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{c.full_name}</p>
                      <p className="text-xs text-gray-400">{c.email}</p>
                      <p className="text-xs text-gray-400">{c.company_name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${TIER_COLOR[c.subscription_tier] ?? 'bg-gray-100 text-gray-600'}`}>
                      {c.subscription_tier}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${c.is_suspended ? 'bg-red-100 text-red-600' : (STATUS_COLOR[c.subscription_status] ?? 'bg-gray-100 text-gray-600')}`}>
                      {c.is_suspended ? 'Suspended' : c.subscription_status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.campaigns_count}</td>
                  <td className="px-4 py-3 text-gray-600">{c.emails_sent_30d.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(c.last_active).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditClient(c)} title="Override tier"
                        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-brand-600 transition-colors">
                        <Pencil size={14} />
                      </button>
                      {c.is_suspended ? (
                        <button onClick={() => handleReactivate(c)} disabled={actioning === c.id} title="Reactivate"
                          className="p-1.5 rounded-md hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50">
                          {actioning === c.id ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                        </button>
                      ) : (
                        <button onClick={() => handleSuspend(c)} disabled={actioning === c.id} title="Suspend"
                          className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50">
                          {actioning === c.id ? <Loader2 size={14} className="animate-spin" /> : <ShieldOff size={14} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">Page {page} of {pages} · {total} clients</span>
              <div className="flex gap-1">
                <button onClick={() => load(offset - LIMIT)} disabled={offset === 0}
                  className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                  <ChevronLeft size={14} />
                </button>
                <button onClick={() => load(offset + LIMIT)} disabled={offset + LIMIT >= total}
                  className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
