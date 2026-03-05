import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, FileText, Lightbulb, HelpCircle, Calendar } from 'lucide-react'
import { useScrollReveal } from '../hooks/useScrollReveal'

const blogPosts = [
  {
    title: 'Cold Email Deliverability: The Complete 2026 Guide',
    date: 'March 1, 2026',
    category: 'Deliverability',
    summary: 'Everything you need to know about SPF, DKIM, DMARC, warmup protocols, and staying out of spam in 2026.',
    readTime: '12 min read',
    color: 'from-[#3E3018] to-[#7D6440]',
  },
  {
    title: 'How to Write AI First Lines That Actually Convert',
    date: 'Feb 20, 2026',
    category: 'Copywriting',
    summary: 'The anatomy of a first line that makes a prospect stop scrolling. Includes 15 templates you can steal today.',
    readTime: '8 min read',
    color: 'from-[#1A2A3A] to-[#2A5A8A]',
  },
  {
    title: 'Agency Outreach: Managing 20+ Clients at Scale',
    date: 'Feb 10, 2026',
    category: 'Agency',
    summary: 'How top cold email agencies structure their operations, manage client reporting, and avoid burnout at scale.',
    readTime: '10 min read',
    color: 'from-[#1A2A1A] to-[#3A6A40]',
  },
  {
    title: 'The Anatomy of a Perfect Cold Email Sequence',
    date: 'Jan 28, 2026',
    category: 'Strategy',
    summary: 'Step 1 through step 6: what to say, when to say it, and why most sequences fail after the second touchpoint.',
    readTime: '9 min read',
    color: 'from-[#2A1A3A] to-[#5A3A8A]',
  },
]

const caseStudies = [
  {
    company: 'Apex Demand Gen',
    metric: '3× reply rate in 60 days',
    summary: 'How a 4-person agency tripled their average reply rate across all client campaigns by switching to Bookd\'s AI copy engine and Smart Senders infrastructure.',
    logo: 'AD',
    color: '#9A7E58',
  },
  {
    company: 'Outbound Studio',
    metric: '22 clients, 0 new hires',
    summary: 'Outbound Studio scaled from 3 to 22 clients in four months without adding a single headcount, using Bookd\'s white-label portals and centralized admin dashboard.',
    logo: 'OS',
    color: '#4A7A40',
  },
  {
    company: 'Pipeline Co.',
    metric: '1,200 meetings booked in Q1',
    summary: 'An in-house SDR team of 6 booked 1,200 qualified meetings in a single quarter by pairing Bookd\'s automated warmup with AI-personalized outreach at scale.',
    logo: 'PC',
    color: '#2A5A8A',
  },
]

