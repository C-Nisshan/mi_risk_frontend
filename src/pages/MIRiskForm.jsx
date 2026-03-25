// src/pages/MIRiskForm.jsx
import { useState } from "react";
import { useAuth, API_BASE } from "../App";

const RC = { Low:"#10b981", Moderate:"#f59e0b", High:"#ef4444" };
const RB = { Low:"rgba(16,185,129,0.12)", Moderate:"rgba(245,158,11,0.12)", High:"rgba(239,68,68,0.12)" };

/* ── Wizard steps definition ──────────────────────────────────── */
const STEPS = [
  {
    id: "vitals", icon:"🩺", title:"Clinical Vitals",
    subtitle:"Core measurements from your last checkup",
    fields: [
      { key:"age",           label:"Age",           type:"number", unit:"years", min:18,  max:90,  col:1 },
      { key:"cholesterol",   label:"Cholesterol",   type:"number", unit:"mg/dL", min:50,  max:400, col:2 },
      { key:"heart_rate",    label:"Heart Rate",    type:"number", unit:"bpm",   min:30,  max:200, col:1 },
      { key:"systolic",      label:"Systolic BP",   type:"number", unit:"mmHg",  min:80,  max:200, col:2 },
      { key:"diastolic",     label:"Diastolic BP",  type:"number", unit:"mmHg",  min:40,  max:130, col:1 },
      { key:"bmi",           label:"BMI",           type:"number", step:"0.1",  min:10,  max:60,  col:2 },
      { key:"triglycerides", label:"Triglycerides", type:"number", unit:"mg/dL", min:20,  max:800, col:1 },
    ],
  },
  {
    id: "factors", icon:"⚕️", title:"Risk Factors",
    subtitle:"Medical history and lifestyle risk indicators",
    fields: [
      { key:"diabetes",            label:"Diabetes",              type:"toggle", col:1 },
      { key:"family_history",      label:"Family History of MI",  type:"toggle", col:2 },
      { key:"smoking",             label:"Smoking",               type:"toggle", col:1 },
      { key:"obesity",             label:"Obesity (self-report)", type:"toggle", col:2 },
      { key:"alcohol_consumption", label:"Alcohol Consumption",   type:"toggle", col:1 },
    ],
  },
  {
    id: "lifestyle", icon:"🏃", title:"Lifestyle",
    subtitle:"Daily activity and sleep patterns",
    fields: [
      { key:"exercise_hours_per_week", label:"Exercise",       type:"number", unit:"hrs/week", min:0, max:30,  col:1 },
      { key:"sedentary_hours_per_day", label:"Sedentary Time", type:"number", unit:"hrs/day",  min:0, max:20,  col:2 },
      { key:"physical_activity_days",  label:"Active Days",    type:"number", unit:"days/wk",  min:0, max:7,   col:1 },
      { key:"sleep_hours_per_day",     label:"Sleep",          type:"number", unit:"hrs/day",  min:2, max:12,  col:2, step:"0.5" },
    ],
  },
  {
    id: "diet", icon:"🥗", title:"Dietary Fat",
    subtitle:"Optional — auto-pulled from your food logs if left blank",
    fields: [
      { key:"daily_fat_override", label:"Daily Sat Fat Override", type:"number", unit:"g/day", min:0, max:300, step:"0.1", optional:true, col:"full" },
    ],
  },
];

