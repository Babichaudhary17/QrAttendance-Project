/**
 * MobileScanPage — renders the QR scanner fullscreen with no dashboard chrome.
 * Designed for mobile: the student navigates here when they tap "Scan QR"
 * from the bottom navigation bar.
 */
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import ScanQR from "./ScanQR";

export default function MobileScanPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleDone = () => navigate("/student/dashboard", { replace: true });

  return (
    <div className="relative min-h-screen min-h-[100dvh] bg-slate-950 overflow-hidden">
      {/* Header bar with back button */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 pt-safe pb-3"
           style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}>
        <button
          onClick={handleDone}
          className="w-9 h-9 rounded-full bg-black/40 backdrop-blur border border-white/15 text-white flex items-center justify-center active:scale-95 transition-all"
          aria-label="Back to dashboard"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div>
          <p className="text-white text-sm font-bold leading-tight">Scan QR Code</p>
          {currentUser?.name && (
            <p className="text-slate-400 text-xs leading-tight">{currentUser.name}</p>
          )}
        </div>
      </div>

      {/* Scanner fills the whole screen */}
      <ScanQR fullscreen onDone={handleDone} />
    </div>
  );
}
