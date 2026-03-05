import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props { children: ReactNode; label?: string }
interface State { hasError: boolean; message: string }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }

  reset = () => this.setState({ hasError: false, message: '' })

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-xl border border-red-200 p-8 text-center shadow-sm">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={22} className="text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            {this.props.label ?? 'Something went wrong'}
          </h2>
          <p className="text-sm text-gray-500 mb-1">
            An unexpected error occurred. Try refreshing the page.
          </p>
          {this.state.message && (
            <p className="text-xs font-mono text-red-400 bg-red-50 rounded px-3 py-2 mt-3 text-left break-all">
              {this.state.message}
            </p>
          )}
          <button
            onClick={this.reset}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      </div>
    )
  }
}
