// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useAuth, API_BASE } from "../App";

const RC = { Low:"#10b981", Moderate:"#f59e0b", High:"#ef4444" };
const RB = { Low:"rgba(16,185,129,0.12)", Moderate:"rgba(245,158,11,0.12)", High:"rgba(239,68,68,0.12)" };

function StatCard({ label, value, unit, sub, accent="#0ec3af" }) {
  return (
    <div style={{ flex:"1 1 180px", minWidth:0,
      background:"linear-gradient(145deg,#0d1b2e,#091524)",
      borderRadius:16, padding:"20px 22px",
      border:"1px solid rgba(255,255,255,0.07)",
      boxShadow:"0 4px 20px rgba(0,0,0,0.25)",
      position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", width:80, height:80, borderRadius:"50%",
        top:-20, right:-20, background:`radial-gradient(circle,${accent}22 0%,transparent 70%)`,
        pointerEvents:"none" }}/>
      <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", fontWeight:600,
        letterSpacing:.6, textTransform:"uppercase", marginBottom:12 }}>{label}</div>
      <div style={{ fontSize:30, fontWeight:800, color:"#fff", lineHeight:1, letterSpacing:-0.5 }}>
        {value ?? "—"}
        {unit && <span style={{ fontSize:14, fontWeight:400, color:"rgba(255,255,255,0.3)", marginLeft:5 }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontSize:11, color:"rgba(255,255,255,0.25)", marginTop:8 }}>{sub}</div>}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2,
        background:`linear-gradient(90deg,${accent},transparent)`, opacity:.4 }}/>
    </div>
  );
}

function MiniBar({ label, value, max }) {
  const pct = Math.min((value / Math.max(max, 0.1)) * 100, 100);
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:5 }}>
        <span style={{ color:"rgba(255,255,255,0.62)", fontWeight:500, textTransform:"capitalize" }}>{label}</span>
        <span style={{ color:"#0ec3af", fontWeight:600 }}>{value.toFixed(1)}g</span>
      </div>
      <div style={{ height:5, background:"rgba(255,255,255,0.07)", borderRadius:4 }}>
        <div style={{ width:`${pct}%`, height:5,
          background:"linear-gradient(90deg,#0ec3af,#6366f1)",
          borderRadius:4, transition:"width .6s ease" }}/>
      </div>
    </div>
  );
}

