import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts'
import { ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle } from 'lucide-react'
import { getDashboardStats, getRecentEvents } from '../api'
import { useNavigate } from 'react-router-dom'

const COLORS = {
  blue: '#4b8bff',
  blueGlow: 'rgba(75,139,255,0.12)',
  green: '#34d399',
  greenGlow: 'rgba(52,211,153,0.1)',
  red: '#c94a4a',
  redGlow: 'rgba(201,74,74,0.12)',
  redSoft: '#b84c4c',
  redSoftGlow: 'rgba(184,76,76,0.08)',
  orange: '#fb923c',
  orangeGlow: 'rgba(251,146,60,0.1)',
  amber: '#fbbf24',
  surfaceElevated: '#16161c',
  hairline: 'rgba(255,255,255,0.08)',
  stone: '#3f4352',
  ink: '#edeef3',
}

const trustColor = (v: number) => v >= 0.7 ? COLORS.green : v >= 0.4 ? COLORS.amber : COLORS.red

const decisionData = [
  { name: 'Granted', value: 723, color: COLORS.green },
  { name: 'Alert', value: 89, color: COLORS.amber },
  { name: 'Revoked', value: 23, color: COLORS.red },
]

const weeklyData = [
  { day: 'Mon', score: 0.82, events: 142 },
  { day: 'Tue', score: 0.79, events: 156 },
  { day: 'Wed', score: 0.85, events: 134 },
  { day: 'Thu', score: 0.81, events: 167 },
  { day: 'Fri', score: 0.76, events: 198 },
  { day: 'Sat', score: 0.88, events: 89 },
  { day: 'Sun', score: 0.91, events: 54 },
]

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
}

function StatSkeleton() {
  return (
    <div className="stat-card" style={{ cursor: 'default' }}>
      <div className="skeleton" style={{ width: 80, height: 11, marginBottom: 12, borderRadius: 3 }} />
      <div className="skeleton" style={{ width: 60, height: 32, marginBottom: 8, borderRadius: 4 }} />
      <div className="skeleton" style={{ width: 100, height: 12, borderRadius: 3 }} />
    </div>
  )
}

