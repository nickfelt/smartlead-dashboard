import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Loader2, Plus, Trash2, Play, Pause, Upload,
  BarChart2, Users, Mail, Settings, ListOrdered,
  ChevronDown, ChevronUp, Sparkles, CheckSquare, Square, X,
} from 'lucide-react'
import api from '../../lib/api'
import { useToast } from '../../contexts/ToastContext'
import AiWriter from '../../components/AiWriter'
import type { Campaign, Lead, EmailAccount } from '../../types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SequenceStep {
  seq_number: number
  seq_delay_details: { delay_in_days: number }
  subject: string
  email_body: string
}

interface AnalyticsData {
  total_sent: number
  total_opened: number
  total_replied: number
  total_bounced: number
  total_unsubscribed: number
  open_rate: number
  reply_rate: number
  bounce_rate: number
  daily_stats?: { date: string; sent: number; opened: number; replied: number }[]
}

type Tab = 'sequences' | 'leads' | 'analytics' | 'settings' | 'email-accounts'

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

// ─── Sequence Editor ─────────────────────────────────────────────────────────

function SequenceTab({ campaignId }: { campaignId: number }) {
  const { showToast } = useToast()
  const [steps, setSteps] = useState<SequenceStep[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(0)
  const [showAi, setShowAi] = useState(false)

  useEffect(() => {
    api.get<SequenceStep[]>(`/campaigns/${campaignId}/sequences`)
      .then(({ data }) => setSteps(data))
      .catch(() => showToast('Failed to load sequences', 'error'))
      .finally(() => setLoading(false))
  }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  const addStep = () => {
    const n = steps.length + 1
    setSteps((prev) => [
      ...prev,
      { seq_number: n, seq_delay_details: { delay_in_days: n === 1 ? 0 : 3 }, subject: '', email_body: '' },
    ])
    setExpanded(n - 1)
  }

  const removeStep = (i: number) => {
    setSteps((prev) => prev.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, seq_number: idx + 1 })))
    setExpanded(null)
  }

  const updateStep = (i: number, patch: Partial<SequenceStep>) => {
    setSteps((prev) => prev.map((s, idx) => idx === i ? { ...s, ...patch } : s))
  }

  const save = async () => {
    setSaving(true)
    try {
      await api.post(`/campaigns/${campaignId}/sequences`, { sequences: steps })
      showToast('Sequence saved', 'success')
    } catch {
      showToast('Failed to save sequence', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleApplySequence = (generated: { seq_number: number; seq_delay_details: { delay_in_days: number }; variants: { subject: string; body: string }[] }[]) => {
    setSteps(generated.map((s, i) => ({
      seq_number: i + 1,
      seq_delay_details: s.seq_delay_details ?? { delay_in_days: i === 0 ? 0 : 3 },
      subject: s.variants?.[0]?.subject ?? '',
      email_body: s.variants?.[0]?.body ?? '',
    })))
    setExpanded(0)
    setShowAi(false)
    showToast('AI sequence applied — review & save', 'success')
  }

  if (loading) return <div className="flex justify-center h-32 items-center"><Loader2 size={22} className="animate-spin text-gray-400" /></div>

  return (
    <div className="space-y-4">
      {showAi && (
        <AiWriter
          onClose={() => setShowAi(false)}
          onApplySequence={handleApplySequence}
          onApplyVariants={() => {}}
          onApplyRewrite={() => {}}
          onApplySubjects={() => {}}
        />
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{steps.length} step{steps.length !== 1 ? 's' : ''}</p>
        <div className="flex gap-2">
          <button onClick={() => setShowAi(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-brand-300 text-brand-600 rounded-lg hover:bg-brand-50 transition-colors">
            <Sparkles size={14} /> AI Writer
          </button>
          <button onClick={addStep}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
            <Plus size={14} /> Add Step
          </button>
        </div>
      </div>

      {steps.length === 0 && (
        <div className="flex flex-col items-center justify-center h-40 bg-white rounded-xl border border-dashed border-gray-300 text-center">
          <ListOrdered size={32} className="text-gray-300 mb-2" />
          <p className="text-sm text-gray-500 font-medium">No sequence steps yet</p>
          <p className="text-xs text-gray-400 mt-0.5">Add your first step or use the AI Writer</p>
        </div>
      )}

      {steps.map((step, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button onClick={() => setExpanded(expanded === i ? null : i)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">
                {step.seq_number}
              </span>
              <span className="text-sm font-medium text-gray-800">
                {step.subject || <span className="text-gray-400 italic">No subject</span>}
              </span>
              {step.seq_number > 1 && (
                <span className="text-xs text-gray-400">Day +{step.seq_delay_details.delay_in_days}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={(e) => { e.stopPropagation(); removeStep(i) }}
                className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors">
                <Trash2 size={14} />
              </button>
              {expanded === i ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </div>
          </button>

          {expanded === i && (
            <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
              {step.seq_number > 1 && (
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium text-gray-600 whitespace-nowrap">Delay (days)</label>
                  <input type="number" min={1} max={30}
                    value={step.seq_delay_details.delay_in_days}
                    onChange={(e) => updateStep(i, { seq_delay_details: { delay_in_days: Number(e.target.value) } })}
                    className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-brand-500" />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Subject</label>
                <input type="text"
                  value={step.subject}
                  onChange={(e) => updateStep(i, { subject: e.target.value })}
                  placeholder="Subject line..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-200" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Email Body</label>
                <textarea
                  value={step.email_body}
                  onChange={(e) => updateStep(i, { email_body: e.target.value })}
                  rows={8}
                  placeholder="Write your email body here. Use {{first_name}}, {{company_name}}, etc."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-200 font-mono resize-y" />
              </div>
            </div>
          )}
        </div>
      ))}

      {steps.length > 0 && (
        <div className="flex justify-end">
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
            {saving && <Loader2 size={14} className="animate-spin" />}
            Save Sequence
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Leads Tab ────────────────────────────────────────────────────────────────

function LeadsTab({ campaignId }: { campaignId: number }) {
  const { showToast } = useToast()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [bulking, setBulking] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState(0)
  const LIMIT = 50

  const load = async (off = 0) => {
    setLoading(true)
    try {
      const { data } = await api.get<{ data: Lead[]; total: number }>(`/campaigns/${campaignId}/leads`, {
        params: { offset: off, limit: LIMIT },
      })
      setLeads(off === 0 ? data.data : (prev) => [...prev, ...data.data])
      setTotal(data.total)
      setOffset(off)
    } catch {
      showToast('Failed to load leads', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(0) }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelected(selected.size === leads.length ? new Set() : new Set(leads.map((l) => l.id)))
  }

  const bulkAction = async (action: string) => {
    if (selected.size === 0) return
    setBulking(true)
    try {
      await api.post(`/campaigns/${campaignId}/leads/bulk-action`, {
        lead_ids: Array.from(selected),
        action,
      })
      showToast(`${selected.size} lead(s) ${action}d`, 'success')
      setSelected(new Set())
      load(0)
    } catch {
      showToast('Bulk action failed', 'error')
    } finally {
      setBulking(false)
    }
  }

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const text = await file.text()
      const lines = text.trim().split('\n')
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
      const rows = lines.slice(1).map((line) => {
        const vals = line.split(',')
        return Object.fromEntries(headers.map((h, i) => [h, vals[i]?.trim() ?? '']))
      })
      await api.post(`/campaigns/${campaignId}/leads`, { leads: rows })
      showToast(`${rows.length} leads uploaded`, 'success')
      load(0)
    } catch {
      showToast('CSV upload failed', 'error')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const STATUS_COLOR: Record<string, string> = {
    NOT_CONTACTED: 'bg-gray-100 text-gray-600',
    IN_PROGRESS:   'bg-blue-100 text-blue-700',
    COMPLETED:     'bg-green-100 text-green-700',
    PAUSED:        'bg-yellow-100 text-yellow-700',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{total.toLocaleString()} lead{total !== 1 ? 's' : ''}</p>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <>
              <button onClick={() => bulkAction('pause')} disabled={bulking}
                className="px-3 py-1.5 text-sm border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50 transition-colors">
                Pause {selected.size}
              </button>
              <button onClick={() => bulkAction('resume')} disabled={bulking}
                className="px-3 py-1.5 text-sm border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors">
                Resume {selected.size}
              </button>
              <button onClick={() => bulkAction('delete')} disabled={bulking}
                className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                Delete {selected.size}
              </button>
            </>
          )}
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            Import CSV
          </button>
        </div>
      </div>

      {loading && leads.length === 0 ? (
        <div className="flex justify-center h-32 items-center"><Loader2 size={22} className="animate-spin text-gray-400" /></div>
      ) : leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 bg-white rounded-xl border border-dashed border-gray-300 text-center">
          <Users size={32} className="text-gray-300 mb-2" />
          <p className="text-sm text-gray-500 font-medium">No leads yet</p>
          <p className="text-xs text-gray-400 mt-0.5">Import a CSV to add leads</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 w-10">
                  <button onClick={toggleAll}>
                    {selected.size === leads.length && leads.length > 0
                      ? <CheckSquare size={16} className="text-brand-600" />
                      : <Square size={16} className="text-gray-400" />}
                  </button>
                </th>
                {['Name', 'Email', 'Company', 'Title', 'Status'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leads.map((l) => (
                <tr key={l.id} className={`hover:bg-gray-50 transition-colors ${selected.has(l.id) ? 'bg-brand-50' : ''}`}>
                  <td className="px-4 py-2.5">
                    <button onClick={() => toggleSelect(l.id)}>
                      {selected.has(l.id)
                        ? <CheckSquare size={16} className="text-brand-600" />
                        : <Square size={16} className="text-gray-400" />}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 font-medium text-gray-900">{l.first_name} {l.last_name}</td>
                  <td className="px-4 py-2.5 text-gray-600">{l.email}</td>
                  <td className="px-4 py-2.5 text-gray-600">{l.company_name}</td>
                  <td className="px-4 py-2.5 text-gray-500">{l.title}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[l.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {l.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leads.length < total && (
            <div className="p-3 border-t border-gray-100 flex justify-center">
              <button onClick={() => load(offset + LIMIT)} disabled={loading}
                className="text-sm text-brand-600 hover:underline disabled:opacity-50">
                Load more ({total - leads.length} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────

function AnalyticsTab({ campaignId }: { campaignId: number }) {
  const { showToast } = useToast()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<AnalyticsData>(`/campaigns/${campaignId}/analytics`)
      .then(({ data }) => setData(data))
      .catch(() => showToast('Failed to load analytics', 'error'))
      .finally(() => setLoading(false))
  }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="flex justify-center h-32 items-center"><Loader2 size={22} className="animate-spin text-gray-400" /></div>
  if (!data) return null

  const maxSent = Math.max(...(data.daily_stats?.map((d) => d.sent) ?? [1]), 1)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Sent" value={data.total_sent.toLocaleString()} />
        <StatCard label="Open Rate" value={`${data.open_rate}%`} sub={`${data.total_opened.toLocaleString()} opened`} />
        <StatCard label="Reply Rate" value={`${data.reply_rate}%`} sub={`${data.total_replied.toLocaleString()} replied`} />
        <StatCard label="Bounce Rate" value={`${data.bounce_rate}%`} sub={`${data.total_bounced.toLocaleString()} bounced`} />
      </div>

      {data.daily_stats && data.daily_stats.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Daily Activity</h3>
          <div className="space-y-2">
            {data.daily_stats.map((day) => (
              <div key={day.date} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-24 shrink-0">{day.date}</span>
                <div className="flex-1 flex items-center gap-1 h-4 bg-gray-100 rounded overflow-hidden">
                  <div className="bg-brand-400 h-full rounded" style={{ width: `${(day.sent / maxSent) * 100}%` }} title={`Sent: ${day.sent}`} />
                </div>
                <span className="text-xs text-gray-500 w-16 text-right">{day.sent} sent</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Settings Tab ────────────────────────────────────────────────────────────

function SettingsTab({ campaignId }: { campaignId: number }) {
  const { showToast } = useToast()
  const [schedule, setSchedule] = useState({
    timezone: 'America/New_York',
    days_of_the_week: [1, 2, 3, 4, 5],
    start_hour: '09:00',
    end_hour: '17:00',
    min_time_btw_emails: 10,
    max_new_leads_per_day: 50,
  })
  const [tracking, setTracking] = useState({
    track_opens: true,
    track_clicks: true,
    stop_on_reply: true,
    stop_on_auto_reply: false,
    send_as_plain_text: false,
    unsubscribe_text: '',
  })
  const [savingSched, setSavingSched] = useState(false)
  const [savingTrack, setSavingTrack] = useState(false)

  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const toggleDay = (d: number) => {
    setSchedule((prev) => ({
      ...prev,
      days_of_the_week: prev.days_of_the_week.includes(d)
        ? prev.days_of_the_week.filter((x) => x !== d)
        : [...prev.days_of_the_week, d].sort(),
    }))
  }

  const saveSchedule = async () => {
    setSavingSched(true)
    try {
      await api.post(`/campaigns/${campaignId}/schedule`, schedule)
      showToast('Schedule saved', 'success')
    } catch {
      showToast('Failed to save schedule', 'error')
    } finally {
      setSavingSched(false)
    }
  }

  const saveTracking = async () => {
    setSavingTrack(true)
    try {
      await api.post(`/campaigns/${campaignId}/settings`, tracking)
      showToast('Settings saved', 'success')
    } catch {
      showToast('Failed to save settings', 'error')
    } finally {
      setSavingTrack(false)
    }
  }

  const inputCls = 'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-200'

  return (
    <div className="space-y-6 max-w-xl">
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="font-semibold text-gray-800">Sending Schedule</h3>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">Send days</label>
          <div className="flex gap-1.5">
            {DAY_LABELS.map((label, d) => (
              <button key={d} onClick={() => toggleDay(d)}
                className={`w-10 h-10 rounded-lg text-xs font-medium transition-colors ${
                  schedule.days_of_the_week.includes(d)
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Start time</label>
            <input type="time" value={schedule.start_hour}
              onChange={(e) => setSchedule((p) => ({ ...p, start_hour: e.target.value }))}
              className={`${inputCls} w-full`} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">End time</label>
            <input type="time" value={schedule.end_hour}
              onChange={(e) => setSchedule((p) => ({ ...p, end_hour: e.target.value }))}
              className={`${inputCls} w-full`} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Min delay (min)</label>
            <input type="number" min={1} value={schedule.min_time_btw_emails}
              onChange={(e) => setSchedule((p) => ({ ...p, min_time_btw_emails: Number(e.target.value) }))}
              className={`${inputCls} w-full`} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Max new leads/day</label>
            <input type="number" min={1} max={500} value={schedule.max_new_leads_per_day}
              onChange={(e) => setSchedule((p) => ({ ...p, max_new_leads_per_day: Number(e.target.value) }))}
              className={`${inputCls} w-full`} />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Timezone</label>
          <select value={schedule.timezone}
            onChange={(e) => setSchedule((p) => ({ ...p, timezone: e.target.value }))}
            className={`${inputCls} w-full bg-white`}>
            {['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo'].map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>

        <button onClick={saveSchedule} disabled={savingSched}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
          {savingSched && <Loader2 size={14} className="animate-spin" />} Save Schedule
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="font-semibold text-gray-800">Tracking & Behavior</h3>

        {([
          ['track_opens', 'Track opens'],
          ['track_clicks', 'Track clicks'],
          ['stop_on_reply', 'Stop sequence on reply'],
          ['stop_on_auto_reply', 'Stop sequence on auto-reply'],
          ['send_as_plain_text', 'Send as plain text'],
        ] as [keyof typeof tracking, string][]).map(([key, label]) => (
          <label key={key} className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-700">{label}</span>
            <button onClick={() => setTracking((p) => ({ ...p, [key]: !p[key] }))}
              className={`relative w-10 h-5 rounded-full transition-colors ${tracking[key] ? 'bg-brand-600' : 'bg-gray-200'}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${tracking[key] ? 'translate-x-5' : ''}`} />
            </button>
          </label>
        ))}

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Unsubscribe text</label>
          <input type="text" value={tracking.unsubscribe_text}
            onChange={(e) => setTracking((p) => ({ ...p, unsubscribe_text: e.target.value }))}
            placeholder="If you'd like to unsubscribe, reply STOP"
            className={`${inputCls} w-full`} />
        </div>

        <button onClick={saveTracking} disabled={savingTrack}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
          {savingTrack && <Loader2 size={14} className="animate-spin" />} Save Settings
        </button>
      </div>
    </div>
  )
}

// ─── Email Accounts Tab ───────────────────────────────────────────────────────

function EmailAccountsTab({ campaignId }: { campaignId: number }) {
  const { showToast } = useToast()
  const [attached, setAttached] = useState<EmailAccount[]>([])
  const [available, setAvailable] = useState<EmailAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<number | null>(null)
  const [adding, setAdding] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get<EmailAccount[]>(`/campaigns/${campaignId}/email-accounts`),
      api.get<EmailAccount[]>('/email-accounts'),
    ])
      .then(([attachedRes, allRes]) => {
        setAttached(attachedRes.data)
        const attachedIds = new Set(attachedRes.data.map((a) => a.id))
        setAvailable(allRes.data.filter((a) => !attachedIds.has(a.id)))
      })
      .catch(() => showToast('Failed to load email accounts', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  const addAccount = async (id: number) => {
    setAdding(id)
    try {
      await api.post(`/campaigns/${campaignId}/email-accounts`, { email_account_id: id })
      showToast('Account added', 'success')
      load()
    } catch {
      showToast('Failed to add account', 'error')
    } finally {
      setAdding(null)
    }
  }

  const removeAccount = async (id: number) => {
    setRemoving(id)
    try {
      await api.delete(`/campaigns/${campaignId}/email-accounts/${id}`)
      showToast('Account removed', 'success')
      load()
    } catch {
      showToast('Failed to remove account', 'error')
    } finally {
      setRemoving(null)
    }
  }

  const STATUS_DOT: Record<string, string> = {
    active:       'bg-green-500',
    warmup:       'bg-yellow-500',
    failed:       'bg-red-500',
    disconnected: 'bg-gray-400',
  }

  if (loading) return <div className="flex justify-center h-32 items-center"><Loader2 size={22} className="animate-spin text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Attached Accounts ({attached.length})</h3>
        </div>
        {attached.length === 0 ? (
          <p className="text-sm text-gray-400 p-4 text-center">No accounts attached yet</p>
        ) : (
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-50">
              {attached.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${STATUS_DOT[a.status] ?? 'bg-gray-400'}`} />
                      <span className="font-medium text-gray-800">{a.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{a.from_name}</td>
                  <td className="px-4 py-3 text-gray-400">{a.messages_per_day}/day</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => removeAccount(a.id)} disabled={removing === a.id}
                      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50 flex items-center gap-1 ml-auto">
                      {removing === a.id ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />} Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {available.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Available Accounts</h3>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-50">
              {available.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${STATUS_DOT[a.status] ?? 'bg-gray-400'}`} />
                      <span className="font-medium text-gray-800">{a.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{a.from_name}</td>
                  <td className="px-4 py-3 text-gray-400">{a.messages_per_day}/day</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => addAccount(a.id)} disabled={adding === a.id}
                      className="text-xs text-brand-600 hover:text-brand-800 disabled:opacity-50 flex items-center gap-1 ml-auto">
                      {adding === a.id ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Add
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT:     { label: 'Draft',     color: 'bg-gray-100 text-gray-600' },
  ACTIVE:    { label: 'Active',    color: 'bg-green-100 text-green-700' },
  PAUSED:    { label: 'Paused',    color: 'bg-yellow-100 text-yellow-700' },
  COMPLETED: { label: 'Completed', color: 'bg-blue-100 text-blue-700' },
  STOPPED:   { label: 'Stopped',   color: 'bg-red-100 text-red-700' },
}

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const campaignId = Number(id)

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('sequences')
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    api.get<Campaign>(`/campaigns/${campaignId}`)
      .then(({ data }) => setCampaign(data))
      .catch(() => showToast('Failed to load campaign', 'error'))
      .finally(() => setLoading(false))
  }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggle = async () => {
    if (!campaign) return
    const next = campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    setToggling(true)
    try {
      await api.post(`/campaigns/${campaignId}/status`, { status: next })
      setCampaign((prev) => prev ? { ...prev, status: next } : prev)
      showToast(`Campaign ${next === 'ACTIVE' ? 'started' : 'paused'}`, 'success')
    } catch {
      showToast('Status update failed', 'error')
    } finally {
      setToggling(false)
    }
  }

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'sequences',      label: 'Sequence',       icon: <ListOrdered size={15} /> },
    { key: 'leads',          label: 'Leads',          icon: <Users size={15} /> },
    { key: 'analytics',      label: 'Analytics',      icon: <BarChart2 size={15} /> },
    { key: 'settings',       label: 'Settings',       icon: <Settings size={15} /> },
    { key: 'email-accounts', label: 'Email Accounts', icon: <Mail size={15} /> },
  ]

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-gray-400" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Campaign not found.
      </div>
    )
  }

  const s = STATUS_CONFIG[campaign.status] ?? STATUS_CONFIG['DRAFT']

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard/campaigns')}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>
              <span className="text-xs text-gray-400">{campaign.leads_count.toLocaleString()} leads</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(campaign.status === 'ACTIVE' || campaign.status === 'PAUSED' || campaign.status === 'DRAFT') && (
            <button onClick={handleToggle} disabled={toggling}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                campaign.status === 'ACTIVE'
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}>
              {toggling
                ? <Loader2 size={14} className="animate-spin" />
                : campaign.status === 'ACTIVE' ? <Pause size={14} /> : <Play size={14} />}
              {campaign.status === 'ACTIVE' ? 'Pause' : 'Start'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.key ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'sequences'      && <SequenceTab campaignId={campaignId} />}
      {tab === 'leads'          && <LeadsTab campaignId={campaignId} />}
      {tab === 'analytics'      && <AnalyticsTab campaignId={campaignId} />}
      {tab === 'settings'       && <SettingsTab campaignId={campaignId} />}
      {tab === 'email-accounts' && <EmailAccountsTab campaignId={campaignId} />}
    </div>
  )
}
