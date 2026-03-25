// src/pages/Register.jsx
import { useState } from "react";
import { useAuth, API_BASE } from "../App";

export default function Register({ onSwitch }) {
  const { showToast } = useAuth();
  const [form, setForm]       = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/auth/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      showToast("Account created! Please sign in.");
      onSwitch();
    } catch (err) {
      showToast(err.message, "error");
    } finally { setLoading(false); }
  };

  const fld = (name) => ({
    width: "100%", padding: "13px 16px 13px 44px",
    borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box",
    transition: "all .25s",
    background: focused === name ? "rgba(255,255,255,0.13)" : "rgba(255,255,255,0.07)",
    border: focused === name ? "1.5px solid rgba(14,195,175,0.7)" : "1.5px solid rgba(255,255,255,0.1)",
    color: "#fff", caretColor: "#0ec3af",
  });

  const FEATURES = [
    { icon: "📸", title: "AI Food Recognition", desc: "Upload any food photo for instant identification" },
    { icon: "🧪", title: "Sat Fat Analysis",    desc: "3-tier USDA-backed nutritional breakdown" },
    { icon: "❤️", title: "MI Risk Model",        desc: "Clinical ML model with top risk factor insights" },
  ];

  return (
    <div style={{ minHeight:"100vh", display:"flex",
      fontFamily:"'DM Sans','Segoe UI',sans-serif",
      background:"#060d1a", position:"relative", overflow:"hidden" }}>
      <style>{`
        @keyframes f1{0%,100%{transform:translate(0,0)}50%{transform:translate(28px,-38px)}}
        @keyframes f2{0%,100%{transform:translate(0,0)}50%{transform:translate(-22px,28px)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes fadein{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideup{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        input::placeholder{color:rgba(255,255,255,0.28);}
        .abtn:hover:not(:disabled){background:linear-gradient(135deg,#0bc4af,#0aa898)!important;transform:translateY(-1px);box-shadow:0 10px 28px rgba(14,195,175,0.45)!important;}
        .abtn{transition:all .2s!important;}
        .sw:hover{color:#0ec3af!important;}
        .fc:hover{background:rgba(14,195,175,0.1)!important;border-color:rgba(14,195,175,0.25)!important;}
        .fc{transition:all .2s!important;}
      `}</style>

      {/* BG orbs */}
      <div style={{ position:"absolute",inset:0,zIndex:0,pointerEvents:"none" }}>
        <div style={{ position:"absolute",width:620,height:620,borderRadius:"50%",top:-200,right:-160,
          background:"radial-gradient(circle,rgba(14,195,175,0.16) 0%,transparent 70%)",animation:"f1 8s ease-in-out infinite" }}/>
        <div style={{ position:"absolute",width:500,height:500,borderRadius:"50%",bottom:-80,left:-80,
          background:"radial-gradient(circle,rgba(99,102,241,0.14) 0%,transparent 70%)",animation:"f2 11s ease-in-out infinite" }}/>
        <div style={{ position:"absolute",inset:0,
          backgroundImage:"linear-gradient(rgba(14,195,175,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(14,195,175,0.035) 1px,transparent 1px)",
          backgroundSize:"52px 52px" }}/>
      </div>

      {/* ── Left — form ─────────────────────────────────── */}
      <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",
        padding:"40px 32px",position:"relative",zIndex:1 }}>
        <div style={{ width:"100%",maxWidth:420,
          background:"rgba(255,255,255,0.05)",backdropFilter:"blur(28px)",
          borderRadius:24,border:"1px solid rgba(255,255,255,0.09)",padding:"40px 36px",
          boxShadow:"0 24px 80px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.09)",
          animation:"fadein .5s ease both" }}>

          <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:28 }}>
            <div style={{ width:40,height:40,borderRadius:12,
              background:"linear-gradient(135deg,#0ec3af,#6366f1)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:18,boxShadow:"0 4px 16px rgba(14,195,175,0.3)" }}>♥</div>
            <div>
              <h2 style={{ margin:0,fontSize:20,fontWeight:700,color:"#fff" }}>Create Account</h2>
              <p style={{ margin:0,color:"rgba(255,255,255,0.38)",fontSize:12 }}>Start tracking your MI risk today</p>
            </div>
          </div>

          <form onSubmit={submit}>
            {[
              { key:"username", label:"Username", type:"text",  icon:"👤", ph:"johndoe" },
              { key:"email",    label:"Email",    type:"email", icon:"✉",  ph:"you@example.com" },
              { key:"password", label:"Password", type:"password",icon:"🔒",ph:"••••••••" },
            ].map(({key,label,type,icon,ph},i) => (
              <div key={key} style={{ marginBottom:i===2?28:14,position:"relative" }}>
                <label style={{ fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.45)",
                  letterSpacing:.6,textTransform:"uppercase",display:"block",marginBottom:6 }}>{label}</label>
                <span style={{ position:"absolute",left:14,top:35,fontSize:14,color:"rgba(255,255,255,0.28)" }}>{icon}</span>
                <input type={type} placeholder={ph} required
                  value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}
                  onFocus={()=>setFocused(key)} onBlur={()=>setFocused(null)}
                  style={fld(key)} />
              </div>
            ))}

            <button type="submit" disabled={loading} className="abtn" style={{
              width:"100%",padding:"14px 0",borderRadius:12,border:"none",
              background:"linear-gradient(135deg,#0ec3af,#0aad9b)",
              color:"#fff",fontWeight:700,fontSize:15,
              cursor:loading?"not-allowed":"pointer",opacity:loading?0.72:1,
              boxShadow:"0 4px 18px rgba(14,195,175,0.32)" }}>
              {loading
                ?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                     style={{animation:"spin .75s linear infinite"}}>
                     <circle cx="12" cy="12" r="10" opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10"/>
                   </svg>Creating…
                 </span>
                :"Create account →"}
            </button>
          </form>

          <div style={{ marginTop:20,textAlign:"center",borderTop:"1px solid rgba(255,255,255,0.07)",paddingTop:18 }}>
            <span style={{ fontSize:13,color:"rgba(255,255,255,.32)" }}>Already have an account? </span>
            <button onClick={onSwitch} className="sw" style={{ background:"none",border:"none",
              color:"#0ec3af",cursor:"pointer",fontWeight:600,fontSize:13,padding:0,transition:"color .2s" }}>
              Sign in →
            </button>
          </div>
        </div>
      </div>

      {/* ── Right — features ─────────────────────────────── */}
      <div style={{ flex:"0 0 44%",display:"flex",flexDirection:"column",
        justifyContent:"center",padding:"60px 52px",position:"relative",zIndex:1 }}>
        <p style={{ margin:"0 0 8px",fontSize:12,fontWeight:600,
          color:"rgba(14,195,175,0.7)",letterSpacing:1.2,textTransform:"uppercase" }}>Everything you need</p>
        <h2 style={{ margin:"0 0 36px",fontSize:32,fontWeight:800,color:"#fff",
          lineHeight:1.2,letterSpacing:-0.5 }}>
          Your complete<br/>cardiac health hub
        </h2>

        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          {FEATURES.map((f,i) => (
            <div key={i} className="fc" style={{
              display:"flex",alignItems:"flex-start",gap:16,
              background:"rgba(255,255,255,0.04)",
              border:"1px solid rgba(255,255,255,0.08)",
              borderRadius:14,padding:"16px 18px",
              animation:`slideup .4s ease ${i*.1+.2}s both` }}>
              <div style={{ fontSize:22,flexShrink:0,marginTop:1 }}>{f.icon}</div>
              <div>
                <div style={{ fontWeight:600,color:"#fff",fontSize:14,marginBottom:3 }}>{f.title}</div>
                <div style={{ color:"rgba(255,255,255,0.38)",fontSize:12,lineHeight:1.5 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop:32,padding:"14px 18px",
          background:"rgba(14,195,175,0.08)",borderRadius:12,
          border:"1px solid rgba(14,195,175,0.18)" }}>
          <div style={{ fontSize:12,color:"rgba(14,195,175,0.8)",fontWeight:600,marginBottom:4 }}>Free to use</div>
          <div style={{ fontSize:12,color:"rgba(255,255,255,0.4)",lineHeight:1.5 }}>
            No credit card required. Start logging food and tracking your MI risk immediately.
          </div>
        </div>
      </div>
    </div>
  );
}