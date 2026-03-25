// src/pages/History.jsx
import { useState, useEffect } from "react";
import { useAuth, API_BASE } from "../App";

const RC = { Low: "#10b981", Moderate: "#f59e0b", High: "#ef4444" };

function Tab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`btn px-4 py-2 rounded-pill fw-semibold ${active ? "btn-success" : "btn-outline-light"}`}
    >
      {children}
    </button>
  );
}

function fatColor(g) {
  return g > 20 ? "#ef4444" : g > 10 ? "#f59e0b" : "#10b981";
}

export default function History() {
  const { token } = useAuth();
  const [tab, setTab] = useState("food");
  const [foodLogs, setFoodLogs] = useState([]);
  const [riskHistory, setRiskHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFood = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/mi/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      setFoodLogs(d.fat_trend_30d || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchRisk = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/mi/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRiskHistory(data.history || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (tab === "food") fetchFood();
    else fetchRisk();
  }, [tab]);

  return (
    <div className="container-fluid" style={{ maxWidth: "1280px" }}>
      <div className="mb-5">
        <h1 className="display-6 fw-bold text-white">History</h1>
        <p className="text-white-50">Your food logs and MI risk assessments over time</p>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-3 mb-4 flex-wrap">
        <Tab active={tab === "food"} onClick={() => setTab("food")}>
          <i className="bi bi-utensils me-2"></i>
          Fat Intake Log
        </Tab>
        <Tab active={tab === "risk"} onClick={() => setTab("risk")}>
          <i className="bi bi-heart-pulse me-2"></i>
          MI Risk History
        </Tab>
      </div>

      {/* Food Log Tab */}
      {tab === "food" && (
        <div className="card border-0 shadow-lg" style={{ background: "linear-gradient(145deg,#0d1b2e,#091524)" }}>
          <div className="card-header border-0 bg-transparent d-flex justify-content-between align-items-center p-4">
            <h5 className="mb-0 fw-semibold text-white">Daily Saturated Fat — Last 30 Days</h5>
            <span className="badge bg-success bg-opacity-10 text-success border border-success">
              {foodLogs.length} days logged
            </span>
          </div>

          {loading ? (
            <div className="p-5 text-center">
              <div className="spinner-border text-success mb-3" role="status"></div>
              <div className="text-white-50">Loading food logs...</div>
            </div>
          ) : foodLogs.length === 0 ? (
            <div className="p-5 text-center text-white-50">
              No food logs yet. Go to <span className="text-success">Log Food</span> to get started.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th className="ps-4">Date</th>
                    <th>Total Sat Fat</th>
                    <th>Meals</th>
                    <th className="pe-4">Intake Level</th>
                  </tr>
                </thead>
                <tbody>
                  {foodLogs.slice().reverse().map((row, i) => {
                    const color = fatColor(row.daily_sat_fat);
                    const pct = Math.min((row.daily_sat_fat / 30) * 100, 100);

                    return (
                      <tr key={i}>
                        <td className="ps-4 fw-medium">{row.date}</td>
                        <td>
                          <span className="fw-bold fs-5" style={{ color }}>
                            {row.daily_sat_fat.toFixed(2)}
                            <span className="fs-6 fw-normal opacity-50 ms-1">g</span>
                          </span>
                        </td>
                        <td className="text-white-50">{row.meal_count}</td>
                        <td className="pe-4">
                          <div className="d-flex align-items-center gap-3">
                            <div className="flex-grow-1">
                              <div className="progress" style={{ height: "7px" }}>
                                <div
                                  className="progress-bar"
                                  style={{ width: `${pct}%`, backgroundColor: color }}
                                ></div>
                              </div>
                            </div>
                            <span
                              className="badge rounded-pill px-3 py-1"
                              style={{
                                backgroundColor: `${color}22`,
                                color: color,
                                border: `1px solid ${color}44`,
                              }}
                            >
                              {row.daily_sat_fat > 20 ? "High" : row.daily_sat_fat > 10 ? "Moderate" : "Low"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MI Risk History Tab */}
      {tab === "risk" && (
        <div className="card border-0 shadow-lg" style={{ background: "linear-gradient(145deg,#0d1b2e,#091524)" }}>
          <div className="card-header border-0 bg-transparent d-flex justify-content-between align-items-center p-4">
            <h5 className="mb-0 fw-semibold text-white">MI Risk Assessments — Last 30 Days</h5>
            <span className="badge bg-success bg-opacity-10 text-success border border-success">
              {riskHistory.length} assessments
            </span>
          </div>

          {loading ? (
            <div className="p-5 text-center">
              <div className="spinner-border text-success mb-3" role="status"></div>
              <div className="text-white-50">Loading risk history...</div>
            </div>
          ) : riskHistory.length === 0 ? (
            <div className="p-5 text-center text-white-50">
              No assessments yet. Go to <span className="text-success">MI Risk Check</span> to run your first one.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th className="ps-4">Date</th>
                    <th>Risk Level</th>
                    <th>Score</th>
                    <th>Fat (g)</th>
                    <th>7d Avg</th>
                    <th>Cholesterol</th>
                    <th>BMI</th>
                    <th>Systolic</th>
                    <th className="pe-4">Diastolic</th>
                  </tr>
                </thead>
                <tbody>
                  {riskHistory.map((row, i) => {
                    const cat = row.mi_risk_category;
                    return (
                      <tr key={i}>
                        <td className="ps-4 fw-medium">{row.date}</td>
                        <td>
                          <span
                            className="badge rounded-pill px-3 py-1"
                            style={{
                              background: `${RC[cat]}22`,
                              color: RC[cat],
                              border: `1px solid ${RC[cat]}44`,
                            }}
                          >
                            {cat}
                          </span>
                        </td>
                        <td className="fw-bold fs-5" style={{ color: RC[cat] }}>
                          {row.mi_risk_pct?.toFixed(1)}
                          <span className="fs-6 fw-normal opacity-50">%</span>
                        </td>
                        <td className="text-success fw-semibold">{row.fat_g?.toFixed(1)}</td>
                        <td className="text-white-50">{row.avg_fat_7d?.toFixed(1) ?? "—"}</td>
                        <td className="text-white-50">{row.cholesterol}</td>
                        <td className="text-white-50">{row.bmi?.toFixed(1)}</td>
                        <td className="text-white-50">{row.systolic}</td>
                        <td className="pe-4 text-white-50">{row.diastolic}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}