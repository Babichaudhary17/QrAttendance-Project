import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { AuthProvider, useAuth } from "./Context/AuthContext";
import LoginPage        from "./pages/LoginPage";
import RegisterPage     from "./pages/RegisterPage";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard   from "./pages/AdminDashboard";
import JoinClass        from "./pages/student/JoinClass";
import MobileScanPage   from "./pages/student/MobileScanPage";
import Icon             from "./Components/UI/Icon";

/* ── Shared utility screens ──────────────────────────────────────────── */

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold tracking-wide">Loading workspace...</span>
      </div>
    </div>
  );
}

function AccessDenied() {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center border border-slate-800 rounded-2xl bg-slate-900 p-10">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-500/15 border border-red-500/25 text-red-400 flex items-center justify-center mb-5">
          <Icon name="shield" className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-black text-white">Access Denied</h1>
        <p className="text-slate-400 text-sm mt-2 leading-6">
          You don't have permission to view this page.
        </p>
        <button
          onClick={logout}
          className="mt-6 w-full rounded-xl py-3 bg-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-700 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

/* ── Route guards ────────────────────────────────────────────────────── */

/**
 * ProtectedRoute — renders children only for authenticated users with the
 * correct role. Unauthenticated visitors are sent to /login. Users with the
 * wrong role see an AccessDenied screen. Admins bypass role checks (they can
 * view any protected page via the admin dashboard).
 */
function ProtectedRoute({ children, allowedRole }) {
  const { currentUser, loading } = useAuth();

  // Show spinner only during the initial cold-load (token in sessionStorage
  // but the workspace hasn't been validated yet — no currentUser yet).
  if (loading && !currentUser) return <LoadingScreen />;
  if (!currentUser)             return <Navigate to="/login" replace />;
  if (currentUser.forcePasswordReset) return <ForcePasswordReset />;
  if (allowedRole && currentUser.role !== allowedRole) return <AccessDenied />;

  return children;
}

/**
 * PublicRoute — renders children only for guests. Authenticated users are
 * redirected to their role-appropriate dashboard immediately.
 */
function PublicRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading && !currentUser) return <LoadingScreen />;

  if (currentUser && !currentUser.forcePasswordReset) {
    return <Navigate to={`/${currentUser.role}/dashboard`} replace />;
  }

  return children;
}

/* ── Force Password Reset ────────────────────────────────────────────── */

function ForcePasswordReset() {
  const { changePassword, logout } = useAuth();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const result = await changePassword(form.currentPassword, form.newPassword);
    setLoading(false);
    if (!result.success) setError(result.error);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
      >
        <div>
          <h1 className="text-white text-xl font-black">Reset your password</h1>
          <p className="text-slate-500 text-sm mt-1">
            A new password is required before opening the workspace.
          </p>
        </div>
        <input
          type="password"
          value={form.currentPassword}
          onChange={(e) => setForm((c) => ({ ...c, currentPassword: e.target.value }))}
          placeholder="Temporary password"
          className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-sky-500 transition-colors"
        />
        <input
          type="password"
          value={form.newPassword}
          onChange={(e) => setForm((c) => ({ ...c, newPassword: e.target.value }))}
          placeholder="New strong password"
          className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-sky-500 transition-colors"
        />
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl py-3 bg-sky-500 text-white font-black text-sm disabled:opacity-60 hover:bg-sky-400 transition-colors"
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={logout}
            className="rounded-xl py-3 border border-slate-700 text-slate-300 font-bold text-sm hover:bg-slate-800 transition-colors"
          >
            Sign out
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── App shell ───────────────────────────────────────────────────────── */

function AppRoutes() {
  const { authNotice } = useAuth();

  return (
    <>
      {/* Workspace-level notice banner (e.g. session expiry warning) */}
      {authNotice && (
        <div className="fixed right-4 top-4 z-50 max-w-sm rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 shadow-xl backdrop-blur">
          {authNotice}
        </div>
      )}

      <Routes>
        {/* ── Public routes (redirect to dashboard if already logged in) ── */}
        <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* ── Role-gated protected routes ─────────────────────────────── */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute allowedRole="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/scan"
          element={
            <ProtectedRoute allowedRole="student">
              <MobileScanPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/join/:classCode"
          element={
            <ProtectedRoute allowedRole="student">
              <JoinClass />
            </ProtectedRoute>
          }
        />

        {/* ── Catch-all: redirect everything unknown to /login ─────────── */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
