import { Mail, Plus } from 'lucide-react'

export default function EmailAccounts() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Accounts</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your sender accounts and warmup.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} />
          Add Account
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 flex items-center justify-center h-64">
        <div className="text-center">
          <Mail size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-500">Email Accounts — Phase 5</h2>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            Account management, warmup stats, and Smart Senders mailbox purchasing will be built in Phase 5.
          </p>
        </div>
      </div>
    </div>
  )
}
