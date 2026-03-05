import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Globe, Shield, Zap, Server, BarChart2 } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const steps = [
  {
    n: '01',
    title: 'Search & select your domains',
    desc: 'Type the domain name you want. Bookd checks availability and shows pricing instantly. Pick one or buy in bulk for volume sending.',
  },
  {
    n: '02',
    title: 'Choose your mailboxes',
    desc: 'Select Google Workspace, Microsoft 365, or standard SMTP. Pick how many mailboxes you need per domain.',
  },
  {
    n: '03',
    title: 'Bookd handles DNS automatically',
    desc: 'SPF, DKIM, and DMARC records are configured for you. No technical knowledge required — just place the order.',
  },
  {
    n: '04',
    title: 'Warmup starts immediately',
    desc: 'New mailboxes enter our automated warmup program. Within 2–4 weeks they\'re at full sending capacity with a healthy reputation score.',
  },
]

const providers = [
  { name: 'Google Workspace', logo: 'G', color: '#4285F4', desc: 'Best deliverability for B2B inboxes. Full Gmail experience.' },
  { name: 'Microsoft 365',    logo: 'M', color: '#00A4EF', desc: 'Outlook mailboxes with enterprise-grade infrastructure.' },
  { name: 'Custom SMTP',      logo: '✉', color: '#9A7E58', desc: 'Bring your own provider. Bookd handles warmup regardless.' },
]

const benefits = [
  { icon: <Globe size={20} />,    title: 'No manual DNS setup',       desc: 'SPF, DKIM, DMARC — all configured automatically on purchase.' },
  { icon: <Zap size={20} />,      title: 'Ready in hours, not weeks', desc: 'From domain purchase to sending in one afternoon, not a month.' },
  { icon: <Shield size={20} />,   title: 'Built-in warmup protocol',  desc: 'Gradual sending ramp-up protects your domain reputation from day one.' },
  { icon: <Server size={20} />,   title: 'Scale with one click',      desc: 'Add more domains and mailboxes as your campaigns grow — no IT ticket needed.' },
  { icon: <BarChart2 size={20} />, title: 'Live health scores',       desc: 'Monitor inbox placement, spam rate, and warmup progress for every mailbox.' },
  { icon: <CheckCircle2 size={20} />, title: 'Centralized billing',   desc: 'All your domains, mailboxes, and subscriptions on one invoice.' },
]

function RevealSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
    >
      {children}
    </div>
  )
}

export default function SmartSenders() {
  return (
    <div className="bg-[#FAF7F2]">

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6 bg-gradient-to-br from-[#1A2A1A] via-[#2A4A30] to-[#4A7A40] overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-semibold tracking-wide uppercase mb-5">
            Smart Senders
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.1] mb-5">
            Warmed-up mailboxes,<br />
            <span className="text-[#A8D4A0]">ready to send</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Buy domains, provision mailboxes, and auto-configure DNS — all inside Bookd. No IT setup, no manual warmup, no waiting.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#9A7E58] hover:bg-[#7D6440] text-white font-semibold transition-all hover:scale-105"
            >
              Get started with Smart Senders <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold transition-all"
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white border-b border-[#E8DDCB]">
        <RevealSection>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <span className="inline-block px-3 py-1 rounded-full bg-[#9A7E58]/10 text-[#7D6440] text-xs font-semibold tracking-wide uppercase mb-4">
                How It Works
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1A1A1A]">
                From order to inbox in four steps
              </h2>
            </div>
            <div className="relative">
              {/* Connector */}
              <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-[#E8DDCB]" />
              <div className="grid md:grid-cols-4 gap-6">
                {steps.map((s) => (
                  <div key={s.n} className="relative text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#9A7E58] text-white font-serif font-bold text-lg flex items-center justify-center mx-auto mb-4 shadow-md shadow-[#9A7E58]/30 relative z-10">
                      {s.n}
                    </div>
                    <h3 className="font-semibold text-[#1A1A1A] mb-2 text-sm">{s.title}</h3>
                    <p className="text-xs text-[#6B6B6B] leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ── Providers ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#F5F0E8]">
        <RevealSection>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-block px-3 py-1 rounded-full bg-[#9A7E58]/10 text-[#7D6440] text-xs font-semibold tracking-wide uppercase mb-4">
                Supported Providers
              </span>
              <h2 className="font-serif text-3xl font-semibold text-[#1A1A1A]">
                Your choice of inbox provider
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {providers.map((p) => (
                <div key={p.name} className="bg-white rounded-2xl border border-[#E8DDCB] p-6 text-center hover:border-[#9A7E58] transition-colors">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.logo}
                  </div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">{p.name}</h3>
                  <p className="text-sm text-[#6B6B6B]">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ── Benefits ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <RevealSection>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-block px-3 py-1 rounded-full bg-[#9A7E58]/10 text-[#7D6440] text-xs font-semibold tracking-wide uppercase mb-4">
                Benefits
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1A1A1A]">
                Infrastructure that just works
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {benefits.map((b) => (
                <div key={b.title} className="flex gap-4 p-5 rounded-2xl border border-[#E8DDCB] bg-[#FAF7F2]">
                  <div className="w-10 h-10 bg-[#9A7E58]/10 rounded-xl flex items-center justify-center text-[#9A7E58] flex-shrink-0">
                    {b.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1A1A1A] text-sm mb-1">{b.title}</h3>
                    <p className="text-xs text-[#6B6B6B] leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#3E3018] py-16 px-6">
        <RevealSection>
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { v: '98%',  l: 'Inbox placement rate' },
              { v: '2–4w', l: 'Full warmup timeline' },
              { v: '3',    l: 'DNS records auto-set' },
              { v: '24h',  l: 'Avg. provisioning time' },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-serif text-4xl font-bold text-white mb-1">{s.v}</div>
                <div className="text-sm text-[#C4AE8A]">{s.l}</div>
              </div>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <RevealSection>
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-gradient-to-br from-[#1A2A1A] to-[#4A7A40] rounded-3xl px-8 py-14 text-white">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-3 leading-tight">
                Stop fighting deliverability.<br />Start booking meetings.
              </h2>
              <p className="text-white/70 mb-8 max-w-xl mx-auto">
                Smart Senders is available on Pro and Enterprise plans. Spin up your infrastructure today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#9A7E58] hover:bg-[#B49870] text-white font-semibold transition-all hover:scale-105"
                >
                  Get started <ArrowRight size={16} />
                </Link>
                <Link
                  to="/contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold transition-all"
                >
                  Talk to sales
                </Link>
              </div>
            </div>
          </div>
        </RevealSection>
      </section>

    </div>
  )
}
