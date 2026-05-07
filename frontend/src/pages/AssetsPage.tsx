import { useEffect, useState } from "react";
import { getAssets } from "../api";

interface Asset {
  id: string;
  name: string;
  asset_type: string;
  category: string | null;
  location: string | null;
  criticality: string;
  is_monitored: boolean;
  alert_threshold: number;
  created_at: string;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAssets().then((r) => setAssets(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Monitored Assets</h2>
        <p>Physical assets under continuous trust evaluation</p>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Location</th>
                <th>Criticality</th>
                <th>Monitored</th>
                <th>Alert Threshold</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{a.name}</td>
                  <td>{a.asset_type?.replace("_", " ")}</td>
                  <td>{a.location || "—"}</td>
                  <td><span className={`badge ${a.criticality}`}>{a.criticality}</span></td>
                  <td>{a.is_monitored ? "✓" : "—"}</td>
                  <td>{(a.alert_threshold * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
