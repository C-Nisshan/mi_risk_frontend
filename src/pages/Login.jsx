// src/pages/Login.jsx
import { useState, useEffect } from "react";
import { useAuth, API_BASE } from "../App";

export default function Login({ onSwitch }) {
  const { setToken, showToast } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulse(p => 1 - p), 1800);
    return () => clearInterval(t);
  }, []);

  const ECG_PATHS = [
    "M0,60 C80,20 160,100 240,60 C320,20 400,100 480,60 C560,20 640,100 720,60 C800,20 880,100 960,60",
    "M0,60 C80,100 160,20 240,60 C320,100 400,20 480,60 C560,100 640,20 720,60 C800,100 880,20 960,60",
  ];

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      setToken(data.token);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex" style={{ background: "#060d1a", position: "relative", overflow: "hidden" }}>
      {/* Background Effects */}
      <div className="position-absolute inset-0" style={{ zIndex: 0, pointerEvents: "none" }}>
        <div
          className="position-absolute rounded-circle"
          style={{
            width: 620,
            height: 620,
            top: -200,
            left: -160,
            background: "radial-gradient(circle, rgba(14,195,175,0.16) 0%, transparent 70%)",
            animation: "f1 8s ease-in-out infinite",
          }}
        />
        <div
          className="position-absolute rounded-circle"
          style={{
            width: 500,
            height: 500,
            bottom: -80,
            right: -80,
            background: "radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)",
            animation: "f2 11s ease-in-out infinite",
          }}
        />
        <div
          className="position-absolute"
          style={{
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(14,195,175,0.035) 1px,transparent 1px),
              linear-gradient(90deg,rgba(14,195,175,0.035) 1px,transparent 1px)
            `,
            backgroundSize: "52px 52px",
          }}
        />
      </div>

      <style>{`
        @keyframes f1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(28px,-38px); } }
        @keyframes f2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-22px,28px); } }
        @keyframes fadein { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        input::placeholder { color: rgba(255,255,255,0.28); }
      `}</style>

      <div className="container-fluid">
        <div className="row min-vh-100 align-items-center">
          
          {/* Left Brand Panel */}
          <div className="col-lg-5 d-none d-lg-flex flex-column justify-content-center px-5 position-relative" style={{ zIndex: 1 }}>
            <div className="mb-5">
              <div 
                className="d-inline-flex align-items-center justify-content-center rounded-4 mb-4"
                style={{
                  width: 64,
                  height: 64,
                  background: "linear-gradient(135deg, #0ec3af, #6366f1)",
                  boxShadow: "0 10px 40px rgba(14,195,175,0.4)",
                }}
              >
                <i className="bi bi-heart-pulse-fill fs-2 text-white"></i>
              </div>
              <h1 className="display-4 fw-bold text-white lh-1">
                MI Risk<br />
                <span className="text-success">Tracker</span>
              </h1>
            </div>

            <p className="lead text-white-50 mb-5" style={{ maxWidth: "340px" }}>
              Monitor dietary saturated fat and assess myocardial infarction risk with AI-powered analysis.
            </p>

            {/* Animated ECG */}
            <div className="mb-5">
              <svg viewBox="0 0 960 120" style={{ width: "100%", maxWidth: "380px", opacity: 0.6 }}>
                <path
                  d={ECG_PATHS[pulse]}
                  fill="none"
                  stroke="#0ec3af"
                  strokeWidth="3"
                  strokeLinecap="round"
                  style={{ transition: "d 1.8s cubic-bezier(.4,0,.2,1)" }}
                />
              </svg>
            </div>

            <div className="d-flex gap-5">
              {[
                { value: "11", label: "Food Classes" },
                { value: "3-Tier", label: "Fat Lookup" },
                { value: "ML", label: "Risk Model" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="fs-2 fw-bold text-success">{item.value}</div>
                  <div className="small text-white-50">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <div className="col-lg-7 col-12 d-flex align-items-center justify-content-center p-4" style={{ zIndex: 1 }}>
            <div 
              className="w-100" 
              style={{ maxWidth: "420px" }}
            >
              <div 
                className="card border-0 shadow-xl"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  backdropFilter: "blur(28px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <h2 className="fw-bold text-white mb-1">Welcome back</h2>
                    <p className="text-white-50">Sign in to continue tracking your health</p>
                  </div>

                  <form onSubmit={submit}>
                    <div className="mb-4">
                      <label className="form-label text-uppercase small fw-semibold text-white-50">Email Address</label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text bg-transparent border-end-0 text-white-50">
                          <i className="bi bi-envelope"></i>
                        </span>
                        <input
                          type="email"
                          className="form-control bg-transparent border-start-0 text-white"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label text-uppercase small fw-semibold text-white-50">Password</label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text bg-transparent border-end-0 text-white-50">
                          <i className="bi bi-lock"></i>
                        </span>
                        <input
                          type="password"
                          className="form-control bg-transparent border-start-0 text-white"
                          placeholder="••••••••"
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-success w-100 py-3 fw-bold fs-5 mt-3"
                      style={{
                        background: "linear-gradient(135deg, #0ec3af, #0aad9b)",
                        boxShadow: "0 8px 25px rgba(14,195,175,0.35)",
                      }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-3"></span>
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign In <i className="bi bi-arrow-right ms-2"></i>
                        </>
                      )}
                    </button>
                  </form>

                  <div className="text-center mt-5 pt-4 border-top border-light border-opacity-10">
                    <span className="text-white-50">Don't have an account? </span>
                    <button
                      onClick={onSwitch}
                      className="btn btn-link text-success p-0 fw-semibold text-decoration-none"
                    >
                      Create one now →
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer note */}
              <div className="text-center mt-4">
                <small className="text-white-50">Protected by secure JWT authentication</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}