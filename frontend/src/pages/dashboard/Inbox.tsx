import { Inbox as InboxIcon } from 'lucide-react'

export default function Inbox() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <InboxIcon size={24} className="text-gray-700" />
          <h1 className="text-2xl font-bold text-gray-900">Master Inbox</h1>
        </div>
        <p className="text-gray-500 text-sm mt-1">
          All replies from your campaigns in one place.
        </p>
      </div>

      {/* Placeholder */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <InboxIcon size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-500">Inbox — Phase 3</h2>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            The full inbox UI with conversation threads, filtering, and reply composer will be built in Phase 3.
          </p>
        </div>
      </div>
    </div>
  )
}
