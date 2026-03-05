import { useState, useEffect, useRef, useCallback } from 'react'
import DOMPurify from 'dompurify'
import {
  Search, Star, Archive, MailOpen, ChevronDown,
  Send, Loader2, RefreshCw, Tag, Inbox as InboxIcon,
} from 'lucide-react'
import api from '../../lib/api'
import { useToast } from '../../contexts/ToastContext'
import type { InboxMessage, LeadCategory } from '../../types'

// ─── Types ────────────────────────────────────────────────────────────────────

type InboxFilter = 'all' | 'unread' | 'snoozed' | 'important' | 'archived'

interface PaginatedMessages {
  data: InboxMessage[]
  total: number
  offset: number
  limit: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(diff / 3600000)
  if (hours < 24) return `${hours}h ago`
  if (hours < 48) return 'Yesterday'
  return `${Math.round(hours / 24)}d ago`
}

const CATEGORY_COLORS: Record<string, string> = {
  'Interested':      'bg-green-100 text-green-700',
  'Not Interested':  'bg-red-100 text-red-700',
  'Meeting Booked':  'bg-blue-100 text-blue-700',
  'Out of Office':   'bg-yellow-100 text-yellow-700',
  'Wrong Person':    'bg-gray-100 text-gray-600',
  'Do Not Contact':  'bg-red-100 text-red-700',
  'Uncategorized':   'bg-gray-100 text-gray-500',
}

const CATEGORIES: LeadCategory[] = [
  'Interested', 'Not Interested', 'Meeting Booked',
  'Out of Office', 'Wrong Person', 'Do Not Contact', 'Uncategorized',
]

const FILTER_TABS: { key: InboxFilter; label: string }[] = [
  { key: 'all',       label: 'All Replies' },
  { key: 'unread',    label: 'Unread' },
  { key: 'snoozed',   label: 'Snoozed' },
  { key: 'important', label: 'Important' },
  { key: 'archived',  label: 'Archived' },
]

const FILTER_ENDPOINTS: Record<InboxFilter, string> = {
  all:       '/inbox/replies',
  unread:    '/inbox/unread',
  snoozed:   '/inbox/snoozed',
  important: '/inbox/important',
  archived:  '/inbox/archived',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ConversationItem({
  msg,
  selected,
  onClick,
}: {
  msg: InboxMessage
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors flex gap-3',
        selected ? 'bg-brand-50 border-l-2 border-l-brand-500' : '',
      ].join(' ')}
    >
      {/* Unread dot */}
      <div className="mt-1.5 flex-shrink-0">
        {!msg.is_read
          ? <div className="w-2 h-2 rounded-full bg-brand-500" />
          : <div className="w-2 h-2" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className={`text-sm truncate ${!msg.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
            {msg.lead_name}
          </span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {msg.is_important && <Star size={11} className="text-yellow-400 fill-yellow-400" />}
            <span className="text-xs text-gray-400">{timeAgo(msg.timestamp)}</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 truncate mb-1">{msg.lead_company}</p>

        <p className="text-xs text-gray-400 truncate">{msg.body.replace(/<[^>]+>/g, '').slice(0, 80)}</p>

        {msg.category && msg.category !== 'Uncategorized' && (
          <span className={`mt-1.5 inline-block text-xs px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[msg.category]}`}>
            {msg.category}
          </span>
        )}
      </div>
    </button>
  )
}

function ThreadMessage({ msg }: { msg: InboxMessage }) {
  const isSent = msg.message_type === 'sent'
  const clean  = DOMPurify.sanitize(msg.body, { ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'u', 'a', 'ul', 'ol', 'li', 'strong', 'em'] })

  return (
    <div className={`mb-6 ${isSent ? 'pl-8' : 'pr-8'}`}>
      <div className={`flex items-center gap-2 mb-2 ${isSent ? 'justify-end' : ''}`}>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${isSent ? 'bg-brand-100 text-brand-700 order-last' : 'bg-gray-200 text-gray-600'}`}>
          {isSent ? 'You' : msg.lead_name[0]}
        </div>
        <div>
          <span className="text-sm font-medium text-gray-900">{isSent ? 'You' : msg.lead_name}</span>
          <span className="text-xs text-gray-400 ml-2">{new Date(msg.timestamp).toLocaleString()}</span>
        </div>
      </div>
      <div className={`rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed ${isSent ? 'bg-brand-50 border border-brand-100' : 'bg-white border border-gray-200'}`}>
        <div dangerouslySetInnerHTML={{ __html: clean }} />
      </div>
    </div>
  )
}

// ─── Main Inbox Component ─────────────────────────────────────────────────────