/* ── Result Modal ─────────────────────────────────────────────── */
function ResultModal({ result, onClose }) {
  if (!result) return null;
  const cat = result.mi_risk_category;

  return (
    <div
      style={{ position:"fixed", inset:0, zIndex:1000,
        background:"rgba(6,13,26,0.88)", backdropFilter:"blur(10px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:20, animation:"fadeov .25s ease" }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ width:"100%", maxWidth:580,
        background:"linear-gradient(145deg,#0d1b2e,#091524)",
        borderRadius:24, border:`1px solid ${RC[cat]}44`,
        boxShadow:`0 32px 80px rgba(0,0,0,0.7),0 0 0 1px ${RC[cat]}18`,
        overflow:"hidden", animation:"modalin .3s cubic-bezier(.34,1.56,.64,1)",
        maxHeight:"90vh", overflowY:"auto" }}>

        {/* Risk header */}
        <div style={{ background:`linear-gradient(135deg,${RB[cat]},rgba(99,102,241,0.08))`,
          padding:"28px 28px 24px", borderBottom:`1px solid ${RC[cat]}22` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div style={{ display:"flex", gap:16, alignItems:"center", flexWrap:"wrap" }}>
              {/* Category */}
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginBottom:6,
                  textTransform:"uppercase", letterSpacing:.6 }}>MI Risk</div>
                <div style={{ fontSize:42, fontWeight:900, color:RC[cat], lineHeight:1 }}>{cat}</div>
              </div>
              {/* Score */}
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginBottom:6,
                  textTransform:"uppercase", letterSpacing:.6 }}>Score</div>
                <div style={{ fontSize:42, fontWeight:900, color:RC[cat], lineHeight:1 }}>
                  {result.mi_risk_percentage.toFixed(0)}
                  <span style={{ fontSize:20, fontWeight:400, color:"rgba(255,255,255,0.35)" }}>%</span>
                </div>
              </div>
              {/* Confidence */}
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginBottom:6,
                  textTransform:"uppercase", letterSpacing:.6 }}>Confidence</div>
                <div style={{ fontSize:42, fontWeight:900, color:"#fff", lineHeight:1 }}>
                  {(result.confidence*100).toFixed(0)}
                  <span style={{ fontSize:20, fontWeight:400, color:"rgba(255,255,255,0.35)" }}>%</span>
                </div>
              </div>
            </div>
            <button onClick={onClose}
              style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)",
                borderRadius:8, color:"rgba(255,255,255,0.5)", cursor:"pointer",
                width:32, height:32, fontSize:18, display:"flex", alignItems:"center", justifyContent:"center",
                flexShrink:0 }}>×</button>
          </div>

          {/* Class probability bars */}
          <div style={{ marginTop:20 }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", textTransform:"uppercase",
              letterSpacing:.5, marginBottom:10 }}>Class Probabilities</div>
            {Object.entries(result.class_probabilities).map(([cls,p]) => (
              <div key={cls} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:7 }}>
                <span style={{ width:72, fontSize:12, color:RC[cls], fontWeight:600 }}>{cls}</span>
                <div style={{ flex:1, height:7, background:"rgba(255,255,255,0.08)", borderRadius:4 }}>
                  <div style={{ width:`${p*100}%`, height:7, background:RC[cls], borderRadius:4,
                    transition:"width .8s cubic-bezier(.4,0,.2,1)" }}/>
                </div>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)", width:34, textAlign:"right" }}>
                  {(p*100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding:"22px 28px" }}>
          {/* Fat info */}
          <div style={{ background:"rgba(14,195,175,0.08)", borderRadius:10,
            border:"1px solid rgba(14,195,175,0.18)", padding:"12px 16px", marginBottom:18 }}>
            <div style={{ fontSize:10, color:"rgba(14,195,175,0.7)", textTransform:"uppercase",
              letterSpacing:.5, marginBottom:6 }}>Dietary Fat Used</div>
            <div style={{ fontSize:14, color:"#fff", fontWeight:600 }}>
              {result.fat_intake_used?.value_g?.toFixed(1)}g/day
              <span style={{ fontSize:12, fontWeight:400, color:"rgba(255,255,255,0.4)", marginLeft:8 }}>
                via {(result.fat_intake_used?.source||"").replace(/_/g," ")}
              </span>
            </div>
            {(result.fat_intake_used?.avg_7d || result.fat_intake_used?.avg_30d) && (
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)", marginTop:4 }}>
                {result.fat_intake_used?.avg_7d && `7d avg: ${result.fat_intake_used.avg_7d.toFixed(1)}g`}
                {result.fat_intake_used?.avg_7d && result.fat_intake_used?.avg_30d && "  ·  "}
                {result.fat_intake_used?.avg_30d && `30d avg: ${result.fat_intake_used.avg_30d.toFixed(1)}g`}
              </div>
            )}
          </div>

          {/* Top risk factors */}
          {result.top_risk_factors?.length > 0 && (
            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", textTransform:"uppercase",
                letterSpacing:.5, marginBottom:10 }}>Top Risk Drivers</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {result.top_risk_factors.map((f,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:12,
                    background:"rgba(255,255,255,0.04)", borderRadius:10, padding:"10px 14px",
                    border:"1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ width:28, height:28, borderRadius:8, flexShrink:0,
                      background:`linear-gradient(135deg,${RC[result.mi_risk_category]}33,${RC[result.mi_risk_category]}11)`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:12, fontWeight:700, color:RC[result.mi_risk_category] }}>
                      {i+1}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.85)" }}>{f.label}</div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:1 }}>
                        Value: {f.patient_value} · Importance: {(f.importance*100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={onClose}
            style={{ width:"100%", padding:"12px 0", borderRadius:10, border:"none",
              background:"linear-gradient(135deg,#0ec3af,#0aad9b)",
              color:"#fff", fontWeight:600, fontSize:14, cursor:"pointer" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function MIRiskForm() {
  const { token, showToast } = useAuth();
  const [step, setStep]       = useState(0);
  const [values, setValues]   = useState({
    age:"", cholesterol:"", heart_rate:"", systolic:"", diastolic:"",
    bmi:"", triglycerides:"", diabetes:0, family_history:0, smoking:0,
    obesity:0, alcohol_consumption:0, exercise_hours_per_week:"",
    sedentary_hours_per_day:"", physical_activity_days:"", sleep_hours_per_day:"",
  });
  const [manualFat, setManualFat] = useState("");
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);

  const set = (k, v) => setValues(p => ({ ...p, [k]: v }));

  const submit = async () => {
    setLoading(true);
    try {
      const body = { ...values };
      if (manualFat !== "" && manualFat !== null) body.daily_fat_intake_g = parseFloat(manualFat);
      const res  = await fetch(`${API_BASE}/mi/predict`, {
        method:"POST",
        headers:{ Authorization:`Bearer ${token}`, "Content-Type":"application/json" },
        body:JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Prediction failed");
      setResult(data);
    } catch (err) {
      showToast(err.message, "error");
    } finally { setLoading(false); }
  };

  const currentStep = STEPS[step];
  const progress = ((step) / STEPS.length) * 100;

  const inp = {
    width:"100%", padding:"11px 14px", borderRadius:10, fontSize:14, outline:"none",
    boxSizing:"border-box", background:"rgba(255,255,255,0.07)",
    border:"1.5px solid rgba(255,255,255,0.1)", color:"#fff", caretColor:"#0ec3af",
    transition:"border-color .2s",
  };

  const renderField = (f) => {
    if (f.type === "toggle") return (
      <div style={{ display:"flex", gap:8 }}>
        {[["No",0],["Yes",1]].map(([txt,val]) => (
          <button key={val} onClick={() => set(f.key, val)} style={{
            flex:1, padding:"11px 0", borderRadius:10, fontSize:13, fontWeight:600,
            border:`1.5px solid ${values[f.key]===val?"#0ec3af":"rgba(255,255,255,0.1)"}`,
            background:values[f.key]===val?"rgba(14,195,175,0.15)":"rgba(255,255,255,0.05)",
            color:values[f.key]===val?"#0ec3af":"rgba(255,255,255,0.45)",
            cursor:"pointer", transition:"all .2s",
          }}>{txt}</button>
        ))}
      </div>
    );

    const isOpt = f.key === "daily_fat_override";
    return (
      <div style={{ position:"relative" }}>
        <input
          type="number" step={f.step||"1"} min={f.min} max={f.max}
          placeholder={isOpt ? "Leave blank to auto-calculate" : `${f.min}–${f.max}`}
          value={isOpt ? manualFat : values[f.key]}
          onChange={e => isOpt ? setManualFat(e.target.value) : set(f.key, e.target.value)}
          onFocus={e => e.target.style.borderColor="rgba(14,195,175,0.7)"}
          onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.1)"}
          style={inp}
        />
        {f.unit && (
          <span style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)",
            fontSize:11, color:"rgba(255,255,255,0.28)", pointerEvents:"none" }}>{f.unit}</span>
        )}
      </div>
    );
  };

  /* Split fields into two columns */
  const leftFields  = currentStep.fields.filter(f => f.col===1 || f.col==="full");
  const rightFields = currentStep.fields.filter(f => f.col===2);

  return (
    <div style={{ width:"100%", maxWidth:860, margin:"0 auto",
      fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @keyframes fadein{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeov{from{opacity:0}to{opacity:1}}
        @keyframes modalin{from{opacity:0;transform:scale(.92) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes slideright{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        input::placeholder{color:rgba(255,255,255,0.22);}
        input[type=number]::-webkit-inner-spin-button{opacity:.3;}
        .nb:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 10px 28px rgba(14,195,175,0.42)!important;}
        .nb{transition:all .2s!important;}
        .stepbtn:hover{opacity:1!important;}
        .stepbtn{transition:opacity .2s!important;}
      `}</style>

      <div style={{ marginBottom:24 }}>
        <h1 style={{ margin:"0 0 4px", fontSize:24, fontWeight:800, color:"#0f172a", letterSpacing:-0.5 }}>
          MI Risk Assessment
        </h1>
        <p style={{ margin:0, color:"#64748b", fontSize:13 }}>
          Enter your clinical data. Saturated fat is auto-pulled from your food logs.
        </p>
      </div>

      <div style={{ background:"linear-gradient(145deg,#0d1b2e,#091524)",
        borderRadius:22, border:"1px solid rgba(255,255,255,0.08)",
        boxShadow:"0 16px 48px rgba(0,0,0,0.22)",
        overflow:"hidden", animation:"fadein .4s ease" }}>

        {/* ── Progress bar ────────────────────────────────── */}
        <div style={{ height:3, background:"rgba(255,255,255,0.06)" }}>
          <div style={{ height:3, background:"linear-gradient(90deg,#0ec3af,#6366f1)",
            width:`${progress + (1/STEPS.length)*100}%`, transition:"width .4s ease" }}/>
        </div>

        {/* ── Step indicators ──────────────────────────────── */}
        <div style={{ display:"flex", padding:"20px 28px 0", gap:8 }}>
          {STEPS.map((s,i) => (
            <button key={s.id} className="stepbtn"
              onClick={() => i <= step && setStep(i)}
              style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"none",
                cursor:i<=step?"pointer":"default", padding:"6px 12px 6px 6px",
                borderRadius:30, opacity: i>step ? .35 : 1,
                background:i===step?"rgba(14,195,175,0.12)":"transparent" }}>
              <div style={{ width:28, height:28, borderRadius:"50%",
                background:i<step?"linear-gradient(135deg,#0ec3af,#6366f1)"
                  :i===step?"rgba(14,195,175,0.25)":"rgba(255,255,255,0.06)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:i<step?12:14, flexShrink:0 }}>
                {i<step ? "✓" : s.icon}
              </div>
              <span style={{ fontSize:12, fontWeight:600,
                color:i===step?"#0ec3af":i<step?"rgba(255,255,255,0.6)":"rgba(255,255,255,0.3)",
                whiteSpace:"nowrap" }}>
                {s.title}
              </span>
            </button>
          ))}
        </div>

        {/* ── Step content ─────────────────────────────────── */}
        <div style={{ padding:"24px 28px 28px", animation:"slideright .3s ease" }}
          key={step}>
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:18, fontWeight:700, color:"#fff", marginBottom:4 }}>
              {currentStep.title}
            </div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.38)" }}>
              {currentStep.subtitle}
            </div>
          </div>

          {/* Two-column field layout */}
          <div style={{ display:"grid",
            gridTemplateColumns: rightFields.length ? "1fr 1fr" : "1fr",
            gap:"0 32px" }}>
            {/* Left column */}
            <div>
              {leftFields.map(f => (
                <div key={f.key} style={{ marginBottom:18 }}>
                  <label style={{ fontSize:11, fontWeight:600,
                    color:"rgba(255,255,255,0.42)", letterSpacing:.6,
                    textTransform:"uppercase", display:"block", marginBottom:7 }}>
                    {f.label}
                    {f.optional && <span style={{ color:"rgba(255,255,255,0.25)", fontWeight:400, marginLeft:6 }}>(optional)</span>}
                    {f.unit && f.type!=="number" && <span style={{ color:"rgba(255,255,255,0.25)", fontWeight:400, marginLeft:4 }}>({f.unit})</span>}
                  </label>
                  {renderField(f)}
                </div>
              ))}
            </div>
            {/* Right column */}
            {rightFields.length > 0 && (
              <div>
                {rightFields.map(f => (
                  <div key={f.key} style={{ marginBottom:18 }}>
                    <label style={{ fontSize:11, fontWeight:600,
                      color:"rgba(255,255,255,0.42)", letterSpacing:.6,
                      textTransform:"uppercase", display:"block", marginBottom:7 }}>
                      {f.label}
                      {f.unit && <span style={{ color:"rgba(255,255,255,0.25)", fontWeight:400, marginLeft:4 }}>({f.unit})</span>}
                    </label>
                    {renderField(f)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info box for diet step */}
          {currentStep.id === "diet" && (
            <div style={{ background:"rgba(14,195,175,0.07)", borderRadius:10,
              border:"1px solid rgba(14,195,175,0.16)", padding:"14px 16px", marginTop:8 }}>
              <div style={{ fontSize:12, color:"rgba(14,195,175,0.8)", fontWeight:600, marginBottom:4 }}>
                Auto-resolution order
              </div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.38)", lineHeight:1.7 }}>
                Today's food logs → 7-day rolling average → 30-day rolling average → 0.0
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:28 }}>
            <button
              onClick={() => setStep(s => Math.max(0,s-1))}
              disabled={step===0}
              style={{ padding:"11px 24px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)",
                background:"rgba(255,255,255,0.05)", color:step===0?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.6)",
                fontWeight:600, fontSize:14, cursor:step===0?"default":"pointer",
                transition:"all .2s" }}>
              ← Back
            </button>

            <div style={{ fontSize:12, color:"rgba(255,255,255,0.28)" }}>
              Step {step+1} of {STEPS.length}
            </div>

            {step < STEPS.length-1
              ? <button onClick={() => setStep(s=>s+1)} className="nb"
                  style={{ padding:"11px 28px", borderRadius:10, border:"none",
                    background:"linear-gradient(135deg,#0ec3af,#0aad9b)",
                    color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer",
                    boxShadow:"0 4px 16px rgba(14,195,175,0.28)" }}>
                  Next →
                </button>
              : <button onClick={submit} disabled={loading} className="nb"
                  style={{ padding:"11px 28px", borderRadius:10, border:"none",
                    background:loading?"rgba(14,195,175,0.3)":"linear-gradient(135deg,#0ec3af,#0aad9b)",
                    color:"#fff", fontWeight:700, fontSize:14,
                    cursor:loading?"not-allowed":"pointer",
                    boxShadow:"0 4px 16px rgba(14,195,175,0.28)" }}>
                  {loading
                    ?<span style={{display:"flex",alignItems:"center",gap:8}}>
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                         style={{animation:"spin .75s linear infinite"}}>
                         <circle cx="12" cy="12" r="10" opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10"/>
                       </svg>Predicting…
                     </span>
                    :"Predict Risk ❤️"}
                </button>
            }
          </div>
        </div>
      </div>

      <ResultModal result={result} onClose={() => setResult(null)} />
    </div>
  );
}