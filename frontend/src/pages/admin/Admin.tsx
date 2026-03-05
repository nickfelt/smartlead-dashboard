import { Users, DollarSign, Megaphone, Mail } from 'lucide-react'

const mockMetrics = [
  { label: 'Active Clients', value: '23', sub: '+3 this month', icon: <Users size={20} />, color: 'bg-blue-500' },
  { label: 'MRR', value: '$4,511', sub: '+$394 MoM', icon: <DollarSign size={20} />, color: 'bg-green-500' },
  { label: 'Active Campaigns', value: '67', sub: 'across all clients', icon: <Megaphone size={20} />, color: 'bg-purple-500' },
  { label: 'Emails Today', value: '14,280', sub: '580 replies received', icon: <Mail size={20} />, color: 'bg-orange-500' },
]

export default function Admin() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Platform health and revenue at a glance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {mockMetrics.map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">{m.label}</p>
              <div className={`${m.color} p-2 rounded-lg text-white`}>{m.icon}</div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{m.value}</p>
            <p className="text-xs text-gray-400 mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Admin Dashboard — Phase 6</h2>
        <p className="text-sm text-gray-500">
          Full admin features including client management, revenue analytics, audit log viewer, impersonation, and pending Smart Sender approvals will be built in Phase 6.
        </p>
      </div>
    </div>
  )
}