export default function Inbox() {
  const { showToast } = useToast()

  // List state
  const [filter, setFilter]           = useState<InboxFilter>('all')
  const [search, setSearch]           = useState('')
  const [conversations, setConvs]     = useState<InboxMessage[]>([])
  const [total, setTotal]             = useState(0)
  const [offset, setOffset]           = useState(0)
  const [listLoading, setListLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Thread state
  const [selected, setSelected]         = useState<InboxMessage | null>(null)
  const [thread, setThread]             = useState<InboxMessage[]>([])
  const [threadLoading, setThreadLoading] = useState(false)
  const threadEndRef = useRef<HTMLDivElement>(null)

  // Reply state
  const [replyBody, setReplyBody]       = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  // Action state
  const [categoryOpen, setCategoryOpen] = useState(false)
  const LIMIT = 20

  // ── Fetch conversations ────────────────────────────────────────────────────

  const fetchConversations = useCallback(async (reset = true) => {
    const off = reset ? 0 : offset
    if (reset) setListLoading(true)
    else setLoadingMore(true)

    try {
      const { data } = await api.post<PaginatedMessages>(
        FILTER_ENDPOINTS[filter],
        {},
        { params: { offset: off, limit: LIMIT } },
      )
      setTotal(data.total)
      setConvs(reset ? data.data : (prev) => [...prev, ...data.data])
      setOffset(off + data.data.length)
    } catch {
      showToast('Failed to load inbox', 'error')
    } finally {
      setListLoading(false)
      setLoadingMore(false)
    }
  }, [filter, offset]) // eslint-disable-line react-hooks/exhaustive-deps

  // Initial load + filter change
  useEffect(() => {
    setSelected(null)
    setThread([])
    fetchConversations(true)
  }, [filter]) // eslint-disable-line react-hooks/exhaustive-deps

  // Poll every 30s
  useEffect(() => {
    const id = setInterval(() => fetchConversations(true), 30_000)
    return () => clearInterval(id)
  }, [filter]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load thread when conversation selected ────────────────────────────────

  const selectConversation = async (msg: InboxMessage) => {
    setSelected(msg)
    setReplyBody('')
    setThreadLoading(true)

    try {
      const { data } = await api.get<{ messages: InboxMessage[] }>(
        `/inbox/lead/${msg.lead_id}/thread`,
        { params: { campaign_id: msg.campaign_id } },
      )
      setThread(data.messages)

      // Auto-mark as read
      if (!msg.is_read) {
        await api.patch('/inbox/read-status', { email_id: msg.id, is_read: true })
        setConvs((prev) => prev.map((c) => c.id === msg.id ? { ...c, is_read: true } : c))
        setSelected((prev) => prev ? { ...prev, is_read: true } : prev)
      }
    } catch {
      showToast('Failed to load thread', 'error')
    } finally {
      setThreadLoading(false)
      setTimeout(() => threadEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  const toggleImportant = async () => {
    if (!selected) return
    const newVal = !selected.is_important
    try {
      await api.patch('/inbox/important', { email_id: selected.id, is_important: newVal })
      setSelected((p) => p ? { ...p, is_important: newVal } : p)
      setConvs((prev) => prev.map((c) => c.id === selected.id ? { ...c, is_important: newVal } : c))
      showToast(newVal ? 'Marked as important' : 'Removed from important', 'success')
    } catch {
      showToast('Action failed', 'error')
    }
  }

  const toggleArchive = async () => {
    if (!selected) return
    try {
      await api.patch('/inbox/archive', { email_id: selected.id, is_archived: !selected.is_archived })
      setConvs((prev) => prev.filter((c) => c.id !== selected.id))
      setSelected(null)
      setThread([])
      showToast(selected.is_archived ? 'Unarchived' : 'Archived', 'success')
    } catch {
      showToast('Action failed', 'error')
    }
  }

  const changeCategory = async (cat: LeadCategory) => {
    if (!selected) return
    setCategoryOpen(false)
    try {
      await api.patch('/inbox/category', {
        lead_id: selected.lead_id,
        campaign_id: selected.campaign_id,
        category: cat,
      })
      setSelected((p) => p ? { ...p, category: cat } : p)
      setConvs((prev) => prev.map((c) => c.id === selected.id ? { ...c, category: cat } : c))
      showToast(`Category set to ${cat}`, 'success')
    } catch {
      showToast('Failed to update category', 'error')
    }
  }

  const sendReply = async () => {
    if (!selected || !replyBody.trim()) return
    setSendingReply(true)
    try {
      await api.post('/inbox/reply', {
        lead_id:          selected.lead_id,
        campaign_id:      selected.campaign_id,
        email_body:       replyBody.trim(),
        email_account_id: 1, // TODO: let user choose in Phase 5
      })
      const newMsg: InboxMessage = {
        id: Date.now(),
        lead_id: selected.lead_id,
        lead_email: selected.lead_email,
        lead_name: selected.lead_name,
        lead_company: selected.lead_company,
        campaign_id: selected.campaign_id,
        campaign_name: selected.campaign_name,
        subject: `Re: ${selected.subject}`,
        body: replyBody.trim(),
        is_read: true,
        is_important: false,
        is_snoozed: false,
        is_archived: false,
        category: selected.category,
        timestamp: new Date().toISOString(),
        message_type: 'sent',
      }
      setThread((prev) => [...prev, newMsg])
      setReplyBody('')
      showToast('Reply sent', 'success')
      setTimeout(() => threadEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch {
      showToast('Failed to send reply', 'error')
    } finally {
      setSendingReply(false)
    }
  }

  // ── Filtered list ─────────────────────────────────────────────────────────

  const filtered = search.trim()
    ? conversations.filter(
        (c) =>
          c.lead_name.toLowerCase().includes(search.toLowerCase()) ||
          c.lead_email.toLowerCase().includes(search.toLowerCase()) ||
          c.lead_company.toLowerCase().includes(search.toLowerCase()),
      )
    : conversations

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden bg-white">

      {/* ── Left Panel: Conversation List ─────────────────────────────────── */}
      <div className="w-80 flex-shrink-0 flex flex-col border-r border-gray-200 min-h-0">

        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-gray-900">Inbox</h1>
            <button
              onClick={() => fetchConversations(true)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, email, company…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-400 bg-gray-50"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={[
                'flex-shrink-0 px-3 py-2 text-xs font-medium transition-colors border-b-2',
                filter === tab.key
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {listLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 size={20} className="animate-spin text-gray-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center px-4">
              <InboxIcon size={32} className="text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">
                {search ? 'No results for your search.' : 'No messages here yet.'}
              </p>
            </div>
          ) : (
            <>
              {filtered.map((msg) => (
                <ConversationItem
                  key={msg.id}
                  msg={msg}
                  selected={selected?.id === msg.id}
                  onClick={() => selectConversation(msg)}
                />
              ))}

              {conversations.length < total && (
                <button
                  onClick={() => fetchConversations(false)}
                  disabled={loadingMore}
                  className="w-full py-3 text-xs text-brand-600 hover:bg-brand-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {loadingMore ? <Loader2 size={12} className="animate-spin" /> : null}
                  Load more ({total - conversations.length} remaining)
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Right Panel: Thread ────────────────────────────────────────────── */}
      {selected ? (
        <div className="flex-1 flex flex-col min-h-0">

          {/* Thread header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-gray-900 truncate">{selected.lead_name}</h2>
                <p className="text-sm text-gray-500">{selected.lead_email} · {selected.lead_company}</p>
                <span className="inline-block mt-1 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {selected.campaign_name}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={toggleImportant}
                  title={selected.is_important ? 'Remove from important' : 'Mark as important'}
                  className={`p-2 rounded-md transition-colors ${selected.is_important ? 'text-yellow-400 bg-yellow-50' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                  <Star size={16} className={selected.is_important ? 'fill-yellow-400' : ''} />
                </button>

                <button
                  onClick={toggleArchive}
                  title={selected.is_archived ? 'Unarchive' : 'Archive'}
                  className="p-2 rounded-md text-gray-400 hover:bg-gray-100 transition-colors"
                >
                  <Archive size={16} />
                </button>

                {/* Category dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setCategoryOpen(!categoryOpen)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${CATEGORY_COLORS[selected.category]} hover:opacity-80`}
                  >
                    <Tag size={12} />
                    {selected.category}
                    <ChevronDown size={11} />
                  </button>
                  {categoryOpen && (
                    <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => changeCategory(cat)}
                          className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 ${cat === selected.category ? 'font-semibold' : ''}`}
                        >
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${CATEGORY_COLORS[cat].split(' ')[0]}`} />
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mt-2 font-medium">{selected.subject}</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5">
            {threadLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 size={20} className="animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                {thread.map((msg) => (
                  <ThreadMessage key={msg.id} msg={msg} />
                ))}
                <div ref={threadEndRef} />
              </>
            )}
          </div>

          {/* Reply composer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-white flex-shrink-0">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold flex-shrink-0 mt-0.5">
                You
              </div>
              <div className="flex-1">
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendReply()
                  }}
                  placeholder={`Reply to ${selected.lead_name}… (⌘↵ to send)`}
                  rows={3}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200 bg-gray-50"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-400">{replyBody.length > 0 ? `${replyBody.length} chars` : ''}</p>
                  <button
                    onClick={sendReply}
                    disabled={sendingReply || !replyBody.trim()}
                    className="flex items-center gap-2 px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sendingReply
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Send size={14} />}
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MailOpen size={28} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-600">Select a conversation</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-xs">
              Choose a message from the list to read the full thread and reply.
            </p>
          </div>
        </div>
      )}

      {/* Close category dropdown on outside click */}
      {categoryOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setCategoryOpen(false)} />
      )}
    </div>
  )
}
