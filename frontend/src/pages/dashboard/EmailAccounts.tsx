import { useState, useEffect } from 'react'
import {
  Plus, Trash2, Loader2, Mail, ChevronDown, ChevronUp,
  Pencil, X, Check, RefreshCw, AlertTriangle, ShoppingCart,
  Search, Zap,
} from 'lucide-react'
import api from '../../lib/api'
import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'
import type { EmailAccount } from '../../types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_DOT: Record<string, string> = {
  active:       'bg-green-500',
  warmup:       'bg-yellow-500',
  failed:       'bg-red-500',
  disconnected: 'bg-gray-400',
}

const STATUS_BADGE: Record<string, string> = {
  active:       'bg-green-100 text-green-700',
  warmup:       'bg-yellow-100 text-yellow-700',
  failed:       'bg-red-100 text-red-700',
  disconnected: 'bg-gray-100 text-gray-600',
}

// ─── Warmup Stats Panel ───────────────────────────────────────────────────────

interface WarmupDay { date: string; sent: number; inbox: number; spam: number }

function WarmupStatsPanel({ accountId }: { accountId: number }) {
  const { showToast } = useToast()
  const [stats, setStats] = useState<{ warmup_enabled: boolean; days: WarmupDay[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/email-accounts/${accountId}/warmup-stats`)
      .then(({ data }) => setStats(data))
      .catch(() => showToast('Failed to load warmup stats', 'error'))
      .finally(() => setLoading(false))
  }, [accountId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="flex justify-center py-4"><Loader2 size={18} className="animate-spin text-gray-400" /></div>
  if (!stats) return null

  const maxSent = Math.max(...(stats.days?.map((d) => d.sent) ?? [1]), 1)

  return (
    <div className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-100">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">7-Day Warmup Activity</p>
      <div className="space-y-1">
        {stats.days?.map((day) => {
          const inboxPct = day.sent > 0 ? Math.round((day.inbox / day.sent) * 100) : 0
          const spamPct  = day.sent > 0 ? Math.round((day.spam  / day.sent) * 100) : 0
          return (
            <div key={day.date} className="flex items-center gap-3 text-xs">
              <span className="text-gray-400 w-20 shrink-0">{day.date}</span>
              <div className="flex-1 flex h-3 rounded overflow-hidden bg-gray-200 gap-px">
                <div className="bg-green-400" style={{ width: `${(day.inbox / maxSent) * 100}%` }} title={`Inbox: ${day.inbox}`} />
                <div className="bg-red-400"   style={{ width: `${(day.spam  / maxSent) * 100}%` }} title={`Spam: ${day.spam}`} />
              </div>
              <span className="text-gray-500 w-28 text-right">
                <span className="text-green-600">{inboxPct}% inbox</span>
                {' · '}
                <span className="text-red-500">{spamPct}% spam</span>
              </span>
            </div>
          )
        })}
      </div>
      <div className="flex gap-4 mt-2 text-xs text-gray-400">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-green-400" /> Inbox</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-400" />   Spam</span>
      </div>
    </div>
  )
}

// ─── Add Account Modal ────────────────────────────────────────────────────────

function AddAccountModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const { showToast } = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    from_name: '',
    email: '',
    password: '',
    smtp_host: '',
    smtp_port: 587,
    smtp_encryption: 'TLS',
    imap_host: '',
    imap_port: 993,
    imap_encryption: 'SSL',
    messages_per_day: 50,
  })

  const set = (k: string, v: string | number) => setForm((p) => ({ ...p, [k]: v }))

  const handleSave = async () => {
    if (!form.email || !form.from_name || !form.smtp_host) {
      showToast('Email, name, and SMTP host are required', 'error')
      return
    }
    setSaving(true)
    try {
      await api.post('/email-accounts', form)
      showToast('Email account added', 'success')
      onAdded()
    } catch {
      showToast('Failed to add account', 'error')
      setSaving(false)
    }
  }

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-200'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Add Email Account (SMTP)</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">From name *</label>
              <input type="text" value={form.from_name} onChange={(e) => set('from_name', e.target.value)}
                placeholder="John Smith" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Email address *</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                placeholder="john@example.com" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Password *</label>
            <input type="password" value={form.password} onChange={(e) => set('password', e.target.value)}
              placeholder="App password or SMTP password" className={inputCls} />
          </div>
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">SMTP</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600 block mb-1">Host *</label>
                <input type="text" value={form.smtp_host} onChange={(e) => set('smtp_host', e.target.value)}
                  placeholder="smtp.gmail.com" className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Port</label>
                <input type="number" value={form.smtp_port} onChange={(e) => set('smtp_port', Number(e.target.value))}
                  className={inputCls} />
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs font-medium text-gray-600 block mb-1">Encryption</label>
              <select value={form.smtp_encryption} onChange={(e) => set('smtp_encryption', e.target.value)}
                className={`${inputCls} bg-white`}>
                {['TLS', 'SSL', 'None'].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">IMAP</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600 block mb-1">Host</label>
                <input type="text" value={form.imap_host} onChange={(e) => set('imap_host', e.target.value)}
                  placeholder="imap.gmail.com" className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Port</label>
                <input type="number" value={form.imap_port} onChange={(e) => set('imap_port', Number(e.target.value))}
                  className={inputCls} />
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs font-medium text-gray-600 block mb-1">Encryption</label>
              <select value={form.imap_encryption} onChange={(e) => set('imap_encryption', e.target.value)}
                className={`${inputCls} bg-white`}>
                {['SSL', 'TLS', 'None'].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Daily sending limit</label>
            <input type="number" min={1} max={500} value={form.messages_per_day}
              onChange={(e) => set('messages_per_day', Number(e.target.value))} className={inputCls} />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
            {saving && <Loader2 size={14} className="animate-spin" />} Add Account
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Edit Account Modal ───────────────────────────────────────────────────────

function EditAccountModal({ account, onClose, onSaved }: { account: EmailAccount; onClose: () => void; onSaved: () => void }) {
  const { showToast } = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    from_name: account.from_name,
    messages_per_day: account.messages_per_day,
    tags: account.tags.join(', '),
    warmup_enabled: account.warmup.warmup_enabled,
    warmup_limit: account.warmup.warmup_limit,
  })

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-200'

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all([
        api.patch(`/email-accounts/${account.id}`, {
          from_name: form.from_name,
          messages_per_day: form.messages_per_day,
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
        api.post(`/email-accounts/${account.id}/warmup`, {
          warmup_enabled: form.warmup_enabled,
          warmup_limit: form.warmup_limit,
        }),
      ])
      showToast('Account updated', 'success')
      onSaved()
    } catch {
      showToast('Failed to save changes', 'error')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Edit Account</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded">{account.email}</p>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">From name</label>
            <input type="text" value={form.from_name} onChange={(e) => setForm((p) => ({ ...p, from_name: e.target.value }))}
              className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Daily sending limit</label>
            <input type="number" min={1} max={500} value={form.messages_per_day}
              onChange={(e) => setForm((p) => ({ ...p, messages_per_day: Number(e.target.value) }))}
              className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Tags (comma-separated)</label>
            <input type="text" value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
              placeholder="primary, warmup, q1" className={inputCls} />
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Warmup</p>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700">Enable warmup</span>
              <button onClick={() => setForm((p) => ({ ...p, warmup_enabled: !p.warmup_enabled }))}
                className={`relative w-10 h-5 rounded-full transition-colors ${form.warmup_enabled ? 'bg-brand-600' : 'bg-gray-200'}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.warmup_enabled ? 'translate-x-5' : ''}`} />
              </button>
            </label>
            {form.warmup_enabled && (
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Warmup daily limit</label>
                <input type="number" min={1} max={50} value={form.warmup_limit}
                  onChange={(e) => setForm((p) => ({ ...p, warmup_limit: Number(e.target.value) }))}
                  className={inputCls} />
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
            {saving && <Loader2 size={14} className="animate-spin" />} Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Smart Senders Panel ──────────────────────────────────────────────────────

interface Vendor { id: number; name: string; price_per_mailbox: number }
interface DomainResult { domain: string; available: boolean; price: { monthly: number }; alternatives: string[] }

function SmartSendersPanel() {
  const { showToast } = useToast()
  const [domain, setDomain]         = useState('')
  const [searching, setSearching]   = useState(false)
  const [result, setResult]         = useState<DomainResult | null>(null)
  const [vendors, setVendors]       = useState<Vendor[]>([])
  const [selectedVendor, setSelectedVendor] = useState<number | null>(null)
  const [mailboxCount, setMailboxCount]     = useState(5)
  const [firstName, setFirstName]   = useState('')
  const [lastName, setLastName]     = useState('')
  const [ordering, setOrdering]     = useState(false)

  useEffect(() => {
    api.get('/email-accounts/smart-senders/vendors')
      .then(({ data }) => { setVendors(data); setSelectedVendor(data[0]?.id ?? null) })
      .catch(() => {})
  }, [])

  const searchDomain = async () => {
    if (!domain.trim()) return
    setSearching(true)
    setResult(null)
    try {
      const { data } = await api.post('/email-accounts/smart-senders/search', { domain: domain.trim() })
      setResult(data)
    } catch {
      showToast('Domain search failed', 'error')
    } finally {
      setSearching(false)
    }
  }

  const placeOrder = async () => {
    if (!result || !selectedVendor || !firstName || !lastName) {
      showToast('Fill in all fields to order', 'error')
      return
    }
    setOrdering(true)
    try {
      const { data } = await api.post('/email-accounts/smart-senders/order', {
        domain: result.domain,
        vendor_id: selectedVendor,
        mailbox_count: mailboxCount,
        first_name: firstName,
        last_name: lastName,
        pattern: 'first.last',
      })
      showToast(`Order placed! ID: ${data.order_id}`, 'success')
      setResult(null)
      setDomain('')
    } catch {
      showToast('Order failed', 'error')
      setOrdering(false)
    }
  }

  const vendor = vendors.find((v) => v.id === selectedVendor)
  const monthlyCost = vendor ? ((vendor.price_per_mailbox * mailboxCount) / 100).toFixed(2) : null

  const inputCls = 'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-200'

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <Zap size={16} className="text-brand-600" />
        <h2 className="font-semibold text-gray-900">Smart Senders — Managed Mailboxes</h2>
        <span className="ml-auto text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">Pro+</span>
      </div>
      <div className="p-5 space-y-5">
        <p className="text-sm text-gray-500">
          Purchase ready-to-warm domains and mailboxes managed by Smartlead. Provisioned automatically and added to your account.
        </p>

        {/* Domain search */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Search domain availability</label>
          <div className="flex gap-2">
            <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchDomain()}
              placeholder="example.com" className={`${inputCls} flex-1`} />
            <button onClick={searchDomain} disabled={searching || !domain.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
              {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              Search
            </button>
          </div>
        </div>

        {/* Search result */}
        {result && (
          <div className={`rounded-xl border p-4 space-y-4 ${result.available ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-center gap-2">
              {result.available
                ? <Check size={16} className="text-green-600" />
                : <X size={16} className="text-red-500" />}
              <span className="font-medium text-gray-900">{result.domain}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${result.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {result.available ? 'Available' : 'Taken'}
              </span>
              {result.available && (
                <span className="ml-auto text-sm text-gray-600">${(result.price.monthly / 100).toFixed(2)}/mo</span>
              )}
            </div>

            {!result.available && result.alternatives?.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {result.alternatives.map((alt) => (
                    <button key={alt} onClick={() => { setDomain(alt); setResult(null) }}
                      className="text-xs px-2 py-1 bg-white border border-gray-300 rounded-lg hover:border-brand-400 hover:text-brand-600 transition-colors">
                      {alt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {result.available && (
              <div className="space-y-3 pt-2 border-t border-green-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Vendor</label>
                    <select value={selectedVendor ?? ''} onChange={(e) => setSelectedVendor(Number(e.target.value))}
                      className={`${inputCls} w-full bg-white`}>
                      {vendors.map((v) => (
                        <option key={v.id} value={v.id}>{v.name} — ${(v.price_per_mailbox / 100).toFixed(2)}/mailbox</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Mailboxes</label>
                    <input type="number" min={1} max={50} value={mailboxCount}
                      onChange={(e) => setMailboxCount(Number(e.target.value))}
                      className={`${inputCls} w-full`} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">First name</label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John" className={`${inputCls} w-full`} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Last name</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                      placeholder="Smith" className={`${inputCls} w-full`} />
                  </div>
                </div>
                {monthlyCost && (
                  <p className="text-sm text-gray-600">
                    Estimated cost: <strong>${monthlyCost}/month</strong> for {mailboxCount} mailbox{mailboxCount !== 1 ? 'es' : ''}
                  </p>
                )}
                <button onClick={placeOrder} disabled={ordering}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
                  {ordering ? <Loader2 size={14} className="animate-spin" /> : <ShoppingCart size={14} />}
                  Place Order
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function EmailAccounts() {
  const { showToast } = useToast()
  const { user } = useAuth()
  const [accounts, setAccounts]     = useState<EmailAccount[]>([])
  const [loading, setLoading]       = useState(true)
  const [showAdd, setShowAdd]       = useState(false)
  const [editAccount, setEditAccount] = useState<EmailAccount | null>(null)
  const [deleting, setDeleting]     = useState<number | null>(null)
  const [expanded, setExpanded]     = useState<number | null>(null)

  const canPurchaseMailboxes = user?.subscription_tier === 'pro' || user?.subscription_tier === 'enterprise'

  const load = () => {
    setLoading(true)
    api.get<EmailAccount[]>('/email-accounts')
      .then(({ data }) => setAccounts(data))
      .catch(() => showToast('Failed to load email accounts', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (a: EmailAccount) => {
    if (!confirm(`Delete "${a.email}"? This will disconnect it from all campaigns.`)) return
    setDeleting(a.id)
    try {
      await api.delete(`/email-accounts/${a.id}`)
      setAccounts((prev) => prev.filter((x) => x.id !== a.id))
      showToast('Account deleted', 'success')
    } catch {
      showToast('Delete failed', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const activeCount  = accounts.filter((a) => a.status === 'active').length
  const warmupCount  = accounts.filter((a) => a.status === 'warmup').length
  const failedCount  = accounts.filter((a) => a.status === 'failed' || a.status === 'disconnected').length
  const totalPerDay  = accounts.reduce((s, a) => s + a.messages_per_day, 0)

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {showAdd && (
        <AddAccountModal onClose={() => setShowAdd(false)} onAdded={() => { setShowAdd(false); load() }} />
      )}
      {editAccount && (
        <EditAccountModal account={editAccount} onClose={() => setEditAccount(null)} onSaved={() => { setEditAccount(null); load() }} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Accounts</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage sender inboxes and warmup</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Add Account
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total',        value: accounts.length, color: 'text-gray-900' },
          { label: 'Active',       value: activeCount,     color: 'text-green-600' },
          { label: 'In Warmup',    value: warmupCount,     color: 'text-yellow-600' },
          { label: 'Emails/Day',   value: totalPerDay.toLocaleString(), color: 'text-brand-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Failed alert */}
      {failedCount > 0 && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm text-red-700">
          <AlertTriangle size={16} className="shrink-0" />
          {failedCount} account{failedCount !== 1 ? 's' : ''} need{failedCount === 1 ? 's' : ''} attention — check credentials or reconnect.
        </div>
      )}

      {/* Accounts table */}
      {loading ? (
        <div className="flex justify-center h-32 items-center"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
      ) : accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 bg-white rounded-xl border border-gray-200 text-center mb-6">
          <Mail size={40} className="text-gray-300 mb-3" />
          <p className="font-semibold text-gray-500">No email accounts yet</p>
          <p className="text-sm text-gray-400 mt-1">Add your first sender account to start campaigns.</p>
          <button onClick={() => setShowAdd(true)}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
            <Plus size={14} /> Add Account
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Account', 'Status', 'Provider', 'Warmup', 'Campaigns', 'Limit/Day', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <>
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[a.status] ?? 'bg-gray-400'}`} />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{a.email}</p>
                          <p className="text-xs text-gray-400">{a.from_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[a.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{a.provider}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${a.warmup.warmup_enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-xs text-gray-500">
                          {a.warmup.warmup_enabled
                            ? <><span className="text-green-600 font-medium">{Math.round(a.warmup.inbox_rate * 100)}%</span> inbox</>
                            : 'Off'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{a.campaigns_attached}</td>
                    <td className="px-4 py-3 text-gray-600">{a.messages_per_day}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                          title="Warmup stats"
                          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                          {expanded === a.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                        <button onClick={() => setEditAccount(a)}
                          title="Edit"
                          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(a)} disabled={deleting === a.id}
                          title="Delete"
                          className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50">
                          {deleting === a.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded === a.id && (
                    <tr key={`${a.id}-stats`} className="border-b border-gray-100">
                      <td colSpan={7} className="p-0">
                        <WarmupStatsPanel accountId={a.id} />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Smart Senders */}
      {canPurchaseMailboxes ? (
        <SmartSendersPanel />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
            <Zap size={20} className="text-brand-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Smart Senders — Managed Mailboxes</h3>
            <p className="text-sm text-gray-500 mb-3">
              Upgrade to Pro or Enterprise to purchase ready-to-warm domains and mailboxes managed by Smartlead. Provisioned automatically and added to your account.
            </p>
            <a href="/dashboard/settings?tab=billing"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">
              Upgrade Plan
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
