import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronDown, Check, Star,
  Mail, BarChart2, Users, Zap, Shield, Clock,
  ArrowRight, Play, X,
  Plus, Minus,
} from 'lucide-react'
import { useScrollReveal } from '../hooks/useScrollReveal'

// ─── Data ─────────────────────────────────────────────────────────────────────
const features = [
  {
    icon: <Mail size={24} />,
    title: 'Unified Inbox',
    desc: 'All your client replies in one intelligent inbox. Prioritise, label, and respond without switching tabs.',
    link: '/solutions/agencies',
  },
  {
    icon: <BarChart2 size={24} />,
    title: 'Live Analytics',
    desc: 'Real-time open rates, click rates, and reply rates per campaign — segmented by sequence step.',
    link: '/solutions/sales-teams',
  },
  {
    icon: <Zap size={24} />,
    title: 'AI Copy Engine',
    desc: 'Generate personalised sequences, A/B subject lines, and full rewrites in seconds using GPT-4o.',
    link: '/solutions/founders',
  },
  {
    icon: <Users size={24} />,
    title: 'Client Portals',
    desc: 'White-label dashboards for each of your clients. They see their data; you keep full control.',
    link: '/solutions/agencies',
  },
  {
    icon: <Shield size={24} />,
    title: 'Deliverability First',
    desc: 'Smart Senders provisioning, automated mailbox warmup, and domain health scoring built in.',
    link: '/solutions/smart-senders',
  },
  {
    icon: <Clock size={24} />,
    title: 'Automated Scheduling',
    desc: 'Set send windows per timezone, pause on reply, and throttle to protect your sending reputation.',
    link: '/solutions/sales-teams',
  },
]

const steps = [
  {
    number: '01',
    title: 'Connect your mailboxes',
    desc: 'Import existing SMTP accounts or order warmed-up Smart Senders directly inside Bookd.',
  },
  {
    number: '02',
    title: 'Build your sequence',
    desc: 'Use our AI writer or drag-and-drop editor to craft multi-step campaigns with personalised variants.',
  },
  {
    number: '03',
    title: 'Watch replies roll in',
    desc: 'Monitor real-time analytics per campaign, manage replies in your unified inbox, and close deals faster.',
  },
]

const benefits = [
  {
    badge: 'Agency-Ready',
    headline: 'Manage every client from one seat',
    body: 'No more juggling spreadsheets or context-switching between tools. Bookd gives each client their own branded portal while you run everything from a single admin dashboard.',
    stat: '4×',
    statLabel: 'more clients managed per operator',
    link: '/solutions/agencies',
  },
  {
    badge: 'AI-Powered',
    headline: 'Generate winning copy in seconds',
    body: 'Our AI writer knows what converts in cold outreach. Feed it your ICP, product, and tone — and it outputs full sequences, subject variants, and follow-ups ready to launch.',
    stat: '63%',
    statLabel: 'average reply rate lift vs manual copy',
    link: '/solutions/founders',
  },
  {
    badge: 'Built for Scale',
    headline: 'Deliverability that holds at volume',
    body: 'Automatic mailbox rotation, warmup scheduling, and real-time domain health scores mean your emails land in inboxes — even at 50,000 sends per day.',
    stat: '98%',
    statLabel: 'average inbox placement rate',
    link: '/solutions/smart-senders',
  },
]

const stats = [
  { value: '2.4M+', label: 'Emails sent monthly' },
  { value: '94%',   label: 'Inbox placement rate' },
  { value: '38%',   label: 'Average open rate' },
  { value: '180+',  label: 'Agencies onboarded' },
]

const testimonials = [
  {
    quote: 'Bookd cut our campaign setup time by 70%. The AI writer alone pays for the entire subscription every month.',
    author: 'Sarah Chen',
    role: 'Founder, Apex Demand Gen',
    avatar: 'SC',
    rating: 5,
  },
  {
    quote: 'Finally a tool built for agencies. My clients love their branded dashboards and I love not having to babysit twelve Smartlead logins.',
    author: 'Marcus Rivera',
    role: 'CEO, Outbound Studio',
    avatar: 'MR',
    rating: 5,
  },
  {
    quote: 'We scaled from 3 to 22 clients in four months without adding headcount. The admin controls are exactly what we needed.',
    author: 'Priya Nair',
    role: 'Head of Growth, LeadFlow Agency',
    avatar: 'PN',
    rating: 5,
  },
]

