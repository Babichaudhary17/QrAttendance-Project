import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { QRIcon } from "../Components/UI/Icon";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/* ── Step constants ──────────────────────────────────────────────────── */
const STEP_EMAIL = "email";
const STEP_OTP   = "otp";
const STEP_RESET = "reset";
const STEP_DONE  = "done";

/* ── Mask email for display ──────────────────────────────────────────── */
function maskEmail(email) {
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}${local[1]}${"*".repeat(Math.min(local.length - 2, 6))}@${domain}`;
}

/* ── Reusable text field (same style as LoginPage) ───────────────────── */
function TextField({ id, label, value, onChange, placeholder, type = "text", autoFocus = false, disabled = false }) {
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
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600 disabled:opacity-50 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden ${isPassword ? "pr-11" : ""}`}
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
              <svg xmlns="http://www.w3.org/2000/svg" style={{width:'0.95rem',height:'0.95rem'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
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

/* ── OTP Input — 6 individual boxes ──────────────────────────────────── */
function OtpInput({ value, onChange }) {
  const inputRefs = useRef([]);

  const handleChange = (index, digit) => {
    if (!/^\d?$/.test(digit)) return;

    const next = value.split("");
    next[index] = digit;
    const joined = next.join("");
    onChange(joined);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted.padEnd(6, " ").slice(0, 6).replace(/ /g, ""));
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex justify-center gap-2.5">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputRefs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          autoFocus={i === 0}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          className="w-11 h-13 text-center text-lg font-black bg-slate-950 border border-slate-800 text-white rounded-xl outline-none focus:border-sky-500 transition-colors"
        />
      ))}
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────────────── */
export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step,     setStep]     = useState(STEP_EMAIL);
  const [email,    setEmail]    = useState("");
  const [otp,      setOtp]      = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Auto-redirect after success
  useEffect(() => {
    if (step !== STEP_DONE) return;
    const timer = setTimeout(() => navigate("/login", { replace: true }), 3000);
    return () => clearTimeout(timer);
  }, [step, navigate]);

  const clearMessages = () => { setError(""); setSuccess(""); };

  /* ─── Step 1: Send OTP ─────────────────────────────────────────────── */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setStep(STEP_OTP);
      setResendCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  /* ─── Resend OTP ───────────────────────────────────────────────────── */
  const handleResend = async () => {
    clearMessages();
    setOtp("");
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setSuccess("A new verification code has been sent.");
      setResendCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  /* ─── Step 2: Verify OTP ───────────────────────────────────────────── */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    clearMessages();

    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/verify-otp`, { email, code: otp });
      setResetToken(res.data.data.resetToken);
      setStep(STEP_RESET);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  /* ─── Step 3: Reset Password ───────────────────────────────────────── */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearMessages();

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        resetToken,
        newPassword,
      });
      setStep(STEP_DONE);
    } catch (err) {
      setError(err.response?.data?.message || "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  /* ─── Step indicators ──────────────────────────────────────────────── */
  const steps = [
    { key: STEP_EMAIL, label: "Email" },
    { key: STEP_OTP,   label: "Verify" },
    { key: STEP_RESET, label: "Reset" },
  ];
  const stepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="border border-slate-800 rounded-2xl bg-slate-900 overflow-hidden">

          {/* Header */}
          <div className="p-6 pb-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 text-sky-400">
                <QRIcon />
              </div>
              <span className="text-slate-600 text-xs font-bold uppercase tracking-wider">
                QR Attendance
              </span>
            </div>

            {step !== STEP_DONE && (
              <>
                <h1 className="text-xl font-black text-white">
                  {step === STEP_EMAIL && "Forgot Password"}
                  {step === STEP_OTP   && "Verify Your Email"}
                  {step === STEP_RESET && "Set New Password"}
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  {step === STEP_EMAIL && "Enter your registered email to receive a verification code."}
                  {step === STEP_OTP   && (
                    <>We sent a 6-digit code to <span className="text-sky-400 font-semibold">{maskEmail(email)}</span></>
                  )}
                  {step === STEP_RESET && "Create a strong password for your account."}
                </p>
              </>
            )}
          </div>

          {/* Step progress indicator */}
          {step !== STEP_DONE && (
            <div className="flex items-center gap-2 px-6 py-4">
              {steps.map((s, i) => (
                <div key={s.key} className="flex items-center gap-2 flex-1">
                  <div className="flex-1 flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                        i < stepIndex
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : i === stepIndex
                            ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                            : "bg-slate-800 text-slate-600 border border-slate-700"
                      }`}
                    >
                      {i < stepIndex ? (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span className={`text-xs font-semibold hidden sm:block ${
                      i <= stepIndex ? "text-slate-300" : "text-slate-600"
                    }`}>
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`h-px flex-1 transition-colors duration-300 ${
                      i < stepIndex ? "bg-emerald-500/40" : "bg-slate-800"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Body */}
          <div className="p-6 pt-2">

            {/* ── Step 1: Email ──────────────────────────────────────── */}
            {step === STEP_EMAIL && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <TextField
                  id="forgot-email"
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@school.edu"
                  autoFocus
                />

                {error && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <button
                  id="forgot-send-code"
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl py-3.5 bg-sky-500 text-white font-black text-sm hover:bg-sky-400 disabled:opacity-60 transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending…
                    </span>
                  ) : (
                    "Send Verification Code"
                  )}
                </button>
              </form>
            )}

            {/* ── Step 2: OTP ────────────────────────────────────────── */}
            {step === STEP_OTP && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <OtpInput value={otp} onChange={setOtp} />

                {error && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                    {success}
                  </div>
                )}

                <button
                  id="forgot-verify-otp"
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full rounded-xl py-3.5 bg-sky-500 text-white font-black text-sm hover:bg-sky-400 disabled:opacity-60 transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying…
                    </span>
                  ) : (
                    "Verify Code"
                  )}
                </button>

                <div className="text-center text-sm">
                  {resendCooldown > 0 ? (
                    <span className="text-slate-600">
                      Resend code in <span className="text-slate-400 font-semibold">{resendCooldown}s</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={loading}
                      className="text-sky-400 font-bold hover:text-sky-300 transition-colors disabled:opacity-50"
                    >
                      Resend Code
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* ── Step 3: Reset Password ─────────────────────────────── */}
            {step === STEP_RESET && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <TextField
                  id="reset-new-password"
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={setNewPassword}
                  placeholder="Enter new password"
                  autoFocus
                />
                <TextField
                  id="reset-confirm-password"
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Confirm new password"
                />

                <div className="text-xs text-slate-600 space-y-1 pl-1">
                  <p className={newPassword.length >= 8 ? "text-emerald-400" : ""}>
                    • At least 8 characters
                  </p>
                  <p className={/[A-Z]/.test(newPassword) ? "text-emerald-400" : ""}>
                    • One uppercase letter
                  </p>
                  <p className={/[a-z]/.test(newPassword) ? "text-emerald-400" : ""}>
                    • One lowercase letter
                  </p>
                  <p className={/\d/.test(newPassword) ? "text-emerald-400" : ""}>
                    • One number
                  </p>
                  <p className={/[^A-Za-z0-9]/.test(newPassword) ? "text-emerald-400" : ""}>
                    • One special character
                  </p>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <button
                  id="reset-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl py-3.5 bg-sky-500 text-white font-black text-sm hover:bg-sky-400 disabled:opacity-60 transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Resetting…
                    </span>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            )}

            {/* ── Step 4: Done ────────────────────────────────────────── */}
            {step === STEP_DONE && (
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center mb-5">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-black text-white mb-2">Password Reset Successful</h2>
                <p className="text-slate-500 text-sm mb-6">
                  Your password has been updated. Redirecting to sign in…
                </p>
                <div className="w-5 h-5 mx-auto border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* ── Back to login link ──────────────────────────────────── */}
            {step !== STEP_DONE && (
              <p className="text-center text-sm text-slate-500 mt-5">
                Remember your password?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-sky-400 font-bold hover:text-sky-300 transition-colors"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