const guides = [
  {
    title: 'Cold Email Deliverability 101',
    desc: 'The beginner\'s guide to domain reputation, warmup protocols, and staying out of spam folders.',
    icon: <BookOpen size={20} />,
  },
  {
    title: 'Writing First Lines That Convert',
    desc: 'A practical framework for writing personalized opening lines that make prospects stop and read.',
    icon: <FileText size={20} />,
  },
  {
    title: 'The 5-Step Agency Onboarding Checklist',
    desc: 'How to onboard a new client in under 48 hours — including mailbox setup, sequence build, and reporting.',
    icon: <Lightbulb size={20} />,
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

export default function Resources() {
  return (
    <div className="bg-[#FAF7F2]">

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-16 px-6 bg-white border-b border-[#E8DDCB]">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-[#9A7E58]/10 text-[#7D6440] text-xs font-semibold tracking-wide uppercase mb-5">
            Resources
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1A1A1A] leading-tight mb-4">
            Learn cold email.<br />Level up your pipeline.
          </h1>
          <p className="text-[#6B6B6B] text-lg leading-relaxed">
            Guides, case studies, and playbooks from the Bookd team — everything you need to run better outreach campaigns.
          </p>
        </div>
      </section>

      {/* ── Blog ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <RevealSection>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <h2 className="font-serif text-2xl font-semibold text-[#1A1A1A]">Latest from the blog</h2>
              <button className="text-sm text-[#9A7E58] font-medium hover:text-[#7D6440] flex items-center gap-1 transition-colors">
                View all <ArrowRight size={14} />
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {blogPosts.map((post) => (
                <div
                  key={post.title}
                  className="bg-white rounded-2xl border border-[#E8DDCB] overflow-hidden hover:border-[#9A7E58] hover:shadow-md transition-all cursor-pointer group"
                >
                  {/* Color strip */}
                  <div className={`h-32 bg-gradient-to-br ${post.color} flex items-center px-6`}>
                    <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">{post.category}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-[#1A1A1A] mb-2 group-hover:text-[#9A7E58] transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-sm text-[#6B6B6B] mb-4 leading-relaxed">{post.summary}</p>
                    <div className="flex items-center gap-3 text-xs text-[#9A9A9A]">
                      <Calendar size={12} />
                      <span>{post.date}</span>
                      <span>·</span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ── Case Studies ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white border-y border-[#E8DDCB]">
        <RevealSection>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#1A1A1A]">Case studies</h2>
                <p className="text-sm text-[#6B6B6B] mt-1">Real results from real Bookd customers</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {caseStudies.map((cs) => (
                <div
                  key={cs.company}
                  className="bg-[#FAF7F2] rounded-2xl border border-[#E8DDCB] p-6 hover:border-[#9A7E58] hover:shadow-md transition-all cursor-pointer group"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-base font-bold mb-4"
                    style={{ backgroundColor: cs.color }}
                  >
                    {cs.logo}
                  </div>
                  <p className="text-xs font-semibold text-[#9A7E58] uppercase tracking-wide mb-1">{cs.company}</p>
                  <h3 className="font-serif text-xl font-semibold text-[#1A1A1A] mb-3">{cs.metric}</h3>
                  <p className="text-sm text-[#6B6B6B] leading-relaxed mb-4">{cs.summary}</p>
                  <span className="text-xs text-[#9A7E58] font-medium group-hover:underline">
                    Read case study →
                  </span>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ── Guides ─────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <RevealSection>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <h2 className="font-serif text-2xl font-semibold text-[#1A1A1A]">Free guides</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {guides.map((g) => (
                <div
                  key={g.title}
                  className="bg-white rounded-2xl border border-[#E8DDCB] p-6 hover:border-[#9A7E58] hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 bg-[#9A7E58]/10 rounded-xl flex items-center justify-center text-[#9A7E58] mb-4 group-hover:bg-[#9A7E58] group-hover:text-white transition-colors">
                    {g.icon}
                  </div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-2 group-hover:text-[#9A7E58] transition-colors">
                    {g.title}
                  </h3>
                  <p className="text-sm text-[#6B6B6B] leading-relaxed mb-4">{g.desc}</p>
                  <span className="text-xs text-[#9A7E58] font-medium group-hover:underline">
                    Download free →
                  </span>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ── Help Center ────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-[#F5F0E8] border-t border-[#E8DDCB]">
        <RevealSection>
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-[#E8DDCB] p-8 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-14 h-14 bg-[#9A7E58]/10 rounded-2xl flex items-center justify-center text-[#9A7E58] flex-shrink-0">
                <HelpCircle size={28} />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                  <h3 className="font-semibold text-[#1A1A1A]">Help Center & Docs</h3>
                  <span className="px-2 py-0.5 rounded-full bg-[#9A7E58]/10 text-[#9A7E58] text-xs font-semibold">Coming Soon</span>
                </div>
                <p className="text-sm text-[#6B6B6B]">
                  Full documentation, API reference, and step-by-step setup guides are on the way.
                </p>
              </div>
              <Link
                to="/contact"
                className="flex-shrink-0 px-5 py-2.5 rounded-full border border-[#D4C4A8] hover:border-[#9A7E58] text-[#4A4A4A] hover:text-[#9A7E58] text-sm font-semibold transition-colors"
              >
                Contact support
              </Link>
            </div>
          </div>
        </RevealSection>
      </section>

    </div>
  )
}
