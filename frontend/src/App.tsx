import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/dashboard/Dashboard'
import Inbox from './pages/dashboard/Inbox'
import Campaigns from './pages/dashboard/Campaigns'
import CampaignDetail from './pages/dashboard/CampaignDetail'
import EmailAccounts from './pages/dashboard/EmailAccounts'
import Settings from './pages/dashboard/Settings'
import Admin from './pages/admin/Admin'
import Clients from './pages/admin/Clients'
import Revenue from './pages/admin/Revenue'
import Logs from './pages/admin/Logs'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Protected client routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/inbox" element={<Inbox />} />
              <Route path="/dashboard/campaigns" element={<Campaigns />} />
              <Route path="/dashboard/campaigns/:id" element={<CampaignDetail />} />
              <Route path="/dashboard/email-accounts" element={<EmailAccounts />} />
              <Route path="/dashboard/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Protected admin routes */}
          <Route element={<ProtectedRoute requireAdmin />}>
            <Route element={<Layout />}>
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/clients" element={<Clients />} />
              <Route path="/admin/revenue" element={<Revenue />} />
              <Route path="/admin/logs" element={<Logs />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
