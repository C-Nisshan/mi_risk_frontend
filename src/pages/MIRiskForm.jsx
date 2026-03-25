import { useState } from "react";
import { useAuth, API_BASE } from "../App";

const RC = { Low: "#10b981", Moderate: "#f59e0b", High: "#ef4444" };
const RB = { Low: "rgba(16,185,129,0.12)", Moderate: "rgba(245,158,11,0.12)", High: "rgba(239,68,68,0.12)" };

const STEPS = [
  {
    id: "vitals",
    icon: "bi bi-heart-pulse-fill",
    title: "Clinical Vitals",
    subtitle: "Core measurements from your last checkup",
    fields: [
      { key: "age", label: "Age", type: "number", unit: "years", min: 18, max: 90, col: 1 },
      { key: "cholesterol", label: "Total Cholesterol", type: "number", unit: "mg/dL", min: 50, max: 400, col: 2 },
      { key: "heart_rate", label: "Heart Rate", type: "number", unit: "bpm", min: 30, max: 200, col: 1 },
      { key: "systolic", label: "Systolic BP", type: "number", unit: "mmHg", min: 80, max: 200, col: 2 },
      { key: "diastolic", label: "Diastolic BP", type: "number", unit: "mmHg", min: 40, max: 130, col: 1 },
      { key: "bmi", label: "BMI", type: "number", step: "0.1", min: 10, max: 60, col: 2 },
      { key: "triglycerides", label: "Triglycerides", type: "number", unit: "mg/dL", min: 20, max: 800, col: 1 },
    ],
  },
  {
    id: "factors",
    icon: "bi bi-shield-exclamation",
    title: "Risk Factors",
    subtitle: "Medical history and lifestyle risk indicators",
    fields: [
      { key: "diabetes", label: "Diabetes", type: "toggle", col: 1 },
      { key: "family_history", label: "Family History of MI", type: "toggle", col: 2 },
      { key: "smoking", label: "Smoking", type: "toggle", col: 1 },
      { key: "obesity", label: "Obesity (self-report)", type: "toggle", col: 2 },
      { key: "alcohol_consumption", label: "Alcohol Consumption", type: "toggle", col: 1 },
    ],
  },
  {
    id: "lifestyle",
    icon: "bi bi-activity",
    title: "Lifestyle",
    subtitle: "Daily activity and sleep patterns",
    fields: [
      { key: "exercise_hours_per_week", label: "Exercise", type: "number", unit: "hrs/week", min: 0, max: 30, col: 1 },
      { key: "sedentary_hours_per_day", label: "Sedentary Time", type: "number", unit: "hrs/day", min: 0, max: 20, col: 2 },
      { key: "physical_activity_days", label: "Active Days per Week", type: "number", unit: "days/wk", min: 0, max: 7, col: 1 },
      { key: "sleep_hours_per_day", label: "Sleep", type: "number", unit: "hrs/day", min: 2, max: 12, step: "0.5", col: 2 },
    ],
  },
  {
    id: "diet",
    icon: "bi bi-utensils",
    title: "Dietary Fat",
    subtitle: "Optional — auto-pulled from your food logs if left blank",
    fields: [
      { key: "daily_fat_override", label: "Daily Saturated Fat Override", type: "number", unit: "g/day", min: 0, max: 300, step: "0.1", optional: true, col: "full" },
    ],
  },
];