function FatChart({ trend }) {
  if (!trend || trend.length === 0) return (
    <div style={{ height:120, display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", gap:8 }}>
      <div style={{ fontSize:28, opacity:.2 }}>📈</div>
      <div style={{ color:"rgba(255,255,255,0.2)", fontSize:12 }}>No food logs yet</div>
    </div>
  );
  const max = Math.max(...trend.map(d => d.daily_sat_fat), 1);
  const W = 500, H = 110, pad = 20;
  const pts = trend.map((d, i) => {
    const x = pad + (i / Math.max(trend.length-1,1)) * (W - pad*2);
    const y = H - pad - ((d.daily_sat_fat / max) * (H - pad*2));
    return `${x},${y}`;
  });
  const path = `M ${pts.join(" L ")}`;
  const area = `M ${pts[0]} L ${pts.join(" L ")} L ${pts[pts.length-1].split(",")[0]},${H-pad} L ${pts[0].split(",")[0]},${H-pad} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:110 }}>
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0ec3af" stopOpacity=".2"/>
          <stop offset="100%" stopColor="#0ec3af" stopOpacity=".01"/>
        </linearGradient>
      </defs>
      <path d={area} fill="url(#cg)"/>
      <path d={path} fill="none" stroke="#0ec3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {trend.map((d,i) => {
        const [x,y] = pts[i].split(",").map(Number);
        return <circle key={i} cx={x} cy={y} r={3} fill="#0ec3af" stroke="#060d1a" strokeWidth="1.5"/>;
      })}
      <text x={pad}   y={H-4} fontSize="9" fill="rgba(255,255,255,0.22)">{trend[0]?.date?.slice(5)}</text>
      <text x={W-pad} y={H-4} fontSize="9" fill="rgba(255,255,255,0.22)" textAnchor="end">
        {trend[trend.length-1]?.date?.slice(5)}
      </text>
    </svg>
  );
}

export default function Dashboard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/mi/dashboard`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r=>r.json()).then(setData).catch(console.error).finally(()=>setLoading(false));
  }, [token]);

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:300 }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <div style={{ display:"flex", alignItems:"center", gap:10, color:"rgba(255,255,255,0.3)", fontSize:13 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          style={{ animation:"spin .75s linear infinite" }}>
          <circle cx="12" cy="12" r="10" opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10"/>
        </svg>Loading dashboard…
      </div>
    </div>
  );

  const risk = data?.latest_mi_risk;

  return (
    <div style={{ width:"100%", fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes fadein{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div style={{ marginBottom:28, animation:"fadein .4s ease" }}>
        <h1 style={{ margin:"0 0 4px", fontSize:24, fontWeight:800, color:"#fff", letterSpacing:-0.5 }}>Dashboard</h1>
        <p style={{ margin:0, color:"rgba(255,255,255,0.32)", fontSize:13 }}>Daily fat intake and MI risk overview</p>
      </div>

      {/* Stat row */}
      <div style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:18, animation:"fadein .4s ease .05s both" }}>
        <StatCard label="Today's Sat Fat" value={data?.today_sat_fat_g?.toFixed(1)} unit="g" sub="Logged today" accent="#0ec3af"/>
        <StatCard label="7-Day Average" value={data?.avg_7d_sat_fat_g?.toFixed(1)??"—"} unit="g/day" sub="Rolling weekly" accent="#6366f1"/>
        <StatCard label="30-Day Average" value={data?.avg_30d_sat_fat_g?.toFixed(1)??"—"} unit="g/day" sub="Monthly trend" accent="#8b5cf6"/>
        <StatCard label="Meals Logged" value={data?.total_meals} sub={`across ${data?.active_days??0} active days`} accent="#0ec3af"/>
      </div>

      {/* Risk + chart */}
      <div style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:18, animation:"fadein .4s ease .1s both" }}>
        <div style={{ flex:"0 0 210px", minWidth:0,
          background:"linear-gradient(145deg,#0d1b2e,#091524)", borderRadius:16, padding:"22px",
          border:`1px solid ${risk?.category?RC[risk.category]+"33":"rgba(255,255,255,0.07)"}`,
          boxShadow:"0 4px 20px rgba(0,0,0,0.25)" }}>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.32)", fontWeight:600,
            letterSpacing:.6, textTransform:"uppercase", marginBottom:16 }}>Latest MI Risk</div>
          {risk?.category ? <>
            <div style={{ display:"inline-block", padding:"3px 12px", borderRadius:20,
              background:RB[risk.category], color:RC[risk.category], fontWeight:700, fontSize:12,
              marginBottom:14, border:`1px solid ${RC[risk.category]}44` }}>{risk.category}</div>
            <div style={{ fontSize:44, fontWeight:900, color:RC[risk.category], lineHeight:1, marginBottom:10, letterSpacing:-1 }}>
              {risk.percentage?.toFixed(0)}<span style={{ fontSize:18, fontWeight:400, color:"rgba(255,255,255,0.28)" }}>%</span>
            </div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.22)" }}>Assessed {risk.date}</div>
          </> : (
            <div style={{ color:"rgba(255,255,255,0.25)", fontSize:12, lineHeight:1.7 }}>
              No assessment yet.<br/><span style={{ color:"#0ec3af" }}>Go to MI Risk Check →</span>
            </div>
          )}
        </div>

        <div style={{ flex:"1 1 300px", minWidth:0,
          background:"linear-gradient(145deg,#0d1b2e,#091524)", borderRadius:16, padding:"22px",
          border:"1px solid rgba(255,255,255,0.07)", boxShadow:"0 4px 20px rgba(0,0,0,0.25)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
            <div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.32)", fontWeight:600,
                letterSpacing:.6, textTransform:"uppercase" }}>30-Day Sat Fat Trend</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.2)", marginTop:3 }}>Daily total (g)</div>
            </div>
            <div style={{ fontSize:10, color:"rgba(14,195,175,0.6)", fontWeight:600,
              padding:"3px 10px", background:"rgba(14,195,175,0.08)", borderRadius:20,
              border:"1px solid rgba(14,195,175,0.15)" }}>Last 30 days</div>
          </div>
          <FatChart trend={data?.fat_trend_30d}/>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display:"flex", gap:14, flexWrap:"wrap", animation:"fadein .4s ease .15s both" }}>
        {/* Top foods */}
        <div style={{ flex:"1 1 260px", minWidth:0,
          background:"linear-gradient(145deg,#0d1b2e,#091524)", borderRadius:16, padding:"22px",
          border:"1px solid rgba(255,255,255,0.07)", boxShadow:"0 4px 20px rgba(0,0,0,0.25)" }}>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.32)", fontWeight:600,
            letterSpacing:.6, textTransform:"uppercase", marginBottom:18 }}>Top Foods (30 days)</div>
          {data?.top_foods?.length
            ? data.top_foods.map((f,i)=>(
                <MiniBar key={i} label={`${f.food} ×${f.frequency}`}
                  value={f.avg_sat_fat} max={Math.max(...data.top_foods.map(x=>x.avg_sat_fat),0.1)}/>
              ))
            : <div style={{ color:"rgba(255,255,255,0.2)", fontSize:12, lineHeight:1.7 }}>
                Log food to see your fat breakdown
              </div>
          }
        </div>

        {/* Recent meals */}
        <div style={{ flex:"1 1 260px", minWidth:0,
          background:"linear-gradient(145deg,#0d1b2e,#091524)", borderRadius:16, padding:"22px",
          border:"1px solid rgba(255,255,255,0.07)", boxShadow:"0 4px 20px rgba(0,0,0,0.25)" }}>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.32)", fontWeight:600,
            letterSpacing:.6, textTransform:"uppercase", marginBottom:18 }}>Recent Meals</div>
          {data?.recent_foods?.length
            ? data.recent_foods.map((f,i)=>(
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                  padding:"10px 0", borderBottom:i<data.recent_foods.length-1?"1px solid rgba(255,255,255,0.05)":"none" }}>
                  <div style={{ minWidth:0, marginRight:12 }}>
                    <div style={{ fontWeight:600, fontSize:13, color:"rgba(255,255,255,0.78)",
                      textTransform:"capitalize", marginBottom:2 }}>{f.food}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.26)" }}>
                      {f.method} · {f.weight_g}g · {f.date}
                    </div>
                  </div>
                  <div style={{ fontWeight:700, fontSize:13, color:"#0ec3af", whiteSpace:"nowrap", flexShrink:0 }}>
                    {f.sat_fat_g.toFixed(2)}g
                  </div>
                </div>
              ))
            : <div style={{ color:"rgba(255,255,255,0.2)", fontSize:12, lineHeight:1.7 }}>
                No meals logged yet.<br/><span style={{ color:"#0ec3af" }}>Go to Log Food →</span>
              </div>
          }
        </div>

        {/* Risk history mini */}
        {data?.risk_trend?.length > 0 && (
          <div style={{ flex:"1 1 260px", minWidth:0,
            background:"linear-gradient(145deg,#0d1b2e,#091524)", borderRadius:16, padding:"22px",
            border:"1px solid rgba(255,255,255,0.07)", boxShadow:"0 4px 20px rgba(0,0,0,0.25)" }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.32)", fontWeight:600,
              letterSpacing:.6, textTransform:"uppercase", marginBottom:18 }}>Risk History</div>
            {data.risk_trend.slice(0,5).map((r,i)=>(
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"9px 0", borderBottom:i<Math.min(data.risk_trend.length,5)-1?"1px solid rgba(255,255,255,0.05)":"none" }}>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.32)" }}>{r.date}</div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:600,
                    background:`${RC[r.category]}1a`, color:RC[r.category],
                    border:`1px solid ${RC[r.category]}33` }}>{r.category}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:RC[r.category] }}>
                    {r.risk_pct?.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}