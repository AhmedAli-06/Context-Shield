import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'

const api = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface Event {
  id: string
  user_name?: string
  asset_name?: string
  event_type: string
  decision: string
  trust_score: number
  occurred_at: string
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.03, delayChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
}

const trustColor = (v: number) =>
  v >= 0.7 ? 'var(--accent-green)' : v >= 0.4 ? 'var(--accent-yellow)' : 'var(--accent-red)'

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch(`${api}/api/v1/events/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setEvents(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  const filtered = filter === 'all' ? events : events.filter(e => e.decision === filter)

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      <motion.div className="page-header" variants={item}>
        <h2>Events</h2>
        <p>Access events and trust score history ({events.length} total)</p>
      </motion.div>

      <motion.div className="card" variants={item}>
        <div className="card-header">
          <h3>Event Log</h3>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['all', 'granted', 'alert', 'denied'].map(f => (
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
          {filtered.length === 0 ? (
            <div className="empty-state">
              <Activity size={32} />
              <h4>No events found</h4>
              <p>Events will appear here as they are recorded.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Asset</th>
                    <th>Type</th>
                    <th>Decision</th>
                    <th>Trust Score</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 50).map(ev => (
                    <tr key={ev.id}>
                      <td style={{ fontWeight: 500, color: 'var(--charcoal)' }}>
                        {ev.user_name || '—'}
                      </td>
                      <td>{ev.asset_name || '—'}</td>
                      <td style={{ textTransform: 'capitalize' }}>
                        {ev.event_type.replace(/_/g, ' ')}
                      </td>
                      <td>
                        <span className={`badge ${ev.decision}`}>
                          <span className="badge-dot" />
                          {ev.decision}
                        </span>
                      </td>
                      <td>
                        <div className="trust-score">
                          <div className="trust-bar">
                            <div
                              className="trust-bar-fill"
                              style={{
                                width: `${(ev.trust_score * 100).toFixed(0)}%`,
                                background: trustColor(ev.trust_score),
                              }}
                            />
                          </div>
                          <span
                            className="trust-value"
                            style={{ color: trustColor(ev.trust_score) }}
                          >
                            {(ev.trust_score * 100).toFixed(0)}
                          </span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--stone)', fontSize: '12px' }}>
                        {ev.occurred_at ? new Date(ev.occurred_at).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
