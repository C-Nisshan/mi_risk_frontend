// src/pages/FoodLogger.jsx
import { useState, useRef } from "react";
import { useAuth, API_BASE } from "../App";

const METHODS = ["boiled", "fried", "baked", "grilled", "raw"];
const FAT_LEVELS = ["none", "low", "medium", "high"];
const OIL_TYPES = ["vegetable_oil", "olive_oil", "coconut_oil", "butter", "palm_oil"];
const NO_OIL = ["boiled", "raw"];
const FAT_DESC = { none: "No oil", low: "~5g oil", medium: "~10g oil", high: "~15g oil" };

/* ── Result Modal ─────────────────────────────────────────────── */
function ResultModal({ result, onClose }) {
  if (!result) return null;

  const total = result.sat_fat_total_g;
  const rc = total > 15 ? "#ef4444" : total > 8 ? "#f59e0b" : "#10b981";
  const rl = total > 15 ? "High" : total > 8 ? "Moderate" : "Low";
  const maxBar = Math.max(result.sat_fat_base_g + result.sat_fat_oil_g, 0.1);

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(6,13,26,0.92)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0" style={{ background: "linear-gradient(145deg,#0d1b2e,#091524)" }}>
          
          {/* Header */}
          <div className="modal-header border-0 pb-0" style={{ background: "linear-gradient(135deg,rgba(14,195,175,0.12),rgba(99,102,241,0.08))" }}>
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center justify-content-center rounded-3" 
                   style={{ width: 48, height: 48, background: "linear-gradient(135deg,#0ec3af,#6366f1)" }}>
                <i className="bi bi-check-lg fs-3 text-white"></i>
              </div>
              <div>
                <h5 className="mb-0 text-white text-capitalize">{result.food}</h5>
                <small className="text-white-50">
                  Logged • {(result.confidence * 100).toFixed(1)}% confidence
                </small>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            {/* Total Saturated Fat */}
            <div className="text-center mb-4">
              <div className="text-uppercase small opacity-50 fw-semibold mb-2">Total Saturated Fat</div>
              <div className="display-3 fw-bold" style={{ color: rc }}>
                {total}
                <span className="fs-4 fw-normal opacity-50 ms-2">g</span>
              </div>
              <div className="mt-2">
                <span className="badge rounded-pill px-3 py-2" 
                      style={{ background: `${rc}22`, color: rc, border: `1px solid ${rc}44` }}>
                  {rl} Saturated Fat
                </span>
              </div>
            </div>

            {/* Fat Breakdown */}
            <div className="p-3 rounded-3 mb-4" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="small opacity-50 text-uppercase fw-semibold mb-2">Fat Breakdown</div>
              <div className="progress mb-2" style={{ height: "10px" }}>
                <div className="progress-bar bg-success" style={{ width: `${(result.sat_fat_base_g / maxBar) * 100}%` }}></div>
                <div className="progress-bar bg-primary" style={{ width: `${(result.sat_fat_oil_g / maxBar) * 100}%` }}></div>
              </div>
              <div className="d-flex justify-content-between small">
                <span style={{ color: "#10b981" }}>● From food: {result.sat_fat_base_g}g</span>
                <span style={{ color: "#6366f1" }}>● From oil: {result.sat_fat_oil_g}g</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="row g-3">
              {[
                ["Weight", `${result.weight_grams}g`],
                ["Method", result.cooking_method],
                ["Fat Level", result.added_fat_level],
                ["Oil", result.oil_type || "—"],
                ["Data Source", result.data_source],
                ["Context", (result.context_source || "").split(":")[0]],
              ].map(([label, value]) => (
                <div key={label} className="col-6">
                  <div className="p-3 rounded-3 h-100" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div className="small opacity-50 text-uppercase">{label}</div>
                    <div className="fw-semibold text-white mt-1 text-capitalize">{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {result.warning && (
              <div className="alert alert-warning border-warning mt-4">
                {result.warning}
              </div>
            )}
          </div>

          <div className="modal-footer border-0 p-4">
            <button className="btn btn-success w-100 py-3 fw-semibold" onClick={onClose}>
              Log Another Meal <i className="bi bi-arrow-right ms-2"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────────────── */
export default function FoodLogger() {
  const { token, showToast } = useAuth();
  const fileRef = useRef();
  
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [weight, setWeight] = useState(100);
  const [method, setMethod] = useState("");
  const [fatLevel, setFatLevel] = useState("");
  const [oilType, setOilType] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragging, setDragging] = useState(false);

  const oilDisabled = NO_OIL.includes(method);

  const handleFile = (f) => {
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
      if (method) fd.append("cooking_method", method);
      if (fatLevel) fd.append("added_fat_level", fatLevel);
      if (oilType && !oilDisabled) fd.append("oil_type", oilType);

      const res = await fetch(`${API_BASE}/food/predict`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Prediction failed");
      
      setResult(data);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ maxWidth: "720px" }}>
      <div className="mb-4">
        <h1 className="display-6 fw-bold text-white">Log Food</h1>
        <p className="text-white-50">Upload a food photo to estimate saturated fat intake</p>
      </div>

      <div className="card border-0 shadow-lg" style={{ background: "linear-gradient(145deg,#0d1b2e,#091524)" }}>
        {/* Drop Zone */}
        <div
          className="p-5 text-center border border-dashed rounded-4 mx-4 mt-4 mb-3"
          style={{
            borderColor: dragging ? "#0ec3af" : "rgba(255,255,255,0.15)",
            background: dragging ? "rgba(14,195,175,0.08)" : "transparent",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onClick={() => fileRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { 
            e.preventDefault(); 
            setDragging(false); 
            handleFile(e.dataTransfer.files[0]); 
          }}
        >
          {preview ? (
            <div className="position-relative d-inline-block">
              <img
                src={preview}
                alt="food preview"
                className="img-fluid rounded-3 shadow-sm"
                style={{ maxHeight: "220px", objectFit: "cover" }}
              />
              <div className="position-absolute bottom-0 start-50 translate-middle-x bg-dark bg-opacity-75 text-white small px-3 py-1 rounded-pill">
                Click to change photo
              </div>
            </div>
          ) : (
            <>
              <i className="bi bi-camera-fill display-1 text-white-50 mb-3"></i>
              <h5 className="text-white-75">Drop food photo here</h5>
              <p className="text-white-50 small">or click to browse • JPG, PNG supported</p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="d-none"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>

        <div className="px-4 pb-4">
          {/* Weight Input */}
          <div className="mb-4">
            <label className="form-label text-uppercase small fw-semibold">Portion Weight (grams) *</label>
            <div className="input-group">
              <input
                type="number"
                min="1"
                max="2000"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="form-control form-control-lg"
              />
              <span className="input-group-text">g</span>
            </div>
          </div>

          <div className="row g-4">
            {/* Cooking Method */}
            <div className="col-md-6">
              <label className="form-label text-uppercase small fw-semibold opacity-75">Cooking Method</label>
              <select
                value={method}
                onChange={(e) => {
                  setMethod(e.target.value);
                  if (NO_OIL.includes(e.target.value)) {
                    setFatLevel("none");
                    setOilType("");
                  }
                }}
                className="form-select form-select-lg"
              >
                <option value="">Auto-detect from image</option>
                {METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Added Fat Level */}
            <div className="col-md-6">
              <label className="form-label text-uppercase small fw-semibold opacity-75">
                Added Fat Level {oilDisabled && <span className="text-warning">(Not applicable)</span>}
              </label>
              <select
                value={fatLevel}
                disabled={oilDisabled}
                onChange={(e) => setFatLevel(e.target.value)}
                className="form-select form-select-lg"
                style={{ opacity: oilDisabled ? 0.6 : 1 }}
              >
                <option value="">Auto-infer from image</option>
                {FAT_LEVELS.map((f) => (
                  <option key={f} value={f}>
                    {f === "none" ? "None" : `${f.charAt(0).toUpperCase() + f.slice(1)} (${FAT_DESC[f]})`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Oil Type */}
          {!oilDisabled && (
            <div className="mt-4">
              <label className="form-label text-uppercase small fw-semibold opacity-75">Oil Type</label>
              <select
                value={oilType}
                onChange={(e) => setOilType(e.target.value)}
                className="form-select form-select-lg"
              >
                <option value="">Default for selected method</option>
                {OIL_TYPES.map((o) => (
                  <option key={o} value={o}>
                    {o.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={submit}
            disabled={loading || !image}
            className="btn btn-success w-100 mt-5 py-3 fw-bold fs-5"
            style={{
              background: "linear-gradient(135deg, #0ec3af, #0aad9b)",
              boxShadow: "0 8px 25px rgba(14,195,175,0.3)",
            }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-3"></span>
                Analysing Image...
              </>
            ) : (
              <>
                <i className="bi bi-graph-up me-2"></i>
                Predict & Log Meal
              </>
            )}
          </button>
        </div>
      </div>

      <ResultModal result={result} onClose={() => setResult(null)} />
    </div>
  );
}