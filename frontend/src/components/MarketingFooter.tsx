import { Link } from 'react-router-dom'
import { Twitter, Linkedin, Instagram } from 'lucide-react'

const footerCols = [
  {
    heading: 'Product',
    links: [
      { label: 'Features',   to: '/#features' },
      { label: 'Pricing',    to: '/#pricing' },
      { label: 'Changelog',  to: '/resources' },
      { label: 'Roadmap',    to: '/resources' },
    ],
  },
  {
    heading: 'Solutions',
    links: [
      { label: 'For Agencies',    to: '/solutions/agencies' },
      { label: 'For Sales Teams', to: '/solutions/sales-teams' },
      { label: 'For Founders',    to: '/solutions/founders' },
      { label: 'Smart Senders',   to: '/solutions/smart-senders' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About',     to: '/about' },
      { label: 'Resources', to: '/resources' },
      { label: 'Contact',   to: '/contact' },
      { label: 'Careers',   to: '/about' },
    ],
  },
]

export default function MarketingFooter() {
  return (
    <footer className="bg-[#1A1A1A] text-white py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#9A7E58] rounded-lg flex items-center justify-center">
                <span className="text-white font-serif font-bold text-base leading-none">B</span>
              </div>
              <span className="font-serif font-semibold text-xl tracking-tight">Bookd</span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              The all-in-one cold outreach platform for B2B agencies — AI-written sequences,
              warmed-up mailboxes, and white-label client portals.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-11 h-11 rounded-lg bg-white/10 hover:bg-[#9A7E58] flex items-center justify-center transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerCols.map((col) => (
            <div key={col.heading}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">
                {col.heading}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Bookd Inc. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((label) => (
              <a key={label} href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors py-1">
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