function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="skeleton" style={{ width: 140, height: 14, borderRadius: 3 }} />
        <div className="skeleton" style={{ width: 80, height: 20, borderRadius: 10 }} />
      </div>
      <div className="card-body">
        <div className="skeleton" style={{ width: '100%', height, borderRadius: 6 }} />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ totalAssets: 12, activeUsers: 20, eventsToday: 2847, alertsActive: 3 })
  const [recentEvents, setRecentEvents] = useState<any[]>([])
  const [liveTime, setLiveTime] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    const token = localStorage.getItem('cs_token')
    if (!token) return

    setError(null)
    setLoading(true)

    getDashboardStats()
      .then(r => {
        const d = r.data
        setStats(prev => ({
          totalAssets: d.total_assets ?? prev.totalAssets,
          activeUsers: d.active_users ?? prev.activeUsers,
          eventsToday: d.events_24h ?? d.events_today ?? prev.eventsToday,
          alertsActive: d.active_alerts ?? prev.alertsActive,
        }))
      })
      .catch(() => setError('Failed to load dashboard stats'))
      .finally(() => setLoading(false))

    getRecentEvents(24)
      .then(r => { if (Array.isArray(r.data)) setRecentEvents(r.data.slice(0, 8)) })
      .catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const interval = setInterval(() => setLiveTime(new Date()), 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    load()
    setTimeout(() => setRefreshing(false), 800)
  }

  const hourlyData = [
    8,9,12,15,22,45,78,95,82,60,55,58,
    48,52,85,110,95,78,65,55,42,30,18,10,
  ].map((v, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    events: v,
    baseline: 40,
  }))

  const chartTooltipStyle = {
    background: COLORS.surfaceElevated,
    border: `1px solid ${COLORS.hairline}`,
    borderRadius: 8,
    fontSize: 12,
    color: COLORS.ink,
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      <motion.div className="page-header" variants={item}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2>Dashboard</h2>
            <p>Real-time overview · {liveTime.toLocaleTimeString()}</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleRefresh} disabled={refreshing || loading}>
            <RefreshCw size={13} className={refreshing ? 'spinning' : ''} /> Refresh
          </button>
        </div>
      </motion.div>

      {error && (
        <motion.div
          variants={item}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', marginBottom: 24,
            background: `${COLORS.redGlow}`, border: `1px solid rgba(201,74,74,0.2)`,
            borderRadius: 8, fontSize: 13, color: COLORS.red,
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
          <button className="btn btn-sm" style={{ marginLeft: 'auto', background: 'rgba(201,74,74,0.15)', color: COLORS.red, border: '1px solid rgba(201,74,74,0.2)' }} onClick={load}>
            Retry
          </button>
        </motion.div>
      )}

      <motion.div className="stats-grid" variants={item}>
        {loading ? (
          <>
            <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
          </>
        ) : (
          <>
            <div className="stat-card" onClick={() => navigate('/assets')} style={{ cursor: 'pointer' }}>
              <div className="stat-glow" style={{ background: COLORS.blueGlow }} />
              <div className="stat-label">Total Assets</div>
              <div className="stat-value">{stats.totalAssets}</div>
              <div className="stat-change up"><ArrowUpRight size={12} /> View all assets</div>
            </div>
            <div className="stat-card" onClick={() => navigate('/sessions')} style={{ cursor: 'pointer' }}>
              <div className="stat-glow" style={{ background: COLORS.greenGlow }} />
              <div className="stat-label">Active Users</div>
              <div className="stat-value">{stats.activeUsers}</div>
              <div className="stat-change up"><ArrowUpRight size={12} /> Active sessions</div>
            </div>
            <div className="stat-card" onClick={() => navigate('/events')} style={{ cursor: 'pointer' }}>
              <div className="stat-glow" style={{ background: COLORS.orangeGlow }} />
              <div className="stat-label">Events Today</div>
              <div className="stat-value">{stats.eventsToday.toLocaleString()}</div>
              <div className="stat-change down"><ArrowDownRight size={12} /> View event log</div>
            </div>
            <div className="stat-card" onClick={() => navigate('/alerts')} style={{ cursor: 'pointer' }}>
              <div className="stat-glow" style={{ background: COLORS.redGlow }} />
              <div className="stat-label">Active Alerts</div>
              <div className="stat-value">{stats.alertsActive}</div>
              <div className="stat-change neutral">Requires attention</div>
            </div>
          </>
        )}
      </motion.div>

      <div className="grid-2">
        {loading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <motion.div className="card" variants={item}>
              <div className="card-header">
                <h3>Trust Score Trend</h3>
                <span className="badge">
                  <span className="badge-dot" style={{ background: COLORS.green }} />
                  Operational
                </span>
              </div>
              <div className="card-body">
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData}>
                      <defs>
                        <linearGradient id="trustGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={COLORS.blue} stopOpacity={0.2} />
                          <stop offset="100%" stopColor={COLORS.blue} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.hairline} />
                      <XAxis dataKey="day" tick={{ fill: COLORS.stone, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 1]} tick={{ fill: COLORS.stone, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Area type="monotone" dataKey="score" stroke={COLORS.blue} fill="url(#trustGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            <motion.div className="card" variants={item}>
              <div className="card-header">
                <h3>Access Decisions</h3>
                <span className="badge">Last 24 hours</span>
              </div>
              <div className="card-body">
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={decisionData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                        {decisionData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={chartTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8 }}>
                  {decisionData.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: COLORS.ink }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                      {d.name}: {d.value}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>

      <div className="grid-2">
        {loading ? (
          <>
            <ChartSkeleton height={200} />
            <ChartSkeleton height={200} />
          </>
        ) : (
          <>
            <motion.div className="card" variants={item}>
              <div className="card-header">
                <h3>Hourly Event Volume</h3>
              </div>
              <div className="card-body">
                <div className="chart-container chart-container-sm">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.hairline} />
                      <XAxis dataKey="hour" tick={{ fill: COLORS.stone, fontSize: 9 }} axisLine={false} tickLine={false} interval={3} />
                      <YAxis tick={{ fill: COLORS.stone, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Bar dataKey="events" fill={COLORS.blue} opacity={0.7} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            <motion.div className="card" variants={item}>
              <div className="card-header">
                <h3>Recent Events</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/events')}>View all</button>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Asset</th>
                        <th>Decision</th>
                        <th>Score</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentEvents.length === 0 ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i}>
                            <td colSpan={5} style={{ textAlign: 'center', color: COLORS.stone, fontSize: 12, padding: 24 }}>
                              {i === 0 ? 'No recent events. Data will appear once events are recorded.' : ''}
                            </td>
                          </tr>
                        ))
                      ) : (
                        recentEvents.map((ev: any) => (
                          <tr key={ev.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/events')}>
                            <td style={{ fontWeight: 500, color: COLORS.ink }}>{ev.user_name || '—'}</td>
                            <td>{ev.asset_name || '—'}</td>
                            <td>
                              <span className={`badge ${ev.decision}`}>
                                <span className="badge-dot" />
                                {ev.decision}
                              </span>
                            </td>
                            <td>
                              <div className="trust-score">
                                <div className="trust-bar">
                                  <div className="trust-bar-fill" style={{
                                    width: `${((ev.trust_score ?? 0.5) * 100).toFixed(0)}%`,
                                    background: trustColor(ev.trust_score ?? 0.5),
                                  }} />
                                </div>
                                <span className="trust-value" style={{ color: trustColor(ev.trust_score ?? 0.5) }}>
                                  {((ev.trust_score ?? 0.5) * 100).toFixed(0)}
                                </span>
                              </div>
                            </td>
                            <td style={{ color: COLORS.stone, fontSize: 12 }}>
                              {ev.occurred_at ? new Date(ev.occurred_at).toLocaleTimeString() : '—'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  )
}
