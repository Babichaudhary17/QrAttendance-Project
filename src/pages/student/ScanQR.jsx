import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import { QRVisual } from "../../Components/UI/QRMark";
import Icon from "../../Components/UI/Icon";

export default function ScanQR() {
  const {
    currentUser,
    classes,
    addAttendanceRecord,
    activeQrSessions,
    stopQrSession,
  } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState("");

  const scannerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const markAttendanceFromPayload = async (payload) => {
    const { sessionId, classId, expiresAt, teacherId } = payload;

    if (!sessionId || !classId || !expiresAt) {
      setError("Invalid QR code. Missing session details.");
      return;
    }

    if (Date.now() > new Date(expiresAt).getTime()) {
      setError("This QR code has expired. Ask your teacher to generate a new one.");
      return;
    }

    if (!classes.some((cls) => cls.id === classId)) {
      setError("You are not enrolled in the class for this QR code.");
      return;
    }

    const result = await addAttendanceRecord({
      classId,
      sessionId,
      teacherId,
      token: payload.token,
    });

    if (!result.success) {
      setError(result.error);
      return;
    }

    setScanResult({
      sessionId,
      classId,
      date: result.record.date,
      time: result.record.time,
    });
  };

  const handleDecoded = async (text) => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
    }

    setScanning(false);
    setProgress(100);

    try {
      const payload = JSON.parse(text);
      await markAttendanceFromPayload(payload);
    } catch {
      setError("Invalid QR code. Could not parse the session data.");
    }
  };

  const startScan = async () => {
    setError("");
    setScanResult(null);
    setProgress(0);
    setScanning(true);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-scan-region");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 180, height: 180 } },
        (decodedText) => handleDecoded(decodedText),
        () => {}
      );

      let nextProgress = 0;
      const timer = setInterval(() => {
        nextProgress = Math.min(nextProgress + 1, 90);
        setProgress(nextProgress);
        if (nextProgress >= 90) {
          clearInterval(timer);
        }
      }, 100);
    } catch (err) {
      setScanning(false);
      setError(
        err?.message?.includes("permission")
          ? "Camera permission denied. Please allow camera access and try again."
          : "Could not start camera. Make sure no other app is using it."
      );
    }
  };

  const useActiveSession = () => {
    setError("");
    setScanResult(null);

    const classId = classes.find((cls) => activeQrSessions[cls.id])?.id;
    const payload = classId ? activeQrSessions[classId] : null;

    if (!payload) {
      setError("No active teacher QR session was found.");
      return;
    }

    if (Date.now() > payload.expiresAt) {
      stopQrSession(classId);
      setError("The active teacher session has expired.");
      return;
    }

    markAttendanceFromPayload(payload);
  };

  const reset = () => {
    setScanResult(null);
    setError("");
    setProgress(0);
    setScanning(false);
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 flex flex-col items-center">
        <p className="text-slate-400 text-sm mb-6">Enrolled classes</p>
        <div className="bg-white p-6 rounded-2xl mb-5 shadow-xl">
          <QRVisual size={140} color="#0f172a" />
        </div>
        <p className="text-white font-bold text-sm">{currentUser.name}</p>
        <p className="text-slate-500 text-xs mt-1">
          {currentUser.studentId}
        </p>
        <div className="mt-5 w-full space-y-2">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-300"
            >
              {cls.name}
            </div>
          ))}
          {classes.length === 0 && (
            <p className="text-slate-500 text-sm text-center">
              No enrolled classes yet.
            </p>
          )}
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center">
        <h3 className="text-white font-bold mb-2">Mark Attendance</h3>
        <p className="text-slate-500 text-sm mb-8 text-center max-w-xs">
          Scan the classroom QR shown by your teacher to mark yourself present.
        </p>

        {scanning && (
          <div className="flex flex-col items-center w-full max-w-xs">
            <div
              id="qr-scan-region"
              className="w-44 h-44 rounded-2xl overflow-hidden mb-6 border-4 border-sky-500 bg-slate-900"
            />
            <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
              <div
                className="bg-sky-400 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-slate-400 text-sm">Scanning... point at teacher's QR</p>
            <button
              onClick={() => {
                scannerRef.current?.stop();
                reset();
              }}
              className="mt-4 text-xs text-slate-600 hover:text-slate-400 underline transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {!scanning && scanResult && (
          <div className="text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mb-4">
              <Icon name="check" className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-emerald-400 font-black text-lg mb-1">Attendance Marked!</p>
            <p className="text-slate-500 text-sm">
              {scanResult.date} at {scanResult.time}
            </p>
            <p className="text-slate-600 text-xs mt-1 font-mono">
              Class {scanResult.classId} - {scanResult.sessionId?.slice(0, 8)}
            </p>
            <button
              onClick={reset}
              className="mt-5 text-sm text-slate-500 hover:text-slate-300 underline transition-colors"
            >
              Scan again
            </button>
          </div>
        )}

        {!scanning && error && (
          <div className="text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mb-4">
              <Icon name="x" className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-red-400 font-black text-lg mb-2">Failed</p>
            <p className="text-slate-400 text-sm text-center max-w-xs mb-5">{error}</p>
            <button
              onClick={reset}
              className="px-5 py-2.5 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 text-sm font-semibold rounded-xl transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {!scanning && !scanResult && !error && (
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={startScan}
              className="flex items-center gap-3 bg-sky-500 text-white font-black px-8 py-4 rounded-2xl hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/20 text-sm"
            >
              <Icon name="camera" className="w-5 h-5" />
              Start Scanning
            </button>
            <button
              onClick={useActiveSession}
              className="text-sm text-slate-400 hover:text-white transition-colors underline"
            >
              Use active teacher session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
