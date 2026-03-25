// src/pages/History.jsx
import { useState, useEffect } from "react";
import { useAuth, API_BASE } from "../App";

// ── Palette tokens (matches full app) ──────────────────────────
const P = {
  card:   "linear-gradient(145deg,#0d1b2e,#091524)",
  border: "rgba(255,255,255,0.08)",
  text:   "#fff",
  sub:    "rgba(255,255,255,0.38)",
  label:  "rgba(255,255,255,0.42)",
  accent: "#0ec3af",
  accent2:"#6366f1",
  row:    "rgba(255,255,255,0.03)",
  rowHov: "rgba(14,195,175,0.05)",
  divider:"rgba(255,255,255,0.05)",
};
const RC = { Low: "#10b981", Moderate: "#f59e0b", High: "#ef4444" };
const RB = { Low:"rgba(16,185,129,0.14)", Moderate:"rgba(245,158,11,0.14)", High:"rgba(239,68,68,0.14)" };

function Tab({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 22px", borderRadius: 10, border: "none", cursor: "pointer",
      fontWeight: active ? 700 : 400, fontSize: 13,
      background: active
        ? "linear-gradient(135deg,rgba(14,195,175,0.18),rgba(99,102,241,0.1))"
        : "transparent",
      color:  active ? P.accent : P.sub,
      border: active ? "1px solid rgba(14,195,175,0.22)" : "1px solid transparent",
      transition: "all .18s",
    }}>
      {children}
    </button>
  );
}

/* Fat level colour based on daily total */
function fatColor(g) {
  return g > 20 ? "#ef4444" : g > 10 ? "#f59e0b" : "#10b981";
}

