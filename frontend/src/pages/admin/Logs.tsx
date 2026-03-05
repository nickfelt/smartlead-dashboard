import { ScrollText } from 'lucide-react'

export default function Logs() {
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Audit Logs</h1>
      <p className="text-gray-500 text-sm mb-8">Every action taken across the platform.</p>

      <div className="bg-white rounded-xl border border-gray-200 flex items-center justify-center h-64">
        <div className="text-center">
          <ScrollText size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-500">Audit Logs — Phase 6</h2>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            Searchable, filterable audit log with real-time updates and CSV export.
          </p>
        </div>
      </div>
    </div>
  )
}
