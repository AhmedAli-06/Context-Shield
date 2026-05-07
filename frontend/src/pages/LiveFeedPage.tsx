import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Radio, Activity, Circle, AlertTriangle,
  CheckCircle, XCircle, Zap,
} from "lucide-react";
import { EmptyState } from "../components/EmptyState";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws/live";

interface LiveEvent {
  id: string;
  event_type: string;
  user_name?: string;
  asset_name?: string;
  decision: string;
  trust_score: number;
  occurred_at: string;
  details?: string;
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.03, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
};

const trustColor = (v: number) =>
  v >= 0.7 ? "var(--accent-green)" : v >= 0.4 ? "var(--accent-yellow)" : "var(--accent-red)";

const decisionIcon = (d: string) => {
  switch (d) {
    case "granted": return CheckCircle;
    case "denied": return XCircle;
    case "alert": return AlertTriangle;
    default: return Activity;
  }
};

export default function LiveFeedPage() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [filter, setFilter] = useState("all");
  const wsRef = useRef<WebSocket | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        reconnectTimer = setTimeout(connect, 3000);
      };
      ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
          const event: LiveEvent = {
            id: data.id || crypto.randomUUID(),
            event_type: data.event_type || data.type || "unknown",
            user_name: data.user_name,
            asset_name: data.asset_name,
            decision: data.decision || "unknown",
            trust_score: data.trust_score ?? 0.5,
            occurred_at: data.occurred_at || data.timestamp || new Date().toISOString(),
            details: data.details || data.reason,
          };
          setEvents((prev) => [event, ...prev].slice(0, 200));
        } catch {
          setEvents((prev) => [
            {
              id: crypto.randomUUID(),
              event_type: "raw",
              decision: "info",
              trust_score: 0.5,
              occurred_at: new Date().toISOString(),
              details: msg.data,
            },
            ...prev,
          ].slice(0, 200));
        }
      };
    };

    connect();

    return () => {
      ws?.close();
      clearTimeout(reconnectTimer);
    };
  }, []);

  const filtered = filter === "all"
    ? events
    : events.filter((e) => e.decision === filter);

  const stats = {
    granted: events.filter((e) => e.decision === "granted").length,
    denied: events.filter((e) => e.decision === "denied").length,
    alert: events.filter((e) => e.decision === "alert").length,
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      <motion.div className="page-header" variants={item}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2>Live Feed</h2>
            <p>Real-time event stream from WebSocket</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className={`badge ${connected ? "allow" : "denied"}`}>
              <span className="badge-dot" />
              {connected ? "Connected" : "Disconnected"}
            </span>
            <span style={{ fontSize: "12px", color: "var(--stone)", fontFamily: "var(--font-mono)" }}>
              {events.length} events
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div className="stats-grid" variants={item}>
        <div className="stat-card">
          <div className="stat-glow" style={{ background: "var(--accent-green-glow)" }} />
          <div className="stat-label">Granted</div>
          <div className="stat-value">{stats.granted}</div>
          <div className="stat-change up">Access approved</div>
        </div>
        <div className="stat-card">
          <div className="stat-glow" style={{ background: "var(--accent-red-glow)" }} />
          <div className="stat-label">Denied</div>
          <div className="stat-value">{stats.denied}</div>
          <div className="stat-change down">Access rejected</div>
        </div>
        <div className="stat-card">
          <div className="stat-glow" style={{ background: "var(--accent-yellow-glow)" }} />
          <div className="stat-label">Alerts</div>
          <div className="stat-value">{stats.alert}</div>
          <div className="stat-change neutral">Requires attention</div>
        </div>
        <div className="stat-card">
          <div className="stat-glow" style={{ background: connected ? "var(--accent-green-glow)" : "var(--accent-red-glow)" }} />
          <div className="stat-label">Connection</div>
          <div className="stat-value" style={{ fontSize: "14px", fontFamily: "var(--font-mono)" }}>
            {connected ? "● Live" : "○ Offline"}
          </div>
          <div className="stat-change neutral">
            {connected ? "Receiving events" : "Reconnecting in 3s..."}
          </div>
        </div>
      </motion.div>

      <motion.div className="card" variants={item}>
        <div className="card-header">
          <h3><Zap size={14} style={{ marginRight: 8, color: connected ? "var(--accent-green)" : "var(--stone)" }} /> Event Stream</h3>
          <div style={{ display: "flex", gap: "6px" }}>
            {["all", "granted", "denied", "alert"].map((f) => (
              <button
                key={f}
                className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
            <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEvents([])} title="Clear feed">
              <Circle size={12} />
            </button>
          </div>
        </div>
        <div className="live-feed" ref={listRef}>
          {filtered.length === 0 ? (
            <EmptyState icon={Radio} title="Waiting for events" description={connected ? "Events will appear here in real-time as they stream from the server." : "Connecting to WebSocket server..."} />
          ) : (
            filtered.map((ev) => {
              const Icon = decisionIcon(ev.decision);
              const iconColor = ev.decision === "granted" ? "var(--accent-green)"
                : ev.decision === "denied" ? "var(--accent-red)"
                : "var(--accent-yellow)";

              return (
                <motion.div
                  key={ev.id}
                  className="live-event"
                  initial={{ opacity: 0, x: -8, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="live-event-indicator" style={{ background: iconColor }} />
                  <div className="live-event-icon" style={{ color: iconColor }}>
                    <Icon size={14} />
                  </div>
                  <div className="live-event-info">
                    <div className="live-event-top">
                      <span className="live-event-type">{ev.event_type.replace(/_/g, " ")}</span>
                      <span className={`badge ${ev.decision}`} style={{ fontSize: "10px", padding: "1px 6px" }}>
                        <span className="badge-dot" />
                        {ev.decision}
                      </span>
                    </div>
                    <div className="live-event-detail">
                      {ev.user_name && <span>{ev.user_name}</span>}
                      {ev.asset_name && <span>→ {ev.asset_name}</span>}
                      {ev.details && <span className="live-event-extra">· {ev.details}</span>}
                    </div>
                    <div className="live-event-meta">
                      <div className="trust-score">
                        <div className="trust-bar">
                          <div className="trust-bar-fill" style={{ width: `${(ev.trust_score * 100).toFixed(0)}%`, background: trustColor(ev.trust_score) }} />
                        </div>
                        <span className="trust-value" style={{ color: trustColor(ev.trust_score), fontSize: "11px" }}>
                          {(ev.trust_score * 100).toFixed(0)}
                        </span>
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--stone)" }}>
                        {new Date(ev.occurred_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
