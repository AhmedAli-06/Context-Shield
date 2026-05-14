import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts'
import { ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react'
import { getDashboardStats, getRecentEvents } from '../api'
import { useNavigate } from 'react-router-dom'

function AnimatedValue({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = display
    const end = value
    const dur = 800
    const step = (end - start) / (dur / 16)
    let cur = start
    const timer = setInterval(() => {
      cur += step
      if ((step > 0 && cur >= end) || (step < 0 && cur <= end)) {
        setDisplay(end)
        clearInterval(timer)
      } else {
        setDisplay(Math.round(cur))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [value])
  return <>{display.toLocaleString()}{suffix}</>
}

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } } }

const trustColor = (v: number) => v >= 0.7 ? 'var(--accent-green)' : v >= 0.4 ? 'var(--accent-yellow)' : 'var(--accent-red)'
const decisionData = [
  { name: 'Granted', value: 723, color: 'var(--accent-green)' },
  { name: 'Alert', value: 89, color: 'var(--accent-yellow)' },
  { name: 'Revoked', value: 23, color: 'var(--accent-red)' },
]
const weeklyData = [
  { day: 'Mon', score: 0.82, events: 142 }, { day: 'Tue', score: 0.79, events: 156 },
  { day: 'Wed', score: 0.85, events: 134 }, { day: 'Thu', score: 0.81, events: 167 },
  { day: 'Fri', score: 0.76, events: 198 }, { day: 'Sat', score: 0.88, events: 89 },
  { day: 'Sun', score: 0.91, events: 54 },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ totalAssets: 12, activeUsers: 20, eventsToday: 2847, alertsActive: 3 })
  const [recentEvents, setRecentEvents] = useState<any[]>([])
  const [liveTime, setLiveTime] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(() => {
    if (!localStorage.getItem('cs_token')) return
    getDashboardStats().then(r => {
      const d = r.data
      setStats(s => ({ totalAssets: d.total_assets ?? s.totalAssets, activeUsers: d.active_users ?? s.activeUsers, eventsToday: d.events_24h ?? d.events_today ?? s.eventsToday, alertsActive: d.active_alerts ?? s.alertsActive }))
    }).catch(() => {})
    getRecentEvents(24).then(r => { if (Array.isArray(r.data)) setRecentEvents(r.data.slice(0, 8)) }).catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { const i = setInterval(() => setLiveTime(new Date()), 30000); return () => clearInterval(i) }, [])

  const handleRefresh = () => { setRefreshing(true); load(); setTimeout(() => setRefreshing(false), 800) }

  const hourlyData = Array.from({ length: 24 }, (_, i) => ({ hour: `${i.toString().padStart(2, '0')}:00`, events: Math.floor(Math.random() * 25) + 8, baseline: 15 }))

  const cards = [
    { label: 'Total Assets', value: stats.totalAssets, glow: 'var(--accent-blue-glow)', action: '/assets', icon: ArrowUpRight, actionLabel: 'View all assets', changeClass: 'up' },
    { label: 'Active Users', value: stats.activeUsers, glow: 'var(--accent-green-glow)', action: '/sessions', icon: ArrowUpRight, actionLabel: 'Active sessions', changeClass: 'up' },
    { label: 'Events Today', value: stats.eventsToday, glow: 'var(--accent-purple-glow)', action: '/events', icon: ArrowDownRight, actionLabel: 'View event log', changeClass: 'down' },
    { label: 'Active Alerts', value: stats.alertsActive, glow: 'var(--accent-red-glow)', action: '/alerts', icon: ArrowDownRight, actionLabel: 'Requires attention', changeClass: 'neutral' },
  ]

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      <motion.div className="page-header" variants={item}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2>Dashboard</h2>
            <p>Real-time overview · {liveTime.toLocaleTimeString()}</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={13} className={refreshing ? 'spinning' : ''} /> Refresh
          </button>
        </div>
      </motion.div>

      <motion.div className="stats-grid" variants={item}>
        {cards.map((c, i) => (
          <div key={i} className="stat-card" onClick={() => navigate(c.action)}>
            <div className="stat-glow" style={{ background: c.glow }} />
            <div className="stat-label">{c.label}</div>
            <div className="stat-value"><AnimatedValue value={c.value} /></div>
            <div className={`stat-change ${c.changeClass}`}>
              <c.icon size={12} /> {c.actionLabel}
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid-2">
        <motion.div className="card" variants={item}>
          <div className="card-header">
            <h3>Trust Score Trend</h3>
            <span className="badge"><span className="badge-dot" style={{ background: 'var(--accent-green)' }} />Operational</span>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs><linearGradient id="trustGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent-blue)" stopOpacity={0.15} /><stop offset="100%" stopColor="var(--accent-blue)" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline)" />
                  <XAxis dataKey="day" tick={{ fill: 'var(--stone)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 1]} tick={{ fill: 'var(--stone)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
                  <Tooltip contentStyle={{ background: 'var(--surface-elevated)', border: '1px solid var(--hairline-strong)', borderRadius: '8px', fontSize: '12px', color: 'var(--ink)' }} />
                  <Area type="monotone" dataKey="score" stroke="var(--accent-blue)" fill="url(#trustGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        <motion.div className="card" variants={item}>
          <div className="card-header"><h3>Access Decisions</h3><span className="badge">Last 24 hours</span></div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={decisionData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                    {decisionData.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--surface-elevated)', border: '1px solid var(--hairline-strong)', borderRadius: '8px', fontSize: '12px', color: 'var(--ink)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8 }}>
              {decisionData.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--charcoal)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />{d.name}: {d.value}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid-2">
        <motion.div className="card" variants={item}>
          <div className="card-header"><h3>Hourly Event Volume</h3></div>
          <div className="card-body">
            <div className="chart-container chart-container-sm">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline)" />
                  <XAxis dataKey="hour" tick={{ fill: 'var(--stone)', fontSize: 9 }} axisLine={false} tickLine={false} interval={3} />
                  <YAxis tick={{ fill: 'var(--stone)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--surface-elevated)', border: '1px solid var(--hairline-strong)', borderRadius: '8px', fontSize: '12px', color: 'var(--ink)' }} />
                  <Bar dataKey="events" fill="var(--accent-blue)" opacity={0.6} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        <motion.div className="card" variants={item}>
          <div className="card-header"><h3>Recent Events</h3><button className="btn btn-ghost btn-sm" onClick={() => navigate('/events')}>View all</button></div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table>
                <thead><tr><th>User</th><th>Asset</th><th>Decision</th><th>Score</th><th>Time</th></tr></thead>
                <tbody>
                  {recentEvents.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--stone)', fontSize: 12, padding: 'var(--space-xl)' }}>No recent events</td></tr>
                  ) : recentEvents.map((ev: any) => (
                    <tr key={ev.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/events')}>
                      <td style={{ fontWeight: 500, color: 'var(--charcoal)' }}>{ev.user_name || '—'}</td>
                      <td>{ev.asset_name || '—'}</td>
                      <td><span className={`badge ${ev.decision}`}><span className="badge-dot" />{ev.decision}</span></td>
                      <td><div className="trust-score"><div className="trust-bar"><div className="trust-bar-fill" style={{ width: `${((ev.trust_score ?? 0.5) * 100).toFixed(0)}%`, background: trustColor(ev.trust_score ?? 0.5) }} /></div><span className="trust-value" style={{ color: trustColor(ev.trust_score ?? 0.5) }}>{((ev.trust_score ?? 0.5) * 100).toFixed(0)}</span></div></td>
                      <td style={{ color: 'var(--stone)', fontSize: 12 }}>{ev.occurred_at ? new Date(ev.occurred_at).toLocaleTimeString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
