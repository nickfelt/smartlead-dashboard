import { useState, FormEvent } from 'react'
import { Mail, Clock, MessageSquare, Check } from 'lucide-react'

const inputCls =
  'block w-full rounded-xl border border-[#D4C4A8] bg-white px-4 py-3 text-[#1A1A1A] placeholder-[#9A9A9A] focus:border-[#9A7E58] focus:outline-none focus:ring-2 focus:ring-[#9A7E58]/20 text-sm transition'

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // UI-only form — in production wire up to email/CRM
    setSubmitted(true)
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [field]: e.target.value })

  return (
    <div className="bg-[#FAF7F2] min-h-screen">

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-16 px-6 bg-white border-b border-[#E8DDCB]">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-[#9A7E58]/10 text-[#7D6440] text-xs font-semibold tracking-wide uppercase mb-5">
            Get in touch
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1A1A1A] leading-tight mb-4">
            Let's talk about scaling<br />
            <span className="text-[#9A7E58]">your outreach</span>
          </h1>
          <p className="text-[#6B6B6B] text-lg">
            Whether you have a question, want a demo, or are ready to get started — we're here.
          </p>
        </div>
      </section>

      {/* ── Two-column layout ──────────────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">

          {/* ── Contact form ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-[#E8DDCB] shadow-sm p-8">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-5">
                  <Check size={28} className="text-green-500" />
                </div>
                <h3 className="font-serif text-2xl font-semibold text-[#1A1A1A] mb-2">Message sent!</h3>
                <p className="text-[#6B6B6B]">
                  Thanks for reaching out. We'll get back to you within one business day.
                </p>
              </div>
            ) : (
              <>
                <h2 className="font-semibold text-[#1A1A1A] text-lg mb-6">Send us a message</h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Name</label>
                      <input
                        type="text" required value={form.name} onChange={set('name')}
                        className={inputCls} placeholder="Jane Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Email</label>
                      <input
                        type="email" required value={form.email} onChange={set('email')}
                        className={inputCls} placeholder="you@company.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Company</label>
                    <input
                      type="text" value={form.company} onChange={set('company')}
                      className={inputCls} placeholder="Acme Corp"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Message</label>
                    <textarea
                      required rows={5} value={form.message} onChange={set('message')}
                      className={`${inputCls} resize-none`}
                      placeholder="Tell us about your outreach goals, current setup, or any questions you have..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-full bg-[#9A7E58] hover:bg-[#7D6440] text-white text-sm font-semibold transition-colors"
                  >
                    Send message
                  </button>
                </form>
              </>
            )}
          </div>

          {/* ── Right info panel ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-6">

            {/* Contact info cards */}
            <div className="bg-white rounded-2xl border border-[#E8DDCB] p-6">
              <h3 className="font-semibold text-[#1A1A1A] mb-5">Contact info</h3>
              <div className="space-y-4">
                {[
                  {
                    icon: <Mail size={18} />,
                    label: 'Email',
                    value: 'hello@bookd.io',
                    sub: 'For general inquiries',
                  },
                  {
                    icon: <Clock size={18} />,
                    label: 'Response time',
                    value: 'Within 1 business day',
                    sub: 'Mon–Fri, 9am–6pm EST',
                  },
                  {
                    icon: <MessageSquare size={18} />,
                    label: 'Live chat',
                    value: 'Available in the app',
                    sub: 'For existing customers',
                  },
                ].map((item) => (
                  <div key={item.label} className="flex gap-3">
                    <div className="w-9 h-9 bg-[#F5F0E8] rounded-xl flex items-center justify-center text-[#9A7E58] flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs text-[#9A9A9A] font-medium">{item.label}</div>
                      <div className="text-sm font-semibold text-[#1A1A1A]">{item.value}</div>
                      <div className="text-xs text-[#9A9A9A]">{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calendly placeholder */}
            <div className="bg-white rounded-2xl border border-[#E8DDCB] p-6 flex-1">
              <h3 className="font-semibold text-[#1A1A1A] mb-1">Book a call</h3>
              <p className="text-sm text-[#6B6B6B] mb-5">
                Prefer a live conversation? Schedule a 30-minute call with our team.
              </p>
              <div className="bg-[#F5F0E8] rounded-xl h-52 flex items-center justify-center border border-[#E8DDCB]">
                <div className="text-center px-4">
                  <div className="w-10 h-10 bg-[#9A7E58]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock size={20} className="text-[#9A7E58]" />
                  </div>
                  <p className="text-sm font-medium text-[#4A4A4A] mb-1">Calendly embed</p>
                  <p className="text-xs text-[#9A9A9A]">
                    Drop in your Calendly widget URL to<br />enable inline booking here
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ nudge */}
            <div className="bg-[#F5F0E8] rounded-2xl border border-[#E8DDCB] p-5">
              <p className="text-sm text-[#4A4A4A]">
                <span className="font-semibold text-[#1A1A1A]">Looking for quick answers?</span>{' '}
                Check out our{' '}
                <a href="/#faq" className="text-[#9A7E58] font-medium hover:underline">
                  FAQ section
                </a>{' '}
                on the homepage — most common questions are answered there.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
