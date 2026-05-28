import { useState, useEffect } from "react";
import "./AdminPanel.css";

const API = `${import.meta.env.VITE_API_BASE_URL}/api/admin`;

export default function AdminPanel({ currentUser }) {
  const [tab, setTab] = useState("observations");
  const [observations, setObservations] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const headers = {
    "Content-Type": "application/json",
    "x-user-id": String(currentUser.id),
  };

  useEffect(() => {
    if (tab === "observations") fetchObservations();
    if (tab === "logs") fetchLogs();
  }, [tab]);

  async function fetchObservations() {
    setLoading(true);
    const res = await fetch(`${API}/observation-list`, { headers });
    const data = await res.json();
    setObservations(data);
    setLoading(false);
  }

  async function fetchLogs() {
    setLoading(true);
    const res = await fetch(`${API}/logs?limit=200`, { headers });
    const data = await res.json();
    setLogs(data);
    setLoading(false);
  }

  async function handleResolve(id) {
    await fetch(`${API}/observation-list/${id}/resolve`, {
      method: "PATCH",
      headers,
    });
    fetchObservations();
  }

  return (
    <div className="admin-panel">
      <h2 className="admin-title">🛡️ Admin Security Panel</h2>

      <div className="admin-tabs">
        <button
          className={`admin-tab${tab === "observations" ? " active" : ""}`}
          onClick={() => setTab("observations")}
        >
          🚨 Observation List
        </button>
        <button
          className={`admin-tab${tab === "logs" ? " active" : ""}`}
          onClick={() => setTab("logs")}
        >
          📋 Audit Logs
        </button>
      </div>

      {loading && <p className="admin-loading">Loading...</p>}

      {tab === "observations" && !loading && (
        <div className="obs-table-wrap">
          {observations.length === 0 ? (
            <p className="admin-empty">✅ No suspicious users detected.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Reason</th>
                  <th>Trigger</th>
                  <th>Flagged At</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {observations.map((obs) => (
                  <tr key={obs.id} className={obs.resolved ? "resolved" : "flagged"}>
                    <td><strong>{obs.username}</strong></td>
                    <td>{obs.reason}</td>
                    <td><code>{obs.triggerAction}</code></td>
                    <td>{new Date(obs.flaggedAt).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${obs.resolved ? "badge-ok" : "badge-warn"}`}>
                        {obs.resolved ? "Resolved" : "⚠️ Suspicious"}
                      </span>
                    </td>
                    <td>
                      {!obs.resolved && (
                        <button
                          className="resolve-btn"
                          onClick={() => handleResolve(obs.id)}
                        >
                          Mark Resolved
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "logs" && !loading && (
        <div className="obs-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User ID</th>
                <th>Group</th>
                <th>Action</th>
                <th>Details</th>
                <th>IP</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>{log.userId ?? "—"}</td>
                  <td><span className={`badge ${log.groupId === "ADMIN" ? "badge-admin" : "badge-user"}`}>{log.groupId ?? "—"}</span></td>
                  <td><code>{log.action}</code></td>
                  <td className="log-info">{log.actionInfo}</td>
                  <td>{log.ipAddress ?? "—"}</td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}