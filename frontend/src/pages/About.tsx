import { Link } from 'react-router-dom'
import { ArrowRight, Heart, Zap, Eye, Repeat } from 'lucide-react'
import { useScrollReveal } from '../hooks/useScrollReveal'

const team = [
  {
    name: 'Nick Felt',
    role: 'Founder & CEO',
    avatar: 'NF',
    bio: 'Previously led growth at three B2B SaaS companies. Built Bookd after spending years managing cold email campaigns across dozens of tools.',
  },
  {
    name: 'Sarah Kim',
    role: 'Head of Engineering',
    avatar: 'SK',
    bio: 'Former senior engineer at Stripe and Segment. Obsessed with building infrastructure that scales without the ops headaches.',
  },
  {
    name: 'Marcus Rivera',
    role: 'Head of Growth',
    avatar: 'MR',
    bio: 'Ran outbound at two Series A companies. Booked 1,000+ meetings via cold email before joining Bookd to help others do the same.',
  },
  {
    name: 'Priya Nair',
    role: 'Head of Customer Success',
    avatar: 'PN',
    bio: 'Agency background — ran outreach for 20+ B2B clients simultaneously. Knows exactly what agency operators need to succeed.',
  },
]

const values = [
  {
    icon: <Heart size={22} />,
    title: 'Customer first',
    desc: 'Every product decision starts with one question: does this make our customers more successful? If the answer is no, we don\'t build it.',
  },
  {
    icon: <Zap size={22} />,
    title: 'Speed without compromise',
    desc: 'We ship fast, but never at the cost of reliability. Our customers trust us with their pipeline — we take that seriously.',
  },
  {
    icon: <Eye size={22} />,
    title: 'Radical transparency',
    desc: 'No hidden fees, no surprise rate limits, no burying the bad news in the changelog. We say what we mean and mean what we say.',
  },
  {
    icon: <Repeat size={22} />,
    title: 'Compound curiosity',
    desc: "Cold email evolves fast. We stay obsessed with what's working now, not what worked two years ago — and we share that knowledge openly.",
  },
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

export default function About() {
  return (
    <div className="bg-[#FAF7F2]">

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6 bg-gradient-to-br from-[#3E3018] via-[#7D6440] to-[#C47A2A] overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')]" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-semibold tracking-wide uppercase mb-5">
            Our Story
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.1] mb-5">
            We built the tool<br />
            <span className="text-[#E8C88A]">we wished existed</span>
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Bookd was born from years of managing B2B cold outreach campaigns across a patchwork of disconnected tools. We knew there had to be a better way.
          </p>
        </div>
      </section>

      {/* ── Mission ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white border-b border-[#E8DDCB]">
        <RevealSection>
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-[#9A7E58]/10 text-[#7D6440] text-xs font-semibold tracking-wide uppercase mb-6">
              Our Mission
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1A1A1A] mb-6 leading-tight">
              Make AI-powered outreach accessible, effective, and scalable for every B2B team
            </h2>
            <p className="text-[#4A4A4A] leading-relaxed text-lg">
              The best sales conversations start with the right email at the right time. We believe every company — from solo founders to 500-person agencies — deserves access to the tools and infrastructure to make that happen. That's what Bookd is built to deliver.
            </p>
          </div>
        </RevealSection>
      </section>

      {/* ── Team ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#F5F0E8]">
        <RevealSection>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <span className="inline-block px-3 py-1 rounded-full bg-[#9A7E58]/10 text-[#7D6440] text-xs font-semibold tracking-wide uppercase mb-4">
                The Team
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1A1A1A]">
                Built by operators, for operators
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member) => (
                <div key={member.name} className="bg-white rounded-2xl border border-[#E8DDCB] p-6 text-center hover:border-[#9A7E58] transition-colors">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#9A7E58] to-[#C47A2A] flex items-center justify-center text-white text-xl font-semibold mx-auto mb-4">
                    {member.avatar}
                  </div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-0.5">{member.name}</h3>
                  <p className="text-xs text-[#9A7E58] font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-[#6B6B6B] leading-relaxed">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ── Values ─────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <RevealSection>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-block px-3 py-1 rounded-full bg-[#9A7E58]/10 text-[#7D6440] text-xs font-semibold tracking-wide uppercase mb-4">
                Our Values
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1A1A1A]">
                What we believe
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {values.map((v) => (
                <div key={v.title} className="flex gap-4 p-6 rounded-2xl border border-[#E8DDCB] bg-[#FAF7F2]">
                  <div className="w-11 h-11 bg-[#9A7E58]/10 rounded-xl flex items-center justify-center text-[#9A7E58] flex-shrink-0">
                    {v.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1A1A1A] mb-2">{v.title}</h3>
                    <p className="text-sm text-[#6B6B6B] leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#F5F0E8]">
        <RevealSection>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-3xl font-semibold text-[#1A1A1A] mb-4">
              Come build with us
            </h2>
            <p className="text-[#4A4A4A] mb-8">
              We're a small team with big ambitions. If you're obsessed with cold email, sales infrastructure, or AI — we'd love to talk.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#9A7E58] hover:bg-[#7D6440] text-white font-semibold transition-colors"
              >
                Book a Call <ArrowRight size={16} />
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-[#D4C4A8] hover:border-[#9A7E58] text-[#4A4A4A] hover:text-[#9A7E58] font-semibold transition-colors"
              >
                Start free trial
              </Link>
            </div>
          </div>
        </RevealSection>
      </section>

    </div>
  )
}
