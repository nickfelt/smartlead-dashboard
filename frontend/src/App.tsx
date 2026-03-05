import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'

import Login from './pages/Login'
import Signup from './pages/Signup'
import NotFound from './pages/NotFound'
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
      <ToastProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
              {/* Public */}
              <Route path="/login"  element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/"       element={<Navigate to="/dashboard" replace />} />

              {/* Protected client */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard"                     element={<ErrorBoundary label="Dashboard error"><Dashboard /></ErrorBoundary>} />
                  <Route path="/dashboard/inbox"               element={<ErrorBoundary label="Inbox error"><Inbox /></ErrorBoundary>} />
                  <Route path="/dashboard/campaigns"           element={<ErrorBoundary label="Campaigns error"><Campaigns /></ErrorBoundary>} />
                  <Route path="/dashboard/campaigns/:id"       element={<ErrorBoundary label="Campaign error"><CampaignDetail /></ErrorBoundary>} />
                  <Route path="/dashboard/email-accounts"      element={<ErrorBoundary label="Email accounts error"><EmailAccounts /></ErrorBoundary>} />
                  <Route path="/dashboard/settings"            element={<ErrorBoundary label="Settings error"><Settings /></ErrorBoundary>} />
                </Route>
              </Route>

              {/* Protected admin */}
              <Route element={<ProtectedRoute requireAdmin />}>
                <Route element={<Layout />}>
                  <Route path="/admin"          element={<ErrorBoundary label="Admin error"><Admin /></ErrorBoundary>} />
                  <Route path="/admin/clients"  element={<ErrorBoundary label="Clients error"><Clients /></ErrorBoundary>} />
                  <Route path="/admin/revenue"  element={<ErrorBoundary label="Revenue error"><Revenue /></ErrorBoundary>} />
                  <Route path="/admin/logs"     element={<ErrorBoundary label="Logs error"><Logs /></ErrorBoundary>} />
                </Route>
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
