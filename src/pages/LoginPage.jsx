import { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import Icon from "../Components/UI/Icon";
import { QRIcon } from "../Components/UI/Icon";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  teacherId: "",
  studentId: "",
  classId: "",
  classCode: "",
  studentClass: "",
};

export default function LoginPage() {
  const { enrollmentClasses, fetchEnrollmentClasses, login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("teacher");
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode === "register" && role === "student") {
      fetchEnrollmentClasses?.().catch(() => {});
    }
  }, [mode, role]);

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }

    if (mode === "register") {
      if (!form.name) {
        setError("Full name is required.");
        return;
      }
      if (role === "teacher" && !form.teacherId) {
        setError("Teacher ID is required.");
        return;
      }
      if (role === "student" && !form.studentId) {
        setError("Student ID is required.");
        return;
      }
    }

    setLoading(true);
    const result =
      mode === "login"
        ? await login(form.email, form.password, role)
        : await register({ ...form, role });
    setLoading(false);

    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-[0.9fr_1.1fr] border border-slate-800 rounded-2xl overflow-hidden bg-slate-900">
        <section className="p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950">
          <div className="w-12 h-12 text-sky-400 mb-6">
            <QRIcon />
          </div>
          <h1 className="text-3xl font-black text-white leading-tight">
            QR-Based Attendance System
          </h1>
          <p className="text-slate-400 text-sm mt-4 leading-6">
            A MERN attendance app with JWT login, teacher class management, live QR
            sessions, camera scanning, and duplicate-safe attendance records.
          </p>

          <div className="mt-8 grid gap-3 text-sm">
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

        <section className="p-6 sm:p-8">
          <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 mb-5">
            {["login", "register"].map((item) => (
              <button
                key={item}
                onClick={() => {
                  setMode(item);
                  setError("");
                }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-bold capitalize ${
                  mode === item
                    ? "bg-sky-500 text-white"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {["teacher", "student", "admin"].map((item) => (
              <button
                key={item}
                onClick={() => {
                  setRole(item);
                  setError("");
                }}
                className={`rounded-xl border px-4 py-3 text-sm font-bold capitalize ${
                  role === item
                    ? "border-sky-500 bg-sky-500/10 text-sky-300"
                    : "border-slate-800 text-slate-500 hover:text-slate-300"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <TextField
                label="Full name"
                value={form.name}
                onChange={(value) => update("name", value)}
                placeholder="Full name"
              />
            )}

            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(value) => update("email", value)}
              placeholder={role === "teacher" ? "teacher@school.edu" : "student@school.edu"}
            />
            <TextField
              label="Password"
              type="password"
              value={form.password}
              onChange={(value) => update("password", value)}
              placeholder="Strong password"
            />

            {mode === "register" && role === "teacher" && (
              <TextField
                label="Teacher ID"
                value={form.teacherId}
                onChange={(value) => update("teacherId", value)}
                placeholder="T-001"
              />
            )}

            {mode === "register" && role === "student" && (
              <div className="grid sm:grid-cols-2 gap-4">
                <TextField
                  label="Student ID"
                  value={form.studentId}
                  onChange={(value) => update("studentId", value)}
                  placeholder="S-1021"
                />
                <SelectField
                  label="Assigned class"
                  value={form.classId}
                  onChange={(value) => {
                    update("classId", value);
                    update("studentClass", enrollmentClasses.find((cls) => cls.id === value)?.name ?? "");
                  }}
                  options={enrollmentClasses}
                />
                <div className="sm:col-span-2">
                  <TextField
                    label="Class code"
                    value={form.classCode}
                    onChange={(value) => update("classCode", value)}
                    placeholder="Use a teacher-provided code if class is not listed"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full rounded-xl py-3.5 bg-sky-500 text-white font-black text-sm hover:bg-sky-400 disabled:opacity-60 transition-colors"
            >
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1.5 font-semibold">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-sky-500 transition-all"
      >
        <option value="">Select class</option>
        {options.map((cls) => (
          <option key={cls.id} value={cls.id}>
            {cls.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1.5 font-semibold">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-sky-500 transition-all"
      />
    </label>
  );
}
