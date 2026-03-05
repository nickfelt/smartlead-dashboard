import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, CreditCard, Key, Loader2, CheckCircle, ExternalLink, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import api from '../../lib/api'

// ─── AI Key Row ───────────────────────────────────────────────────────────────

interface KeyStatus {
  configured: boolean
  masked?: string
}

interface AiKeyRowProps {
  provider: 'anthropic' | 'openai'
  label: string
  placeholder: string
  helpUrl: string
  helpText: string
  status: KeyStatus
  onSaved: () => void
}

function AiKeyRow({ provider, label, placeholder, helpUrl, helpText, status, onSaved }: AiKeyRowProps) {
  const { showToast } = useToast()
  const [value, setValue] = useState('')
  const [show, setShow] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)

  const handleSave = async () => {
    if (!value.trim()) return
    setSaving(true)
    try {
      await api.post('/settings/ai-keys', { provider, key: value.trim() })
      showToast(`${label} key saved successfully`, 'success')
      setValue('')
      onSaved()
    } catch {
      showToast(`Failed to save ${label} key`, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    if (!status.configured) {
      showToast('Save a key first before testing', 'warning')
      return
    }
    setTesting(true)
    try {
      const { data } = await api.post<{ ok: boolean; message: string }>('/settings/ai-keys/test', { provider })
      if (data.ok) showToast(`${label} key is valid ✓`, 'success')
      else showToast(`${label} key test failed: ${data.message}`, 'error')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Test failed'
      showToast(msg, 'error')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="py-5 border-b border-gray-100 last:border-0">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{label}</span>
            {status.configured && (
              <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                <CheckCircle size={11} /> Configured
              </span>
            )}
          </div>
          {status.configured && status.masked && (
            <p className="text-xs text-gray-400 mt-0.5 font-mono">{status.masked}</p>
          )}
        </div>
        {status.configured && (
          <button
            onClick={handleTest}
            disabled={testing}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-300 rounded px-2.5 py-1 transition-colors disabled:opacity-50"
          >
            {testing ? <Loader2 size={11} className="animate-spin" /> : null}
            Test key
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type={show ? 'text' : 'password'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={status.configured ? 'Enter new key to replace…' : placeholder}
            className="w-full rounded-md border border-gray-300 px-3 py-2 pr-9 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !value.trim()}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : null}
          Save
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-1.5">
        Get your key at{' '}
        <a href={helpUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline inline-flex items-center gap-0.5">
          {helpText} <ExternalLink size={10} />
        </a>
      </p>
    </div>
  )
}

// ─── Main Settings page ───────────────────────────────────────────────────────

interface AiKeysStatus {
  anthropic: KeyStatus
  openai: KeyStatus
}

export default function Settings() {
  const { user, refreshUser } = useAuth()
  const { showToast } = useToast()
  const [portalLoading, setPortalLoading] = useState(false)
  const [keysStatus, setKeysStatus] = useState<AiKeysStatus>({
    anthropic: { configured: false },
    openai: { configured: false },
  })

  useEffect(() => {
    api.get<AiKeysStatus>('/settings/ai-keys')
      .then(({ data }) => setKeysStatus(data))
      .catch(() => {/* silent */})
  }, [])

  const refreshKeys = () => {
    api.get<AiKeysStatus>('/settings/ai-keys')
      .then(({ data }) => { setKeysStatus(data); refreshUser() })
      .catch(() => {/* silent */})
  }

  const handleManageBilling = async () => {
    setPortalLoading(true)
    try {
      const { data } = await api.post<{ portal_url: string }>('/auth/create-portal-session')
      window.location.href = data.portal_url
    } catch {
      showToast('Could not open billing portal', 'error')
    } finally {
      setPortalLoading(false)
    }
  }

  const bothConfigured = keysStatus.anthropic.configured && keysStatus.openai.configured
  const noneConfigured = !keysStatus.anthropic.configured && !keysStatus.openai.configured

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account and subscription.</p>
      </div>

      {/* ── Subscription ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <CreditCard size={18} className="text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900">Subscription</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Current plan</p>
            <p className="text-xl font-bold text-gray-900 capitalize mt-0.5">
              {user?.subscription_tier}{' '}
              <span className={user?.subscription_status === 'active' ? 'text-green-600' : 'text-red-500'}>
                · {user?.subscription_status}
              </span>
            </p>
          </div>
          <button
            onClick={handleManageBilling}
            disabled={portalLoading}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {portalLoading ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
            Manage billing
          </button>
        </div>
      </div>

      {/* ── AI API Keys ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Key size={18} className="text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900">AI API Keys</h2>
        </div>
        <p className="text-sm text-gray-500 mb-1">
          The AI email writer uses <strong>your own</strong> API keys — you pay your provider directly. Keys are encrypted and never exposed.
        </p>

        {noneConfigured && (
          <div className="mt-3 mb-1 rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            Add at least one AI API key to use the email writer in Campaigns.
          </div>
        )}
        {bothConfigured && (
          <div className="mt-3 mb-1 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
            Both providers configured — you can choose Claude or GPT-4o in the email writer.
          </div>
        )}

        <div className="mt-4">
          <AiKeyRow
            provider="anthropic"
            label="Anthropic (Claude)"
            placeholder="sk-ant-api03-…"
            helpUrl="https://console.anthropic.com/settings/keys"
            helpText="console.anthropic.com"
            status={keysStatus.anthropic}
            onSaved={refreshKeys}
          />
          <AiKeyRow
            provider="openai"
            label="OpenAI (GPT-4o)"
            placeholder="sk-proj-…"
            helpUrl="https://platform.openai.com/api-keys"
            helpText="platform.openai.com"
            status={keysStatus.openai}
            onSaved={refreshKeys}
          />
        </div>
      </div>

      {/* ── Account Info ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <SettingsIcon size={18} className="text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900">Account</h2>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          {[
            { label: 'Name', value: user?.full_name },
            { label: 'Email', value: user?.email },
            { label: 'Company', value: user?.company_name },
            { label: 'Member since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <dt className="text-gray-500">{label}</dt>
              <dd className="font-medium text-gray-900 mt-0.5">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
