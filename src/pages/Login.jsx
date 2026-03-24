// src/pages/Login.jsx
import { useState } from "react";
import { useAuth, API_BASE } from "../App";

const field = {
  width: "100%", padding: "11px 14px", borderRadius: 8,
  border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none",
  background: "#fff", boxSizing: "border-box", marginBottom: 14,
};

export default function Login({ onSwitch }) {
  const { setToken, showToast } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/auth/login`, {
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
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "linear-gradient(135deg,#0f172a,#1e3a5f)",
      fontFamily: "Inter, system-ui, sans-serif",
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: "40px 36px",
        width: 380, boxShadow: "0 20px 60px rgba(0,0,0,.25)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>♥</div>
          <h2 style={{ margin: 0, color: "#0f172a", fontWeight: 700 }}>MI Risk Tracker</h2>
          <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 13 }}>
            Sign in to your account
          </p>
        </div>

        <form onSubmit={submit}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Email</label>
          <input style={field} type="email" placeholder="you@example.com"
            value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Password</label>
          <input style={field} type="password" placeholder="••••••••"
            value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          <button type="submit" disabled={loading} style={{
            width: "100%", padding: 12, borderRadius: 8, border: "none",
            background: "#1e3a5f", color: "#fff", fontWeight: 600, fontSize: 14,
            cursor: loading ? "not-allowed" : "pointer", marginTop: 4,
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#64748b" }}>
          No account?{" "}
          <button onClick={onSwitch} style={{ background: "none", border: "none",
            color: "#3b82f6", cursor: "pointer", fontWeight: 600, padding: 0 }}>
            Register
          </button>
        </p>
      </div>
    </div>
  );
}