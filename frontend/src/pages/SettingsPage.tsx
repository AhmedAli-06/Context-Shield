import { useEffect, useState } from "react";
import { getSettings, updateSettings, getApiKeys, createApiKey, deleteApiKey } from "../api";
import { Save, Plus, Trash2, Copy } from "lucide-react";

interface Settings {
  weight_identity: number;
  weight_temporal: number;
  weight_project: number;
  weight_role: number;
  weight_anomaly: number;
  default_alert_threshold: number;
  default_revocation_threshold: number;
  session_timeout_minutes: number;
}

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string | null;
  is_active: boolean;
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyResult, setNewKeyResult] = useState<string | null>(null);
  const [tab, setTab] = useState<"weights" | "keys">("weights");

  useEffect(() => {
    Promise.all([getSettings(), getApiKeys()])
      .then(([s, k]) => {
        setSettings(s.data);
        setApiKeys(k.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await updateSettings(settings as unknown as Record<string, unknown>);
      setSettings(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    try {
      const res = await createApiKey(newKeyName);
      setApiKeys((prev) => [...prev, res.data]);
      setNewKeyResult(res.data.raw_key);
      setNewKeyName("");
    } catch { }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      await deleteApiKey(id);
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
    } catch { }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Settings</h2>
        <p>Configure trust score weights, thresholds, and API access</p>
      </div>

      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        {(["weights", "keys"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="btn-primary"
            style={{
              width: "auto", padding: "8px 16px", fontSize: 12,
              background: tab === t ? "var(--accent)" : "var(--bg-card)",
              border: `1px solid ${tab === t ? "var(--accent)" : "var(--border)"}`,
              textTransform: "capitalize",
            }}
          >
            {t === "weights" ? "Trust Weights" : "API Keys"}
          </button>
        ))}
      </div>

      {tab === "weights" && settings && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Trust Score Weights</h3>
            <button onClick={handleSave} className="btn-primary" disabled={saving} style={{ width: "auto", padding: "8px 20px", display: "flex", alignItems: "center", gap: 6 }}>
              <Save size={14} /> {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </button>
          </div>

          {([
            { key: "weight_identity", label: "Identity Confidence", desc: "Weight for credential validity and user status" },
            { key: "weight_temporal", label: "Temporal Context", desc: "Weight for time-of-day vs baseline patterns" },
            { key: "weight_project", label: "Project Relevance", desc: "Weight for user-asset-project authorization" },
            { key: "weight_role", label: "Role Match", desc: "Weight for role-based access level" },
            { key: "weight_anomaly", label: "Anomaly Score", desc: "Weight for deviation from learned baseline" },
          ] as const).map(({ key, label, desc }) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>{label}</label>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>
                  {((settings[key] as number) * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings[key] as number}
                onChange={(e) => setSettings({ ...settings, [key]: parseFloat(e.target.value) })}
                style={{ width: "100%", accentColor: "var(--accent)" }}
              />
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{desc}</p>
            </div>
          ))}

          <hr style={{ borderColor: "var(--border)", margin: "20px 0" }} />

          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Thresholds</h3>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>Alert Threshold</label>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--warning)" }}>
                {((settings.default_alert_threshold ?? 0.4) * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range" min="0" max="1" step="0.05"
              value={settings.default_alert_threshold}
              onChange={(e) => setSettings({ ...settings, default_alert_threshold: parseFloat(e.target.value) })}
              style={{ width: "100%", accentColor: "var(--warning)" }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>Revocation Threshold</label>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--danger)" }}>
                {((settings.default_revocation_threshold ?? 0.2) * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range" min="0" max="1" step="0.05"
              value={settings.default_revocation_threshold}
              onChange={(e) => setSettings({ ...settings, default_revocation_threshold: parseFloat(e.target.value) })}
              style={{ width: "100%", accentColor: "var(--danger)" }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              value={settings.session_timeout_minutes}
              onChange={(e) => setSettings({ ...settings, session_timeout_minutes: parseInt(e.target.value) || 480 })}
              style={{
                width: 120, padding: "8px 12px", background: "var(--bg-input)",
                border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
                color: "var(--text-primary)", fontSize: 14,
              }}
            />
          </div>
        </div>
      )}

      {tab === "keys" && (
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>API Keys</h3>

          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <input
              type="text"
              placeholder="New API key name..."
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              style={{
                flex: 1, padding: "8px 12px", background: "var(--bg-input)",
                border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
                color: "var(--text-primary)", fontSize: 14,
              }}
              onKeyDown={(e) => e.key === "Enter" && handleCreateKey()}
            />
            <button onClick={handleCreateKey} className="btn-primary" style={{ width: "auto", padding: "8px 16px", display: "flex", alignItems: "center", gap: 6 }}>
              <Plus size={14} /> Create Key
            </button>
          </div>

          {newKeyResult && (
            <div style={{
              padding: 12, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: "var(--radius-sm)", marginBottom: 16, fontSize: 13,
            }}>
              <strong style={{ color: "var(--success)" }}>Key created!</strong> Copy it now — it won't be shown again.
              <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                <code style={{ flex: 1, padding: "6px 10px", background: "var(--bg-input)", borderRadius: 4, fontSize: 12, wordBreak: "break-all" }}>
                  {newKeyResult}
                </code>
                <button
                  onClick={() => { navigator.clipboard.writeText(newKeyResult); }}
                  style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", padding: 4 }}
                  title="Copy to clipboard"
                >
                  <Copy size={14} />
                </button>
              </div>
              <button
                onClick={() => setNewKeyResult(null)}
                style={{ marginTop: 8, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 12, textDecoration: "underline" }}
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Prefix</th>
                  <th>Active</th>
                  <th>Created</th>
                  <th>Last Used</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 32 }}>No API keys created yet</td></tr>
                ) : (
                  apiKeys.map((k) => (
                    <tr key={k.id}>
                      <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{k.name}</td>
                      <td><code style={{ fontSize: 12, padding: "2px 6px", background: "var(--bg-input)", borderRadius: 4 }}>{k.key_prefix}...</code></td>
                      <td>{k.is_active ? "✓" : "—"}</td>
                      <td>{new Date(k.created_at).toLocaleDateString()}</td>
                      <td>{k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : "Never"}</td>
                      <td>
                        <button onClick={() => handleDeleteKey(k.id)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", padding: 4 }} title="Delete key">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
