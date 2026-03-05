import axios from 'axios'
import { env } from '../config/env'

const api = axios.create({
  baseURL: env.apiUrl,
  headers: { 'Content-Type': 'application/json' },
})

// Attach auth token from localStorage to every request
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('mock_session') || localStorage.getItem('supabase_session')
  if (stored) {
    try {
      const session = JSON.parse(stored)
      const token = session?.access_token
      if (token) config.headers.Authorization = `Bearer ${token}`
    } catch {
      // ignore malformed storage
    }
  }
  return config
})

// Global response error handling
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      localStorage.removeItem('mock_session')
      localStorage.removeItem('supabase_session')
      window.location.href = '/login'
    }

    // Let callers handle 403 and other errors themselves
    return Promise.reject(error)
  },
)

export default api
