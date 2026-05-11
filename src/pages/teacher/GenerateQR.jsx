import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useAuth } from "../../Context/AuthContext";

export default function GenerateQR({ classId, teacherId }) {
  const { activeQrSessions, startQrSession, stopQrSession } = useAuth();
  const qrRef = useRef(null);
  const payload = activeQrSessions[classId] ?? null;
  const [timeLeft, setTimeLeft] = useState(60);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!payload) {
      setTimeLeft(60);
      return;
    }

    const syncRemaining = () => {
      const remaining = Math.ceil((payload.expiresAt - Date.now()) / 1000);

      if (remaining <= 0) {
        startQrSession(classId).catch((err) => setError(err.message));
        return;
      }

      setTimeLeft(remaining);
    };

    syncRemaining();
    const timer = setInterval(syncRemaining, 1000);
    return () => clearInterval(timer);
  }, [classId, payload, startQrSession, teacherId]);

  const beginSession = async () => {
    setError("");
    try {
      await startQrSession(classId, teacherId);
    } catch (err) {
      setError(err.message);
    }
  };

  const endSession = () => {
    stopQrSession(classId);
  };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");

    if (!canvas || !payload) {
      return;
    }

    const link = document.createElement("a");
    link.download = `qr-session-${payload.sessionId}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const timerColor =
    timeLeft <= 10
      ? "text-red-400 border-red-500/30 bg-red-500/10"
      : timeLeft <= 20
        ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
        : "text-sky-400 border-sky-500/30 bg-sky-500/10";

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
          QR Session
        </h3>

        {!payload ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <p className="text-slate-500 text-sm text-center">
              Generate a time-limited QR code for class {classId}.
              <br />
              Students can scan it to mark attendance.
            </p>
            <button
              onClick={beginSession}
              className="px-6 py-3 bg-sky-500 text-white font-bold text-sm rounded-xl hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/20"
            >
              Generate QR Code
            </button>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          </div>
        ) : (
          <div className="space-y-3">
            <div
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-mono font-bold ${timerColor}`}
            >
              <span>Auto-refreshes in</span>
              <span className="text-lg">{timeLeft}s</span>
            </div>

            {[
              { label: "Session ID", value: payload.sessionId },
              { label: "Class", value: payload.classId },
              { label: "Teacher", value: payload.teacherId ?? "--" },
              {
                label: "Expires",
                value: new Date(payload.expiresAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }),
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between px-4 py-2.5 bg-slate-800 rounded-xl border border-slate-700"
              >
                <span className="text-slate-500 text-xs uppercase tracking-wider">
                  {item.label}
                </span>
                <span className="text-slate-200 text-xs font-mono">{item.value}</span>
              </div>
            ))}

            <button
              onClick={endSession}
              className="w-full mt-2 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-semibold rounded-xl transition-all"
            >
              Stop Session
            </button>
          </div>
        )}
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center min-h-64">
        {payload ? (
          <div className="flex flex-col items-center transition-all duration-500 opacity-100 scale-100">
            <div ref={qrRef} className="bg-white p-4 rounded-2xl mb-5 shadow-2xl">
              <QRCodeCanvas
                value={JSON.stringify(payload)}
                size={160}
                bgColor="#ffffff"
                fgColor="#0f172a"
                level="M"
                includeMargin
              />
            </div>

            <p className="text-white font-bold text-sm">Class {payload.classId}</p>
            <p className="text-slate-500 text-xs mt-1">
              Session - {payload.sessionId.slice(0, 8)}
            </p>

            <button
              onClick={downloadQR}
              className="px-4 py-2.5 bg-sky-500 text-white font-bold text-sm rounded-xl hover:bg-sky-400 transition-all mt-5"
            >
              Download
            </button>
          </div>
        ) : (
          <div className="text-center text-slate-600">
            <div className="opacity-20 mb-3 mx-auto w-fit">
              <svg width="70" height="70" viewBox="0 0 70 70" fill="none">
                <rect x="4" y="4" width="26" height="26" rx="3" stroke="#64748b" strokeWidth="3" />
                <rect x="10" y="10" width="14" height="14" rx="1" fill="#64748b" opacity="0.5" />
                <rect x="40" y="4" width="26" height="26" rx="3" stroke="#64748b" strokeWidth="3" />
                <rect x="46" y="10" width="14" height="14" rx="1" fill="#64748b" opacity="0.5" />
                <rect x="4" y="40" width="26" height="26" rx="3" stroke="#64748b" strokeWidth="3" />
                <rect x="10" y="46" width="14" height="14" rx="1" fill="#64748b" opacity="0.5" />
                <rect x="40" y="40" width="8" height="8" rx="1" fill="#64748b" opacity="0.5" />
                <rect x="52" y="40" width="8" height="8" rx="1" fill="#64748b" opacity="0.5" />
                <rect x="40" y="52" width="8" height="8" rx="1" fill="#64748b" opacity="0.5" />
                <rect x="52" y="52" width="8" height="8" rx="1" fill="#64748b" opacity="0.5" />
              </svg>
            </div>
            <p className="text-sm">Click "Generate QR Code" to start a session</p>
          </div>
        )}
      </div>
    </div>
  );
}
