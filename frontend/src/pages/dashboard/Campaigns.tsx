import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Play, Pause, Trash2, Loader2, Megaphone, X } from 'lucide-react'
import api from '../../lib/api'
import { useToast } from '../../contexts/ToastContext'
import type { Campaign, CampaignStatus } from '../../types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS: Record<CampaignStatus, { label: string; color: string }> = {
  DRAFT:     { label: 'Draft',     color: 'bg-gray-100 text-gray-600' },
  ACTIVE:    { label: 'Active',    color: 'bg-green-100 text-green-700' },
  PAUSED:    { label: 'Paused',    color: 'bg-yellow-100 text-yellow-700' },
  COMPLETED: { label: 'Completed', color: 'bg-blue-100 text-blue-700' },
  STOPPED:   { label: 'Stopped',   color: 'bg-red-100 text-red-700' },
}

type FilterStatus = 'ALL' | CampaignStatus

// ─── New Campaign Modal ───────────────────────────────────────────────────────

function NewCampaignModal({ onClose, onCreate }: { onClose: () => void; onCreate: (id: number) => void }) {
  const { showToast } = useToast()
  const [name, setName]       = useState('')
  const [saving, setSaving]   = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const { data } = await api.post<{ id: number; name: string }>('/campaigns', { name: name.trim() })
      showToast(`Campaign "${name}" created`, 'success')
      onCreate(data.id)
    } catch {
      showToast('Failed to create campaign', 'error')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">New Campaign</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign name</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="e.g. Q1 SaaS Outreach"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-200"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleCreate} disabled={saving || !name.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
              {saving && <Loader2 size={14} className="animate-spin" />}
              Create & Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Campaigns() {
  const { showToast } = useToast()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState<FilterStatus>('ALL')
  const [showNew, setShowNew]     = useState(false)
  const [deleting, setDeleting]   = useState<number | null>(null)

  useEffect(() => {
    api.get<Campaign[]>('/campaigns')
      .then(({ data }) => setCampaigns(data))
      .catch(() => showToast('Failed to load campaigns', 'error'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusToggle = async (c: Campaign) => {
    const next = c.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    try {
      await api.post(`/campaigns/${c.id}/status`, { status: next })
      setCampaigns((prev) => prev.map((x) => x.id === c.id ? { ...x, status: next } : x))
      showToast(`Campaign ${next === 'ACTIVE' ? 'started' : 'paused'}`, 'success')
    } catch {
      showToast('Status update failed', 'error')
    }
  }

  const handleDelete = async (c: Campaign) => {
    if (!confirm(`Delete "${c.name}"? This cannot be undone.`)) return
    setDeleting(c.id)
    try {
      await api.delete(`/campaigns/${c.id}`)
      setCampaigns((prev) => prev.filter((x) => x.id !== c.id))
      showToast('Campaign deleted', 'success')
    } catch {
      showToast('Delete failed', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const handleCreated = (newId: number) => {
    setShowNew(false)
    window.location.href = `/dashboard/campaigns/${newId}`
  }

  const FILTER_TABS: { key: FilterStatus; label: string }[] = [
    { key: 'ALL',       label: 'All' },
    { key: 'ACTIVE',    label: 'Active' },
    { key: 'PAUSED',    label: 'Paused' },
    { key: 'DRAFT',     label: 'Draft' },
    { key: 'COMPLETED', label: 'Completed' },
  ]

  const visible = filter === 'ALL' ? campaigns : campaigns.filter((c) => c.status === filter)

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {showNew && <NewCampaignModal onClose={() => setShowNew(false)} onCreate={handleCreated} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> New Campaign
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {FILTER_TABS.map((tab) => {
          const count = tab.key === 'ALL' ? campaigns.length : campaigns.filter((c) => c.status === tab.key).length
          return (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                filter === tab.key ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {tab.label}
              {count > 0 && <span className="ml-1.5 text-xs text-gray-400">({count})</span>}
            </button>
          )
        })}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-32"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-center bg-white rounded-xl border border-gray-200">
          <Megaphone size={40} className="text-gray-300 mb-3" />
          <p className="font-semibold text-gray-500">No campaigns yet</p>
          <p className="text-sm text-gray-400 mt-1">Create your first campaign to get started.</p>
          <button onClick={() => setShowNew(true)}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
            <Plus size={14} /> Create Campaign
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Campaign', 'Status', 'Leads', 'Sent', 'Open %', 'Reply %', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visible.map((c) => {
                const s = STATUS[c.status]
                return (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/dashboard/campaigns/${c.id}`}
                        className="font-medium text-gray-900 hover:text-brand-600 transition-colors">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.leads_count.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-600">{c.stats.total_sent.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={c.stats.open_rate >= 30 ? 'text-green-600 font-medium' : 'text-gray-600'}>
                        {c.stats.open_rate}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={c.stats.reply_rate >= 5 ? 'text-green-600 font-medium' : 'text-gray-600'}>
                        {c.stats.reply_rate}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {(c.status === 'ACTIVE' || c.status === 'PAUSED' || c.status === 'DRAFT') && (
                          <button onClick={() => handleStatusToggle(c)}
                            title={c.status === 'ACTIVE' ? 'Pause' : 'Start'}
                            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
                            {c.status === 'ACTIVE' ? <Pause size={15} /> : <Play size={15} />}
                          </button>
                        )}
                        <button onClick={() => handleDelete(c)} disabled={deleting === c.id}
                          title="Delete"
                          className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50">
                          {deleting === c.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
