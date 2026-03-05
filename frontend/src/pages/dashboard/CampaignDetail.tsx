import { useParams } from 'react-router-dom'
import { Megaphone } from 'lucide-react'

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Campaign #{id}</h1>

      <div className="bg-white rounded-xl border border-gray-200 flex items-center justify-center h-64 mt-6">
        <div className="text-center">
          <Megaphone size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-500">Campaign Detail — Phase 4</h2>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            Sequence editor, leads, settings, analytics, and email accounts tabs will be built in Phase 4.
          </p>
        </div>
      </div>
    </div>
  )
}
