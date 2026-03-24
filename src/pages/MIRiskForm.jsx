// src/pages/MIRiskForm.jsx
import { useState } from "react";
import { useAuth, API_BASE } from "../App";

const RISK_COLOR = { Low: "#10b981", Moderate: "#f59e0b", High: "#ef4444" };
const RISK_BG    = { Low: "#d1fae5", Moderate: "#fef3c7", High: "#fee2e2" };

const inp = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none",
  background: "#fff", boxSizing: "border-box",
};
const lbl = { fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 };
const fld = { marginBottom: 16 };

const SECTIONS = [
  {
    title: "Clinical Vitals",
    fields: [
      { key: "age",          label: "Age",              type: "number", unit: "years", min: 18, max: 90 },
      { key: "cholesterol",  label: "Cholesterol",      type: "number", unit: "mg/dL", min: 50, max: 400 },
      { key: "heart_rate",   label: "Heart Rate",       type: "number", unit: "bpm",   min: 30, max: 200 },
      { key: "systolic",     label: "Systolic BP",      type: "number", unit: "mmHg",  min: 80, max: 200 },
      { key: "diastolic",    label: "Diastolic BP",     type: "number", unit: "mmHg",  min: 40, max: 130 },
      { key: "bmi",          label: "BMI",              type: "number", step: "0.1",   min: 10, max: 60 },
      { key: "triglycerides",label: "Triglycerides",    type: "number", unit: "mg/dL", min: 20, max: 800 },
    ],
  },
  {
    title: "Risk Factors",
    fields: [
      { key: "diabetes",           label: "Diabetes",           type: "toggle" },
      { key: "family_history",     label: "Family history of MI", type: "toggle" },
      { key: "smoking",            label: "Smoking",            type: "toggle" },
      { key: "obesity",            label: "Obesity (self-reported)", type: "toggle" },
      { key: "alcohol_consumption",label: "Alcohol consumption", type: "toggle" },
    ],
  },
  {
    title: "Lifestyle",
    fields: [
      { key: "exercise_hours_per_week", label: "Exercise",           type: "number", unit: "hrs/week", min: 0, max: 30 },
      { key: "sedentary_hours_per_day", label: "Sedentary hours",    type: "number", unit: "hrs/day",  min: 0, max: 20 },
      { key: "physical_activity_days",  label: "Active days",        type: "number", unit: "/week",    min: 0, max: 7 },
      { key: "sleep_hours_per_day",     label: "Sleep hours",        type: "number", unit: "hrs/day",  min: 2, max: 12, step: "0.5" },
    ],
  },
];

