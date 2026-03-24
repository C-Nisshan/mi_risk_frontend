// src/components/Layout.jsx
import { useAuth } from "../App";

const NAV = [
  { id: "dashboard", label: "Dashboard",    icon: "▦" },
  { id: "food",      label: "Log Food",     icon: "◎" },
  { id: "risk",      label: "MI Risk Check",icon: "♥" },
  { id: "history",   label: "History",      icon: "◷" },
];

export default function Layout({ page, setPage, children }) {
  const { logout } = useAuth();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Sidebar */}
      <aside style={{
        width: 220, background: "#0f172a", display: "flex",
        flexDirection: "column", padding: "24px 0", flexShrink: 0,
        position: "fixed", height: "100vh", top: 0, left: 0, zIndex: 100,
      }}>
        {/* Brand */}
        <div style={{ padding: "0 24px 32px", borderBottom: "1px solid #1e293b" }}>
          <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>
            ♥ MI Risk Tracker
          </div>
          <div style={{ color: "#64748b", fontSize: 11, marginTop: 4 }}>
            Dietary Fat Monitor
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "20px 12px" }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              display: "flex", alignItems: "center", gap: 10,
              width: "100%", padding: "11px 14px", borderRadius: 8,
              border: "none", cursor: "pointer", marginBottom: 4,
              background: page === n.id ? "#1e3a5f" : "transparent",
              color:      page === n.id ? "#93c5fd" : "#94a3b8",
              fontSize: 13, fontWeight: page === n.id ? 600 : 400,
              transition: "all .15s",
            }}>
              <span style={{ fontSize: 16 }}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: "0 12px 12px" }}>
          <button onClick={logout} style={{
            width: "100%", padding: "10px 14px", borderRadius: 8,
            border: "1px solid #334155", background: "transparent",
            color: "#64748b", fontSize: 13, cursor: "pointer",
          }}>
            ⎋ Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 220, flex: 1, padding: "32px", maxWidth: "calc(100vw - 220px)", overflowX: "hidden" }}>
        {children}
      </main>
    </div>
  );
}