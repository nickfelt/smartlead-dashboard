import { Link } from 'react-router-dom'
import { Megaphone } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mb-6">
        <Megaphone size={28} className="text-brand-600" />
      </div>
      <h1 className="text-5xl font-extrabold text-gray-900 mb-2">404</h1>
      <p className="text-lg text-gray-500 mb-1">Page not found</p>
      <p className="text-sm text-gray-400 mb-8 max-w-xs">
        The page you're looking for doesn't exist or was moved.
      </p>
      <Link to="/dashboard"
        className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">
        Back to Dashboard
      </Link>
    </div>
  )
}
