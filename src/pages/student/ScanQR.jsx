import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

/* ── Parse QR token ─────────────────────────────────────── */
function parseToken(text) {
  const t = String(text).trim();
  if (!t) return null;
  try {
    const p = JSON.parse(t);
    if (p && typeof p === "object" && typeof p.token === "string") return p.token.trim() || null;
  } catch { }
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(t)) return t;
  return null;
}

/* ── Web Audio beep ─────────────────────────────────────── */
function playSuccessBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    gain.connect(ctx.destination);

    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.22);
    });
  } catch { }
}

/* ── Corner brackets SVG overlay ────────────────────────── */
function ScanFrame() {
  const S = 28; // bracket arm length (px)
  const T = 4;  // stroke thickness
  const C = "rgb(56,189,248)"; // sky-400
  const corners = [
    // top-left
    { x1: 0, y1: S, x2: 0, y2: T / 2, x3: S, y3: T / 2 },
    // top-right  (mirror x)
    { x1: "100%", y1: S, x2: "100%", y2: T / 2, x3: `calc(100% - ${S}px)`, y3: T / 2 },
    // bottom-left
    { x1: 0, y1: `calc(100% - ${S}px)`, x2: 0, y2: `calc(100% - ${T / 2}px)`, x3: S, y3: `calc(100% - ${T / 2}px)` },
    // bottom-right
    { x1: "100%", y1: `calc(100% - ${S}px)`, x2: "100%", y2: `calc(100% - ${T / 2}px)`, x3: `calc(100% - ${S}px)`, y3: `calc(100% - ${T / 2}px)` },
  ];

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ overflow: "visible" }}
    >
      {corners.map((c, i) => (
        <polyline
          key={i}
          points={`${c.x1},${c.y1} ${c.x2},${c.y2} ${c.x3},${c.y3}`}
          fill="none"
          stroke={C}
          strokeWidth={T}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

/* ── Animated checkmark ─────────────────────────────────── */
function AnimatedCheck() {
  return (
    <svg viewBox="0 0 52 52" className="w-28 h-28 animate-success-pop drop-shadow-[0_0_24px_rgba(52,211,153,0.5)]">
      <circle cx="26" cy="26" r="25" fill="none" stroke="rgba(52,211,153,0.25)" strokeWidth="2" />
      <circle cx="26" cy="26" r="25" fill="rgba(52,211,153,0.12)" strokeWidth="0" />
      <circle cx="26" cy="26" r="22" fill="rgba(52,211,153,0.18)" strokeWidth="0" />
      <polyline
        points="14,27 22,35 38,18"
        fill="none"
        stroke="rgb(52,211,153)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="40"
        strokeDashoffset="40"
        style={{ animation: "check-draw 0.4s 0.35s ease forwards" }}
      />
    </svg>
  );
}

/* ── Countdown ring (SVG) ───────────────────────────────── */
function CountdownRing({ seconds = 4 }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90">
      <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
      <circle
        cx="22" cy="22" r={r}
        fill="none"
        stroke="rgb(52,211,153)"
        strokeWidth="3"
        strokeDasharray={circ}
        strokeDashoffset="0"
        strokeLinecap="round"
        style={{ animation: `countdown-ring ${seconds}s linear forwards` }}
      />
    </svg>
  );
}

/* ── Main component ─────────────────────────────────────── */
export default function ScanQR({ fullscreen = false, onDone }) {
  const { addAttendanceRecord, activeQrSessions, classes, stopQrSession } = useAuth();
  const navigate = useNavigate();

  const [phase, setPhase] = useState("idle"); // idle | scanning | success | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const scannerRef = useRef(null);
  const handledRef = useRef(false); // prevent double-handling
  const fileInputRef = useRef(null);

  /* cleanup on unmount */
  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => { });
      }
    };
  }, []);

  /* Auto-return to dashboard after success */
  useEffect(() => {
    if (phase !== "success") return;
    const timer = setTimeout(() => {
      if (onDone) { onDone(); return; }
      navigate("/student/dashboard", { replace: true });
    }, 4000);
    return () => clearTimeout(timer);
  }, [phase, navigate, onDone]);

  /* ── Stop scanner ──────────────────────────────────────── */
  const stopScanner = useCallback(async () => {
    try {
      if (scannerRef.current?.isScanning) await scannerRef.current.stop();
    } catch { }
  }, []);

  /* ── Submit token to backend ───────────────────────────── */
  const submitToken = useCallback(async (token) => {
    const res = await addAttendanceRecord({ token });
    if (!res.success) {
      setErrorMsg(res.error || "Attendance could not be marked.");
      setPhase("error");
      return;
    }
    playSuccessBeep();
    setResult({
      className: res.record.className || "Class",
      teacherName: res.record.teacherName || null,
      date: res.record.date,
      time: res.record.time,
    });
    setPhase("success");
  }, [addAttendanceRecord]);

  /* ── Handle decoded QR ─────────────────────────────────── */
  const handleDecoded = useCallback(async (text) => {
    if (handledRef.current) return;
    handledRef.current = true;
    await stopScanner();
    const token = parseToken(text);
    if (!token) {
      setErrorMsg("That QR code is not a valid attendance token. Point at the teacher's screen.");
      setPhase("error");
      return;
    }
    setPhase("processing");
    await submitToken(token);
  }, [stopScanner, submitToken]);

  /* ── Start camera scanner ──────────────────────────────── */
  const startScan = useCallback(async () => {
    handledRef.current = false;
    setErrorMsg("");
    setResult(null);
    setPhase("scanning");

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-video-region");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 15, qrbox: { width: 240, height: 240 } },
        (text) => handleDecoded(text),
        () => { }
      );
    } catch (err) {
      setPhase("error");
      setErrorMsg(
        err?.message?.toLowerCase().includes("permission")
          ? "Camera permission was denied. Please allow camera access in your browser settings and try again."
          : "Could not open the camera. Make sure no other app is using it, then try again."
      );
    }
  }, [handleDecoded]);

  /* ── Use active teacher session (same-device shortcut) ── */
  const useActiveSession = useCallback(async () => {
    handledRef.current = false;
    setErrorMsg("");
    setResult(null);

    const classId = classes.find((c) => activeQrSessions[c.id])?.id ?? null;
    const payload = classId ? activeQrSessions[classId] : null;

    if (!payload) { setErrorMsg("No active teacher QR session was found."); setPhase("error"); return; }
    if (Date.now() > payload.expiresAt) {
      stopQrSession(classId);
      setErrorMsg("The active session has expired. Ask your teacher to refresh the QR.");
      setPhase("error");
      return;
    }

    setPhase("processing");
    await submitToken(payload.token);
  }, [classes, activeQrSessions, stopQrSession, submitToken]);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    handledRef.current = false;
    setErrorMsg("");
    setResult(null);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode("qr-file-scan-temp");
      const decodedText = await html5QrCode.scanFile(file, false);
      const token = parseToken(decodedText);
      if (!token) {
        setErrorMsg("The uploaded image does not contain a valid attendance token. Please upload a clear photo/screenshot of the QR code.");
        setPhase("error");
        return;
      }
      setPhase("processing");
      await submitToken(token);
    } catch (err) {
      console.error("QR Code Upload Scan Error:", err);
      setErrorMsg("Failed to decode QR code from the image. Make sure the QR code is clearly visible and try again.");
      setPhase("error");
    } finally {
      if (event.target) event.target.value = "";
    }
  };

  const reset = () => { setPhase("idle"); setResult(null); setErrorMsg(""); };
  const cancel = async () => { await stopScanner(); reset(); };

  /* ── Render ─────────────────────────────────────────────── */

  /* IDLE — big camera button */
  if (phase === "idle") {
    return (
      <div className={`flex flex-col items-center justify-center gap-8 ${fullscreen ? "min-h-screen bg-slate-950" : "py-10"}`}>
        <div className="flex flex-row items-center justify-center gap-12 sm:gap-16">
          {/* Camera option */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative flex items-center justify-center">
              {/* Pulse rings */}
              <span className="absolute w-32 h-32 rounded-full bg-sky-500/20 animate-ping-slower" />
              <span className="absolute w-26 h-26 rounded-full bg-sky-500/25 animate-ping-slow" />
              <button
                onClick={startScan}
                className="relative z-10 w-20 h-20 rounded-full bg-sky-500 hover:bg-sky-400 active:scale-95 transition-all shadow-xl shadow-sky-500/40 flex items-center justify-center"
                aria-label="Start QR scan"
              >
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </button>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-sm">Use Camera</p>
              <p className="text-slate-500 text-xs mt-0.5">Scan via live camera</p>
            </div>
          </div>

          {/* Upload option */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative flex items-center justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="relative z-10 w-20 h-20 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 active:scale-95 transition-all shadow-xl flex items-center justify-center"
                aria-label="Upload QR image"
              >
                <svg className="w-8 h-8 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </button>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-sm">Upload QR Image</p>
              <p className="text-slate-500 text-xs mt-0.5">Select image from gallery</p>
            </div>
          </div>
        </div>

        <button
          onClick={useActiveSession}
          className="text-sm text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors mt-2"
        >
          Use active teacher session instead
        </button>

        {/* Hidden inputs / helpers needed for decoding */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />
        <div id="qr-file-scan-temp" className="hidden" />
      </div>
    );
  }

  /* SCANNING — fullscreen camera */
  if (phase === "scanning") {
    return (
      <div className={`relative flex flex-col items-center justify-center bg-black ${fullscreen ? "min-h-screen" : "rounded-2xl overflow-hidden"}`} style={{ minHeight: fullscreen ? "100dvh" : 400 }}>

        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div
            id="qr-video-region"
            className="!absolute !inset-0 !w-full !h-full [&>video]:!w-full [&>video]:!h-full [&>video]:!object-cover [&>*:last-child]:!hidden"
          />
        </div>

        {/* Dark vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70 pointer-events-none" />

        {/* Scan window */}
        <div className="relative z-10 w-64 h-64">
          {/* Corner brackets */}
          <ScanFrame />
          {/* Animated scan laser line */}
          <div
            className="absolute left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent animate-scan-line"
            style={{ boxShadow: "0 0 8px 2px rgba(56,189,248,0.6)" }}
          />
        </div>

        {/* Label */}
        <div className="relative z-10 mt-8 text-center px-6">
          <p className="text-white font-semibold text-sm">Align the QR code in the frame</p>
          <p className="text-slate-400 text-xs mt-1">Keep steady — scanning automatically</p>
        </div>

        {/* Cancel button */}
        <button
          onClick={cancel}
          className="relative z-10 mt-6 px-6 py-2.5 rounded-full border border-white/20 bg-white/10 text-white text-sm font-semibold backdrop-blur hover:bg-white/20 active:scale-95 transition-all"
        >
          Cancel
        </button>
      </div>
    );
  }

  /* PROCESSING — spinner */
  if (phase === "processing") {
    return (
      <div className={`flex flex-col items-center justify-center gap-4 ${fullscreen ? "min-h-screen bg-slate-950" : "py-16"}`}>
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Marking attendance…</p>
      </div>
    );
  }

  /* SUCCESS */
  if (phase === "success" && result) {
    return (
      <div className={`flex flex-col items-center justify-center px-6 ${fullscreen ? "min-h-screen bg-slate-950" : "py-10"}`}>
        <AnimatedCheck />

        <div className="mt-6 text-center animate-fade-up">
          <p className="text-emerald-400 font-black text-2xl tracking-tight">Attendance Marked!</p>
          <p className="text-slate-400 text-sm mt-1">Successfully recorded</p>
        </div>

        {/* Details card */}
        <div className="mt-6 w-full max-w-xs bg-slate-800/70 border border-slate-700 rounded-2xl p-5 space-y-3 animate-fade-up" style={{ animationDelay: "0.15s" }}>
          <DetailRow icon="📚" label="Subject" value={result.className} />
          {result.teacherName && <DetailRow icon="👤" label="Teacher" value={result.teacherName} />}
          <DetailRow icon="📅" label="Date" value={result.date} />
          <DetailRow icon="🕐" label="Time" value={result.time} />
        </div>

        {/* Countdown ring + auto-return label */}
        <div className="mt-8 flex flex-col items-center gap-2 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <CountdownRing seconds={4} />
          <p className="text-slate-500 text-xs">Returning to dashboard…</p>
        </div>

        <button onClick={reset} className="mt-4 text-sm text-slate-600 hover:text-slate-400 underline transition-colors">
          Go back now
        </button>
      </div>
    );
  }

  /* ERROR */
  if (phase === "error") {
    return (
      <div className={`flex flex-col items-center justify-center px-6 ${fullscreen ? "min-h-screen bg-slate-950" : "py-10"}`}>
        <div className="w-24 h-24 rounded-full bg-red-500/15 border-2 border-red-500/50 flex items-center justify-center animate-success-pop">
          <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <div className="mt-6 text-center animate-fade-up">
          <p className="text-red-400 font-black text-xl">Failed</p>
          <p className="text-slate-400 text-sm mt-2 max-w-xs leading-6">{errorMsg}</p>
        </div>

        <button
          onClick={reset}
          className="mt-8 px-8 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-sm rounded-2xl active:scale-95 transition-all animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return null;
}

/* ── Detail row helper ──────────────────────────────────── */
function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg">{icon}</span>
      <div className="min-w-0">
        <p className="text-slate-500 text-xs uppercase tracking-wide font-semibold">{label}</p>
        <p className="text-white text-sm font-bold truncate">{value}</p>
      </div>
    </div>
  );
}
