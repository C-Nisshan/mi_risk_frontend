import { useState, useEffect } from "react";
import { useAuth, API_BASE } from "../App";

const RC = { Low: "#10b981", Moderate: "#f59e0b", High: "#ef4444" };

function StatCard({ label, value, unit, sub, accent = "#0ec3af" }) {
  return (
    <div className="card h-100 border-0 shadow-sm" style={{ background: "linear-gradient(145deg,#0d1b2e,#091524)" }}>
      <div className="card-body p-4">
        <div className="text-uppercase small opacity-50 fw-semibold mb-2">{label}</div>
        <div className="display-5 fw-bold text-white mb-1">
          {value ?? "—"}
          {unit && <span className="fs-5 fw-normal opacity-50 ms-1">{unit}</span>}
        </div>
        {sub && <div className="small opacity-50">{sub}</div>}
      </div>
      <div className="card-footer border-0 bg-transparent pt-0 pb-3">
        <div style={{ height: 3, background: `linear-gradient(90deg,${accent},transparent)`, borderRadius: 3 }} />
      </div>
    </div>
  );
}

function MiniBar({ label, value, max }) {
  const pct = Math.min((value / Math.max(max, 0.1)) * 100, 100);
  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between small mb-1">
        <span className="text-white-50">{label}</span>
        <span className="text-success fw-semibold">{value.toFixed(1)}g</span>
      </div>
      <div className="progress" style={{ height: "6px" }}>
        <div className="progress-bar bg-gradient" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#0ec3af,#6366f1)" }} />
      </div>
    </div>
  );
}

