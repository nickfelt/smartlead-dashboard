import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import MarketingLayout from './layouts/MarketingLayout'

// Marketing pages
import Landing from './pages/Landing'
import About from './pages/About'
import Resources from './pages/Resources'
import Contact from './pages/Contact'
import Agencies from './pages/solutions/Agencies'
import SalesTeams from './pages/solutions/SalesTeams'
import Founders from './pages/solutions/Founders'
import SmartSenders from './pages/solutions/SmartSenders'

// Auth pages (standalone — have their own layout)
import Login from './pages/Login'
import Signup from './pages/Signup'
import NotFound from './pages/NotFound'

// App pages
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

              {/* ── Marketing site (shared nav + footer) ──────────────────── */}
              <Route element={<MarketingLayout />}>
                <Route path="/"                          element={<Landing />} />
                <Route path="/about"                     element={<About />} />
                <Route path="/resources"                 element={<Resources />} />
                <Route path="/contact"                   element={<Contact />} />
                <Route path="/solutions/agencies"        element={<Agencies />} />
                <Route path="/solutions/sales-teams"     element={<SalesTeams />} />
                <Route path="/solutions/founders"        element={<Founders />} />
                <Route path="/solutions/smart-senders"   element={<SmartSenders />} />
              </Route>

              {/* ── Auth (standalone — own cream layout) ──────────────────── */}
              <Route path="/login"  element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* ── Protected client dashboard ─────────────────────────────── */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard"               element={<ErrorBoundary label="Dashboard error"><Dashboard /></ErrorBoundary>} />
                  <Route path="/dashboard/inbox"         element={<ErrorBoundary label="Inbox error"><Inbox /></ErrorBoundary>} />
                  <Route path="/dashboard/campaigns"     element={<ErrorBoundary label="Campaigns error"><Campaigns /></ErrorBoundary>} />
                  <Route path="/dashboard/campaigns/:id" element={<ErrorBoundary label="Campaign error"><CampaignDetail /></ErrorBoundary>} />
                  <Route path="/dashboard/email-accounts" element={<ErrorBoundary label="Email accounts error"><EmailAccounts /></ErrorBoundary>} />
                  <Route path="/dashboard/settings"      element={<ErrorBoundary label="Settings error"><Settings /></ErrorBoundary>} />
                </Route>
              </Route>

              {/* ── Protected admin ────────────────────────────────────────── */}
              <Route element={<ProtectedRoute requireAdmin />}>
                <Route element={<Layout />}>
                  <Route path="/admin"         element={<ErrorBoundary label="Admin error"><Admin /></ErrorBoundary>} />
                  <Route path="/admin/clients" element={<ErrorBoundary label="Clients error"><Clients /></ErrorBoundary>} />
                  <Route path="/admin/revenue" element={<ErrorBoundary label="Revenue error"><Revenue /></ErrorBoundary>} />
                  <Route path="/admin/logs"    element={<ErrorBoundary label="Logs error"><Logs /></ErrorBoundary>} />
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
