import { useEffect, useState } from "react";
import { getAlerts } from "../api";

interface Alert {
  id: string;
  severity: string;
  alert_type: string;
  title: string;
  status: string;
  triggered_at: string;
  trust_score_at_trigger: number | null;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAlerts(filter || undefined).then((r) => setAlerts(r.data)).finally(() => setLoading(false));
  }, [filter]);

  if (loading) return <div className="spinner" />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Security Alerts</h2>
        <p>Trust score violations and anomaly detections</p>
      </div>
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        {["", "open", "acknowledged", "resolved"].map((f) => (
          <button
            key={f}
            onClick={() => { setLoading(true); setFilter(f); }}
            className="btn-primary"
            style={{
              width: "auto", padding: "8px 16px", fontSize: 12,
              background: filter === f ? "var(--accent)" : "var(--bg-card)",
              border: `1px solid ${filter === f ? "var(--accent)" : "var(--border)"}`,
            }}
          >
            {f || "All"}
          </button>
        ))}
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Severity</th>
                <th>Type</th>
                <th>Title</th>
                <th>Trust Score</th>
                <th>Status</th>
                <th>Triggered</th>
              </tr>
            </thead>
            <tbody>
              {alerts.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 32 }}>No alerts found</td></tr>
              ) : (
                alerts.map((a) => (
                  <tr key={a.id}>
                    <td><span className={`badge ${a.severity}`}>{a.severity}</span></td>
                    <td>{a.alert_type?.replace("_", " ")}</td>
                    <td style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</td>
                    <td style={{ color: a.trust_score_at_trigger !== null && a.trust_score_at_trigger < 0.4 ? "#ef4444" : "#f59e0b" }}>
                      {a.trust_score_at_trigger !== null ? `${(a.trust_score_at_trigger * 100).toFixed(1)}%` : "—"}
                    </td>
                    <td><span className={`badge ${a.status}`}>{a.status}</span></td>
                    <td>{new Date(a.triggered_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
