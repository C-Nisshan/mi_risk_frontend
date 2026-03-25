// src/components/Layout.jsx
import { useAuth } from "../App";

const NAV = [
  { id: "dashboard", label: "Dashboard",     icon: "▦" },
  { id: "food",      label: "Log Food",      icon: "◎" },
  { id: "risk",      label: "MI Risk Check", icon: "♥" },
  { id: "history",   label: "History",       icon: "◷" },
];

// ── Shared palette (matches Login / Register / FoodLogger / MIRiskForm) ──
// bg-deep:    #060d1a
// bg-card:    #0d1b2e
// bg-surface: #091524
// accent:     #0ec3af
// accent2:    #6366f1
// border:     rgba(255,255,255,0.08)
// text:       #fff  /  rgba(255,255,255,0.4)

export default function Layout({ page, setPage, children }) {
  const { logout } = useAuth();

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      background: "#060d1a",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      <style>{`
        @keyframes sideGlow{0%,100%{opacity:.5}50%{opacity:1}}
        .nav-btn:hover{background:rgba(14,195,175,0.08)!important;color:rgba(255,255,255,0.75)!important;}
        .nav-btn{transition:all .18s!important;}
        .logout-btn:hover{background:rgba(255,255,255,0.07)!important;color:rgba(255,255,255,0.6)!important;}
        .logout-btn{transition:all .18s!important;}
      `}</style>

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: "linear-gradient(180deg,#0a1628 0%,#060d1a 100%)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        display: "flex", flexDirection: "column",
        position: "fixed", height: "100vh", top: 0, left: 0, zIndex: 100,
      }}>
        {/* Subtle accent line at top */}
        <div style={{
          height: 2,
          background: "linear-gradient(90deg,#0ec3af,#6366f1,transparent)",
        }}/>

        {/* Brand */}
        <div style={{ padding: "24px 20px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "linear-gradient(135deg,#0ec3af,#6366f1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, flexShrink: 0,
              boxShadow: "0 4px 14px rgba(14,195,175,0.28)",
            }}>♥</div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>
                MI Risk Tracker
              </div>
              <div style={{ color: "rgba(14,195,175,0.6)", fontSize: 10, marginTop: 2, letterSpacing: .4 }}>
                Dietary Fat Monitor
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 10px" }}>
          {NAV.map(n => {
            const active = page === n.id;
            return (
              <button key={n.id} onClick={() => setPage(n.id)} className="nav-btn" style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "10px 12px", borderRadius: 10,
                border: active ? "1px solid rgba(14,195,175,0.22)" : "1px solid transparent",
                cursor: "pointer", marginBottom: 4,
                background: active
                  ? "linear-gradient(135deg,rgba(14,195,175,0.14),rgba(99,102,241,0.08))"
                  : "transparent",
                color: active ? "#0ec3af" : "rgba(255,255,255,0.4)",
                fontSize: 13, fontWeight: active ? 600 : 400,
              }}>
                <span style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14,
                  background: active ? "rgba(14,195,175,0.15)" : "rgba(255,255,255,0.04)",
                }}>
                  {n.icon}
                </span>
                {n.label}
                {active && (
                  <div style={{
                    marginLeft: "auto", width: 6, height: 6, borderRadius: "50%",
                    background: "#0ec3af", boxShadow: "0 0 6px rgba(14,195,175,0.8)",
                  }}/>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: "0 10px 20px" }}>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16, marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)",
              textTransform: "uppercase", letterSpacing: .6, paddingLeft: 12, marginBottom: 8 }}>
              Account
            </div>
          </div>
          <button onClick={logout} className="logout-btn" style={{
            width: "100%", padding: "10px 12px", borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.03)",
            color: "rgba(255,255,255,0.35)", fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 14 }}>⎋</span>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────── */}
      <main style={{
        marginLeft: 220,
        flex: 1,
        width: "calc(100vw - 220px)",
        minWidth: 0,
        padding: "32px 36px",
        boxSizing: "border-box",
        overflowX: "hidden",
        // Subtle bg grid matching auth pages
        backgroundImage: `linear-gradient(rgba(14,195,175,0.025) 1px,transparent 1px),
                          linear-gradient(90deg,rgba(14,195,175,0.025) 1px,transparent 1px)`,
        backgroundSize: "52px 52px",
      }}>
        {children}
      </main>
    </div>
  );
}