function ResultModal({ result, onClose }) {
  if (!result) return null;
  const cat = result.mi_risk_category;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(6,13,26,0.92)" }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content bg-dark border-0" style={{ border: `1px solid ${RC[cat]}44` }}>
          <div className="modal-header border-0 pb-0" style={{ background: `linear-gradient(135deg,${RB[cat]},rgba(99,102,241,0.08))` }}>
            <div className="d-flex gap-4 flex-wrap">
              <div className="text-center">
                <div className="text-uppercase small opacity-50">MI Risk</div>
                <div className="display-4 fw-bold" style={{ color: RC[cat] }}>{cat}</div>
              </div>
              <div className="text-center">
                <div className="text-uppercase small opacity-50">Score</div>
                <div className="display-4 fw-bold" style={{ color: RC[cat] }}>
                  {result.mi_risk_percentage.toFixed(0)}<span className="fs-4 fw-normal opacity-50">%</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-uppercase small opacity-50">Confidence</div>
                <div className="display-4 fw-bold text-white">
                  {(result.confidence * 100).toFixed(0)}<span className="fs-4 fw-normal opacity-50">%</span>
                </div>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <h6 className="text-uppercase small opacity-50 mb-3">Class Probabilities</h6>
            {Object.entries(result.class_probabilities).map(([cls, p]) => (
              <div key={cls} className="mb-3">
                <div className="d-flex justify-content-between small mb-1">
                  <span style={{ color: RC[cls], fontWeight: 600 }}>{cls}</span>
                  <span className="opacity-50">{(p * 100).toFixed(0)}%</span>
                </div>
                <div className="progress" style={{ height: "8px" }}>
                  <div className="progress-bar" style={{ width: `${p * 100}%`, backgroundColor: RC[cls] }}></div>
                </div>
              </div>
            ))}

            {result.fat_intake_used && (
              <div className="mt-4 p-3 rounded-3" style={{ background: "rgba(14,195,175,0.08)", border: "1px solid rgba(14,195,175,0.2)" }}>
                <div className="small opacity-75">Dietary Fat Used</div>
                <div className="fw-semibold">
                  {result.fat_intake_used.value_g?.toFixed(1)} g/day 
                  <span className="ms-2 small opacity-50">
                    via {(result.fat_intake_used.source || "").replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            )}

            {result.top_risk_factors?.length > 0 && (
              <div className="mt-4">
                <h6 className="text-uppercase small opacity-50 mb-3">Top Risk Drivers</h6>
                {result.top_risk_factors.map((f, i) => (
                  <div key={i} className="d-flex gap-3 mb-3 p-3 rounded-3 bg-dark border">
                    <div className="flex-shrink-0 w-8 h-8 rounded-2 d-flex align-items-center justify-content-center fw-bold"
                         style={{ background: `linear-gradient(135deg,${RC[cat]}33,${RC[cat]}11)`, color: RC[cat] }}>
                      {i + 1}
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-semibold">{f.label}</div>
                      <div className="small opacity-50">
                        Value: {f.patient_value} • Importance: {(f.importance * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer border-0">
            <button className="btn btn-success w-100 py-3 fw-semibold" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MIRiskForm() {
  const { token, showToast } = useAuth();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({
    age: "", cholesterol: "", heart_rate: "", systolic: "", diastolic: "",
    bmi: "", triglycerides: "", diabetes: 0, family_history: 0, smoking: 0,
    obesity: 0, alcohol_consumption: 0, exercise_hours_per_week: "",
    sedentary_hours_per_day: "", physical_activity_days: "", sleep_hours_per_day: "",
  });
  const [manualFat, setManualFat] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const set = (k, v) => setValues(p => ({ ...p, [k]: v }));

  const submit = async () => {
    setLoading(true);
    try {
      const body = { ...values };
      if (manualFat !== "" && manualFat !== null) {
        body.daily_fat_intake_g = parseFloat(manualFat);
      }

      const res = await fetch(`${API_BASE}/mi/predict`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(body),
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

  const currentStep = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  const renderField = (f) => {
    if (f.type === "toggle") {
      return (
        <div className="d-flex gap-2">
          {[["No", 0], ["Yes", 1]].map(([txt, val]) => (
            <button
              key={val}
              type="button"
              onClick={() => set(f.key, val)}
              className={`flex-fill btn ${values[f.key] === val ? "btn-success" : "btn-outline-secondary"}`}
            >
              {txt}
            </button>
          ))}
        </div>
      );
    }

    const isOpt = f.key === "daily_fat_override";

    return (
      <div className="position-relative">
        <input
          type="number"
          step={f.step || "1"}
          min={f.min}
          max={f.max}
          placeholder={isOpt ? "Leave blank to auto-calculate from logs" : `Enter value (${f.min}–${f.max})`}
          value={isOpt ? manualFat : values[f.key]}
          onChange={(e) => isOpt ? setManualFat(e.target.value) : set(f.key, e.target.value)}
          className="form-control pe-5"   // padding-right for unit
          style={{ color: "#fff" }}
        />
        {f.unit && (
          <span 
            className="position-absolute top-50 translate-middle-y text-white-50 small"
            style={{ right: "14px", fontSize: "0.875rem" }}
          >
            {f.unit}
          </span>
        )}
      </div>
    );
  };

  const leftFields = currentStep.fields.filter(f => f.col === 1 || f.col === "full");
  const rightFields = currentStep.fields.filter(f => f.col === 2);

  return (
    <div className="container-fluid py-4" style={{ maxWidth: "900px" }}>
      <div className="mb-4">
        <h1 className="h3 fw-bold text-white">MI Risk Assessment</h1>
        <p className="text-muted small">Enter your clinical data. Saturated fat is auto-pulled from food logs when possible.</p>
      </div>

      <div className="card shadow-lg">
        {/* Progress Bar */}
        <div className="progress" style={{ height: "4px" }}>
          <div className="progress-bar bg-success" style={{ width: `${progress}%` }}></div>
        </div>

        {/* Step Indicators */}
        <div className="px-4 pt-4 pb-2">
          <div className="d-flex flex-wrap gap-2">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => i <= step && setStep(i)}
                className={`step-btn btn d-flex align-items-center gap-2 px-3 py-2 rounded-pill flex-grow-1 flex-sm-grow-0
                  ${i === step ? "bg-success bg-opacity-10 text-success border border-success" : "btn-outline-secondary"}`}
                disabled={i > step}
              >
                <div className="d-flex align-items-center justify-content-center rounded-circle" 
                     style={{ width: 32, height: 32, background: i < step ? "#0ec3af" : "rgba(255,255,255,0.1)" }}>
                  {i < step ? <i className="bi bi-check-lg"></i> : <i className={s.icon}></i>}
                </div>
                <span className="small fw-semibold d-none d-sm-inline">{s.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-4">
          <div className="mb-4">
            <h4 className="fw-bold text-white">{currentStep.title}</h4>
            <p className="text-muted small mb-0">{currentStep.subtitle}</p>
          </div>

          <div className="row g-4">
            <div className={rightFields.length ? "col-md-6" : "col-12"}>
              {leftFields.map(f => (
                <div key={f.key} className="mb-4">
                  <label className="form-label text-uppercase small fw-semibold opacity-75">
                    {f.label}
                    {f.optional && <span className="ms-1 opacity-50">(optional)</span>}
                  </label>
                  {renderField(f)}
                </div>
              ))}
            </div>

            {rightFields.length > 0 && (
              <div className="col-md-6">
                {rightFields.map(f => (
                  <div key={f.key} className="mb-4">
                    <label className="form-label text-uppercase small fw-semibold opacity-75">
                      {f.label}
                    </label>
                    {renderField(f)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {currentStep.id === "diet" && (
            <div className="alert alert-info border-0 mt-3" style={{ background: "rgba(14,195,175,0.1)", color: "#e2e8f0" }}>
              <strong>Auto-resolution order:</strong> Today's logs → 7-day average → 30-day average → 0.0g
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center mt-5">
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              className="btn btn-outline-light px-4"
            >
              ← Back
            </button>

            <div className="small text-muted">
              Step {step + 1} of {STEPS.length}
            </div>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                className="btn btn-success px-5"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={loading}
                className="btn btn-success px-5 d-flex align-items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    Predicting...
                  </>
                ) : (
                  <>Predict Risk <i className="bi bi-heart-pulse"></i></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <ResultModal result={result} onClose={() => setResult(null)} />
    </div>
  );
}