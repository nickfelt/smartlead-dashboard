import { useState } from 'react'
import { X, Sparkles, Loader2, ChevronRight, Copy, Check } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

// ─── Types ────────────────────────────────────────────────────────────────────

type AiMode = 'sequence' | 'variants' | 'rewrite' | 'subjects'
type Provider = 'claude' | 'openai'

interface SequenceStep {
  seq_number: number
  seq_delay_details: { delay_in_days: number }
  variants: { subject: string; body: string }[]
}

interface AiWriterProps {
  onClose: () => void
  onApplySequence: (steps: SequenceStep[]) => void
  onApplyVariants: (variants: { label: string; subject: string; body: string }[]) => void
  onApplyRewrite: (text: string) => void
  onApplySubjects: (subjects: string[]) => void
  currentBody?: string
  currentSubject?: string
}

// ─── Merge tag reference ──────────────────────────────────────────────────────

const MERGE_TAGS = [
  '{{first_name}}', '{{last_name}}', '{{email}}', '{{company_name}}',
  '{{title}}', '{{phone}}', '{{city}}', '{{state}}', '{{country}}',
  '{{website}}', '{{sender_name}}', '{{custom1}}', '{{custom2}}',
  '{{custom3}}', '{{custom4}}', '{{custom5}}',
]

const TONES = ['Professional', 'Casual', 'Direct', 'Friendly', 'Urgent']
const GOALS = ['Book a meeting', 'Get a reply', 'Drive to website', 'Generate interest', 'Nurture relationship']
const STYLES = ['More concise', 'More casual', 'More formal', 'More urgent', 'Add social proof']

// ─── Component ────────────────────────────────────────────────────────────────

