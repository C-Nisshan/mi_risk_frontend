// src/pages/FoodLogger.jsx
import { useState, useRef } from "react";
import { useAuth, API_BASE } from "../App";

const METHODS   = ["boiled", "fried", "baked", "grilled", "raw"];
const FAT_LEVELS = ["none", "low", "medium", "high"];
const OIL_TYPES  = ["vegetable_oil", "olive_oil", "coconut_oil", "butter", "palm_oil"];
const NO_OIL     = ["boiled", "raw"];

const sel = {
  padding: "10px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0",
  fontSize: 13, background: "#fff", outline: "none", width: "100%", boxSizing: "border-box",
};
const lbl = { fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6, marginTop: 14 };

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

  const oilDisabled = NO_OIL.includes(method);

  const onFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImage(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const submit = async () => {
    if (!image) return showToast("Please select a food image.", "error");
    if (!weight || weight <= 0) return showToast("Enter a valid weight.", "error");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", image);
      fd.append("weight", weight);
      if (method)   fd.append("cooking_method",  method);
      if (fatLevel) fd.append("added_fat_level", fatLevel);
      if (oilType && !oilDisabled) fd.append("oil_type", oilType);

      const res  = await fetch(`${API_BASE}/food/predict`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Prediction failed");
      setResult(data);
      showToast(`Logged: ${data.food} — ${data.sat_fat_total_g}g sat fat`);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ margin: "0 0 4px", color: "#0f172a", fontSize: 22, fontWeight: 700 }}>Log Food</h1>
      <p style={{ margin: "0 0 28px", color: "#64748b", fontSize: 13 }}>
        Upload a food photo to estimate saturated fat intake
      </p>

      <div style={{ background: "#fff", borderRadius: 12, padding: 28, border: "1px solid #e2e8f0" }}>

        {/* Image upload */}
        <div
          onClick={() => fileRef.current.click()}
          style={{
            border: "2px dashed #cbd5e1", borderRadius: 10, padding: "32px 16px",
            textAlign: "center", cursor: "pointer", marginBottom: 20,
            background: preview ? "#f8fafc" : "#f1f5f9",
            transition: "border-color .2s",
          }}
        >
          {preview
            ? <img src={preview} alt="preview" style={{ maxHeight: 180, maxWidth: "100%", borderRadius: 8, objectFit: "cover" }} />
            : (
              <div>
                <div style={{ fontSize: 36, marginBottom: 8 }}>◎</div>
                <div style={{ fontWeight: 600, color: "#374151", fontSize: 14 }}>Click to upload food photo</div>
                <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>JPG or PNG recommended</div>
              </div>
            )
          }
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFile} />
        </div>

        {/* Weight */}
        <label style={lbl}>Portion weight (grams) *</label>
        <input
          type="number" min="1" max="2000" value={weight}
          onChange={e => setWeight(e.target.value)}
          style={{ ...sel, marginBottom: 0 }}
        />

        {/* Cooking method */}
        <label style={lbl}>Cooking method <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional — inferred if blank)</span></label>
        <select value={method} onChange={e => { setMethod(e.target.value); if(NO_OIL.includes(e.target.value)){ setFatLevel("none"); setOilType(""); }}} style={sel}>
          <option value="">Auto-detect</option>
          {METHODS.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase()+m.slice(1)}</option>)}
        </select>

        {/* Fat level */}
        <label style={lbl}>
          Added fat level
          {oilDisabled && <span style={{ color: "#f59e0b", fontWeight: 400, marginLeft: 6 }}>— not applicable for {method}</span>}
        </label>
        <select value={fatLevel} onChange={e => setFatLevel(e.target.value)} style={sel} disabled={oilDisabled}>
          <option value="">Auto-infer</option>
          {FAT_LEVELS.map(f => <option key={f} value={f}>{f === "none" ? "None" : `${f.charAt(0).toUpperCase()+f.slice(1)} (~${{low:5,medium:10,high:15}[f] || 0}g oil)`}</option>)}
        </select>

        {/* Oil type */}
        {!oilDisabled && (
          <>
            <label style={lbl}>Oil type <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span></label>
            <select value={oilType} onChange={e => setOilType(e.target.value)} style={sel}>
              <option value="">Default for method</option>
              {OIL_TYPES.map(o => <option key={o} value={o}>{o.replace(/_/g," ")}</option>)}
            </select>
          </>
        )}

        <button onClick={submit} disabled={loading || !image} style={{
          width: "100%", marginTop: 24, padding: 13, borderRadius: 8, border: "none",
          background: "#1e3a5f", color: "#fff", fontWeight: 600, fontSize: 14,
          cursor: loading || !image ? "not-allowed" : "pointer",
          opacity: loading || !image ? 0.65 : 1,
        }}>
          {loading ? "Analysing…" : "Predict & Log"}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div style={{
          marginTop: 20, background: "#f0fdf4", border: "1px solid #86efac",
          borderRadius: 12, padding: 24,
        }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#14532d", marginBottom: 16 }}>
            ✓ {result.food} — logged successfully
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
            {[
              ["Food confidence", `${(result.confidence*100).toFixed(1)}%`],
              ["Cooking method",  result.cooking_method],
              ["Weight",         `${result.weight_grams}g`],
              ["Fat from food",  `${result.sat_fat_base_g}g`],
              ["Fat from oil",   `${result.sat_fat_oil_g}g`],
              ["Total sat fat",  `${result.sat_fat_total_g}g`],
            ].map(([k,v]) => (
              <div key={k}>
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>{k}</div>
                <div style={{ fontWeight: 600, color: "#14532d", fontSize: 14 }}>{v}</div>
              </div>
            ))}
          </div>
          {result.warning && (
            <div style={{ background: "#fef3c7", color: "#92400e", padding: "8px 12px", borderRadius: 6, fontSize: 12 }}>
              ⚠ {result.warning}
            </div>
          )}
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 12 }}>
            Data source: {result.data_source} · Context: {result.context_source}
          </div>
        </div>
      )}
    </div>
  );
}