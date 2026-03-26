// src/pages/Register.jsx
import { useState, useEffect } from "react";
import { useAuth, API_BASE } from "../App";

export default function Register({ onSwitch }) {
  const { showToast } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setPulse((p) => 1 - p), 1800);
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
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      showToast("Account created successfully! Please sign in.", "success");
      onSwitch(); // Switch to Login page
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const FEATURES = [
    { icon: "bi bi-camera-fill", title: "AI Food Recognition", desc: "Upload any food photo for instant identification" },
    { icon: "bi bi-graph-up", title: "Sat Fat Analysis", desc: "3-tier USDA-backed nutritional breakdown" },
    { icon: "bi bi-heart-pulse-fill", title: "MI Risk Model", desc: "Clinical ML model with top risk factor insights" },
  ];

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "#060d1a",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Effects */}
      <div className="position-absolute inset-0" style={{ zIndex: 0, pointerEvents: "none" }}>
        <div
          className="position-absolute rounded-circle"
          style={{
            width: 620,
            height: 620,
            top: -180,
            right: -140,
            background: "radial-gradient(circle, rgba(14,195,175,0.16) 0%, transparent 70%)",
            animation: "f1 8s ease-in-out infinite",
          }}
        />
        <div
          className="position-absolute rounded-circle"
          style={{
            width: 520,
            height: 520,
            bottom: -100,
            left: -100,
            background: "radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)",
            animation: "f2 11s ease-in-out infinite",
          }}
        />
        <div
          className="position-absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(14,195,175,0.035) 1px,transparent 1px),
              linear-gradient(90deg,rgba(14,195,175,0.035) 1px,transparent 1px)
            `,
            backgroundSize: "52px 52px",
          }}
        />
      </div>

      <style>{`
        @keyframes f1 {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(28px,-38px); }
        }
        @keyframes f2 {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(-22px,28px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 8px 25px rgba(14,195,175,0.35); }
          50% { box-shadow: 0 12px 35px rgba(14,195,175,0.55); }
        }

        .register-card {
          animation: fadeInUp 0.8s ease forwards;
        }

        .form-control {
          transition: all 0.3s ease;
          border: 1px solid rgba(255,255,255,0.15) !important;
          background-color: transparent !important;
          color: white !important;
        }

        .form-control::placeholder {
          color: rgba(255, 255, 255, 0.45) !important;
        }

        .form-control:focus {
          border-color: #0ec3af !important;
          box-shadow: 0 0 0 0.25rem rgba(14,195,175,0.25) !important;
          background-color: rgba(255,255,255,0.03) !important;
        }

        .form-control:hover {
          border-color: rgba(14,195,175,0.4);
        }

        .input-group-text {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.15);
          border-right: none;
          color: rgba(255,255,255,0.5);
          transition: all 0.3s ease;
        }

        .input-group:focus-within .input-group-text {
          border-color: #0ec3af;
          color: #0ec3af;
        }

        .btn-success {
          animation: pulseGlow 2s ease-in-out infinite;
        }

        .ecg-path {
          transition: d 1.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .password-toggle {
          cursor: pointer;
          transition: color 0.2s ease;
        }
        .password-toggle:hover {
          color: #0ec3af;
        }
      `}</style>

      <div className="container py-5">
        <div className="row justify-content-center align-items-center g-5">
          {/* Left: Brand / Features Panel (Now on Left like Login) */}
          <div className="col-lg-5 d-none d-lg-block">
            <div className="h-100 d-flex flex-column justify-content-center">
              <div className="mb-5">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-4 mb-4"
                  style={{
                    width: 72,
                    height: 72,
                    background: "linear-gradient(135deg, #0ec3af, #6366f1)",
                    boxShadow: "0 10px 40px rgba(14,195,175,0.45)",
                  }}
                >
                  <i className="bi bi-heart-pulse-fill fs-1 text-white"></i>
                </div>
                <h1 className="display-4 fw-bold text-white lh-1 mb-3">
                  MI Risk
                  <br />
                  <span className="text-success">Tracker</span>
                </h1>
              </div>

              <p className="lead text-white-50 mb-5" style={{ maxWidth: "360px" }}>
                Join thousands monitoring their dietary saturated fat and myocardial infarction risk with AI.
              </p>

              {/* Animated ECG */}
              <div className="mb-5">
                <svg
                  viewBox="0 0 960 120"
                  style={{ width: "100%", maxWidth: "400px", height: "auto", opacity: 0.75 }}
                >
                  <path
                    d={ECG_PATHS[pulse]}
                    fill="none"
                    stroke="#0ec3af"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ecg-path"
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
          </div>

          {/* Right: Registration Form */}
          <div className="col-lg-6 col-xl-5 col-12">
            <div
              className="register-card card border-0 shadow-xl mx-auto"
              style={{
                background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(28px)",
                border: "1px solid rgba(255,255,255,0.1)",
                maxWidth: "440px",
              }}
            >
              <div className="card-body p-5 p-lg-6">
                <div className="text-center mb-5">
                  <h2 className="fw-bold text-white mb-2">Create Account</h2>
                  <p className="text-white-50">Start tracking your heart health today</p>
                </div>

                <form onSubmit={submit}>
                  {/* Username */}
                  <div className="mb-4">
                    <label className="form-label text-uppercase small fw-semibold text-white-50 mb-2">
                      Username
                    </label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text">
                        <i className="bi bi-person"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="johndoe"
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="mb-4">
                    <label className="form-label text-uppercase small fw-semibold text-white-50 mb-2">
                      Email Address
                    </label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Password with Toggle */}
                  <div className="mb-4">
                    <label className="form-label text-uppercase small fw-semibold text-white-50 mb-2">
                      Password
                    </label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                      />
                      <span
                        className="input-group-text password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ borderLeft: "none", cursor: "pointer" }}
                      >
                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-success w-100 py-3 fw-bold fs-5 mt-3"
                    style={{
                      background: "linear-gradient(135deg, #0ec3af, #0aad9b)",
                      boxShadow: "0 8px 25px rgba(14,195,175,0.35)",
                      border: "none",
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-3"></span>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account <i className="bi bi-arrow-right ms-2"></i>
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center mt-5 pt-4 border-top border-light border-opacity-10">
                  <span className="text-white-50">Already have an account? </span>
                  <button
                    onClick={onSwitch}
                    className="btn btn-link text-success p-0 fw-semibold text-decoration-none"
                  >
                    Sign in →
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
  );
}