export default function MIRiskForm() {
  const { token, showToast } = useAuth();
  const [values, setValues] = useState({
    age: "", cholesterol: "", heart_rate: "", systolic: "", diastolic: "",
    bmi: "", triglycerides: "", diabetes: 0, family_history: 0, smoking: 0,
    obesity: 0, alcohol_consumption: 0, exercise_hours_per_week: "",
    sedentary_hours_per_day: "", physical_activity_days: "", sleep_hours_per_day: "",
  });
  const [manualFat, setManualFat] = useState("");
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);

  const set = (k, v) => setValues(p => ({ ...p, [k]: v }));

  const submit = async () => {
    setLoading(true);
    try {
      const body = { ...values };
      if (manualFat !== "") body.daily_fat_intake_g = parseFloat(manualFat);
      const res  = await fetch(`${API_BASE}/mi/predict`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Prediction failed");
      setResult(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 680 }}>
      <h1 style={{ margin: "0 0 4px", color: "#0f172a", fontSize: 22, fontWeight: 700 }}>MI Risk Assessment</h1>
      <p style={{ margin: "0 0 24px", color: "#64748b", fontSize: 13 }}>
        Enter your clinical data. Saturated fat intake is auto-pulled from your food logs.
      </p>

      {/* Result banner */}
      {result && (
        <div style={{
          background: RISK_BG[result.mi_risk_category],
          border: `1.5px solid ${RISK_COLOR[result.mi_risk_category]}`,
          borderRadius: 12, padding: "20px 24px", marginBottom: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>MI RISK CATEGORY</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: RISK_COLOR[result.mi_risk_category] }}>
                {result.mi_risk_category}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>RISK SCORE</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: RISK_COLOR[result.mi_risk_category] }}>
                {result.mi_risk_percentage.toFixed(1)}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>CONFIDENCE</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#374151" }}>
                {(result.confidence * 100).toFixed(0)}%
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>CLASS PROBABILITIES</div>
              {Object.entries(result.class_probabilities).map(([cls, p]) => (
                <div key={cls} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ width: 68, fontSize: 12, color: RISK_COLOR[cls], fontWeight: 600 }}>{cls}</span>
                  <div style={{ flex: 1, height: 6, background: "#e2e8f0", borderRadius: 4 }}>
                    <div style={{ width: `${p*100}%`, height: 6, background: RISK_COLOR[cls], borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 11, color: "#6b7280", width: 36, textAlign: "right" }}>{(p*100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fat intake source */}
          <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(255,255,255,.6)", borderRadius: 8, fontSize: 12, color: "#374151" }}>
            Fat intake used: <strong>{result.fat_intake_used?.value_g?.toFixed(1)}g</strong>
            {" "}({result.fat_intake_used?.source?.replace(/_/g," ")})
            {result.fat_intake_used?.avg_7d && ` · 7d avg: ${result.fat_intake_used.avg_7d.toFixed(1)}g`}
            {result.fat_intake_used?.avg_30d && ` · 30d avg: ${result.fat_intake_used.avg_30d.toFixed(1)}g`}
          </div>

          {/* Top risk factors */}
          {result.top_risk_factors?.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}>TOP RISK DRIVERS</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {result.top_risk_factors.map((f, i) => (
                  <span key={i} style={{
                    padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: "rgba(255,255,255,.8)", color: "#374151",
                    border: "1px solid rgba(0,0,0,.08)",
                  }}>
                    {f.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 28, border: "1px solid #e2e8f0" }}>
        {SECTIONS.map(sec => (
          <div key={sec.title} style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 16,
              paddingBottom: 8, borderBottom: "1px solid #f1f5f9" }}>
              {sec.title}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
              {sec.fields.map(f => (
                <div key={f.key} style={fld}>
                  <label style={lbl}>{f.label}{f.unit && <span style={{ color: "#94a3b8", fontWeight: 400, marginLeft: 4 }}>({f.unit})</span>}</label>
                  {f.type === "toggle" ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      {[["No", 0], ["Yes", 1]].map(([txt, val]) => (
                        <button key={val} onClick={() => set(f.key, val)} style={{
                          flex: 1, padding: "9px 0", borderRadius: 8, fontSize: 13, fontWeight: 500,
                          border: `1.5px solid ${values[f.key] === val ? "#3b82f6" : "#e2e8f0"}`,
                          background: values[f.key] === val ? "#eff6ff" : "#fff",
                          color: values[f.key] === val ? "#1d4ed8" : "#64748b",
                          cursor: "pointer",
                        }}>
                          {txt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      type={f.type} step={f.step || "1"} min={f.min} max={f.max}
                      value={values[f.key]}
                      onChange={e => set(f.key, e.target.value)}
                      style={inp}
                      placeholder={`${f.min ?? 0} – ${f.max ?? "∞"}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Manual fat override */}
        <div style={{ background: "#f8fafc", borderRadius: 8, padding: "14px 16px", marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
            Saturated fat intake override <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span>
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10 }}>
            Leave blank to auto-calculate from food logs (today → 7-day avg → 30-day avg)
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              type="number" min="0" max="300" step="0.1"
              value={manualFat} onChange={e => setManualFat(e.target.value)}
              placeholder="e.g. 18.5"
              style={{ ...inp, width: 120, flex: "0 0 120px" }}
            />
            <span style={{ fontSize: 12, color: "#6b7280" }}>g/day saturated fat</span>
          </div>
        </div>

        <button onClick={submit} disabled={loading} style={{
          width: "100%", padding: 14, borderRadius: 8, border: "none",
          background: "#1e3a5f", color: "#fff", fontWeight: 700, fontSize: 14,
          cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
        }}>
          {loading ? "Predicting…" : "Predict MI Risk"}
        </button>
      </div>
    </div>
  );
}