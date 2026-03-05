import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown } from 'lucide-react'

const solutions = [
  { to: '/solutions/agencies',      label: 'For Agencies' },
  { to: '/solutions/sales-teams',   label: 'For Sales Teams' },
  { to: '/solutions/founders',      label: 'For Founders' },
  { to: '/solutions/smart-senders', label: 'Smart Senders' },
]

export default function MarketingNav() {
  const [menuOpen, setMenuOpen]             = useState(false)
  const [solutionsOpen, setSolutionsOpen]   = useState(false)
  const [mobileSolOpen, setMobileSolOpen]   = useState(false)
  const [scrolled, setScrolled]             = useState(false)
  const location = useLocation()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSolutionsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const transparent = isHome && !scrolled
  const linkCls = transparent
    ? 'text-sm font-medium text-white/80 hover:text-white transition-colors'
    : 'text-sm font-medium text-[#4A4A4A] hover:text-[#9A7E58] transition-colors'

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        !transparent
          ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-[#E8DDCB]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-[#9A7E58] rounded-lg flex items-center justify-center">
            <span className="text-white font-serif font-bold text-base leading-none">B</span>
          </div>
          <span className={`font-serif font-semibold text-xl tracking-tight ${transparent ? 'text-white' : 'text-[#1A1A1A]'}`}>
            Bookd
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {/* Solutions dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setSolutionsOpen(!solutionsOpen)}
              className={`flex items-center gap-1 ${linkCls}`}
            >
              Solutions
              <ChevronDown size={14} className={`transition-transform duration-200 ${solutionsOpen ? 'rotate-180' : ''}`} />
            </button>
            {solutionsOpen && (
              <div className="absolute top-9 left-0 bg-white rounded-xl shadow-lg border border-[#E8DDCB] py-2 px-2 w-52 z-50">
                {solutions.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setSolutionsOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-[#4A4A4A] hover:bg-[#F5F0E8] hover:text-[#9A7E58] transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/about"     className={linkCls}>About</Link>
          <Link to="/resources" className={linkCls}>Resources</Link>
          <a    href="/#pricing" className={linkCls}>Pricing</a>
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className={linkCls}>Sign in</Link>
          <Link
            to="/contact"
            className="px-4 py-2 rounded-full bg-[#9A7E58] hover:bg-[#7D6440] text-white text-sm font-semibold transition-colors"
          >
            Book a Call
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-1" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen
            ? <X   size={22} className={transparent ? 'text-white' : 'text-[#1A1A1A]'} />
            : <Menu size={22} className={transparent ? 'text-white' : 'text-[#1A1A1A]'} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[#E8DDCB] px-6 py-4 space-y-1 max-h-[85vh] overflow-y-auto">
          {/* Solutions accordion */}
          <button
            onClick={() => setMobileSolOpen(!mobileSolOpen)}
            className="w-full flex items-center justify-between py-3 text-sm font-medium text-[#4A4A4A]"
          >
            Solutions
            <ChevronDown size={14} className={`transition-transform ${mobileSolOpen ? 'rotate-180' : ''}`} />
          </button>
          {mobileSolOpen && (
            <div className="pl-4 space-y-0.5 pb-1">
              {solutions.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block py-2.5 text-sm text-[#6B6B6B] hover:text-[#9A7E58] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          <Link to="/about"     className="block py-3 text-sm font-medium text-[#4A4A4A]">About</Link>
          <Link to="/resources" className="block py-3 text-sm font-medium text-[#4A4A4A]">Resources</Link>
          <a href="/#pricing" onClick={() => setMenuOpen(false)} className="block py-3 text-sm font-medium text-[#4A4A4A]">Pricing</a>

          <div className="pt-3 border-t border-[#E8DDCB] flex flex-col gap-2">
            <Link to="/login" className="block py-3 text-sm font-medium text-[#4A4A4A]">Sign in</Link>
            <Link
              to="/contact"
              className="block text-center py-3 rounded-full bg-[#9A7E58] text-white text-sm font-semibold"
            >
              Book a Call
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
