// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useAuth, API_BASE } from "../App";

const RISK_COLOR = { Low: "#10b981", Moderate: "#f59e0b", High: "#ef4444" };
const RISK_BG    = { Low: "#d1fae5", Moderate: "#fef3c7", High: "#fee2e2" };

function StatCard({ label, value, unit, sub, color = "#1e3a5f" }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 12, padding: "20px 24px",
      border: "1px solid #e2e8f0", flex: 1, minWidth: 160,
    }}>
      <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: .5 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>
        {value ?? "—"}
        {unit && <span style={{ fontSize: 14, fontWeight: 400, marginLeft: 4, color: "#94a3b8" }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function MiniBar({ label, value, max }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
        <span style={{ color: "#374151", fontWeight: 500 }}>{label}</span>
        <span style={{ color: "#6b7280" }}>{value.toFixed(1)} g</span>
      </div>
      <div style={{ height: 6, background: "#e2e8f0", borderRadius: 4 }}>
        <div style={{ width: `${pct}%`, height: 6, background: "#3b82f6", borderRadius: 4, transition: "width .6s" }} />
      </div>
    </div>
  );
}

function FatChart({ trend }) {
  if (!trend || trend.length === 0) return (
    <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 13 }}>
      No food logs yet
    </div>
  );
  const max   = Math.max(...trend.map(d => d.daily_sat_fat), 1);
  const W     = 420, H = 110, pad = 24;
  const pts   = trend.map((d, i) => {
    const x = pad + (i / Math.max(trend.length - 1, 1)) * (W - pad * 2);
    const y = H - pad - ((d.daily_sat_fat / max) * (H - pad * 2));
    return `${x},${y}`;
  });
  const pathD = `M ${pts.join(" L ")}`;
  const areaD = `M ${pts[0]} L ${pts.join(" L ")} L ${pts[pts.length-1].split(",")[0]},${H-pad} L ${pts[0].split(",")[0]},${H-pad} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 110 }}>
      <defs>
        <linearGradient id="fatGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#fatGrad)" />
      <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {trend.map((d, i) => {
        const [x, y] = pts[i].split(",").map(Number);
        return <circle key={i} cx={x} cy={y} r={3} fill="#3b82f6" />;
      })}
      <text x={pad} y={H - 6} fontSize="9" fill="#94a3b8">
        {trend[0]?.date?.slice(5)}
      </text>
      <text x={W - pad} y={H - 6} fontSize="9" fill="#94a3b8" textAnchor="end">
        {trend[trend.length - 1]?.date?.slice(5)}
      </text>
    </svg>
  );
}

export default function Dashboard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/mi/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
      <div style={{ color: "#94a3b8", fontSize: 14 }}>Loading dashboard…</div>
    </div>
  );

  const risk = data?.latest_mi_risk;

  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ margin: "0 0 4px", color: "#0f172a", fontSize: 22, fontWeight: 700 }}>Dashboard</h1>
      <p style={{ margin: "0 0 28px", color: "#64748b", fontSize: 13 }}>Your daily fat intake and MI risk overview</p>

      {/* Stat row */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard
          label="Today's Sat Fat"
          value={data?.today_sat_fat_g?.toFixed(1)}
          unit="g"
          sub="Saturated fat logged today"
          color="#1e3a5f"
        />
        <StatCard
          label="7-Day Avg"
          value={data?.avg_7d_sat_fat_g?.toFixed(1) ?? "—"}
          unit="g/day"
          sub="Rolling weekly average"
          color="#2563eb"
        />
        <StatCard
          label="30-Day Avg"
          value={data?.avg_30d_sat_fat_g?.toFixed(1) ?? "—"}
          unit="g/day"
          sub="Monthly average"
          color="#7c3aed"
        />
        <StatCard
          label="Meals Logged"
          value={data?.total_meals}
          sub={`across ${data?.active_days} active days`}
          color="#0f766e"
        />
      </div>

      {/* MI risk + fat chart row */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>

        {/* MI Risk card */}
        <div style={{
          background: "#fff", borderRadius: 12, padding: "24px", border: "1px solid #e2e8f0",
          minWidth: 200, flex: "0 0 220px",
        }}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 16, textTransform: "uppercase", letterSpacing: .5 }}>
            Latest MI Risk
          </div>
          {risk?.category ? (
            <>
              <div style={{
                display: "inline-block", padding: "4px 14px", borderRadius: 20,
                background: RISK_BG[risk.category], color: RISK_COLOR[risk.category],
                fontWeight: 700, fontSize: 13, marginBottom: 12,
              }}>
                {risk.category}
              </div>
              <div style={{ fontSize: 38, fontWeight: 800, color: RISK_COLOR[risk.category], lineHeight: 1, marginBottom: 8 }}>
                {risk.percentage?.toFixed(0)}
                <span style={{ fontSize: 18, fontWeight: 400, color: "#94a3b8" }}>%</span>
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>Assessed {risk.date}</div>
            </>
          ) : (
            <div style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6 }}>
              No assessment yet.<br />Go to <strong>MI Risk Check</strong> to get started.
            </div>
          )}
        </div>

        {/* Fat trend chart */}
        <div style={{
          background: "#fff", borderRadius: 12, padding: "24px", border: "1px solid #e2e8f0", flex: 1, minWidth: 280,
        }}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: .5 }}>
            30-Day Saturated Fat Trend
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 14 }}>Daily total (g)</div>
          <FatChart trend={data?.fat_trend_30d} />
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>

        {/* Top foods */}
        <div style={{
          background: "#fff", borderRadius: 12, padding: "24px", border: "1px solid #e2e8f0", flex: 1, minWidth: 240,
        }}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 16, textTransform: "uppercase", letterSpacing: .5 }}>
            Top Foods (30 days)
          </div>
          {data?.top_foods?.length
            ? data.top_foods.map((f, i) => (
                <MiniBar
                  key={i}
                  label={`${f.food} ×${f.frequency}`}
                  value={f.avg_sat_fat}
                  max={Math.max(...data.top_foods.map(x => x.avg_sat_fat), 1)}
                />
              ))
            : <div style={{ color: "#94a3b8", fontSize: 13 }}>Log food to see breakdown</div>
          }
        </div>

        {/* Recent logs */}
        <div style={{
          background: "#fff", borderRadius: 12, padding: "24px", border: "1px solid #e2e8f0", flex: 1, minWidth: 240,
        }}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 16, textTransform: "uppercase", letterSpacing: .5 }}>
            Recent Meals
          </div>
          {data?.recent_foods?.length
            ? data.recent_foods.map((f, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 0", borderBottom: i < data.recent_foods.length - 1 ? "1px solid #f1f5f9" : "none",
                }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13, color: "#1e293b" }}>{f.food}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{f.method} · {f.weight_g}g · {f.date}</div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#3b82f6" }}>{f.sat_fat_g.toFixed(2)}g</div>
                </div>
              ))
            : <div style={{ color: "#94a3b8", fontSize: 13 }}>No meals logged yet</div>
          }
        </div>
      </div>
    </div>
  );
}