function FatChart({ trend }) {
  if (!trend || trend.length === 0) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center">
        <i className="bi bi-graph-up fs-1 opacity-25 mb-3"></i>
        <div className="text-white-50">No food logs yet</div>
      </div>
    );
  }

  // Simple SVG chart (kept as is for now, can be replaced with Chart.js later)
  const max = Math.max(...trend.map(d => d.daily_sat_fat), 1);
  const W = 500, H = 120, pad = 25;
  const pts = trend.map((d, i) => {
    const x = pad + (i / (trend.length - 1)) * (W - pad * 2);
    const y = H - pad - ((d.daily_sat_fat / max) * (H - pad * 2));
    return `${x},${y}`;
  });
  const path = `M ${pts.join(" L ")}`;
  const area = `M ${pts[0]} L ${pts.join(" L ")} L ${pts[pts.length-1].split(",")[0]},${H-pad} L ${pts[0].split(",")[0]},${H-pad} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-100" style={{ height: 130 }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0ec3af" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0ec3af" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#areaGrad)" />
      <path d={path} fill="none" stroke="#0ec3af" strokeWidth="3" strokeLinecap="round" />
      {trend.map((d, i) => {
        const [x, y] = pts[i].split(",").map(Number);
        return <circle key={i} cx={x} cy={y} r="4" fill="#0ec3af" stroke="#060d1a" strokeWidth="2" />;
      })}
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

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border text-success me-3" role="status" />
        Loading dashboard...
      </div>
    );
  }

  const risk = data?.latest_mi_risk;

  return (
    <div className="container-fluid" style={{ maxWidth: "1280px" }}>
      <div className="mb-5">
        <h1 className="display-6 fw-bold text-white">Dashboard</h1>
        <p className="text-white-50">Daily fat intake and MI risk overview</p>
      </div>

      {/* Stats Row */}
      <div className="row g-4 mb-5">
        <div className="col-lg-3 col-md-6">
          <StatCard label="Today's Sat Fat" value={data?.today_sat_fat_g?.toFixed(1)} unit="g" sub="Logged today" />
        </div>
        <div className="col-lg-3 col-md-6">
          <StatCard label="7-Day Average" value={data?.avg_7d_sat_fat_g?.toFixed(1)} unit="g/day" sub="Rolling weekly" accent="#6366f1" />
        </div>
        <div className="col-lg-3 col-md-6">
          <StatCard label="30-Day Average" value={data?.avg_30d_sat_fat_g?.toFixed(1)} unit="g/day" sub="Monthly trend" accent="#8b5cf6" />
        </div>
        <div className="col-lg-3 col-md-6">
          <StatCard label="Meals Logged" value={data?.total_meals} sub={`across ${data?.active_days ?? 0} active days`} />
        </div>
      </div>

      <div className="row g-4">
        {/* Latest MI Risk */}
        <div className="col-lg-4">
          <div className="card h-100 border-0 shadow-sm" style={{ background: "linear-gradient(145deg,#0d1b2e,#091524)" }}>
            <div className="card-body p-4">
              <div className="text-uppercase small opacity-50 fw-semibold mb-3">Latest MI Risk</div>
              {risk?.category ? (
                <>
                  <div className="d-inline-block px-3 py-1 rounded-pill mb-3" style={{ background: "rgba(16,185,129,0.15)", color: RC[risk.category], border: `1px solid ${RC[risk.category]}40` }}>
                    {risk.category}
                  </div>
                  <div className="display-4 fw-bold" style={{ color: RC[risk.category] }}>
                    {risk.percentage?.toFixed(0)}<span className="fs-5 fw-normal opacity-50">%</span>
                  </div>
                  <div className="small text-white-50 mt-2">Assessed {risk.date}</div>
                </>
              ) : (
                <div className="text-white-50 py-4">No assessment yet.<br />Go to <span className="text-success">MI Risk Check</span></div>
              )}
            </div>
          </div>
        </div>

        {/* 30-Day Trend */}
        <div className="col-lg-8">
          <div className="card h-100 border-0 shadow-sm" style={{ background: "linear-gradient(145deg,#0d1b2e,#091524)" }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between mb-4">
                <div>
                  <div className="text-uppercase small opacity-50 fw-semibold">30-Day Sat Fat Trend</div>
                  <div className="small text-white-50">Daily total (g)</div>
                </div>
                <div className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">Last 30 days</div>
              </div>
              <FatChart trend={data?.fat_trend_30d} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="row g-4 mt-4">
        <div className="col-lg-4">
          <div className="card h-100 border-0 shadow-sm" style={{ background: "linear-gradient(145deg,#0d1b2e,#091524)" }}>
            <div className="card-body p-4">
              <div className="text-uppercase small opacity-50 fw-semibold mb-4">Top Foods (30 days)</div>
              {data?.top_foods?.length ? (
                data.top_foods.map((f, i) => (
                  <MiniBar key={i} label={`${f.food} ×${f.frequency}`} value={f.avg_sat_fat} max={Math.max(...data.top_foods.map(x => x.avg_sat_fat), 0.1)} />
                ))
              ) : (
                <div className="text-white-50 py-4">Log food to see your fat breakdown</div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card h-100 border-0 shadow-sm" style={{ background: "linear-gradient(145deg,#0d1b2e,#091524)" }}>
            <div className="card-body p-4">
              <div className="text-uppercase small opacity-50 fw-semibold mb-4">Recent Meals</div>
              {data?.recent_foods?.length ? (
                data.recent_foods.map((f, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center py-3 border-bottom border-light border-opacity-10">
                    <div>
                      <div className="fw-semibold text-white">{f.food}</div>
                      <div className="small text-white-50">{f.method} · {f.weight_g}g · {f.date}</div>
                    </div>
                    <div className="text-success fw-bold">{f.sat_fat_g.toFixed(2)}g</div>
                  </div>
                ))
              ) : (
                <div className="text-white-50 py-4">No meals logged yet.<br />Go to Log Food</div>
              )}
            </div>
          </div>
        </div>

        {data?.risk_trend?.length > 0 && (
          <div className="col-lg-4">
            <div className="card h-100 border-0 shadow-sm" style={{ background: "linear-gradient(145deg,#0d1b2e,#091524)" }}>
              <div className="card-body p-4">
                <div className="text-uppercase small opacity-50 fw-semibold mb-4">Recent Risk Assessments</div>
                {data.risk_trend.slice(0, 5).map((r, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center py-3 border-bottom border-light border-opacity-10">
                    <div className="small text-white-50">{r.date}</div>
                    <div className="d-flex align-items-center gap-3">
                      <span className="badge rounded-pill" style={{ background: "rgba(16,185,129,0.15)", color: RC[r.category], border: `1px solid ${RC[r.category]}40` }}>
                        {r.category}
                      </span>
                      <span className="fw-bold" style={{ color: RC[r.category] }}>{r.risk_pct?.toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}