export default function AiWriter({
  onClose,
  onApplySequence,
  onApplyVariants,
  onApplyRewrite,
  onApplySubjects,
  currentBody = '',
  currentSubject = '',
}: AiWriterProps) {
  const { user } = useAuth()
  const { showToast } = useToast()

  const hasAnthropic = user?.has_anthropic_key ?? false
  const hasOpenai    = user?.has_openai_key    ?? false
  const hasAnyKey    = hasAnthropic || hasOpenai

  const [mode, setMode]         = useState<AiMode>('sequence')
  const [provider, setProvider] = useState<Provider>(hasAnthropic ? 'claude' : 'openai')
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState<unknown>(null)
  const [copied, setCopied]     = useState<string | null>(null)

  // Form fields
  const [audience, setAudience]   = useState('')
  const [product, setProduct]     = useState('')
  const [tone, setTone]           = useState('Professional')
  const [steps, setSteps]         = useState(3)
  const [goal, setGoal]           = useState('Book a meeting')
  const [numVariants, setNumVariants] = useState(3)
  const [rewriteStyle, setRewriteStyle] = useState('More concise')
  const [numSubjects, setNumSubjects] = useState(7)

  const copyTag = (tag: string) => {
    navigator.clipboard.writeText(tag)
    setCopied(tag)
    setTimeout(() => setCopied(null), 1500)
  }

  const generate = async () => {
    setLoading(true)
    setResult(null)
    try {
      if (mode === 'sequence') {
        const { data } = await api.post('/ai/generate-sequence', { provider, audience, product, tone, steps, goal })
        setResult(data.sequences)
      } else if (mode === 'variants') {
        const { data } = await api.post('/ai/generate-variants', {
          provider, existing_subject: currentSubject, existing_body: currentBody, num_variants: numVariants,
        })
        setResult(data.variants)
      } else if (mode === 'rewrite') {
        const { data } = await api.post('/ai/rewrite', { provider, text: currentBody, style: rewriteStyle })
        setResult(data.rewritten)
      } else {
        const { data } = await api.post('/ai/subject-lines', { provider, email_body: currentBody, num_suggestions: numSubjects })
        setResult(data.subject_lines)
      }
    } catch {
      showToast('AI generation failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const MODES: { key: AiMode; label: string }[] = [
    { key: 'sequence', label: 'Generate Sequence' },
    { key: 'variants', label: 'A/B Variants' },
    { key: 'rewrite',  label: 'Rewrite' },
    { key: 'subjects', label: 'Subject Lines' },
  ]

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/20" onClick={onClose} />

      {/* Panel */}
      <div className="w-[480px] bg-white shadow-2xl flex flex-col h-full overflow-hidden border-l border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-brand-600 to-brand-700">
          <div className="flex items-center gap-2 text-white">
            <Sparkles size={18} />
            <span className="font-semibold">AI Email Writer</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded">
            <X size={18} />
          </button>
        </div>

        {!hasAnyKey ? (
          /* No keys configured */
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div>
              <Sparkles size={40} className="text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-700 mb-2">AI keys not configured</h3>
              <p className="text-sm text-gray-500 mb-4">
                Add your Anthropic or OpenAI API key in Settings to use the AI writer.
              </p>
              <a href="/dashboard/settings" className="text-brand-600 text-sm font-medium hover:underline">
                Go to Settings →
              </a>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Provider + Mode selectors */}
            <div className="px-5 pt-4 pb-3 border-b border-gray-100 space-y-3">
              {/* Provider */}
              {hasAnthropic && hasOpenai && (
                <div className="flex gap-2">
                  {(['claude', 'openai'] as Provider[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setProvider(p)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        provider === p
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {p === 'claude' ? '⚡ Claude' : '🤖 GPT-4o'}
                    </button>
                  ))}
                </div>
              )}

              {/* Mode tabs */}
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {MODES.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => { setMode(m.key); setResult(null) }}
                    className={`flex-1 py-1 rounded-md text-xs font-medium transition-colors ${
                      mode === m.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

              {mode === 'sequence' && (
                <>
                  <Field label="Target audience">
                    <textarea rows={2} value={audience} onChange={(e) => setAudience(e.target.value)}
                      placeholder="e.g. B2B SaaS founders with 10-100 employees"
                      className={inputCls} />
                  </Field>
                  <Field label="Your product/service">
                    <textarea rows={2} value={product} onChange={(e) => setProduct(e.target.value)}
                      placeholder="e.g. Cold email software that automates outreach"
                      className={inputCls} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Tone">
                      <select value={tone} onChange={(e) => setTone(e.target.value)} className={inputCls}>
                        {TONES.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </Field>
                    <Field label="Goal">
                      <select value={goal} onChange={(e) => setGoal(e.target.value)} className={inputCls}>
                        {GOALS.map((g) => <option key={g}>{g}</option>)}
                      </select>
                    </Field>
                  </div>
                  <Field label={`Steps (${steps})`}>
                    <input type="range" min={1} max={7} value={steps} onChange={(e) => setSteps(+e.target.value)}
                      className="w-full accent-brand-600" />
                    <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                      <span>1</span><span>7</span>
                    </div>
                  </Field>
                </>
              )}

              {mode === 'variants' && (
                <>
                  <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                    Generating variants for the currently selected step.
                  </div>
                  <Field label={`Number of variants (${numVariants})`}>
                    <input type="range" min={2} max={4} value={numVariants} onChange={(e) => setNumVariants(+e.target.value)}
                      className="w-full accent-brand-600" />
                  </Field>
                </>
              )}

              {mode === 'rewrite' && (
                <Field label="Rewrite style">
                  <div className="grid grid-cols-1 gap-2">
                    {STYLES.map((s) => (
                      <button key={s} onClick={() => setRewriteStyle(s)}
                        className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                          rewriteStyle === s ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </Field>
              )}

              {mode === 'subjects' && (
                <Field label={`Suggestions (${numSubjects})`}>
                  <input type="range" min={3} max={10} value={numSubjects} onChange={(e) => setNumSubjects(+e.target.value)}
                    className="w-full accent-brand-600" />
                  <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                    <span>3</span><span>10</span>
                  </div>
                </Field>
              )}

              {/* Generate button */}
              <button onClick={generate} disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium disabled:opacity-60 transition-colors">
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                {loading ? 'Generating…' : 'Generate'}
              </button>

              {/* Results */}
              {!!result && !loading && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Result</span>
                  </div>

                  {mode === 'sequence' && Array.isArray(result) && (
                    <div className="p-3 space-y-3 max-h-64 overflow-y-auto">
                      {(result as SequenceStep[]).map((step) => (
                        <div key={step.seq_number} className="bg-white border border-gray-200 rounded-lg p-3 text-xs">
                          <p className="font-semibold text-gray-700 mb-1">Step {step.seq_number} · Day {step.seq_delay_details.delay_in_days}</p>
                          <p className="text-gray-500 font-medium">{step.variants[0]?.subject}</p>
                          <p className="text-gray-400 mt-1 line-clamp-3">{step.variants[0]?.body}</p>
                        </div>
                      ))}
                      <button onClick={() => { onApplySequence(result as SequenceStep[]); setResult(null); showToast('Sequence applied!', 'success') }}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                        <ChevronRight size={14} /> Apply to Editor
                      </button>
                    </div>
                  )}

                  {mode === 'variants' && Array.isArray(result) && (
                    <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                      {(result as { label: string; subject: string; body: string }[]).map((v) => (
                        <div key={v.label} className="bg-white border border-gray-200 rounded-lg p-3 text-xs">
                          <span className="font-bold text-brand-600">{v.label}</span>
                          <p className="text-gray-600 mt-1">{v.subject}</p>
                        </div>
                      ))}
                      <button onClick={() => { onApplyVariants(result as { label: string; subject: string; body: string }[]); setResult(null); showToast('Variants added!', 'success') }}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                        <ChevronRight size={14} /> Apply Variants
                      </button>
                    </div>
                  )}

                  {mode === 'rewrite' && typeof result === 'string' && (
                    <div className="p-3">
                      <p className="text-xs text-gray-700 whitespace-pre-wrap mb-3">{result}</p>
                      <button onClick={() => { onApplyRewrite(result); setResult(null); showToast('Rewrite applied!', 'success') }}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                        <ChevronRight size={14} /> Apply Rewrite
                      </button>
                    </div>
                  )}

                  {mode === 'subjects' && Array.isArray(result) && (
                    <div className="p-3 space-y-1.5 max-h-64 overflow-y-auto">
                      {(result as { subject: string; type: string }[]).map((s, i) => (
                        <div key={i} className="flex items-center justify-between gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                          <div>
                            <p className="text-xs text-gray-800">{s.subject}</p>
                            <p className="text-xs text-gray-400 capitalize">{s.type}</p>
                          </div>
                          <button onClick={() => { onApplySubjects([s.subject]); showToast('Subject applied!', 'success') }}
                            className="text-brand-600 hover:text-brand-700 flex-shrink-0">
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Merge tags */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Merge Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {MERGE_TAGS.map((tag) => (
                    <button key={tag} onClick={() => copyTag(tag)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono transition-colors ${
                        copied === tag ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-brand-100 hover:text-brand-700'
                      }`}>
                      {copied === tag ? <Check size={10} /> : <Copy size={10} />}
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200 bg-white'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