export default function History() {
  const { token } = useAuth();
  const [tab, setTab]                 = useState("food");
  const [foodLogs, setFoodLogs]       = useState([]);
  const [riskHistory, setRiskHistory] = useState([]);
  const [loading, setLoading]         = useState(false);

  const fetchFood = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/mi/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      setFoodLogs(d.fat_trend_30d || []);
    } catch {}
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
    if (tab === "food") fetchFood(); else fetchRisk();
  }, [tab]);

  const Spinner = () => (
    <div style={{ display:"flex", alignItems:"center", gap:10, color:P.sub, fontSize:13, padding:32 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P.accent} strokeWidth="2.5"
        style={{ animation:"spin .8s linear infinite" }}>
        <circle cx="12" cy="12" r="10" opacity=".2"/><path d="M12 2a10 10 0 0 1 10 10"/>
      </svg>
      Loading…
    </div>
  );

  return (
    <div style={{ width:"100%", fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes fadein{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .tr:hover{background:rgba(14,195,175,0.04)!important;}
        .tr{transition:background .15s!important;}
      `}</style>

      {/* Header */}
      <div style={{ marginBottom:24, animation:"fadein .4s ease" }}>
        <h1 style={{ margin:"0 0 4px", fontSize:24, fontWeight:800, color:P.text, letterSpacing:-0.5 }}>
          History
        </h1>
        <p style={{ margin:0, color:P.sub, fontSize:13 }}>
          Your food logs and MI risk assessments over time
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:20,
        background:"rgba(255,255,255,0.04)", padding:4,
        borderRadius:12, width:"fit-content",
        border:"1px solid rgba(255,255,255,0.06)" }}>
        <Tab active={tab==="food"} onClick={()=>setTab("food")}>🍽 Fat Intake Log</Tab>
        <Tab active={tab==="risk"} onClick={()=>setTab("risk")}>❤️ MI Risk History</Tab>
      </div>

      {/* ── Food log table ────────────────────────────────────── */}
      {tab === "food" && (
        <div style={{ background:P.card, borderRadius:18, border:`1px solid ${P.border}`,
          boxShadow:"0 8px 32px rgba(0,0,0,0.25)", overflow:"hidden",
          animation:"fadein .3s ease" }}>
          <div style={{ padding:"18px 24px", borderBottom:`1px solid ${P.divider}`,
            display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontSize:14, fontWeight:700, color:P.text }}>
              Daily saturated fat — last 30 days
            </div>
            <div style={{ fontSize:11, color:P.sub,
              background:"rgba(14,195,175,0.08)", padding:"4px 10px",
              borderRadius:20, border:"1px solid rgba(14,195,175,0.18)" }}>
              ● {foodLogs.length} days logged
            </div>
          </div>

          {loading ? <Spinner/> : foodLogs.length === 0
            ? <div style={{ padding:40, textAlign:"center", color:P.sub, fontSize:13 }}>
                No food logs yet. Go to <span style={{ color:P.accent }}>Log Food</span> to get started.
              </div>
            : <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                  <thead>
                    <tr style={{ background:"rgba(255,255,255,0.03)" }}>
                      {["Date","Total Sat Fat","Meals","Intake Level"].map(h => (
                        <th key={h} style={{ padding:"11px 22px", textAlign:"left",
                          color:P.label, fontWeight:600, fontSize:11,
                          textTransform:"uppercase", letterSpacing:.5,
                          borderBottom:`1px solid ${P.divider}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {foodLogs.slice().reverse().map((row, i) => {
                      const color = fatColor(row.daily_sat_fat);
                      const pct   = Math.min(row.daily_sat_fat / 30 * 100, 100);
                      return (
                        <tr key={i} className="tr" style={{ borderBottom:`1px solid ${P.divider}` }}>
                          <td style={{ padding:"14px 22px", color:P.text, fontWeight:500 }}>{row.date}</td>
                          <td style={{ padding:"14px 22px" }}>
                            <span style={{ fontWeight:700, color, fontSize:15 }}>
                              {row.daily_sat_fat.toFixed(2)}
                              <span style={{ fontSize:11, fontWeight:400, marginLeft:3, color:P.sub }}>g</span>
                            </span>
                          </td>
                          <td style={{ padding:"14px 22px", color:P.sub }}>{row.meal_count}</td>
                          <td style={{ padding:"14px 22px" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                              <div style={{ flex:1, maxWidth:100, height:5,
                                background:"rgba(255,255,255,0.07)", borderRadius:4 }}>
                                <div style={{ width:`${pct}%`, height:5,
                                  background:color, borderRadius:4,
                                  transition:"width .6s ease" }}/>
                              </div>
                              <span style={{ fontSize:11, color,
                                background:`${color}18`, padding:"2px 9px",
                                borderRadius:12, fontWeight:600,
                                border:`1px solid ${color}33`, whiteSpace:"nowrap" }}>
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
          }
        </div>
      )}

      {/* ── Risk history table ────────────────────────────────── */}
      {tab === "risk" && (
        <div style={{ background:P.card, borderRadius:18, border:`1px solid ${P.border}`,
          boxShadow:"0 8px 32px rgba(0,0,0,0.25)", overflow:"hidden",
          animation:"fadein .3s ease" }}>
          <div style={{ padding:"18px 24px", borderBottom:`1px solid ${P.divider}`,
            display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontSize:14, fontWeight:700, color:P.text }}>
              MI risk assessments — last 30
            </div>
            <div style={{ fontSize:11, color:P.sub,
              background:"rgba(14,195,175,0.08)", padding:"4px 10px",
              borderRadius:20, border:"1px solid rgba(14,195,175,0.18)" }}>
              ● {riskHistory.length} assessments
            </div>
          </div>

          {loading ? <Spinner/> : riskHistory.length === 0
            ? <div style={{ padding:40, textAlign:"center", color:P.sub, fontSize:13 }}>
                No assessments yet. Go to <span style={{ color:P.accent }}>MI Risk Check</span> to run your first.
              </div>
            : <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                  <thead>
                    <tr style={{ background:"rgba(255,255,255,0.03)" }}>
                      {["Date","Risk","Score","Fat (g)","7d Avg","Cholesterol","BMI","Systolic","Diastolic"].map(h => (
                        <th key={h} style={{ padding:"11px 16px", textAlign:"left",
                          color:P.label, fontWeight:600, fontSize:11, whiteSpace:"nowrap",
                          textTransform:"uppercase", letterSpacing:.5,
                          borderBottom:`1px solid ${P.divider}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {riskHistory.map((row, i) => {
                      const cat = row.mi_risk_category;
                      return (
                        <tr key={i} className="tr" style={{ borderBottom:`1px solid ${P.divider}` }}>
                          <td style={{ padding:"13px 16px", color:P.text, whiteSpace:"nowrap", fontWeight:500 }}>
                            {row.date}
                          </td>
                          <td style={{ padding:"13px 16px" }}>
                            <span style={{
                              padding:"3px 12px", borderRadius:20, fontSize:11, fontWeight:700,
                              background:RB[cat], color:RC[cat],
                              border:`1px solid ${RC[cat]}44`, whiteSpace:"nowrap",
                            }}>{cat}</span>
                          </td>
                          <td style={{ padding:"13px 16px", fontWeight:800, fontSize:15, color:RC[cat] }}>
                            {row.mi_risk_pct?.toFixed(1)}
                            <span style={{ fontSize:11, fontWeight:400, color:P.sub }}>%</span>
                          </td>
                          <td style={{ padding:"13px 16px", color:P.accent, fontWeight:600 }}>
                            {row.fat_g?.toFixed(1)}
                          </td>
                          <td style={{ padding:"13px 16px", color:P.sub }}>
                            {row.avg_fat_7d?.toFixed(1) ?? "—"}
                          </td>
                          <td style={{ padding:"13px 16px", color:P.sub }}>{row.cholesterol}</td>
                          <td style={{ padding:"13px 16px", color:P.sub }}>{row.bmi?.toFixed(1)}</td>
                          <td style={{ padding:"13px 16px", color:P.sub }}>{row.systolic}</td>
                          <td style={{ padding:"13px 16px", color:P.sub }}>{row.diastolic}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
          }
        </div>
      )}
    </div>
  );
}