const plans = [
  {
    name: 'Starter',
    monthlyPrice: 149,
    annualPrice: 119,
    desc: 'Perfect for solo operators and small teams getting started with cold email.',
    features: [
      '5 mailboxes',
      '6,000 emails / month',
      '2,000 active leads',
      '3 active campaigns',
      'Unified inbox',
      'Basic analytics',
      'Email support',
    ],
    cta: 'Start free trial',
    highlighted: false,
  },
  {
    name: 'Pro',
    monthlyPrice: 249,
    annualPrice: 199,
    desc: 'For growing agencies running multiple clients and high-volume campaigns.',
    features: [
      'Unlimited mailboxes',
      '150,000 emails / month',
      '30,000 active leads',
      'Unlimited campaigns',
      'AI copy engine (incl. custom first lines)',
      'Client portals',
      'Smart Senders',
      'Advanced analytics',
      'Priority support',
    ],
    cta: 'Start free trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    monthlyPrice: 497,
    annualPrice: 397,
    desc: 'Custom volume, white-label branding, and dedicated success management.',
    features: [
      'Everything in Pro',
      'Unlimited emails',
      'Unlimited active leads',
      'White-label branding',
      'Custom domain',
      'SSO / SAML',
      'Dedicated CSM',
      'SLA guarantee',
      'Custom contracts',
    ],
    cta: 'Book a call',
    highlighted: false,
  },
]

const faqs = [
  {
    q: 'Does Bookd work with any email provider?',
    a: 'Yes. Bookd connects to any SMTP/IMAP provider — Google Workspace, Microsoft 365, Zoho, and custom SMTP servers. We also offer Smart Senders: pre-warmed mailboxes provisioned and managed for you.',
  },
  {
    q: 'Can my clients log in to see their own data?',
    a: 'Absolutely. Every client gets their own white-labeled portal with their branding. They can view campaigns, analytics, and inbox replies — but they never see your agency settings or other clients.',
  },
  {
    q: "How does the AI writer work?",
    a: "Our AI writer is powered by GPT-4o and fine-tuned on high-performing cold email sequences. You provide your ICP, value proposition, and tone of voice — it outputs full multi-step sequences, A/B subject variants, and follow-up messages.",
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes, every plan includes a 14-day free trial. No credit card required. You can upgrade, downgrade, or cancel at any time from your billing portal.',
  },
  {
    q: 'What happens to my data if I cancel?',
    a: 'Your data is yours. You can export all campaigns, leads, and analytics as CSV at any time. We retain your data for 30 days after cancellation in case you change your mind.',
  },
  {
    q: 'Do you offer agency volume discounts?',
    a: 'Yes. Enterprise plans include custom pricing for high-volume agencies. Book a call and we will put together a proposal tailored to your seat count and send volume.',
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────
function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={14} fill="#E8A04C" stroke="none" />
      ))}
    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[#E8DDCB] last:border-none">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span className="font-medium text-[#1A1A1A] text-base">{q}</span>
        {open ? <Minus size={18} className="flex-shrink-0 text-[#9A7E58]" /> : <Plus size={18} className="flex-shrink-0 text-[#9A7E58]" />}
      </button>
      {open && <p className="pb-5 text-sm text-[#4A4A4A] leading-relaxed">{a}</p>}
    </div>
  )
}

