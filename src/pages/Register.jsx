// src/pages/Register.jsx
import { useState } from "react";
import { useAuth, API_BASE } from "../App";

export default function Register({ onSwitch }) {
  const { showToast } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

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
    <div className="min-vh-100 d-flex" style={{ background: "#060d1a", position: "relative", overflow: "hidden" }}>
      {/* Background Effects */}
      <div className="position-absolute inset-0" style={{ zIndex: 0, pointerEvents: "none" }}>
        <div
          className="position-absolute rounded-circle"
          style={{
            width: 620,
            height: 620,
            top: -200,
            right: -160,
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
            left: -80,
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
          
          {/* Left: Registration Form */}
          <div className="col-lg-7 col-12 d-flex align-items-center justify-content-center p-4" style={{ zIndex: 1 }}>
            <div className="w-100" style={{ maxWidth: "440px" }}>
              <div 
                className="card border-0 shadow-xl"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  backdropFilter: "blur(28px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div className="card-body p-5">
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div 
                      className="d-flex align-items-center justify-content-center rounded-3"
                      style={{
                        width: 52,
                        height: 52,
                        background: "linear-gradient(135deg, #0ec3af, #6366f1)",
                        boxShadow: "0 6px 20px rgba(14,195,175,0.35)",
                      }}
                    >
                      <i className="bi bi-heart-pulse-fill fs-3 text-white"></i>
                    </div>
                    <div>
                      <h2 className="fw-bold text-white mb-0">Create Account</h2>
                      <p className="text-white-50 small mb-0">Start tracking your MI risk today</p>
                    </div>
                  </div>

                  <form onSubmit={submit}>
                    <div className="mb-4">
                      <label className="form-label text-uppercase small fw-semibold text-white-50">Username</label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text bg-transparent border-end-0 text-white-50">
                          <i className="bi bi-person"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control bg-transparent border-start-0 text-white"
                          placeholder="johndoe"
                          value={form.username}
                          onChange={(e) => setForm({ ...form, username: e.target.value })}
                          required
                        />
                      </div>
                    </div>

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

                    <div className="mb-5">
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
                      className="btn btn-success w-100 py-3 fw-bold fs-5"
                      style={{
                        background: "linear-gradient(135deg, #0ec3af, #0aad9b)",
                        boxShadow: "0 8px 25px rgba(14,195,175,0.35)",
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
            </div>
          </div>

          {/* Right: Features Panel */}
          <div className="col-lg-5 d-none d-lg-flex flex-column justify-content-center px-5 position-relative" style={{ zIndex: 1 }}>
            <div className="mb-5">
              <span className="badge bg-success bg-opacity-10 text-success border border-success px-3 py-2">
                Everything you need
              </span>
            </div>

            <h2 className="display-5 fw-bold text-white lh-1 mb-5">
              Your complete<br />cardiac health hub
            </h2>

            <div className="d-flex flex-column gap-4">
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="d-flex gap-4 p-4 rounded-4"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    transition: "all 0.2s",
                  }}
                >
                  <div className="flex-shrink-0 mt-1">
                    <i className={`${f.icon} fs-2 text-success`}></i>
                  </div>
                  <div>
                    <h5 className="fw-semibold text-white mb-2">{f.title}</h5>
                    <p className="text-white-50 mb-0">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div 
              className="mt-5 p-4 rounded-4"
              style={{
                background: "rgba(14,195,175,0.08)",
                border: "1px solid rgba(14,195,175,0.18)",
              }}
            >
              <div className="small text-success fw-semibold mb-2">Free to use</div>
              <p className="small text-white-50 mb-0">
                No credit card required. Start logging food and tracking your MI risk immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}