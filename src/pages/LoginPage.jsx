import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import Icon, { QRIcon } from "../Components/UI/Icon";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [notFound, setNotFound] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNotFound(false);

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      // 404 → the email doesn't exist in the database
      if (result.status === 404) {
        setNotFound(true);
      } else {
        setError(result.error || "Sign in failed. Please try again.");
      }
      return;
    }

    // Navigate immediately using the role returned by the backend — no second
    // render cycle needed. The ProtectedRoute will validate it on arrival.
    navigate(`/${result.role}/dashboard`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-[0.9fr_1.1fr] border border-slate-800 rounded-2xl overflow-hidden bg-slate-900">

        {/* ── Left panel — branding ───────────────────────────────────── */}
        <section className="p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950 flex flex-col">
          <div className="w-12 h-12 text-sky-400 mb-6">
            <QRIcon />
          </div>
          <h1 className="text-3xl font-black text-white leading-tight">
            QR-Based Attendance System
          </h1>
          <p className="text-slate-400 text-sm mt-4 leading-6">
            A MERN attendance app with JWT login, teacher class management, live
            QR sessions, camera scanning, and duplicate-safe attendance records.
          </p>

          <div className="mt-8 grid gap-3 text-sm flex-1">
            {[
              "Teacher and student accounts",
              "Configurable QR attendance sessions",
              "Student camera scanning",
              "MongoDB-backed classes and records",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-slate-300">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-300 flex items-center justify-center">
                  <Icon name="check" className="w-3.5 h-3.5" />
                </span>
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* ── Right panel — login form ────────────────────────────────── */}
        <section className="p-6 sm:p-8 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-xl font-black text-white">Welcome back</h2>
            <p className="text-slate-500 text-sm mt-1">
              Sign in with your email and password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              id="login-email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@school.edu"
              autoFocus
            />
            <TextField
              id="login-password"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Your password"
            />

            {/* Generic error (wrong password, server error, etc.) */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* 404 — email not found in the database */}
            {notFound && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200 space-y-2">
                <p className="font-semibold">No account was found with this email.</p>
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="inline-flex items-center gap-1.5 text-amber-300 font-bold hover:text-amber-100 transition-colors"
                >
                  Register Now
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3.5 bg-sky-500 text-white font-black text-sm hover:bg-sky-400 disabled:opacity-60 transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-sky-400 font-bold hover:text-sky-300 transition-colors"
            >
              Register
            </button>
          </p>
        </section>
      </div>
    </div>
  );
}

/* ── Reusable field component (local to this page) ───────────────────── */
function TextField({ id, label, value, onChange, placeholder, type = "text", autoFocus = false }) {
  return (
    <label className="block" htmlFor={id}>
      <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1.5 font-semibold">
        {label}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600"
      />
    </label>
  );
}
