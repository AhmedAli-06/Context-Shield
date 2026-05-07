import { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, FileJson, Calendar, Clock, Loader2, CheckCircle, BarChart3, PieChart } from "lucide-react";
import { exportEventsCsv, exportEventsJson, getEvents } from "../api";
import toast from "react-hot-toast";

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function ReportsPage() {
  const [hours, setHours] = useState(24);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingJson, setExportingJson] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);
  const [eventCount, setEventCount] = useState<number | null>(null);

  const handleExportCsv = async () => {
    setExportingCsv(true);
    try {
      const res = await exportEventsCsv(hours);
      const blob = new Blob([res.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contextshield-events-${hours}h.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setLastExport(`CSV export (last ${hours}h)`);
      toast.success("CSV report downloaded");
    } catch {
      toast.error("Failed to export CSV");
    } finally {
      setExportingCsv(false);
    }
  };

  const handleExportJson = async () => {
    setExportingJson(true);
    try {
      const res = await exportEventsJson(hours);
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contextshield-events-${hours}h.json`;
      a.click();
      URL.revokeObjectURL(url);
      setLastExport(`JSON export (last ${hours}h)`);
      toast.success("JSON report downloaded");
    } catch {
      toast.error("Failed to export JSON");
    } finally {
      setExportingJson(false);
    }
  };

  const countEvents = async () => {
    try {
      const res = await getEvents(1);
      const total = res.data?.total || res.data?.length || 0;
      setEventCount(total);
      toast.success(`Found ${total} events in current view`);
    } catch {
      toast.error("Could not fetch event count");
    }
  };

  const presets = [1, 6, 12, 24, 48, 168];

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      <motion.div className="page-header" variants={item}>
        <h2>Reports</h2>
        <p>Export security events and generate reports</p>
      </motion.div>

      <div className="grid-2">
        <motion.div variants={item}>
          <div className="card">
            <div className="card-header">
              <h3><Download size={14} style={{ marginRight: 8 }} /> Export Events</h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label>Time range</label>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {presets.map((h) => (
                    <button
                      key={h}
                      className={`btn btn-sm ${hours === h ? "btn-primary" : "btn-ghost"}`}
                      onClick={() => setHours(h)}
                    >
                      {h >= 24 ? `${h / 24}d` : `${h}h`}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "var(--space-xl)" }}>
                <button className="btn btn-primary" onClick={handleExportCsv} disabled={exportingCsv} style={{ flex: 1 }}>
                  {exportingCsv ? <Loader2 size={14} className="spinning" /> : <FileText size={14} />}
                  {exportingCsv ? "Exporting..." : "Export CSV"}
                </button>
                <button className="btn btn-ghost" onClick={handleExportJson} disabled={exportingJson} style={{ flex: 1 }}>
                  {exportingJson ? <Loader2 size={14} className="spinning" /> : <FileJson size={14} />}
                  {exportingJson ? "Exporting..." : "Export JSON"}
                </button>
              </div>

              {lastExport && (
                <div style={{ marginTop: "var(--space-lg)", display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--accent-green)" }}>
                  <CheckCircle size={12} />
                  Last export: {lastExport}
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ marginTop: "var(--space-xl)" }}>
            <div className="card-header">
              <h3><BarChart3 size={14} style={{ marginRight: 8 }} /> Event Summary</h3>
            </div>
            <div className="card-body">
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "12px",
                  background: "rgba(59, 158, 255, 0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <PieChart size={22} style={{ color: "var(--accent-blue)" }} />
                </div>
                <div>
                  <div style={{ fontSize: "13px", color: "var(--charcoal)", fontWeight: 500 }}>Quick count</div>
                  <div style={{ fontSize: "12px", color: "var(--stone)" }}>
                    {eventCount !== null ? `${eventCount} events in current range` : "Click to count events"}
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={countEvents}>
                  Count
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <div className="card">
            <div className="card-header">
              <h3><Calendar size={14} style={{ marginRight: 8 }} /> Scheduled Reports</h3>
            </div>
            <div className="card-body">
              <div className="settings-row">
                <div className="settings-row-info">
                  <h4>Daily summary</h4>
                  <p>Receive a daily CSV report at 08:00</p>
                </div>
                <div className="toggle">
                  <div className="toggle-knob" />
                </div>
              </div>
              <div className="settings-row">
                <div className="settings-row-info">
                  <h4>Weekly digest</h4>
                  <p>Comprehensive weekly JSON report every Monday</p>
                </div>
                <div className="toggle">
                  <div className="toggle-knob" />
                </div>
              </div>
              <div className="settings-row">
                <div className="settings-row-info">
                  <h4>Alert-triggered</h4>
                  <p>Auto-export when critical alerts are triggered</p>
                </div>
                <div className="toggle active">
                  <div className="toggle-knob" />
                </div>
              </div>
            </div>
            <div className="card-footer" style={{ textAlign: "center" }}>
              <span style={{ fontSize: "12px", color: "var(--stone)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <Clock size={12} /> Scheduled reports coming in v0.3
              </span>
            </div>
          </div>

          <div className="card" style={{ marginTop: "var(--space-xl)" }}>
            <div className="card-header">
              <h3>Export History</h3>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div style={{ padding: "var(--space-xl)", textAlign: "center" }}>
                <Download size={24} style={{ color: "var(--stone)", opacity: 0.4, marginBottom: "8px" }} />
                <p style={{ fontSize: "13px", color: "var(--stone)" }}>No exports yet today</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
