import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, RefreshCw, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../lib/api'
import { useToast } from '../../contexts/ToastContext'

interface LogEntry {
  id: string
  user_id: string
  user_email: string
  action: string
  resource_type: string
  resource_id: string
  details: Record<string, unknown>
  ip_address: string
  created_at: string
}

const ACTION_COLOR: Record<string, string> = {
  campaign:      'bg-purple-100 text-purple-700',
  inbox:         'bg-blue-100 text-blue-700',
  email_account: 'bg-orange-100 text-orange-700',
  ai:            'bg-indigo-100 text-indigo-700',
  admin:         'bg-red-100 text-red-700',
  settings:      'bg-gray-100 text-gray-600',
  smart_senders: 'bg-amber-100 text-amber-700',
}

const ACTION_GROUPS = [
  { label: 'All', value: '' },
  { label: 'Campaigns', value: 'campaign' },
  { label: 'Inbox', value: 'inbox' },
  { label: 'Email Accounts', value: 'email_account' },
  { label: 'AI', value: 'ai' },
  { label: 'Admin', value: 'admin' },
  { label: 'Settings', value: 'settings' },
]

const LIMIT = 50

function fmtAction(action: string) {
  return action.replace(/\./g, ' › ').replace(/_/g, ' ')
}

function fmtTime(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

export default function Logs() {
  const { showToast } = useToast()
  const [logs, setLogs]             = useState<LogEntry[]>([])
  const [total, setTotal]           = useState(0)
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [offset, setOffset]         = useState(0)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = (off = 0, q = search, af = actionFilter) => {
    setLoading(true)
    const params: Record<string, string | number> = { offset: off, limit: LIMIT }
    if (q) params.search = q
    if (af) params.action_filter = af
    api.get<{ data: LogEntry[]; total: number }>('/admin/logs', { params })
      .then(({ data }) => { setLogs(data.data); setTotal(data.total); setOffset(off) })
      .catch(() => showToast('Failed to load logs', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (q: string) => {
    setSearch(q)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => load(0, q, actionFilter), 350)
  }

  const handleActionFilter = (af: string) => {
    setActionFilter(af)
    load(0, search, af)
  }

  const exportCsv = () => {
    const headers = ['ID', 'Time', 'User', 'Action', 'Resource Type', 'Resource ID', 'IP']
    const rows = logs.map((l) => [
      l.id, l.created_at, l.user_email, l.action,
      l.resource_type, l.resource_id, l.ip_address,
    ])
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v ?? ''}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const pages = Math.ceil(total / LIMIT)
  const page  = Math.floor(offset / LIMIT) + 1

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total.toLocaleString()} events recorded</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} title="Export CSV"
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export
          </button>
          <button onClick={() => load(offset)} className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search action, user, resource…"
            className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-brand-500 w-64" />
        </div>
        <div className="flex gap-1 border border-gray-200 rounded-lg overflow-hidden bg-white">
          {ACTION_GROUPS.map((g) => (
            <button key={g.value} onClick={() => handleActionFilter(g.value)}
              className={`px-3 py-2 text-xs font-medium transition-colors ${actionFilter === g.value ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center h-32 items-center"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
      ) : logs.length === 0 ? (
        <div className="flex items-center justify-center h-32 bg-white rounded-xl border border-gray-200 text-gray-400 text-sm">
          No logs found
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Time', 'User', 'Action', 'Resource', 'IP'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((l) => {
                const group = l.action.split('.')[0]
                return (
                  <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">{fmtTime(l.created_at)}</td>
                    <td className="px-4 py-2.5">
                      <p className="text-xs font-medium text-gray-800">{l.user_email}</p>
                      <p className="text-xs text-gray-400 font-mono">{l.user_id}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_COLOR[group] ?? 'bg-gray-100 text-gray-600'}`}>
                        {fmtAction(l.action)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">
                      <span className="font-medium">{l.resource_type}</span>
                      {l.resource_id && <span className="text-gray-400 ml-1">#{l.resource_id}</span>}
                    </td>
                    <td className="px-4 py-2.5 text-xs font-mono text-gray-400">{l.ip_address}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">Page {page} of {pages} · {total.toLocaleString()} events</span>
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
        </div>
      )}
    </div>
  )
}
