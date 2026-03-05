import { Users } from 'lucide-react'

export default function Clients() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Clients</h1>
      <p className="text-gray-500 text-sm mb-8">All platform clients and their usage.</p>

      <div className="bg-white rounded-xl border border-gray-200 flex items-center justify-center h-64">
        <div className="text-center">
          <Users size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-500">Client Management — Phase 6</h2>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            Full client table with search, suspend/reactivate, impersonation, and tier overrides.
          </p>
        </div>
      </div>
    </div>
  )
}
