// src/pages/FoodLogger.jsx
import { useState, useRef } from "react";
import { useAuth, API_BASE } from "../App";

const METHODS    = ["boiled", "fried", "baked", "grilled", "raw"];
const FAT_LEVELS = ["none", "low", "medium", "high"];
const OIL_TYPES  = ["vegetable_oil", "olive_oil", "coconut_oil", "butter", "palm_oil"];
const NO_OIL     = ["boiled", "raw"];
const FAT_DESC   = { none:"No oil", low:"~5g oil", medium:"~10g oil", high:"~15g oil" };

/* ── Result Modal ─────────────────────────────────────────────── */
function ResultModal({ result, onClose }) {
  if (!result) return null;
  const total = result.sat_fat_total_g;
  const rc = total > 15 ? "#ef4444" : total > 8 ? "#f59e0b" : "#10b981";
  const rl = total > 15 ? "High" : total > 8 ? "Moderate" : "Low";
  const maxBar = Math.max(result.sat_fat_base_g + result.sat_fat_oil_g, 0.1);

  return (
    <div
      style={{ position:"fixed", inset:0, zIndex:1000,
        background:"rgba(6,13,26,0.88)", backdropFilter:"blur(10px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:20, animation:"fadeov .25s ease" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width:"100%", maxWidth:520,
        background:"linear-gradient(145deg,#0d1b2e,#091524)",
        borderRadius:24, border:"1px solid rgba(14,195,175,0.2)",
        boxShadow:"0 32px 80px rgba(0,0,0,0.7)", overflow:"hidden",
        animation:"modalin .3s cubic-bezier(.34,1.56,.64,1)" }}>

        {/* Header */}
        <div style={{ background:"linear-gradient(135deg,rgba(14,195,175,0.12),rgba(99,102,241,0.08))",
          padding:"22px 26px", borderBottom:"1px solid rgba(255,255,255,0.06)",
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:11,
              background:"linear-gradient(135deg,#0ec3af,#6366f1)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>✓</div>
            <div>
              <div style={{ fontWeight:700, fontSize:15, color:"#fff", textTransform:"capitalize" }}>{result.food}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:1 }}>
                Logged · {(result.confidence*100).toFixed(1)}% confidence
              </div>
            </div>
          </div>
          <button onClick={onClose}
            style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:8, color:"rgba(255,255,255,0.5)", cursor:"pointer",
              width:30, height:30, fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" }}>
            ×
          </button>
        </div>

        <div style={{ padding:"22px 26px" }}>
          {/* Big number */}
          <div style={{ textAlign:"center", marginBottom:22 }}>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", letterSpacing:.6,
              textTransform:"uppercase", marginBottom:8 }}>Total Saturated Fat</div>
            <div style={{ fontSize:54, fontWeight:800, color:rc, lineHeight:1 }}>
              {total}
              <span style={{ fontSize:18, fontWeight:400, color:"rgba(255,255,255,0.35)", marginLeft:4 }}>g</span>
            </div>
            <span style={{ display:"inline-block", marginTop:10, padding:"3px 14px",
              borderRadius:20, fontSize:12, fontWeight:600,
              background:`${rc}22`, color:rc, border:`1px solid ${rc}44` }}>
              {rl} sat fat content
            </span>
          </div>

          {/* Breakdown bar */}
          <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:10, padding:"14px 16px", marginBottom:18 }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.38)", marginBottom:10,
              textTransform:"uppercase", letterSpacing:.5 }}>Fat Breakdown</div>
            <div style={{ display:"flex", height:8, borderRadius:6, overflow:"hidden", marginBottom:8 }}>
              <div style={{ flex:result.sat_fat_base_g/maxBar, background:"#0ec3af" }}/>
              <div style={{ flex:result.sat_fat_oil_g/maxBar,  background:"#6366f1" }}/>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
              <span style={{ color:"#0ec3af" }}>● From food: {result.sat_fat_base_g}g</span>
              <span style={{ color:"#6366f1" }}>● From oil: {result.sat_fat_oil_g}g</span>
            </div>
          </div>

          {/* Details grid */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:16 }}>
            {[
              ["Weight",    `${result.weight_grams}g`],
              ["Method",   result.cooking_method],
              ["Fat level",result.added_fat_level],
              ["Oil",      result.oil_type],
              ["Data src", result.data_source],
              ["Context",  (result.context_source||"").split(":")[0]],
            ].map(([k,v])=>(
              <div key={k} style={{ background:"rgba(255,255,255,0.04)", borderRadius:8, padding:"10px 12px" }}>
                <div style={{ fontSize:9, color:"rgba(255,255,255,0.32)", textTransform:"uppercase",
                  letterSpacing:.4, marginBottom:4 }}>{k}</div>
                <div style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.82)",
                  textTransform:"capitalize", wordBreak:"break-word" }}>{v}</div>
              </div>
            ))}
          </div>

          {result.warning && (
            <div style={{ background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.25)",
              borderRadius:8, padding:"10px 14px", fontSize:12, color:"#fbbf24", marginBottom:14 }}>
              ⚠ {result.warning}
            </div>
          )}

          <button onClick={onClose}
            style={{ width:"100%", padding:"12px 0", borderRadius:10, border:"none",
              background:"linear-gradient(135deg,#0ec3af,#0aad9b)",
              color:"#fff", fontWeight:600, fontSize:14, cursor:"pointer" }}>
            Log another meal →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function FoodLogger() {
  const { token, showToast } = useAuth();
  const fileRef = useRef();

  const [image, setImage]       = useState(null);
  const [preview, setPreview]   = useState(null);
  const [weight, setWeight]     = useState(100);
  const [method, setMethod]     = useState("");
  const [fatLevel, setFatLevel] = useState("");
  const [oilType, setOilType]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [dragging, setDragging] = useState(false);

  const oilDisabled = NO_OIL.includes(method);

  const handleFile = (f) => {
    if (!f) return;
    setImage(f); setPreview(URL.createObjectURL(f)); setResult(null);
  };

  const submit = async () => {
    if (!image)  return showToast("Please select a food image.", "error");
    if (!weight || weight <= 0) return showToast("Enter a valid weight.", "error");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", image); fd.append("weight", weight);
      if (method)                  fd.append("cooking_method",  method);
      if (fatLevel)                fd.append("added_fat_level", fatLevel);
      if (oilType && !oilDisabled) fd.append("oil_type",        oilType);

      const res  = await fetch(`${API_BASE}/food/predict`, {
        method:"POST", headers:{ Authorization:`Bearer ${token}` }, body:fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Prediction failed");
      setResult(data);
    } catch (err) {
      showToast(err.message, "error");
    } finally { setLoading(false); }
  };

  const sel = {
    width:"100%", padding:"11px 14px", borderRadius:10, fontSize:13,
    border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.06)",
    color:"#fff", outline:"none", cursor:"pointer", boxSizing:"border-box",
  };
  const lbl = { fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.42)",
    letterSpacing:.6, textTransform:"uppercase", display:"block", marginBottom:7, marginTop:18 };

  return (
    <div style={{ width:"100%", maxWidth:680, margin:"0 auto",
      fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @keyframes fadein{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeov{from{opacity:0}to{opacity:1}}
        @keyframes modalin{from{opacity:0;transform:scale(.92) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        select option{background:#0d1b2e;color:#fff;}
        .dz:hover{border-color:rgba(14,195,175,0.5)!important;background:rgba(14,195,175,0.04)!important;}
        .dz{transition:all .2s!important;}
        .pb:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 12px 30px rgba(14,195,175,0.42)!important;}
        .pb{transition:all .2s!important;}
        select:focus{border-color:rgba(14,195,175,0.5)!important;}
      `}</style>

      <div style={{ marginBottom:24 }}>
        <h1 style={{ margin:"0 0 4px", fontSize:24, fontWeight:800, color:"#0f172a", letterSpacing:-0.5 }}>Log Food</h1>
        <p style={{ margin:0, color:"#64748b", fontSize:13 }}>Upload a food photo to estimate saturated fat intake</p>
      </div>

      <div style={{ background:"linear-gradient(145deg,#0d1b2e,#091524)",
        borderRadius:20, border:"1px solid rgba(255,255,255,0.08)",
        boxShadow:"0 16px 48px rgba(0,0,0,0.22)",
        overflow:"hidden", animation:"fadein .4s ease" }}>

        {/* Drop zone */}
        <div className="dz"
          onClick={() => fileRef.current.click()}
          onDragOver={e=>{e.preventDefault();setDragging(true)}}
          onDragLeave={()=>setDragging(false)}
          onDrop={e=>{e.preventDefault();setDragging(false);handleFile(e.dataTransfer.files[0])}}
          style={{ border:`2px dashed ${dragging?"rgba(14,195,175,0.7)":"rgba(255,255,255,0.11)"}`,
            borderRadius:14, margin:20, padding:preview?"16px":"32px 20px",
            textAlign:"center", cursor:"pointer",
            background:dragging?"rgba(14,195,175,0.05)":preview?"rgba(255,255,255,0.02)":"transparent" }}>
          {preview
            ? <div style={{ position:"relative", display:"inline-block" }}>
                <img src={preview} alt="preview"
                  style={{ maxHeight:170, maxWidth:"100%", borderRadius:10, objectFit:"cover",
                    boxShadow:"0 8px 24px rgba(0,0,0,0.4)" }} />
                <div style={{ position:"absolute", bottom:8, left:0, right:0,
                  fontSize:11, color:"rgba(255,255,255,0.6)", textAlign:"center" }}>
                  Click to change
                </div>
              </div>
            : <>
                <div style={{ fontSize:38, marginBottom:10 }}>📷</div>
                <div style={{ fontWeight:600, color:"rgba(255,255,255,0.65)", fontSize:14 }}>
                  Drop food photo here
                </div>
                <div style={{ color:"rgba(255,255,255,0.28)", fontSize:12, marginTop:4 }}>
                  or click to browse · JPG, PNG
                </div>
              </>
          }
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }}
            onChange={e=>handleFile(e.target.files[0])}/>
        </div>

        <div style={{ padding:"0 20px 24px" }}>
          {/* Weight */}
          <label style={lbl}>Portion weight *</label>
          <div style={{ position:"relative" }}>
            <input type="number" min="1" max="2000" value={weight}
              onChange={e=>setWeight(e.target.value)}
              style={{ ...sel, paddingRight:36 }}/>
            <span style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)",
              fontSize:12, color:"rgba(255,255,255,0.3)", pointerEvents:"none" }}>g</span>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div>
              <label style={lbl}>Cooking method</label>
              <select value={method} style={sel}
                onChange={e=>{setMethod(e.target.value);if(NO_OIL.includes(e.target.value)){setFatLevel("none");setOilType("");}}}>
                <option value="">Auto-detect</option>
                {METHODS.map(m=><option key={m} value={m}>{m.charAt(0).toUpperCase()+m.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Added fat {oilDisabled&&<span style={{color:"#f59e0b",fontWeight:400}}>(N/A)</span>}</label>
              <select value={fatLevel} disabled={oilDisabled}
                style={{...sel, opacity:oilDisabled?.4:1}}
                onChange={e=>setFatLevel(e.target.value)}>
                <option value="">Auto-infer</option>
                {FAT_LEVELS.map(f=><option key={f} value={f}>
                  {f==="none"?"None":`${f.charAt(0).toUpperCase()+f.slice(1)} (${FAT_DESC[f]})`}
                </option>)}
              </select>
            </div>
          </div>

          {!oilDisabled && <>
            <label style={lbl}>Oil type</label>
            <select value={oilType} style={sel} onChange={e=>setOilType(e.target.value)}>
              <option value="">Default for method</option>
              {OIL_TYPES.map(o=><option key={o} value={o}>
                {o.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}
              </option>)}
            </select>
          </>}

          <button onClick={submit} disabled={loading||!image} className="pb" style={{
            width:"100%", marginTop:22, padding:"14px 0", borderRadius:12, border:"none",
            background:loading||!image?"rgba(14,195,175,0.28)":"linear-gradient(135deg,#0ec3af,#0aad9b)",
            color:"#fff", fontWeight:700, fontSize:15,
            cursor:loading||!image?"not-allowed":"pointer",
            boxShadow:"0 4px 18px rgba(14,195,175,0.26)" }}>
            {loading
              ?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                 <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                   style={{animation:"spin .75s linear infinite"}}>
                   <circle cx="12" cy="12" r="10" opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10"/>
                 </svg>Analysing…
               </span>
              :"📊 Predict & Log"}
          </button>
        </div>
      </div>

      <ResultModal result={result} onClose={()=>setResult(null)}/>
    </div>
  );
}