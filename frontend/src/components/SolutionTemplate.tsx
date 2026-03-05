import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Check, ArrowRight, Star } from 'lucide-react'
import { useScrollReveal } from '../hooks/useScrollReveal'

interface PainPoint {
  icon: ReactNode
  title: string
  desc: string
}

interface Feature {
  icon: ReactNode
  title: string
  desc: string
}

interface Testimonial {
  quote: string
  author: string
  role: string
  avatar: string
}

interface SolutionTemplateProps {
  badge: string
  headline: string
  subheadline: string
  heroBg?: string
  painHeadline: string
  painPoints: PainPoint[]
  solutionBadge: string
  solutionHeadline: string
  solutionBody: string
  solutionStats: Array<{ value: string; label: string }>
  features: Feature[]
  testimonial: Testimonial
  ctaHeadline: string
  ctaBody: string
  ctaLink?: string
  ctaLabel?: string
}

function RevealSection({ children, className = '' }: { children: ReactNode; className?: string }) {
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

export default function SolutionTemplate({
  badge,
  headline,
  subheadline,
  heroBg = 'from-[#3E3018] via-[#7D6440] to-[#C47A2A]',
  painHeadline,
  painPoints,
  solutionBadge,
  solutionHeadline,
  solutionBody,
  solutionStats,
  features,
  testimonial,
  ctaHeadline,
  ctaBody,
  ctaLink = '/signup',
  ctaLabel = 'Start your free trial',
}: SolutionTemplateProps) {
  return (
    <div className="bg-[#FAF7F2]">

      {/* ── Mini hero ──────────────────────────────────────────────────────── */}
      <section className={`relative pt-32 pb-20 px-6 bg-gradient-to-br ${heroBg} overflow-hidden`}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-semibold tracking-wide uppercase mb-5">
            {badge}
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.1] mb-5">
            {headline}
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            {subheadline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#9A7E58] hover:bg-[#7D6440] text-white font-semibold transition-all hover:scale-105"
            >
              Start your free trial <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold transition-all"
            >
              Book a demo
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pain points ────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white border-b border-[#E8DDCB]">
        <RevealSection>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1A1A1A]">
                {painHeadline}
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {painPoints.map((p) => (
                <div key={p.title} className="bg-[#FAF7F2] rounded-2xl border border-[#E8DDCB] p-6">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-400 mb-4">
                    {p.icon}
                  </div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2">{p.title}</h3>
                  <p className="text-sm text-[#6B6B6B] leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ── Solution ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#F5F0E8]">
        <RevealSection>
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-[#9A7E58]/10 text-[#7D6440] text-xs font-semibold tracking-wide uppercase">
                {solutionBadge}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1A1A1A] leading-tight">
                {solutionHeadline}
              </h2>
              <p className="text-[#4A4A4A] leading-relaxed">{solutionBody}</p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              {solutionStats.map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-[#E8DDCB] p-5 text-center">
                  <div className="font-serif text-3xl font-bold text-[#9A7E58] mb-1">{s.value}</div>
                  <div className="text-xs text-[#6B6B6B]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <RevealSection>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-block px-3 py-1 rounded-full bg-[#9A7E58]/10 text-[#7D6440] text-xs font-semibold tracking-wide uppercase mb-4">
                Platform Features
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1A1A1A]">
                Everything you need, built in
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="flex gap-4 p-5 rounded-2xl border border-[#E8DDCB] bg-[#FAF7F2] hover:border-[#9A7E58] transition-colors group"
                >
                  <div className="w-10 h-10 bg-[#9A7E58]/10 rounded-xl flex items-center justify-center text-[#9A7E58] flex-shrink-0 group-hover:bg-[#9A7E58] group-hover:text-white transition-colors">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1A1A1A] mb-1">{f.title}</h3>
                    <p className="text-sm text-[#6B6B6B] leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ── Testimonial ────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-[#F5F0E8] border-y border-[#E8DDCB]">
        <RevealSection>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl border border-[#E8DDCB] shadow-sm p-8">
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#E8A04C" stroke="none" />)}
              </div>
              <blockquote className="font-serif text-xl text-[#1A1A1A] leading-relaxed mb-6">
                "{testimonial.quote}"
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#9A7E58] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-[#1A1A1A] text-sm">{testimonial.author}</div>
                  <div className="text-xs text-[#6B6B6B]">{testimonial.role}</div>
                </div>
              </div>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <RevealSection>
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-gradient-to-br from-[#3E3018] to-[#7D6440] rounded-3xl px-8 py-14 text-white">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-3 leading-tight">{ctaHeadline}</h2>
              <p className="text-white/70 mb-8 max-w-xl mx-auto">{ctaBody}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to={ctaLink}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#9A7E58] hover:bg-[#B49870] text-white font-semibold transition-all hover:scale-105"
                >
                  {ctaLabel} <ArrowRight size={16} />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold transition-all"
                >
                  Book a demo
                </Link>
              </div>
              <p className="mt-5 text-white/40 text-sm">14-day free trial · No credit card required</p>
            </div>
          </div>
        </RevealSection>
      </section>

    </div>
  )
}

// Re-export Check for use in plan pages
export { Check }
