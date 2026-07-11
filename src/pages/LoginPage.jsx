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
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-xs text-sky-400 hover:text-sky-300 font-semibold transition-colors"
              >
                Forgot Password?
              </button>
            </div>


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
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType  = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <label className="block" htmlFor={id}>
      <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1.5 font-semibold">
        {label}
      </span>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden ${isPassword ? "pr-11" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            style={{ right: '0.375rem' }}
            className="absolute inset-y-0 my-auto h-7 w-7 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white transition-all duration-150 shadow-sm"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              /* Eye-off icon */
              <svg xmlns="http://www.w3.org/2000/svg" style={{width:'0.95rem',height:'0.95rem'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              /* Eye icon */
              <svg xmlns="http://www.w3.org/2000/svg" style={{width:'0.95rem',height:'0.95rem'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </label>
  );
}
