import { useEffect, useState } from "react";
import { getEvents } from "../api";

interface Event {
  id: string;
  user_id: string;
  asset_id: string;
  event_type: string;
  occurred_at: string;
  trust_score: number | null;
  decision: string | null;
  decision_reason: string | null;
}

function trustColor(s: number | null) {
  if (s === null) return "#64748b";
  if (s >= 0.7) return "#10b981";
  if (s >= 0.4) return "#f59e0b";
  return "#ef4444";
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents(100).then((r) => setEvents(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Access Events</h2>
        <p>Full audit trail of access attempts with trust scoring</p>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Trust Score</th>
                <th>Decision</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id}>
                  <td>{new Date(ev.occurred_at).toLocaleString()}</td>
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
                        {ev.trust_score !== null ? `${(ev.trust_score * 100).toFixed(1)}%` : "—"}
                      </span>
                    </div>
                  </td>
                  <td><span className={`badge ${ev.decision}`}>{ev.decision || "—"}</span></td>
                  <td style={{ maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-muted)" }}>
                    {ev.decision_reason || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
