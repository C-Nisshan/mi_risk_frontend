// src/App.jsx
import { useState, useEffect, createContext, useContext } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FoodLogger from "./pages/FoodLogger";
import MIRiskForm from "./pages/MIRiskForm";
import History from "./pages/History";
import Layout from "./components/Layout";

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const API_BASE = "http://127.0.0.1:5000/api";

export default function App() {
  const [token, setToken]   = useState(() => localStorage.getItem("token"));
  const [page, setPage]     = useState("dashboard");
  const [toast, setToast]   = useState(null);

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else       localStorage.removeItem("token");
  }, [token]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const logout = () => { setToken(null); setPage("dashboard"); };

  if (!token) {
    return (
      <AuthContext.Provider value={{ token, setToken, showToast }}>
        {page === "register"
          ? <Register onSwitch={() => setPage("login")} />
          : <Login    onSwitch={() => setPage("register")} />}
      </AuthContext.Provider>
    );
  }

  const pages = {
    dashboard: <Dashboard />,
    food:      <FoodLogger />,
    risk:      <MIRiskForm />,
    history:   <History />,
  };

  return (
    <AuthContext.Provider value={{ token, setToken, showToast, logout }}>
      <Layout page={page} setPage={setPage}>
        {toast && (
          <div style={{
            position: "fixed", top: 16, right: 16, zIndex: 9999,
            padding: "12px 20px", borderRadius: 10, fontWeight: 500,
            background: toast.type === "error" ? "#fee2e2" : "#d1fae5",
            color:      toast.type === "error" ? "#991b1b" : "#065f46",
            border:     `1px solid ${toast.type === "error" ? "#fca5a5" : "#6ee7b7"}`,
            boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
          }}>
            {toast.msg}
          </div>
        )}
        {pages[page] || <Dashboard />}
      </Layout>
    </AuthContext.Provider>
  );
}