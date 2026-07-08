import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import Icon, { QRIcon } from "../Components/UI/Icon";

/* ── Initial empty form state ────────────────────────────────────────── */
const emptyForm = {
  name:            "",
  email:           "",
  password:        "",
  confirmPassword: "",
  teacherId:       "",
  studentId:       "",
  classCode:       "",
};

/* ── Main page component ─────────────────────────────────────────────── */
export default function RegisterPage() {
  const { register } = useAuth();
  const navigate      = useNavigate();

  // step 1 = role selection, step 2 = registration form
  const [step,    setStep]    = useState(1);
  const [role,    setRole]    = useState(null);
  const [form,    setForm]    = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleRoleSelect = (selected) => {
    setRole(selected);
    setStep(2);
    setError("");
  };

  const handleBack = () => {
    setStep(1);
    setRole(null);
    setForm(emptyForm);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    // Client-side validation
    if (!form.name.trim())                      { setError("Full name is required.");              return; }
    if (!form.email)                            { setError("Email is required.");                  return; }
    if (!form.password)                         { setError("Password is required.");               return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match.");             return; }
    if (role === "teacher" && !form.teacherId)  { setError("Teacher ID is required.");             return; }
    if (role === "student" && !form.studentId)  { setError("Student ID is required.");             return; }

    setLoading(true);
    const result = await register({ ...form, role });
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Registration failed. Please try again.");
      return;
    }

    // Show success screen, then send to /login (user must log in manually).
    setSuccess(true);
    setTimeout(() => navigate("/login"), 2000);
  };

  /* ── Success screen ──────────────────────────────────────────────── */
  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center border border-slate-800 rounded-2xl bg-slate-900 p-12">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center mb-6">
            <Icon name="check" className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Account Created!</h2>
          <p className="text-slate-400 text-sm mt-3 leading-6">
            Your account has been created successfully.
            <br />
            Taking you to the login page…
          </p>
          <div className="mt-6 w-6 h-6 mx-auto border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  /* ── Page shell (two-column layout shared by both steps) ─────────── */
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-[0.9fr_1.1fr] border border-slate-800 rounded-2xl overflow-hidden bg-slate-900">

        {/* ── Left panel — branding ─────────────────────────────────── */}
        <section className="p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950 flex flex-col">
          <div className="w-12 h-12 text-sky-400 mb-6">
            <QRIcon />
          </div>
          <h1 className="text-3xl font-black text-white leading-tight">
            {step === 1
              ? "Create your account"
              : role === "teacher"
              ? "Teacher Registration"
              : "Student Registration"}
          </h1>
          <p className="text-slate-400 text-sm mt-4 leading-6">
            {step === 1
              ? "Register as a teacher to create classes and run live QR sessions, or as a student to scan in and track your attendance."
              : role === "teacher"
              ? "Set up your teacher account to manage classes and generate QR attendance sessions."
              : "Set up your student account to scan QR codes and track your attendance records."}
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

          <button
            onClick={() => navigate("/login")}
            className="mt-8 text-sm text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Icon name="arrowLeft" className="w-3.5 h-3.5" />
            Back to login
          </button>
        </section>

        {/* ── Right panel — step content ────────────────────────────── */}
        <section className="p-6 sm:p-8 flex flex-col justify-center">
          {step === 1 ? (
            <RoleSelection onSelect={handleRoleSelect} onLogin={() => navigate("/login")} />
          ) : (
            <RegistrationForm
              role={role}
              form={form}
              onUpdate={update}
              onSubmit={handleSubmit}
              onBack={handleBack}
              loading={loading}
              error={error}
              onLogin={() => navigate("/login")}
            />
          )}
        </section>
      </div>
    </div>
  );
}

