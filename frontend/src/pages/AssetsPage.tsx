import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Search, Plus, Server, Cpu, Wrench, HardDrive, Box } from "lucide-react";

const api = import.meta.env.VITE_API_URL || "http://localhost:8000";

const assetIcons: Record<string, any> = {
  cnc_machine: Cpu,
  server: Server,
  welding_station: Wrench,
  assembly_line: Box,
  paint_booth: Box,
  forklift: HardDrive,
  press: Wrench,
  robot_arm: Cpu,
  compressor: HardDrive,
};

interface Asset {
  id: string;
  name: string;
  asset_type: string;
  category: string;
  location: string;
  criticality: string;
  status?: string;
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${api}/api/v1/assets/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setAssets(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const filtered = assets.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const criticalCount = assets.filter((a) => a.criticality === "critical").length;
  const highCount = assets.filter((a) => a.criticality === "high").length;
  const onlineCount = assets.filter((a) => a.status !== "offline").length;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      <motion.div className="page-header" variants={item}>
        <h2>Assets</h2>
        <p>Monitor and manage all registered assets ({assets.length} total)</p>
      </motion.div>

      <motion.div className="stats-grid" variants={item}>
        <div className="stat-card">
          <div className="stat-glow" style={{ background: "var(--accent-blue-glow)" }} />
          <div className="stat-label">Total Assets</div>
          <div className="stat-value">{assets.length}</div>
          <div className="stat-change neutral">Across all zones</div>
        </div>
        <div className="stat-card">
          <div className="stat-glow" style={{ background: "var(--accent-red-glow)" }} />
          <div className="stat-label">Critical</div>
          <div className="stat-value">{criticalCount}</div>
          <div className="stat-change down">Requires heightened monitoring</div>
        </div>
        <div className="stat-card">
          <div className="stat-glow" style={{ background: "var(--accent-orange-glow)" }} />
          <div className="stat-label">High Priority</div>
          <div className="stat-value">{highCount}</div>
          <div className="stat-change neutral">Standard monitoring</div>
        </div>
        <div className="stat-card">
          <div className="stat-glow" style={{ background: "var(--accent-green-glow)" }} />
          <div className="stat-label">Online</div>
          <div className="stat-value">{onlineCount}</div>
          <div className="stat-change up">All systems operational</div>
        </div>
      </motion.div>

      <motion.div className="card" variants={item}>
        <div className="card-header">
          <h3>All Assets</h3>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--stone)", pointerEvents: "none" }} />
              <input
                className="form-input"
                style={{ width: "200px", paddingLeft: "32px" }}
                placeholder="Search assets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-primary">
              <Plus size={14} /> Add Asset
            </button>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <Shield size={32} />
              <h4>No assets found</h4>
              <p>Try adjusting your search or add a new asset.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Criticality</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((asset) => {
                    const Icon = assetIcons[asset.asset_type] || Shield;
                    return (
                      <tr key={asset.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: "6px",
                              background: "var(--surface-elevated)",
                              border: "1px solid var(--hairline-strong)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              <Icon size={13} style={{ color: "var(--charcoal)" }} />
                            </div>
                            <span style={{ fontWeight: 500, color: "var(--charcoal)" }}>{asset.name}</span>
                          </div>
                        </td>
                        <td style={{ textTransform: "capitalize" }}>{asset.asset_type.replace(/_/g, " ")}</td>
                        <td style={{ textTransform: "capitalize" }}>{asset.category}</td>
                        <td>{asset.location}</td>
                        <td>
                          <span className={`badge ${asset.criticality}`}>
                            <span className="badge-dot" />
                            {asset.criticality}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${asset.status === "offline" ? "denied" : "allow"}`}>
                            <span className="badge-dot" />
                            {asset.status || "active"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
