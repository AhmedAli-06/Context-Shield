import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import AssetsPage from './pages/AssetsPage'
import AlertsPage from './pages/AlertsPage'
import EventsPage from './pages/EventsPage'
import SessionsPage from './pages/SessionsPage'
import ApiKeysPage from './pages/ApiKeysPage'
import ReportsPage from './pages/ReportsPage'
import AuditLogPage from './pages/AuditLogPage'
import LiveFeedPage from './pages/LiveFeedPage'
import SettingsPage from './pages/SettingsPage'
import SimulatorPage from './pages/SimulatorPage'
import {
  LayoutDashboard, Shield, AlertTriangle, Activity, Settings, LogOut, Key, FileText, Radio, Fingerprint, Monitor, Menu, X, Gauge,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from 'react-error-boundary'
import { useState, lazy, Suspense } from 'react'
import { WebSocketProvider, useWebSocket } from './context/WebSocketContext'
import './index.css'

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="loading-screen" style={{ flexDirection: 'column', gap: 16 }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <h3 style={{ color: 'var(--ink)', fontWeight: 500, fontSize: 16 }}>Something went wrong</h3>
      <p style={{ color: 'var(--ash)', fontSize: 13 }}>{error.message || 'An unexpected error occurred.'}</p>
      <button className="btn btn-primary" onClick={resetErrorBoundary} style={{ marginTop: 8 }}>Try again</button>
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="spinner" />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function NavItem({ to, icon: Icon, label, badge }: { to: string; icon: any; label: string; badge?: string }) {
  const location = useLocation()
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
  return (
    <NavLink to={to} end={to === '/'} className={isActive ? 'nav-item-active' : ''}>
      <Icon size={16} />
      <span>{label}</span>
      {badge && <span className="nav-badge">{badge}</span>}
    </NavLink>
  )
}

function ConnectionStatus() {
  const { status } = useWebSocket()
  const config = { connected: { color: '#2ecc8a', label: 'Live' }, connecting: { color: '#ffc53d', label: 'Connecting...' }, disconnected: { color: '#ff4757', label: 'Offline' } }
  const c = config[status]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 4, background: 'var(--surface-deep)', border: '1px solid var(--hairline)', fontSize: 11, cursor: 'default' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, boxShadow: `0 0 6px ${c.color}40` }} />
      <span style={{ color: 'var(--ash)' }}>{c.label}</span>
    </div>
  )
}

function AppShell() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  if (location.pathname === '/login' || location.pathname === '/register') return null

  return (
    <div className="app-layout">
      <button className="mobile-menu-btn" onClick={() => setMobileOpen(v => !v)} aria-label="Toggle menu">
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="logo-mark">CS</div>
          <span className="brand-text">ContextShield</span>
          <span className="brand-version">v0.2</span>
        </div>
        <nav className="sidebar-nav" onClick={() => setMobileOpen(false)}>
          <div className="nav-section-label">Overview</div>
          <NavItem to="/" icon={Gauge} label="Dashboard" />
          <NavItem to="/assets" icon={Shield} label="Assets" />
          <NavItem to="/events" icon={Activity} label="Events" />
          <NavItem to="/alerts" icon={AlertTriangle} label="Alerts" />
          <div className="nav-section-label">Monitoring</div>
          <NavItem to="/live-feed" icon={Radio} label="Live Feed" />
          <NavItem to="/simulator" icon={Radio} label="Simulator" />
          <NavItem to="/sessions" icon={Monitor} label="Sessions" />
          <NavItem to="/audit-log" icon={Fingerprint} label="Audit Log" />
          <div className="nav-section-label">Management</div>
          <NavItem to="/api-keys" icon={Key} label="API Keys" />
          <NavItem to="/reports" icon={FileText} label="Reports" />
          <NavItem to="/settings" icon={Settings} label="Settings" />
        </nav>
        <div className="sidebar-footer">
          <div className="avatar">{user?.full_name?.charAt(0) || 'U'}</div>
          <div className="user-info">
            <p>{user?.full_name}</p>
            <span>{user?.email}</span>
          </div>
          <button className="logout-btn" onClick={logout} title="Sign out"><LogOut size={13} /></button>
        </div>
      </aside>

      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <Routes location={location}>
              <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/assets" element={<ProtectedRoute><AssetsPage /></ProtectedRoute>} />
              <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
              <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
              <Route path="/sessions" element={<ProtectedRoute><SessionsPage /></ProtectedRoute>} />
              <Route path="/api-keys" element={<ProtectedRoute><ApiKeysPage /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
              <Route path="/audit-log" element={<ProtectedRoute><AuditLogPage /></ProtectedRoute>} />
              <Route path="/live-feed" element={<ProtectedRoute><LiveFeedPage /></ProtectedRoute>} />
              <Route path="/simulator" element={<ProtectedRoute><SimulatorPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={(e, i) => console.error('Global error:', e, i)}>
      <BrowserRouter>
        <AuthProvider>
          <WebSocketProvider>
            <Toaster position="top-center" toastOptions={{
              style: { background: 'var(--surface-elevated)', color: 'var(--ink)', border: '1px solid var(--hairline-strong)', borderRadius: '10px', fontSize: '13px' },
              success: { iconTheme: { primary: 'var(--accent-green)', secondary: 'var(--canvas)' } },
              error: { iconTheme: { primary: 'var(--accent-red)', secondary: 'var(--canvas)' } },
            }} />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/*" element={<AppShell />} />
            </Routes>
          </WebSocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
