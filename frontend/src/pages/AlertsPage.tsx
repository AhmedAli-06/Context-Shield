import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Bell, CheckCircle, Eye, X, RefreshCw, Loader2 } from 'lucide-react'
import { getAlerts, acknowledgeAlert, resolveAlert, dismissAlert, getAlert } from '../api'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'
import { SkeletonTable } from '../components/Skeleton'

interface Alert {
  id: string
  severity: string
  alert_type: string
  title: string
  description?: string
  trust_score_at_trigger?: number
  triggered_at: string
  acknowledged_at?: string | null
  resolved_at?: string | null
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
}

const severityIcon = (s: string) => {
  switch (s) {
    case 'critical':
      return AlertTriangle
    case 'warning':
      return Bell
    default:
      return AlertTriangle
  }
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [detailAlert, setDetailAlert] = useState<Alert | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [resolveNotes, setResolveNotes] = useState('')
  const [resolveTarget, setResolveTarget] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    getAlerts()
      .then(r => setAlerts(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error('Failed to load alerts'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleAcknowledge = async (id: string) => {
    setActionLoading(id)
    try {
      await acknowledgeAlert(id)
      toast.success('Alert acknowledged')
      load()
    } catch {
      toast.error('Failed to acknowledge alert')
    } finally {
      setActionLoading(null)
    }
  }

  const handleResolve = async () => {
    if (!resolveTarget) return
    setActionLoading(resolveTarget)
    try {
      await resolveAlert(resolveTarget, resolveNotes)
      toast.success('Alert resolved')
      setResolveTarget(null)
      setResolveNotes('')
      load()
    } catch {
      toast.error('Failed to resolve alert')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDismiss = async (id: string) => {
    setActionLoading(id)
    try {
      await dismissAlert(id)
      toast.success('Alert dismissed')
      load()
    } catch {
      toast.error('Failed to dismiss alert')
    } finally {
      setActionLoading(null)
    }
  }

  const openDetail = async (id: string) => {
    setDetailLoading(true)
    try {
      const res = await getAlert(id)
      setDetailAlert(res.data)
    } catch {
      toast.error('Failed to load alert details')
    } finally {
      setDetailLoading(false)
    }
  }

  const filtered =
    filter === 'all'
      ? alerts
      : alerts.filter(a => {
          if (filter === 'open') return !a.acknowledged_at
          if (filter === 'resolved') return !!a.resolved_at
          return a.severity === filter
        })

  const critical = alerts.filter(a => a.severity === 'critical').length
  const warning = alerts.filter(a => a.severity === 'warning').length
  const open = alerts.filter(a => !a.acknowledged_at).length
  const resolved = alerts.filter(a => !!a.resolved_at).length

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      <motion.div className="page-header" variants={item}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2>Alerts</h2>
            <p>Security alerts requiring attention ({open} unacknowledged)</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={load}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </motion.div>

      <motion.div className="stats-grid" variants={item}>
        <div className="stat-card">
          <div className="stat-glow" style={{ background: 'var(--accent-red-glow)' }} />
          <div className="stat-label">Critical</div>
          <div className="stat-value">{critical}</div>
          <div className="stat-change down">Immediate action required</div>
        </div>
        <div className="stat-card">
          <div className="stat-glow" style={{ background: 'var(--accent-orange-glow)' }} />
          <div className="stat-label">Warnings</div>
          <div className="stat-value">{warning}</div>
          <div className="stat-change neutral">Review recommended</div>
        </div>
        <div className="stat-card">
          <div className="stat-glow" style={{ background: 'var(--accent-blue-glow)' }} />
          <div className="stat-label">Unacknowledged</div>
          <div className="stat-value">{open}</div>
          <div className="stat-change neutral">Pending review</div>
        </div>
        <div className="stat-card">
          <div className="stat-glow" style={{ background: 'var(--accent-green-glow)' }} />
          <div className="stat-label">Resolved</div>
          <div className="stat-value">{resolved}</div>
          <div className="stat-change up">Closed</div>
        </div>
      </motion.div>

      <motion.div className="card" variants={item}>
        <div className="card-header">
          <h3>Alert Feed</h3>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['all', 'critical', 'warning', 'open', 'resolved'].map(f => (
              <button
                key={f}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <SkeletonTable rows={6} />
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <CheckCircle size={32} />
              <h4>No alerts</h4>
              <p>All systems are operating normally.</p>
            </div>
          ) : (
            <div style={{ padding: 'var(--space-md)' }}>
              {filtered.map((alert, i) => {
                const Icon = severityIcon(alert.severity)
                const isProcessing = actionLoading === alert.id
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="alert-card"
                    style={{
                      opacity: alert.resolved_at ? 0.6 : 1,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background:
                          alert.severity === 'critical'
                            ? 'rgba(244,114,182,0.1)'
                            : 'rgba(251,191,36,0.1)',
                        flexShrink: 0,
                      }}
                    >
                      <Icon
                        size={15}
                        style={{
                          color:
                            alert.severity === 'critical'
                              ? 'var(--accent-red)'
                              : 'var(--accent-yellow)',
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '4px',
                        }}
                      >
                        <span className={`badge ${alert.severity}`}>
                          <span className="badge-dot" />
                          {alert.severity}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--stone)' }}>
                          {alert.alert_type.replace(/_/g, ' ')}
                        </span>
                        {alert.resolved_at && (
                          <span
                            style={{
                              fontSize: '11px',
                              color: 'var(--accent-green)',
                              marginLeft: 'auto',
                            }}
                          >
                            Resolved
                          </span>
                        )}
                        {alert.acknowledged_at && !alert.resolved_at && (
                          <span
                            style={{
                              fontSize: '11px',
                              color: 'var(--accent-blue)',
                              marginLeft: 'auto',
                            }}
                          >
                            Acknowledged
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: 'var(--charcoal)',
                          marginBottom: '2px',
                        }}
                      >
                        {alert.title}
                      </p>
                      {alert.description && (
                        <p style={{ fontSize: '12px', color: 'var(--stone)' }}>
                          {alert.description}
                        </p>
                      )}
                      <div
                        style={{
                          display: 'flex',
                          gap: '16px',
                          marginTop: '8px',
                          fontSize: '11px',
                          color: 'var(--ash)',
                        }}
                      >
                        {alert.trust_score_at_trigger !== undefined && (
                          <span>Score: {(alert.trust_score_at_trigger * 100).toFixed(0)}</span>
                        )}
                        <span>{new Date(alert.triggered_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '4px',
                        flexShrink: 0,
                        alignItems: 'flex-start',
                      }}
                    >
                      {!alert.resolved_at && (
                        <>
                          {!alert.acknowledged_at && (
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleAcknowledge(alert.id)}
                              disabled={isProcessing}
                              title="Acknowledge"
                            >
                              {isProcessing ? (
                                <Loader2 size={13} className="spinning" />
                              ) : (
                                <Eye size={13} />
                              )}
                              Ack
                            </button>
                          )}
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setResolveTarget(alert.id)}
                            disabled={isProcessing}
                            title="Resolve"
                            style={{ color: 'var(--accent-green)' }}
                          >
                            <CheckCircle size={13} /> Resolve
                          </button>
                          <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={() => handleDismiss(alert.id)}
                            disabled={isProcessing}
                            title="Dismiss"
                            style={{ color: 'var(--stone)' }}
                          >
                            <X size={13} />
                          </button>
                        </>
                      )}
                      <button
                        className="btn btn-ghost btn-sm btn-icon"
                        onClick={() => openDetail(alert.id)}
                        title="View details"
                      >
                        <Eye size={13} />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>

      <Modal
        open={!!resolveTarget}
        onClose={() => {
          setResolveTarget(null)
          setResolveNotes('')
        }}
        title="Resolve Alert"
      >
        <div className="form-group">
          <label>Resolution notes (optional)</label>
          <textarea
            className="form-input"
            style={{ height: '80px', resize: 'vertical', paddingTop: '10px' }}
            placeholder="Describe how this was resolved..."
            value={resolveNotes}
            onChange={e => setResolveNotes(e.target.value)}
          />
        </div>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'flex-end',
            marginTop: 'var(--space-xl)',
          }}
        >
          <button
            className="btn btn-ghost"
            onClick={() => {
              setResolveTarget(null)
              setResolveNotes('')
            }}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            style={{
              background: 'var(--accent-green)',
              color: '#000',
              borderColor: 'var(--accent-green)',
            }}
            onClick={handleResolve}
            disabled={actionLoading === resolveTarget}
          >
            {actionLoading === resolveTarget ? 'Resolving...' : 'Resolve Alert'}
          </button>
        </div>
      </Modal>

      <Modal open={!!detailAlert} onClose={() => setDetailAlert(null)} title="Alert Details">
        {detailLoading ? (
          <div className="spinner" />
        ) : detailAlert ? (
          <div>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                marginBottom: 'var(--space-lg)',
              }}
            >
              <span className={`badge ${detailAlert.severity}`}>
                <span className="badge-dot" />
                {detailAlert.severity}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--stone)' }}>
                {detailAlert.alert_type.replace(/_/g, ' ')}
              </span>
            </div>
            <h4
              style={{
                fontSize: '15px',
                fontWeight: 500,
                marginBottom: 'var(--space-sm)',
                color: 'var(--ink)',
              }}
            >
              {detailAlert.title}
            </h4>
            {detailAlert.description && (
              <p style={{ fontSize: '13px', color: 'var(--ash)', marginBottom: 'var(--space-xl)' }}>
                {detailAlert.description}
              </p>
            )}
            <div className="stat-row">
              <div>
                <span className="stat-row-label">Triggered</span>
                <span className="stat-row-value">
                  {new Date(detailAlert.triggered_at).toLocaleString()}
                </span>
              </div>
              {detailAlert.trust_score_at_trigger !== undefined && (
                <div>
                  <span className="stat-row-label">Trust Score</span>
                  <span className="stat-row-value">
                    {(detailAlert.trust_score_at_trigger * 100).toFixed(0)}
                  </span>
                </div>
              )}
              {detailAlert.acknowledged_at && (
                <div>
                  <span className="stat-row-label">Acknowledged</span>
                  <span className="stat-row-value">
                    {new Date(detailAlert.acknowledged_at).toLocaleString()}
                  </span>
                </div>
              )}
              {detailAlert.resolved_at && (
                <div>
                  <span className="stat-row-label">Resolved</span>
                  <span className="stat-row-value">
                    {new Date(detailAlert.resolved_at).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </motion.div>
  )
}
