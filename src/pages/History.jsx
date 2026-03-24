// src/pages/History.jsx
import { useState, useEffect } from "react";
import { useAuth, API_BASE } from "../App";

const RISK_COLOR = { Low: "#10b981", Moderate: "#f59e0b", High: "#ef4444" };
const RISK_BG    = { Low: "#d1fae5", Moderate: "#fef3c7", High: "#fee2e2" };

function Tab({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer",
      fontWeight: active ? 600 : 400, fontSize: 13,
      background: active ? "#1e3a5f" : "transparent",
      color:      active ? "#fff"    : "#64748b",
    }}>
      {children}
    </button>
  );
}

export default function History() {
  const { token } = useAuth();
  const [tab, setTab]           = useState("food");
  const [foodLogs, setFoodLogs] = useState([]);
  const [riskHistory, setRiskHistory] = useState([]);
  const [loading, setLoading]   = useState(false);

  const fetchFood = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/food/fat/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}

    // Use dashboard trend for full food history
    const res2 = await fetch(`${API_BASE}/mi/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const d = await res2.json();
    setFoodLogs(d.fat_trend_30d || []);
    setLoading(false);
  };

  const fetchRisk = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/mi/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRiskHistory(data.history || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (tab === "food") fetchFood();
    else                fetchRisk();
  }, [tab]);

  return (
    <div style={{ maxWidth: 760 }}>
      <h1 style={{ margin: "0 0 4px", color: "#0f172a", fontSize: 22, fontWeight: 700 }}>History</h1>
      <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: 13 }}>Your food logs and MI risk assessments over time</p>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, background: "#f1f5f9", padding: 4, borderRadius: 10, width: "fit-content" }}>
        <Tab active={tab === "food"}  onClick={() => setTab("food")}>Fat Intake Log</Tab>
        <Tab active={tab === "risk"}  onClick={() => setTab("risk")}>MI Risk History</Tab>
      </div>

      {loading && <div style={{ color: "#94a3b8", fontSize: 13 }}>Loading…</div>}

      {/* Food log table */}
      {!loading && tab === "food" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", fontSize: 13, color: "#374151", fontWeight: 600 }}>
            Daily saturated fat — last 30 days
          </div>
          {foodLogs.length === 0
            ? <div style={{ padding: 32, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No food logs yet. Go to Log Food to get started.</div>
            : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Date", "Total Sat Fat (g)", "Meals"].map(h => (
                      <th key={h} style={{ padding: "10px 20px", textAlign: "left", color: "#64748b", fontWeight: 600, fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {foodLogs.slice().reverse().map((row, i) => (
                    <tr key={i} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 20px", color: "#374151" }}>{row.date}</td>
                      <td style={{ padding: "12px 20px" }}>
                        <span style={{
                          fontWeight: 600,
                          color: row.daily_sat_fat > 20 ? "#ef4444" : row.daily_sat_fat > 10 ? "#f59e0b" : "#10b981",
                        }}>
                          {row.daily_sat_fat.toFixed(2)}g
                        </span>
                        <div style={{ height: 4, background: "#e2e8f0", borderRadius: 2, marginTop: 4, width: 80 }}>
                          <div style={{
                            height: 4, borderRadius: 2,
                            width: `${Math.min(row.daily_sat_fat / 30 * 100, 100)}%`,
                            background: row.daily_sat_fat > 20 ? "#ef4444" : row.daily_sat_fat > 10 ? "#f59e0b" : "#10b981",
                          }} />
                        </div>
                      </td>
                      <td style={{ padding: "12px 20px", color: "#64748b" }}>{row.meal_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>
      )}

      {/* Risk history table */}
      {!loading && tab === "risk" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", fontSize: 13, color: "#374151", fontWeight: 600 }}>
            MI risk assessments — last 30
          </div>
          {riskHistory.length === 0
            ? <div style={{ padding: 32, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No assessments yet. Go to MI Risk Check to run your first assessment.</div>
            : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Date", "Risk", "Score", "Fat (g)", "7d Avg", "Cholesterol", "BMI"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: "#64748b", fontWeight: 600, fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {riskHistory.map((row, i) => (
                    <tr key={i} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 16px", color: "#374151" }}>{row.date}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600,
                          background: RISK_BG[row.mi_risk_category],
                          color:      RISK_COLOR[row.mi_risk_category],
                        }}>
                          {row.mi_risk_category}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: RISK_COLOR[row.mi_risk_category] }}>
                        {row.mi_risk_pct?.toFixed(1)}%
                      </td>
                      <td style={{ padding: "12px 16px", color: "#64748b" }}>{row.fat_g?.toFixed(1)}</td>
                      <td style={{ padding: "12px 16px", color: "#64748b" }}>{row.avg_fat_7d?.toFixed(1) ?? "—"}</td>
                      <td style={{ padding: "12px 16px", color: "#64748b" }}>{row.cholesterol}</td>
                      <td style={{ padding: "12px 16px", color: "#64748b" }}>{row.bmi?.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>
      )}
    </div>
  );
}