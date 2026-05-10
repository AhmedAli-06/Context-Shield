import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  Copy,
  Check,
  RefreshCw,
  Bell,
  User,
  Key,
  Database,
  Globe,
  Server,
  Save,
} from 'lucide-react'
import { updateSettings } from '../api'
import toast from 'react-hot-toast'

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
}

function Toggle({ active, onChange }: { active: boolean; onChange: () => void }) {
  return (
    <div className={`toggle ${active ? 'active' : ''}`} onClick={onChange}>
      <div className="toggle-knob" />
    </div>
  )
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState(true)
  const [anomalyAlerts, setAnomalyAlerts] = useState(true)
  const [autoRevoke, setAutoRevoke] = useState(false)
  const [weeklyDigest, setWeeklyDigest] = useState(false)
  const [slackAlerts, setSlackAlerts] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [systemStatus, setSystemStatus] = useState<any>({
    api: 'checking',
    database: 'checking',
    redis: 'checking',
  })

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    setSystemStatus({ api: 'checking', database: 'checking', redis: 'checking' })
    try {
      const res = await fetch('http://localhost:8000/health')
      const data = await res.json()
      setSystemStatus({
        api: data.status === 'ok' ? 'operational' : 'degraded',
        database: data.database === 'connected' ? 'operational' : 'degraded',
        redis: data.cache === 'connected' ? 'operational' : 'degraded',
      })
    } catch {
      setSystemStatus({ api: 'down', database: 'unknown', redis: 'unknown' })
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      await updateSettings({
        notifications_enabled: notifications,
        anomaly_alerts: anomalyAlerts,
        auto_revoke: autoRevoke,
        weekly_digest: weeklyDigest,
        slack_alerts: slackAlerts,
      })
      toast.success('Settings saved successfully')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const sampleCode = `import { ContextShield } from "@contextshield/sdk";

const cs = new ContextShield({
  apiKey: process.env.CS_API_KEY,
});

const decision = await cs.evaluate({
  userId: "usr_abc123",
  assetId: "ast_xyz789",
  timestamp: new Date(),
});

console.log(decision.trustScore);
// → 0.87`

  const copyCode = () => {
    navigator.clipboard.writeText(sampleCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return { label: 'Connected', cls: 'allow', dot: 'var(--accent-green)' }
      case 'degraded':
        return { label: 'Degraded', cls: 'warning', dot: 'var(--accent-yellow)' }
      case 'down':
        return { label: 'Down', cls: 'denied', dot: 'var(--accent-red)' }
      case 'checking':
        return { label: 'Checking...', cls: 'low', dot: 'var(--stone)' }
      default:
        return { label: 'Unknown', cls: 'low', dot: 'var(--stone)' }
    }
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      <motion.div className="page-header" variants={item}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2>Settings</h2>
            <p>Manage your account, system preferences, and integrations</p>
          </div>
          <button className="btn btn-primary" onClick={saveSettings} disabled={saving}>
            <Save size={13} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </motion.div>

      <div className="grid-2">
        <div>
          <motion.div variants={item} style={{ marginBottom: 'var(--space-xxl)' }}>
            <div className="settings-section">
              <h3>
                <User size={14} style={{ marginRight: 8 }} /> Profile
              </h3>
              <p>Your account information</p>
            </div>
            <div className="card">
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--surface-elevated)',
                      border: '1px solid var(--hairline-strong)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: 500,
                      color: 'var(--charcoal)',
                    }}
                  >
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--charcoal)' }}>
                      {user?.full_name || 'User'}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--stone)' }}>{user?.email || '—'}</p>
                    <p
                      style={{
                        fontSize: '11px',
                        color: 'var(--ash)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      ID: {user?.id || '—'} · Tenant: {user?.tenant_id || '—'}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: 'var(--space-lg)' }}>
                  {user?.roles?.map(role => (
                    <span key={role} className="badge">
                      <span className="badge-dot" style={{ background: 'var(--accent-blue)' }} />
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} style={{ marginBottom: 'var(--space-xxl)' }}>
            <div className="settings-section">
              <h3>
                <Bell size={14} style={{ marginRight: 8 }} /> Notifications
              </h3>
              <p>Control how you receive alerts</p>
            </div>
            <div className="card">
              <div className="card-body" style={{ padding: 'var(--space-lg) var(--space-xl)' }}>
                <div className="settings-row">
                  <div className="settings-row-info">
                    <h4>Push notifications</h4>
                    <p>Receive real-time alerts for critical events</p>
                  </div>
                  <Toggle
                    active={notifications}
                    onChange={() => setNotifications(!notifications)}
                  />
                </div>
                <div className="settings-row">
                  <div className="settings-row-info">
                    <h4>Anomaly alerts</h4>
                    <p>Get notified when unusual patterns are detected</p>
                  </div>
                  <Toggle
                    active={anomalyAlerts}
                    onChange={() => setAnomalyAlerts(!anomalyAlerts)}
                  />
                </div>
                <div className="settings-row">
                  <div className="settings-row-info">
                    <h4>Auto-revocation</h4>
                    <p>Automatically revoke access on critical trust failures</p>
                  </div>
                  <Toggle active={autoRevoke} onChange={() => setAutoRevoke(!autoRevoke)} />
                </div>
                <div className="settings-row">
                  <div className="settings-row-info">
                    <h4>Weekly digest</h4>
                    <p>Email summary of weekly security events</p>
                  </div>
                  <Toggle active={weeklyDigest} onChange={() => setWeeklyDigest(!weeklyDigest)} />
                </div>
                <div className="settings-row" style={{ borderBottom: 'none' }}>
                  <div className="settings-row-info">
                    <h4>Slack integration</h4>
                    <p>Send alerts to your Slack workspace</p>
                  </div>
                  <Toggle active={slackAlerts} onChange={() => setSlackAlerts(!slackAlerts)} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div>
          <motion.div variants={item} style={{ marginBottom: 'var(--space-xxl)' }}>
            <div className="settings-section">
              <h3>
                <Key size={14} style={{ marginRight: 8 }} /> API Access
              </h3>
              <p>Integrate ContextShield into your applications</p>
            </div>
            <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
              <div className="card-header">
                <h3>Quick Start</h3>
                <button className="btn btn-ghost btn-sm" onClick={copyCode}>
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div className="code-window" style={{ border: 'none', borderRadius: 0 }}>
                  <div
                    className="code-window-header"
                    style={{ borderBottom: '1px solid var(--hairline)' }}
                  >
                    <div className="code-window-dots">
                      <div className="code-window-dot red" />
                      <div className="code-window-dot yellow" />
                      <div className="code-window-dot green" />
                    </div>
                    <span className="code-window-title">index.ts</span>
                  </div>
                  <div className="code-window-body">
                    <pre
                      style={{
                        margin: 0,
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        lineHeight: 'inherit',
                      }}
                    >
                      <code>{sampleCode}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={item}>
            <div className="settings-section">
              <h3>
                <Server size={14} style={{ marginRight: 8 }} /> System Status
              </h3>
              <p>Platform health and connectivity</p>
            </div>
            <div className="card">
              <div className="card-body" style={{ padding: 'var(--space-lg) var(--space-xl)' }}>
                <div className="settings-row">
                  <div className="settings-row-info">
                    <h4>
                      <Globe size={13} style={{ marginRight: 6, color: 'var(--stone)' }} /> Version
                    </h4>
                    <p>Current platform version</p>
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--charcoal)',
                    }}
                  >
                    v0.2.0-alpha
                  </span>
                </div>
                <div className="settings-row">
                  <div className="settings-row-info">
                    <h4>
                      <Globe size={13} style={{ marginRight: 6, color: 'var(--stone)' }} /> API
                      Server
                    </h4>
                    <p>Backend service connectivity</p>
                  </div>
                  <span className={`badge ${statusBadge(systemStatus.api).cls}`}>
                    <span className="badge-dot" />
                    {statusBadge(systemStatus.api).label}
                  </span>
                </div>
                <div className="settings-row">
                  <div className="settings-row-info">
                    <h4>
                      <Database size={13} style={{ marginRight: 6, color: 'var(--stone)' }} />{' '}
                      PostgreSQL
                    </h4>
                    <p>Primary database</p>
                  </div>
                  <span className={`badge ${statusBadge(systemStatus.database).cls}`}>
                    <span className="badge-dot" />
                    {statusBadge(systemStatus.database).label}
                  </span>
                </div>
                <div className="settings-row">
                  <div className="settings-row-info">
                    <h4>
                      <Database size={13} style={{ marginRight: 6, color: 'var(--stone)' }} /> Redis
                    </h4>
                    <p>Cache and session store</p>
                  </div>
                  <span className={`badge ${statusBadge(systemStatus.redis).cls}`}>
                    <span className="badge-dot" />
                    {statusBadge(systemStatus.redis).label}
                  </span>
                </div>
              </div>
              <div className="card-footer" style={{ display: 'flex', justifyContent: 'center' }}>
                <button className="btn btn-ghost btn-sm" onClick={checkStatus}>
                  <RefreshCw size={13} /> Check Status
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
