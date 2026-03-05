import { Settings as SettingsIcon, CreditCard, Key } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function Settings() {
  const { user } = useAuth()

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account and subscription.</p>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard size={20} className="text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900">Subscription</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Current plan</p>
            <p className="text-lg font-bold text-gray-900 capitalize mt-0.5">
              {user?.subscription_tier} — <span className="text-brand-600">Active</span>
            </p>
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Manage Billing
          </button>
        </div>
      </div>

      {/* AI API Keys (Phase 2 placeholder) */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Key size={20} className="text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900">AI API Keys</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Add your own API keys to use the AI email writer. Your keys are encrypted and never shared.
        </p>

        <div className="space-y-4">
          {/* Anthropic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anthropic (Claude) API Key
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                disabled
                placeholder={user?.has_anthropic_key ? 'sk-ant-...•••• (configured)' : 'sk-ant-...'}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-500 bg-gray-50"
              />
              <button
                disabled
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-500"
              >
                Save
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Get your key at console.anthropic.com
            </p>
          </div>

          {/* OpenAI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OpenAI API Key
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                disabled
                placeholder={user?.has_openai_key ? 'sk-...•••• (configured)' : 'sk-...'}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-500 bg-gray-50"
              />
              <button
                disabled
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-500"
              >
                Save
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Get your key at platform.openai.com
            </p>
          </div>
        </div>

        <div className="mt-4 bg-blue-50 rounded-md p-3 text-xs text-blue-700">
          AI key management will be fully functional in Phase 2.
        </div>
      </div>

      {/* Account Info placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <SettingsIcon size={20} className="text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900">Account</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Name</p>
            <p className="font-medium text-gray-900 mt-0.5">{user?.full_name}</p>
          </div>
          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-medium text-gray-900 mt-0.5">{user?.email}</p>
          </div>
          <div>
            <p className="text-gray-500">Company</p>
            <p className="font-medium text-gray-900 mt-0.5">{user?.company_name}</p>
          </div>
          <div>
            <p className="text-gray-500">Member since</p>
            <p className="font-medium text-gray-900 mt-0.5">
              {new Date(user?.created_at ?? '').toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
