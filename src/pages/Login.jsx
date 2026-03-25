// src/pages/Login.jsx
import { useState, useEffect } from "react";
import { useAuth, API_BASE } from "../App";

export default function Login({ onSwitch }) {
  const { setToken, showToast } = useAuth();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [pulse, setPulse]     = useState(0);

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
      const res  = await fetch(`${API_BASE}/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      setToken(data.token);
    } catch (err) {
      showToast(err.message, "error");
    } finally { setLoading(false); }
  };

  const fld = (name) => ({
    width: "100%", padding: "13px 16px 13px 44px",
    borderRadius: 10, fontSize: 14, outline: "none",
    boxSizing: "border-box", transition: "all .25s",
    background: focused === name ? "rgba(255,255,255,0.13)" : "rgba(255,255,255,0.07)",
    border: focused === name ? "1.5px solid rgba(14,195,175,0.7)" : "1.5px solid rgba(255,255,255,0.1)",
    color: "#fff", caretColor: "#0ec3af",
  });

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: "#060d1a", position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @keyframes f1{0%,100%{transform:translate(0,0)}50%{transform:translate(28px,-38px)}}
        @keyframes f2{0%,100%{transform:translate(0,0)}50%{transform:translate(-22px,28px)}}
        @keyframes f3{0%,100%{transform:translate(0,0)}50%{transform:translate(14px,22px)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes fadein{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}
        input::placeholder{color:rgba(255,255,255,0.28);}
        .abtn:hover:not(:disabled){background:linear-gradient(135deg,#0bc4af,#0aa898)!important;transform:translateY(-1px);box-shadow:0 10px 28px rgba(14,195,175,0.45)!important;}
        .abtn{transition:all .2s!important;}
        .sw:hover{color:#0ec3af!important;}
      `}</style>

      {/* Background orbs */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position:"absolute", width:620, height:620, borderRadius:"50%", top:-200, left:-160,
          background:"radial-gradient(circle,rgba(14,195,175,0.16) 0%,transparent 70%)", animation:"f1 8s ease-in-out infinite" }} />
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", bottom:-80, right:-80,
          background:"radial-gradient(circle,rgba(99,102,241,0.14) 0%,transparent 70%)", animation:"f2 11s ease-in-out infinite" }} />
        <div style={{ position:"absolute", width:320, height:320, borderRadius:"50%", top:"45%", left:"32%",
          background:"radial-gradient(circle,rgba(14,195,175,0.07) 0%,transparent 70%)", animation:"f3 13s ease-in-out infinite" }} />
        <div style={{ position:"absolute", inset:0,
          backgroundImage:"linear-gradient(rgba(14,195,175,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(14,195,175,0.035) 1px,transparent 1px)",
          backgroundSize:"52px 52px" }} />
      </div>

      {/* ── Left — brand panel ───────────────────────────── */}
      <div style={{ flex:"0 0 44%", display:"flex", flexDirection:"column",
        justifyContent:"center", padding:"60px 52px", position:"relative", zIndex:1 }}>
        <div style={{ width:54, height:54, borderRadius:16, marginBottom:28,
          background:"linear-gradient(135deg,#0ec3af,#6366f1)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:26, boxShadow:"0 8px 32px rgba(14,195,175,0.35)" }}>♥</div>

        <h1 style={{ margin:0, fontSize:40, fontWeight:800, lineHeight:1.1,
          color:"#fff", letterSpacing:-1.5 }}>
          MI Risk<br/><span style={{ color:"#0ec3af" }}>Tracker</span>
        </h1>
        <p style={{ margin:"18px 0 0", color:"rgba(255,255,255,0.4)", fontSize:14,
          lineHeight:1.7, maxWidth:300 }}>
          Monitor dietary saturated fat and assess myocardial infarction risk with AI-powered analysis.
        </p>

        <svg viewBox="0 0 960 120" style={{ width:"100%", maxWidth:360, marginTop:40, opacity:.45 }}>
          <path d={ECG_PATHS[pulse]} fill="none" stroke="#0ec3af" strokeWidth="2.5"
            strokeLinecap="round"
            style={{ transition:"d 1.8s cubic-bezier(.4,0,.2,1)", animation:"pulse 1.8s ease-in-out infinite" }} />
        </svg>

        <div style={{ display:"flex", gap:36, marginTop:40 }}>
          {[["11","Food Classes"],["3-Tier","Fat Lookup"],["ML","Risk Model"]].map(([v,l]) => (
            <div key={l}>
              <div style={{ fontSize:20, fontWeight:800, color:"#0ec3af" }}>{v}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,.32)", marginTop:3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right — glass form ───────────────────────────── */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center",
        padding:"40px 32px", position:"relative", zIndex:1 }}>
        <div style={{ width:"100%", maxWidth:400,
          background:"rgba(255,255,255,0.05)", backdropFilter:"blur(28px)",
          borderRadius:24, border:"1px solid rgba(255,255,255,0.09)",
          padding:"40px 36px",
          boxShadow:"0 24px 80px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.09)",
          animation:"fadein .5s ease both" }}>

          <h2 style={{ margin:"0 0 4px", fontSize:22, fontWeight:700, color:"#fff" }}>Welcome back</h2>
          <p style={{ margin:"0 0 28px", color:"rgba(255,255,255,0.38)", fontSize:13 }}>Sign in to your account</p>

          <form onSubmit={submit}>
            <div style={{ marginBottom:16, position:"relative" }}>
              <label style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.45)",
                letterSpacing:.6, textTransform:"uppercase", display:"block", marginBottom:7 }}>Email</label>
              <span style={{ position:"absolute", left:14, top:37, fontSize:14, color:"rgba(255,255,255,0.28)" }}>✉</span>
              <input type="email" placeholder="you@example.com" required
                value={form.email} onChange={e => setForm({...form,email:e.target.value})}
                onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                style={fld("email")} />
            </div>

            <div style={{ marginBottom:28, position:"relative" }}>
              <label style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.45)",
                letterSpacing:.6, textTransform:"uppercase", display:"block", marginBottom:7 }}>Password</label>
              <span style={{ position:"absolute", left:14, top:37, fontSize:13, color:"rgba(255,255,255,0.28)" }}>🔒</span>
              <input type="password" placeholder="••••••••" required
                value={form.password} onChange={e => setForm({...form,password:e.target.value})}
                onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
                style={fld("password")} />
            </div>

            <button type="submit" disabled={loading} className="abtn" style={{
              width:"100%", padding:"14px 0", borderRadius:12, border:"none",
              background:"linear-gradient(135deg,#0ec3af,#0aad9b)",
              color:"#fff", fontWeight:700, fontSize:15,
              cursor:loading?"not-allowed":"pointer",
              opacity:loading?0.72:1,
              boxShadow:"0 4px 18px rgba(14,195,175,0.32)" }}>
              {loading
                ? <span style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      style={{ animation:"spin .75s linear infinite" }}>
                      <circle cx="12" cy="12" r="10" opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10"/>
                    </svg>Signing in…
                  </span>
                : "Sign in →"}
            </button>
          </form>

          <div style={{ marginTop:24, textAlign:"center",
            borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:20 }}>
            <span style={{ fontSize:13, color:"rgba(255,255,255,.32)" }}>No account? </span>
            <button onClick={onSwitch} className="sw" style={{ background:"none", border:"none",
              color:"#0ec3af", cursor:"pointer", fontWeight:600, fontSize:13,
              padding:0, transition:"color .2s" }}>Create one →</button>
          </div>
        </div>
      </div>
    </div>
  );
}