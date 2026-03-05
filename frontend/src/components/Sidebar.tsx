import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Inbox,
  Megaphone,
  Mail,
  Settings,
  Users,
  DollarSign,
  ScrollText,
  ChevronDown,
  LogOut,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
}

const clientNav: NavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { to: '/dashboard/inbox', label: 'Inbox', icon: <Inbox size={18} /> },
  { to: '/dashboard/campaigns', label: 'Campaigns', icon: <Megaphone size={18} /> },
  { to: '/dashboard/email-accounts', label: 'Email Accounts', icon: <Mail size={18} /> },
  { to: '/dashboard/settings', label: 'Settings', icon: <Settings size={18} /> },
]

const adminNav: NavItem[] = [
  { to: '/admin', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { to: '/admin/clients', label: 'Clients', icon: <Users size={18} /> },
  { to: '/admin/revenue', label: 'Revenue', icon: <DollarSign size={18} /> },
  { to: '/admin/logs', label: 'Audit Logs', icon: <ScrollText size={18} /> },
]

function NavSection({ items, label }: { items: NavItem[]; label?: string }) {
  return (
    <div className="space-y-1">
      {label && (
        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          {label}
        </p>
      )}
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/dashboard' || item.to === '/admin'}
          className={({ isActive }) =>
            [
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-brand-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white',
            ].join(' ')
          }
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </div>
  )
}

export default function Sidebar() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 bg-gray-900 flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <Megaphone size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg">Felt Marketing</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
        <NavSection items={clientNav} label="Dashboard" />

        {isAdmin && (
          <NavSection items={adminNav} label="Admin" />
        )}
      </nav>

      {/* User profile */}
      <div className="px-3 py-4 border-t border-gray-700">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 cursor-pointer group">
          <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-semibold">
              {user?.full_name?.[0]?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
            <div className="flex items-center gap-1">
              <p className="text-xs text-gray-400 truncate capitalize">{user?.subscription_tier} plan</p>
              {isAdmin && <ShieldCheck size={12} className="text-brand-400 flex-shrink-0" />}
            </div>
          </div>
          <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
