import { AuthProvider, useAuth } from "./Context/AuthContext";
import LoginPage        from "./pages/LoginPage";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard   from "./pages/AdminDashboard";
import JoinClass from "./pages/student/JoinClass";
import { useEffect, useState } from "react";

const ROLE_DASHBOARDS = {
  admin: AdminDashboard,
  teacher: TeacherDashboard,
  student: StudentDashboard,
};

function ProtectedDashboard({ user }) {
  const { authNotice } = useAuth();
  const Dashboard = ROLE_DASHBOARDS[user.role];

  if (!Dashboard) {
    return <LoginPage />;
  }

  return (
    <>
      {authNotice && (
        <div className="fixed right-4 top-4 z-50 max-w-sm rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 shadow-xl backdrop-blur">
          {authNotice}
        </div>
      )}
      <Dashboard />
    </>
  );
}

function Router() {
  const { currentUser, loading } = useAuth();
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const updatePath = () => setPath(window.location.pathname);
    window.addEventListener("popstate", updatePath);
    return () => window.removeEventListener("popstate", updatePath);
  }, []);

  if (loading && currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center">
        Loading workspace...
      </div>
    );
  }
  if (!currentUser) return <LoginPage />;
  if (currentUser.forcePasswordReset) return <ForcePasswordReset />;
  if (path.startsWith("/join/")) return <JoinClass />;

  return <ProtectedDashboard user={currentUser} />;
}

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

    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div>
          <h1 className="text-white text-xl font-black">Reset your password</h1>
          <p className="text-slate-500 text-sm mt-1">A new password is required before opening the workspace.</p>
        </div>
        <input
          type="password"
          value={form.currentPassword}
          onChange={(event) => setForm((current) => ({ ...current, currentPassword: event.target.value }))}
          placeholder="Temporary password"
          className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-sky-500"
        />
        <input
          type="password"
          value={form.newPassword}
          onChange={(event) => setForm((current) => ({ ...current, newPassword: event.target.value }))}
          placeholder="New strong password"
          className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-sky-500"
        />
        {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
        <div className="grid grid-cols-2 gap-3">
          <button disabled={loading} className="rounded-xl py-3 bg-sky-500 text-white font-black text-sm disabled:opacity-60">
            {loading ? "Saving..." : "Save"}
          </button>
          <button type="button" onClick={logout} className="rounded-xl py-3 border border-slate-700 text-slate-300 font-bold text-sm">
            Sign out
          </button>
        </div>
      </form>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
