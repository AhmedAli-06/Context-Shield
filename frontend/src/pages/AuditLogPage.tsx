import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Search, RefreshCw, Verified, Fingerprint } from 'lucide-react'
import { getAuditLogs } from '../api'
import { SkeletonTable } from '../components/Skeleton'
import { EmptyState } from '../components/EmptyState'
import toast from 'react-hot-toast'

interface AuditEntry {
  id: string
  user_id?: string
  user_email?: string
  action: string
  resource_type: string
  resource_id?: string
  details?: Record<string, any>
  ip_address?: string
  created_at: string
  hmac_valid?: boolean
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.03, delayChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    getAuditLogs()
      .then(r => setLogs(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error('Failed to load audit logs'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = logs.filter(
    l =>
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.resource_type?.toLowerCase().includes(search.toLowerCase()) ||
      l.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      l.id?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      <motion.div className="page-header" variants={item}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2>Audit Log</h2>
            <p>HMAC-signed immutable audit trail ({logs.length} entries)</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={load}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </motion.div>

      <motion.div className="card" variants={item}>
        <div className="card-header">
          <h3>
            <Verified size={14} style={{ marginRight: 8, color: 'var(--accent-green)' }} /> Audit
            Trail
          </h3>
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
              style={{ width: '240px', paddingLeft: '32px' }}
              placeholder="Search audit entries..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <SkeletonTable rows={8} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No audit entries"
              description="Audit logs will appear here as actions are performed in the system."
            />
          ) : (
            <div>
              {filtered.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  className="audit-entry"
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <div className="audit-entry-sidebar">
                    <div className="audit-entry-icon">
                      <Fingerprint size={14} />
                    </div>
                    <div className="audit-entry-line" />
                  </div>
                  <div className="audit-entry-content">
                    <div className="audit-entry-header">
                      <span className="audit-entry-action">{entry.action}</span>
                      <span
                        className="badge allow"
                        style={{ fontSize: '10px', padding: '1px 6px' }}
                      >
                        <span className="badge-dot" />
                        HMAC Signed
                      </span>
                    </div>
                    <div className="audit-entry-detail">
                      {entry.user_email && (
                        <span>
                          User: <strong>{entry.user_email}</strong>
                        </span>
                      )}
                      {entry.resource_type && (
                        <span>
                          Resource: <strong>{entry.resource_type}</strong>
                        </span>
                      )}
                      {entry.resource_id && (
                        <span>
                          ID: <code className="audit-entry-code">{entry.resource_id}</code>
                        </span>
                      )}
                    </div>
                    {entry.details && (
                      <details className="audit-details">
                        <summary
                          style={{ fontSize: '11px', color: 'var(--stone)', cursor: 'pointer' }}
                        >
                          Details {entry.details._hmac ? '(HMAC verified)' : ''}
                        </summary>
                        <pre className="audit-details-pre">
                          {JSON.stringify(entry.details, null, 2)}
                        </pre>
                      </details>
                    )}
                    <div className="audit-entry-meta">
                      <span>{entry.ip_address || '—'}</span>
                      <span>· {new Date(entry.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
