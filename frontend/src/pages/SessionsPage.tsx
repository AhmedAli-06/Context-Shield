import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Smartphone, Monitor, Globe, XCircle, Shield, RefreshCw, Search } from 'lucide-react'
import { getActiveSessions, getSessions, revokeSession } from '../api'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'
import { SkeletonTable } from '../components/Skeleton'
import { EmptyState } from '../components/EmptyState'

interface Session {
  id: string
  user_id: string
  user_name?: string
  ip_address?: string
  user_agent?: string
  device?: string
  location?: string
  is_active: boolean
  started_at: string
  last_active_at?: string
  expires_at?: string
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
}

const deviceIcon = (ua?: string) => {
  if (!ua) return Monitor
  if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) return Smartphone
  if (ua.includes('Mozilla')) return Globe
  return Monitor
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeCount, setActiveCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [revokeId, setRevokeId] = useState<string | null>(null)
  const [revokeReason, setRevokeReason] = useState('')
  const [revoking, setRevoking] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([
      getSessions().catch(() => ({ data: [] })),
      getActiveSessions().catch(() => ({ data: [] })),
    ])
      .then(([all, active]) => {
        setSessions(all.data)
        setActiveCount(active.data?.length || 0)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleRevoke = async () => {
    if (!revokeId) return
    setRevoking(true)
    try {
      await revokeSession(revokeId, revokeReason || undefined)
      toast.success('Session revoked successfully')
      setRevokeId(null)
      setRevokeReason('')
      load()
    } catch {
      toast.error('Failed to revoke session')
    } finally {
      setRevoking(false)
    }
  }

  const filtered = sessions.filter(
    s =>
      s.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.ip_address?.includes(search) ||
      s.id?.toLowerCase().includes(search.toLowerCase())
  )

  const activeSessions = filtered.filter(s => s.is_active)
  const inactiveSessions = filtered.filter(s => !s.is_active)

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      <motion.div className="page-header" variants={item}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2>Sessions</h2>
            <p>Manage active user sessions ({activeCount} active)</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={load}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </motion.div>

      <motion.div className="stats-grid" variants={item}>
        <div className="stat-card">
          <div className="stat-glow" style={{ background: 'var(--accent-green-glow)' }} />
          <div className="stat-label">Active Sessions</div>
          <div className="stat-value">{activeCount}</div>
          <div className="stat-change up">Currently online</div>
        </div>
        <div className="stat-card">
          <div className="stat-glow" style={{ background: 'var(--accent-blue-glow)' }} />
          <div className="stat-label">Total Sessions</div>
          <div className="stat-value">{sessions.length}</div>
          <div className="stat-change neutral">All time</div>
        </div>
        <div className="stat-card">
          <div className="stat-glow" style={{ background: 'var(--accent-orange-glow)' }} />
          <div className="stat-label">Inactive</div>
          <div className="stat-value">{sessions.length - activeCount}</div>
          <div className="stat-change neutral">Expired or revoked</div>
        </div>
        <div className="stat-card">
          <div className="stat-glow" style={{ background: 'var(--accent-red-glow)' }} />
          <div className="stat-label">Revoked</div>
          <div className="stat-value">{sessions.filter(s => !s.is_active).length}</div>
          <div className="stat-change down">Manually terminated</div>
        </div>
      </motion.div>

      <motion.div className="card" variants={item}>
        <div className="card-header">
          <h3>All Sessions</h3>
          <div style={{ position: 'relative' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--stone)',
                pointerEvents: 'none',
              }}
            />
            <input
              className="form-input"
              style={{ width: '220px', paddingLeft: '32px' }}
              placeholder="Search sessions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <SkeletonTable rows={6} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No sessions found"
              description="Sessions will appear here as users access the system."
            />
          ) : (
            <div>
              {activeSessions.length > 0 && (
                <div>
                  <div
                    style={{
                      padding: '8px 16px',
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                      color: 'var(--accent-green)',
                      fontWeight: 600,
                      borderBottom: '1px solid var(--hairline)',
                    }}
                  >
                    Active — {activeSessions.length}
                  </div>
                  {activeSessions.map(s => (
                    <SessionRow key={s.id} session={s} onRevoke={() => setRevokeId(s.id)} />
                  ))}
                </div>
              )}
              {inactiveSessions.length > 0 && (
                <div>
                  <div
                    style={{
                      padding: '8px 16px',
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                      color: 'var(--stone)',
                      fontWeight: 600,
                      borderBottom: '1px solid var(--hairline)',
                      borderTop: '1px solid var(--hairline)',
                    }}
                  >
                    Inactive / Revoked — {inactiveSessions.length}
                  </div>
                  {inactiveSessions.map(s => (
                    <SessionRow key={s.id} session={s} onRevoke={() => setRevokeId(s.id)} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <Modal open={!!revokeId} onClose={() => setRevokeId(null)} title="Revoke Session">
        <p style={{ fontSize: '13px', color: 'var(--ash)', marginBottom: 'var(--space-xl)' }}>
          This will immediately terminate this session. The user will be signed out.
        </p>
        <div className="form-group">
          <label>Reason (optional)</label>
          <input
            className="form-input"
            placeholder="e.g. Suspicious activity"
            value={revokeReason}
            onChange={e => setRevokeReason(e.target.value)}
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
          <button className="btn btn-ghost" onClick={() => setRevokeId(null)}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            style={{
              background: 'var(--accent-red)',
              color: 'white',
              borderColor: 'var(--accent-red)',
            }}
            onClick={handleRevoke}
            disabled={revoking}
          >
            {revoking ? 'Revoking...' : 'Revoke Session'}
          </button>
        </div>
      </Modal>
    </motion.div>
  )
}

function SessionRow({ session, onRevoke }: { session: Session; onRevoke: () => void }) {
  const Icon = deviceIcon(session.user_agent)
  return (
    <div className="session-row">
      <div className="session-row-icon">
        <Icon size={16} />
      </div>
      <div className="session-row-info">
        <div className="session-row-top">
          <span className="session-user">{session.user_name || 'Unknown User'}</span>
          <span
            className={`badge ${session.is_active ? 'allow' : 'denied'}`}
            style={{ fontSize: '10px', padding: '2px 8px' }}
          >
            <span className="badge-dot" />
            {session.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="session-row-meta">
          <span>{session.ip_address || '—'}</span>
          {session.location && (
            <>
              <span className="meta-sep">·</span>
              <span>{session.location}</span>
            </>
          )}
          <span className="meta-sep">·</span>
          <span>{session.user_agent ? session.user_agent.slice(0, 40) + '…' : '—'}</span>
        </div>
        <div className="session-row-time">
          Started {session.started_at ? new Date(session.started_at).toLocaleString() : '—'}
          {session.last_active_at && (
            <> · Last active {new Date(session.last_active_at).toLocaleString()}</>
          )}
        </div>
      </div>
      {session.is_active && (
        <button
          className="btn btn-ghost btn-sm"
          style={{ color: 'var(--accent-red)' }}
          onClick={onRevoke}
        >
          <XCircle size={13} /> Revoke
        </button>
      )}
    </div>
  )
}
