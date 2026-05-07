import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AssetsPage from "./pages/AssetsPage";
import AlertsPage from "./pages/AlertsPage";
import EventsPage from "./pages/EventsPage";
import SettingsPage from "./pages/SettingsPage";
import { LayoutDashboard, Shield, AlertTriangle, Activity, LogOut, Settings } from "lucide-react";
import "./index.css";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (location.pathname === "/login") return <LoginPage />;

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="logo">CS</div>
          <div>
            <h1>ContextShield</h1>
            <span>v0.1.0-alpha</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end><LayoutDashboard /> Dashboard</NavLink>
          <NavLink to="/assets"><Shield /> Assets</NavLink>
          <NavLink to="/events"><Activity /> Events</NavLink>
          <NavLink to="/alerts"><AlertTriangle /> Alerts</NavLink>
          <NavLink to="/settings"><Settings /> Settings</NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="avatar">{user?.full_name?.charAt(0) || "U"}</div>
          <div className="user-info">
            <p>{user?.full_name}</p>
            <span>{user?.email}</span>
          </div>
          <button onClick={logout} title="Sign out"><LogOut size={16} /></button>
        </div>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/assets" element={<ProtectedRoute><AssetsPage /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<AppShell />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
