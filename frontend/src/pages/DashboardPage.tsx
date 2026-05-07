import { useEffect, useState } from "react";
import { getDashboardStats, getRecentEvents, getAlerts } from "../api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Shield, Activity, AlertTriangle, Cpu, TrendingUp } from "lucide-react";

interface Stats {
  total_assets: number;
  active_sessions: number;
  open_alerts: number;
  avg_trust_score: number;
  events_today: number;
}

interface Event {
  id: string;
  user_id: string;
  asset_id: string;
  event_type: string;
  occurred_at: string;
  trust_score: number | null;
  decision: string | null;
}

interface Alert {
  id: string;
  severity: string;
  alert_type: string;
  title: string;
  status: string;
  triggered_at: string;
  trust_score_at_trigger: number | null;
}

const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

function trustColor(score: number | null): string {
  if (score === null) return "#64748b";
  if (score >= 0.7) return "#10b981";
  if (score >= 0.4) return "#f59e0b";
  return "#ef4444";
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getRecentEvents(24),
      getAlerts("open"),
    ]).then(([s, e, a]) => {
      setStats(s.data);
      setEvents(e.data.slice(0, 20));
      setAlerts(a.data.slice(0, 10));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  // Compute decision distribution for pie chart
  const decisions = events.reduce(
    (acc, e) => {
      const d = e.decision || "allow";
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const pieData = Object.entries(decisions).map(([name, value]) => ({ name, value }));

  // Trust score histogram
  const bins = [0, 0, 0, 0, 0];
  events.forEach((e) => {
    if (e.trust_score === null) return;
    const idx = Math.min(4, Math.floor(e.trust_score * 5));
    bins[idx]++;
  });
  const histData = ["0-.2", ".2-.4", ".4-.6", ".6-.8", ".8-1"].map((r, i) => ({
    range: r,
    count: bins[i],
  }));

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Security Dashboard</h2>
        <p>Real-time overview of physical asset access security</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="icon"><Cpu size={40} /></div>
          <div className="label">Monitored Assets</div>
          <div className="value">{stats?.total_assets ?? 0}</div>
          <div className="subtitle">Active monitoring</div>
        </div>
        <div className="stat-card">
          <div className="icon"><Activity size={40} /></div>
          <div className="label">Events Today</div>
          <div className="value">{stats?.events_today ?? 0}</div>
          <div className="subtitle">Access attempts</div>
        </div>
        <div className="stat-card">
          <div className="icon"><Shield size={40} /></div>
          <div className="label">Avg Trust Score</div>
          <div className="value" style={{ color: trustColor(stats?.avg_trust_score ?? 0) }}>
            {((stats?.avg_trust_score ?? 0) * 100).toFixed(1)}%
          </div>
          <div className="subtitle">Across all events</div>
        </div>
        <div className="stat-card">
          <div className="icon"><AlertTriangle size={40} /></div>
          <div className="label">Open Alerts</div>
          <div className="value" style={{ color: (stats?.open_alerts ?? 0) > 0 ? "#ef4444" : "#10b981" }}>
            {stats?.open_alerts ?? 0}
          </div>
          <div className="subtitle">Requiring attention</div>
        </div>
        <div className="stat-card">
          <div className="icon"><TrendingUp size={40} /></div>
          <div className="label">Active Sessions</div>
          <div className="value">{stats?.active_sessions ?? 0}</div>
          <div className="subtitle">Currently active</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Trust Score Distribution</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histData}>
                <XAxis dataKey="range" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "#1a2035", border: "1px solid #1e293b", borderRadius: 8 }}
                  labelStyle={{ color: "#f1f5f9" }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Access Decisions</h3>
          <div className="chart-container" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#1a2035", border: "1px solid #1e293b", borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Recent Access Events</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Trust</th>
                  <th>Decision</th>
                </tr>
              </thead>
              <tbody>
                {events.slice(0, 8).map((ev) => (
                  <tr key={ev.id}>
                    <td>{new Date(ev.occurred_at).toLocaleTimeString()}</td>
                    <td>{ev.event_type?.replace("_", " ")}</td>
                    <td>
                      <div className="trust-score">
                        <div className="trust-bar">
                          <div
                            className="trust-bar-fill"
                            style={{
                              width: `${(ev.trust_score ?? 0) * 100}%`,
                              background: trustColor(ev.trust_score),
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 12, color: trustColor(ev.trust_score) }}>
                          {((ev.trust_score ?? 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td><span className={`badge ${ev.decision}`}>{ev.decision}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Open Alerts</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Title</th>
                  <th>Trust</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {alerts.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: "center", color: "#10b981" }}>No open alerts ✓</td></tr>
                ) : (
                  alerts.map((al) => (
                    <tr key={al.id}>
                      <td><span className={`badge ${al.severity}`}>{al.severity}</span></td>
                      <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{al.title}</td>
                      <td style={{ color: trustColor(al.trust_score_at_trigger) }}>
                        {al.trust_score_at_trigger !== null ? `${(al.trust_score_at_trigger * 100).toFixed(0)}%` : "—"}
                      </td>
                      <td>{new Date(al.triggered_at).toLocaleTimeString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
