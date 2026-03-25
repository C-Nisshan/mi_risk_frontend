// src/pages/Layout.jsx
import { useAuth } from "../App";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "bi bi-grid-3x3-gap-fill" },
  { id: "food", label: "Log Food", icon: "bi bi-camera-fill" },
  { id: "risk", label: "MI Risk Check", icon: "bi bi-heart-pulse-fill" },
  { id: "history", label: "History", icon: "bi bi-clock-history" },
];

export default function Layout({ page, setPage, children }) {
  const { logout } = useAuth();

  return (
    <div className="d-flex min-vh-100" style={{ background: "#060d1a" }}>
      {/* Sidebar */}
      <aside
        className="d-flex flex-column"
        style={{
          width: "240px",
          flexShrink: 0,
          background: "linear-gradient(180deg, #0a1628 0%, #060d1a 100%)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          position: "fixed",
          height: "100vh",
          top: 0,
          left: 0,
          zIndex: 100,
        }}
      >
        {/* Accent line */}
        <div style={{ height: 3, background: "linear-gradient(90deg, #0ec3af, #6366f1)" }} />

        {/* Brand */}
        <div className="p-4 border-bottom border-light border-opacity-10">
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-3"
              style={{
                width: 42,
                height: 42,
                background: "linear-gradient(135deg, #0ec3af, #6366f1)",
                boxShadow: "0 4px 14px rgba(14,195,175,0.3)",
              }}
            >
              <i className="bi bi-heart-pulse fs-4 text-white"></i>
            </div>
            <div>
              <div className="fw-bold text-white fs-5">MI Risk Tracker</div>
              <div className="small" style={{ color: "#0ec3af" }}>Dietary Fat Monitor</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-grow-1 p-3">
          {NAV.map((n) => {
            const active = page === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setPage(n.id)}
                className={`nav-btn d-flex align-items-center gap-3 w-100 mb-2 p-3 rounded-3 border-0 text-start ${
                  active ? "active" : ""
                }`}
                style={{
                  background: active
                    ? "linear-gradient(135deg, rgba(14,195,175,0.15), rgba(99,102,241,0.08))"
                    : "transparent",
                  color: active ? "#0ec3af" : "rgba(255,255,255,0.55)",
                  fontWeight: active ? 600 : 400,
                }}
              >
                <i className={`${n.icon} fs-5`} style={{ width: 28 }}></i>
                <span>{n.label}</span>
                {active && (
                  <div className="ms-auto rounded-circle" style={{ width: 7, height: 7, background: "#0ec3af" }}></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-top border-light border-opacity-10">
          <button
            onClick={logout}
            className="logout-btn d-flex align-items-center gap-3 w-100 p-3 rounded-3 border border-light border-opacity-10 text-white-50"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <i className="bi bi-box-arrow-right fs-5"></i>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className="flex-grow-1"
        style={{
          marginLeft: "240px",
          padding: "32px 36px",
          minHeight: "100vh",
          backgroundImage: `
            linear-gradient(rgba(14,195,175,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14,195,175,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "52px 52px",
        }}
      >
        {children}
      </main>
    </div>
  );
}