import { Megaphone, Mail, Users, TrendingUp } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface StatCard {
  label: string
  value: string
  sub: string
  icon: React.ReactNode
  color: string
}

const mockStats: StatCard[] = [
  {
    label: 'Active Campaigns',
    value: '7',
    sub: '3 paused',
    icon: <Megaphone size={20} />,
    color: 'bg-blue-500',
  },
  {
    label: 'Email Accounts',
    value: '14',
    sub: '12 healthy',
    icon: <Mail size={20} />,
    color: 'bg-green-500',
  },
  {
    label: 'Total Leads',
    value: '8,420',
    sub: 'across all campaigns',
    icon: <Users size={20} />,
    color: 'bg-purple-500',
  },
  {
    label: 'Reply Rate',
    value: '4.2%',
    sub: 'last 30 days',
    icon: <TrendingUp size={20} />,
    color: 'bg-orange-500',
  },
]

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.full_name?.split(' ')[0]}
        </h1>
        <p className="text-gray-500 mt-1">Here's how your campaigns are performing.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {mockStats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <div className={`${stat.color} p-2 rounded-lg text-white`}>{stat.icon}</div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent activity placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Replies</h2>
          <div className="space-y-3">
            {['Sarah Johnson — Acme Corp', 'Mike Chen — TechStart', 'Lisa Park — Growth Co'].map((name) => (
              <div key={name} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                  <span className="text-brand-600 text-xs font-semibold">{name[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{name}</p>
                  <p className="text-xs text-gray-400">Replied 2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Top Campaigns</h2>
          <div className="space-y-3">
            {[
              { name: 'Q1 SaaS Outreach', rate: '6.1%' },
              { name: 'Agency Cold Email', rate: '4.8%' },
              { name: 'Enterprise Prospecting', rate: '3.2%' },
            ].map((c) => (
              <div key={c.name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <p className="text-sm font-medium text-gray-900">{c.name}</p>
                <span className="text-sm font-semibold text-green-600">{c.rate} reply</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