function BenefitCard({ b, idx }: { b: typeof benefits[0]; idx: number }) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>()
  const reverse = idx % 2 === 1
  return (
    <div
      ref={ref}
      className={`flex flex-col md:flex-row gap-12 items-center transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${reverse ? 'md:flex-row-reverse' : ''}`}
    >
      <div className="flex-1 min-h-[280px] bg-gradient-to-br from-[#F5F0E8] to-[#E8DDCB] rounded-3xl flex items-center justify-center border border-[#D4C4A8]">
        <div className="text-center px-8">
          <div className="text-5xl font-serif font-bold text-[#9A7E58] opacity-30">{b.stat}</div>
          <div className="text-sm text-[#6B6B6B] mt-1">{b.statLabel}</div>
        </div>
      </div>
      <div className="flex-1 space-y-4">
        <span className="inline-block px-3 py-1 rounded-full bg-[#9A7E58]/10 text-[#7D6440] text-xs font-semibold tracking-wide uppercase">
          {b.badge}
        </span>
        <h3 className="font-serif text-3xl font-semibold text-[#1A1A1A] leading-tight">{b.headline}</h3>
        <p className="text-[#4A4A4A] leading-relaxed">{b.body}</p>
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-4xl font-bold text-[#9A7E58]">{b.stat}</span>
          <span className="text-sm text-[#6B6B6B]">{b.statLabel}</span>
        </div>
        <Link
          to={b.link}
          className="inline-flex items-center gap-1 text-sm font-medium text-[#9A7E58] hover:text-[#7D6440] transition-colors"
        >
          Learn more <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}

// ─── Demo Modal ───────────────────────────────────────────────────────────────
function DemoModal({ onClose }: { onClose: () => void }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl overflow-hidden w-full max-w-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E8DDCB]">
          <span className="font-semibold text-[#1A1A1A]">Bookd — 2-minute overview</span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-[#F5F0E8] hover:bg-[#E8DDCB] flex items-center justify-center transition-colors"
          >
            <X size={14} className="text-[#4A4A4A]" />
          </button>
        </div>
        <div className="aspect-video bg-[#1A1A1A] flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
            <Play size={28} fill="white" className="text-white ml-1" />
          </div>
          <p className="text-white/50 text-sm">Demo video coming soon</p>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Landing() {
  const [annual, setAnnual]                   = useState(false)
  const [activeTestimonial, setTestimonial]   = useState(0)
  const [demoOpen, setDemoOpen]               = useState(false)
  const featuresRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const t = setInterval(() => setTestimonial((p) => (p + 1) % testimonials.length), 5000)
    return () => clearInterval(t)
  }, [])

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const featuresReveal    = useScrollReveal<HTMLDivElement>()
  const stepsReveal       = useScrollReveal<HTMLDivElement>()
  const statsReveal       = useScrollReveal<HTMLDivElement>()
  const testimonialReveal = useScrollReveal<HTMLDivElement>()
  const pricingReveal     = useScrollReveal<HTMLDivElement>()
  const faqReveal         = useScrollReveal<HTMLDivElement>()
  const ctaReveal         = useScrollReveal<HTMLDivElement>()

  return (
    <div className="bg-[#FAF7F2] text-[#1A1A1A] font-sans overflow-x-hidden">

      {demoOpen && <DemoModal onClose={() => setDemoOpen(false)} />}

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3E3018] via-[#7D6440] to-[#E8A04C]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs sm:text-sm mb-8 backdrop-blur-sm">
            <Zap size={14} fill="currentColor" className="flex-shrink-0" />
            <span>AI-powered cold outreach for B2B agencies</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.15] mb-6">
            Close more deals.<br />
            <span className="text-[#E8C88A]">Send smarter email.</span>
          </h1>

          <p className="text-white/70 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Bookd is the all-in-one cold outreach platform for B2B agencies — AI-written sequences,
            warmed-up mailboxes, white-label client portals, and real-time analytics in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#9A7E58] hover:bg-[#7D6440] text-white font-semibold text-base transition-all hover:scale-105 shadow-lg shadow-black/20"
            >
              Start your free trial
              <ArrowRight size={16} />
            </Link>
            <button
              onClick={() => setDemoOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold text-base transition-all backdrop-blur-sm"
            >
              <Play size={16} fill="white" />
              Watch demo (2 min)
            </button>
          </div>

          <p className="mt-6 text-white/50 text-sm">
            14-day free trial · No credit card required · Cancel any time
          </p>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={scrollToFeatures}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 hover:text-white/70 transition-colors"
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown size={16} className="animate-bounce" />
        </button>
      </section>

      {/* ── Social Proof Bar ───────────────────────────────────────────────── */}
      <section className="bg-white border-y border-[#E8DDCB] py-6">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-[#9A7E58] mb-6">
            Trusted by leading B2B agencies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {['Apex Demand Gen', 'Outbound Studio', 'LeadFlow Agency', 'Pipeline Co.', 'Catalyst Growth', 'Reply Labs'].map((name) => (
              <span key={name} className="text-base font-serif font-semibold text-[#C4AE8A] tracking-tight">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" ref={featuresRef} className="py-24 px-6">
        <div
          ref={featuresReveal.ref}
          className={`max-w-7xl mx-auto transition-all duration-700 ${
            featuresReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-[#9A7E58]/10 text-[#7D6440] text-xs font-semibold tracking-wide uppercase mb-4">
              Platform Features
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-semibold text-[#1A1A1A] mb-4">
              Everything you need.<br />Nothing you don't.
            </h2>
            <p className="text-[#6B6B6B] max-w-xl mx-auto text-lg">
              Bookd replaces five separate tools with one unified workspace built for agency-scale cold outreach.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Link
                key={f.title}
                to={f.link}
                className="group bg-white rounded-2xl border border-[#E8DDCB] p-6 hover:border-[#9A7E58] hover:shadow-md transition-all"
              >
                <div className="w-11 h-11 bg-[#F5F0E8] rounded-xl flex items-center justify-center text-[#9A7E58] mb-4 group-hover:bg-[#9A7E58] group-hover:text-white transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-[#1A1A1A] mb-2">{f.title}</h3>
                <p className="text-sm text-[#6B6B6B] leading-relaxed mb-3">{f.desc}</p>
                <span className="text-xs text-[#9A7E58] font-medium flex items-center gap-1 mt-1">
                  Learn more <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-white py-24 px-6 border-y border-[#E8DDCB]">
        <div
          ref={stepsReveal.ref}
          className={`max-w-5xl mx-auto transition-all duration-700 ${
            stepsReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-[#9A7E58]/10 text-[#7D6440] text-xs font-semibold tracking-wide uppercase mb-4">
              How It Works
            </span>
            <h2 className="font-serif text-4xl font-semibold text-[#1A1A1A]">
              Up and running in minutes
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-px bg-[#E8DDCB]" />
            {steps.map((s, i) => (
              <div key={i} className="relative text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#9A7E58] text-white font-serif font-bold text-xl flex items-center justify-center mx-auto mb-5 shadow-md shadow-[#9A7E58]/30">
                  {s.number}
                </div>
                <h3 className="font-semibold text-[#1A1A1A] text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ───────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto space-y-24">
          <div className="text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-[#9A7E58]/10 text-[#7D6440] text-xs font-semibold tracking-wide uppercase mb-4">
              Why Bookd
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-semibold text-[#1A1A1A]">
              Built for results at scale
            </h2>
          </div>
          {benefits.map((b, idx) => (
            <BenefitCard key={b.badge} b={b} idx={idx} />
          ))}
        </div>
      </section>

      {/* ── Stats Banner ───────────────────────────────────────────────────── */}
      <section className="bg-[#3E3018] py-20 px-6">
        <div
          ref={statsReveal.ref}
          className={`max-w-5xl mx-auto transition-all duration-700 ${
            statsReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-semibold text-[#E8C88A]">
              The numbers speak for themselves
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-serif text-4xl sm:text-5xl font-bold text-white mb-2">{s.value}</div>
                <div className="text-sm text-[#C4AE8A]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────────── */}
      <section className="bg-[#F5F0E8] py-24 px-6">
        <div
          ref={testimonialReveal.ref}
          className={`max-w-4xl mx-auto transition-all duration-700 ${
            testimonialReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-[#9A7E58]/10 text-[#7D6440] text-xs font-semibold tracking-wide uppercase mb-4">
              Testimonials
            </span>
            <h2 className="font-serif text-4xl font-semibold text-[#1A1A1A]">
              Loved by agency operators
            </h2>
          </div>

          <div className="bg-white rounded-3xl border border-[#E8DDCB] shadow-sm p-8 sm:p-10">
            <StarRating count={testimonials[activeTestimonial].rating} />
            <blockquote className="mt-4 font-serif text-xl sm:text-2xl text-[#1A1A1A] leading-relaxed">
              "{testimonials[activeTestimonial].quote}"
            </blockquote>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#9A7E58] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {testimonials[activeTestimonial].avatar}
              </div>
              <div>
                <div className="font-semibold text-[#1A1A1A] text-sm">{testimonials[activeTestimonial].author}</div>
                <div className="text-xs text-[#6B6B6B]">{testimonials[activeTestimonial].role}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-1 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setTestimonial(i)}
                className="p-2 flex items-center justify-center"
                aria-label={`Go to testimonial ${i + 1}`}
              >
                <span className={`block h-2 rounded-full transition-all ${
                  i === activeTestimonial ? 'bg-[#9A7E58] w-5' : 'bg-[#D4C4A8] w-2'
                }`} />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6 bg-white">
        <div
          ref={pricingReveal.ref}
          className={`max-w-6xl mx-auto transition-all duration-700 ${
            pricingReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-[#9A7E58]/10 text-[#7D6440] text-xs font-semibold tracking-wide uppercase mb-4">
              Pricing
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-semibold text-[#1A1A1A] mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-[#6B6B6B] max-w-md mx-auto mb-8">
              Start for free. No hidden fees. Cancel any time.
            </p>

            <div className="inline-flex items-center gap-3 bg-[#F5F0E8] rounded-full p-1">
              <button
                onClick={() => setAnnual(false)}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                  !annual ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#6B6B6B]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                  annual ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#6B6B6B]'
                }`}
              >
                Annual
                <span className="ml-1.5 text-xs text-[#9A7E58] font-semibold">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 flex flex-col ${
                  plan.highlighted
                    ? 'bg-[#3E3018] text-white border-2 border-[#9A7E58] shadow-xl'
                    : 'bg-[#FAF7F2] border border-[#E8DDCB]'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#9A7E58] rounded-full text-white text-xs font-semibold">
                    Most Popular
                  </div>
                )}
                <div className={`text-sm font-semibold mb-1 ${plan.highlighted ? 'text-[#E8C88A]' : 'text-[#9A7E58]'}`}>
                  {plan.name}
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={`font-serif text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-[#1A1A1A]'}`}>
                    ${annual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className={`text-sm ${plan.highlighted ? 'text-white/60' : 'text-[#6B6B6B]'}`}>/mo</span>
                </div>
                {annual && (
                  <div className={`text-xs mb-3 ${plan.highlighted ? 'text-[#E8C88A]' : 'text-[#9A7E58]'}`}>
                    Billed ${(annual ? plan.annualPrice : plan.monthlyPrice) * 12}/year
                  </div>
                )}
                <p className={`text-sm mb-6 leading-relaxed ${plan.highlighted ? 'text-white/70' : 'text-[#6B6B6B]'}`}>
                  {plan.desc}
                </p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check size={15} className={`flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-[#E8C88A]' : 'text-[#9A7E58]'}`} />
                      <span className={plan.highlighted ? 'text-white/80' : 'text-[#4A4A4A]'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.cta === 'Book a call' ? '/contact' : '/signup'}
                  className={`block text-center py-3 rounded-full text-sm font-semibold transition-colors ${
                    plan.highlighted
                      ? 'bg-[#9A7E58] hover:bg-[#7D6440] text-white'
                      : 'bg-white border border-[#D4C4A8] hover:border-[#9A7E58] hover:text-[#9A7E58] text-[#1A1A1A]'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-[#6B6B6B] mt-8">
            All plans include a 14-day free trial. Need custom volume?{' '}
            <Link to="/contact" className="text-[#9A7E58] font-medium hover:underline">Talk to sales</Link>
          </p>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-6 bg-[#FAF7F2]">
        <div
          ref={faqReveal.ref}
          className={`max-w-3xl mx-auto transition-all duration-700 ${
            faqReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-[#9A7E58]/10 text-[#7D6440] text-xs font-semibold tracking-wide uppercase mb-4">
              FAQ
            </span>
            <h2 className="font-serif text-4xl font-semibold text-[#1A1A1A]">
              Frequently asked questions
            </h2>
          </div>
          <div className="bg-white rounded-2xl border border-[#E8DDCB] px-6 sm:px-8">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div
          ref={ctaReveal.ref}
          className={`max-w-3xl mx-auto text-center transition-all duration-700 ${
            ctaReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="bg-gradient-to-br from-[#3E3018] to-[#7D6440] rounded-3xl px-8 py-16 text-white">
            <h2 className="font-serif text-4xl sm:text-5xl font-bold mb-4 leading-tight">
              Ready to scale your<br />
              <span className="text-[#E8C88A]">cold outreach?</span>
            </h2>
            <p className="text-white/70 mb-8 text-lg max-w-xl mx-auto">
              Join 180+ agencies already using Bookd to send smarter, close faster, and grow without adding headcount.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#9A7E58] hover:bg-[#B49870] text-white font-semibold text-base transition-all hover:scale-105"
              >
                Start free trial <ArrowRight size={16} />
              </Link>
              <Link
                to="/contact"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold text-base transition-all"
              >
                Book a demo
              </Link>
            </div>
            <p className="mt-6 text-white/40 text-sm">14-day free trial · No credit card required</p>
          </div>
        </div>
      </section>

    </div>
  )
}