/* ── Step 1 — Role selection ─────────────────────────────────────────── */
function RoleSelection({ onSelect, onLogin }) {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-black text-white">Who are you?</h2>
        <p className="text-slate-500 text-sm mt-1">
          Select your role to continue with registration.
        </p>
      </div>

      <div className="grid gap-4">
        {/* Teacher card */}
        <button
          id="role-teacher"
          type="button"
          onClick={() => onSelect("teacher")}
          className="group rounded-2xl border border-slate-800 bg-slate-950/60 p-6 text-left hover:border-sky-500/50 hover:bg-sky-500/5 transition-all duration-200"
        >
          <div className="w-12 h-12 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center mb-4 group-hover:bg-sky-500/25 transition-colors">
            <Icon name="users" className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white group-hover:text-sky-300 transition-colors">
            Teacher
          </h3>
          <p className="text-slate-500 text-sm mt-1 leading-5">
            Create classes, manage students, and generate QR attendance sessions.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-sky-500 text-sm font-bold opacity-0 translate-x-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200">
            Register as Teacher
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </div>
        </button>

        {/* Student card */}
        <button
          id="role-student"
          type="button"
          onClick={() => onSelect("student")}
          className="group rounded-2xl border border-slate-800 bg-slate-950/60 p-6 text-left hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-200"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4 group-hover:bg-emerald-500/25 transition-colors">
            <Icon name="camera" className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white group-hover:text-emerald-300 transition-colors">
            Student
          </h3>
          <p className="text-slate-500 text-sm mt-1 leading-5">
            Scan QR codes to mark your attendance and track your records.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-emerald-500 text-sm font-bold opacity-0 translate-x-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200">
            Register as Student
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </div>
        </button>
      </div>

      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{" "}
        <button onClick={onLogin} className="text-sky-400 font-bold hover:text-sky-300 transition-colors">
          Log in
        </button>
      </p>
    </div>
  );
}

/* ── Step 2 — Registration form ──────────────────────────────────────── */
function RegistrationForm({ role, form, onUpdate, onSubmit, onBack, loading, error, onLogin }) {
  const isTeacher = role === "teacher";

  return (
    <div>
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="w-8 h-8 rounded-full border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 hover:bg-slate-800/60 transition-all flex items-center justify-center flex-shrink-0"
          title="Go back"
        >
          <Icon name="arrowLeft" className="w-3.5 h-3.5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-white capitalize">
            {role} Registration
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">Fill in your details to create an account</p>
        </div>
      </div>

      <form id="register-form" onSubmit={onSubmit} className="space-y-4">
        {/* Full Name */}
        <TextField
          id="reg-name"
          label="Full Name"
          value={form.name}
          onChange={(v) => onUpdate("name", v)}
          placeholder="Jane Smith"
          autoFocus
        />

        {/* Email */}
        <TextField
          id="reg-email"
          label="Email"
          type="email"
          value={form.email}
          onChange={(v) => onUpdate("email", v)}
          placeholder={isTeacher ? "teacher@school.edu" : "student@school.edu"}
        />

        {/* Password + Confirm Password side-by-side */}
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField
            id="reg-password"
            label="Password"
            type="password"
            value={form.password}
            onChange={(v) => onUpdate("password", v)}
            placeholder="Strong password"
          />
          <TextField
            id="reg-confirm-password"
            label="Confirm Password"
            type="password"
            value={form.confirmPassword}
            onChange={(v) => onUpdate("confirmPassword", v)}
            placeholder="Repeat password"
          />
        </div>
        <p className="text-xs text-slate-500 -mt-2">
          Min. 8 chars — must include uppercase, lowercase, number &amp; symbol.
        </p>

        {/* Teacher-specific field */}
        {isTeacher && (
          <TextField
            id="reg-teacher-id"
            label="Teacher ID"
            value={form.teacherId}
            onChange={(v) => onUpdate("teacherId", v)}
            placeholder="T-001"
          />
        )}

        {/* Student-specific fields */}
        {!isTeacher && (
          <>
            <TextField
              id="reg-student-id"
              label="Student ID"
              value={form.studentId}
              onChange={(v) => onUpdate("studentId", v)}
              placeholder="S-1021"
            />
            <TextField
              id="reg-class-code"
              label="Class Code"
              value={form.classCode}
              onChange={(v) => onUpdate("classCode", v)}
              placeholder="Enter class code (optional)"
            />
          </>
        )}

        {/* Error display */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          id="register-submit"
          type="submit"
          disabled={loading}
          className={`w-full rounded-xl py-3.5 font-black text-sm text-white disabled:opacity-60 transition-colors ${
            isTeacher
              ? "bg-sky-500 hover:bg-sky-400"
              : "bg-emerald-500 hover:bg-emerald-400"
          }`}
        >
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{" "}
        <button
          onClick={onLogin}
          className="text-sky-400 font-bold hover:text-sky-300 transition-colors"
        >
          Log in
        </button>
      </p>
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
