import { Megaphone, Plus } from 'lucide-react'

export default function Campaigns() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your cold email campaigns.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} />
          New Campaign
        </button>
      </div>

      {/* Placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 flex items-center justify-center h-64">
        <div className="text-center">
          <Megaphone size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-500">Campaigns — Phase 4</h2>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            Campaign list, detail, sequence editor, and AI writer will be built in Phase 4.
          </p>
        </div>
      </div>
    </div>
  )
}
