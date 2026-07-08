import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import Sidebar from "../Components/layout/Sidebar";
import PageHeader from "../Components/layout/PageHeader";
import StatCard from "../Components/UI/StatCard";
import ScanQR from "./student/ScanQR";
import AttendanceHistory from "./student/AttendanceHistory";
import AttendanceReport from "./student/AttendanceReport";
import Profile from "./student/Profile";
import Icon from "../Components/UI/Icon";

const NAV = [
  { id: "scan",    label: "Scan QR",           icon: "camera" },
  { id: "history", label: "Attendance History", icon: "chart"  },
  { id: "report",  label: "My Report",          icon: "list"   },
  { id: "profile", label: "Profile",            icon: "user"   },
];

const HEADERS = {
  scan:    { title: "Scan QR Code",        subtitle: "Scan the classroom QR to mark your attendance" },
  history: { title: "Attendance History",  subtitle: "Your personal attendance records and stats" },
  report:  { title: "My Report Card",      subtitle: "Generate and print your full attendance report" },
  profile: { title: "My Profile",          subtitle: "Your student information and attendance summary" },
};

export default function StudentDashboard() {
  const { classes, currentUser, attendanceRecords, joinClass, refreshWorkspace } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("scan");
  const [classCode, setClassCode] = useState("");
  const [joinStatus, setJoinStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    window.history.replaceState(
      { ...(window.history.state ?? {}), attendQrTab: "scan" },
      "",
      window.location.pathname
    );

    const handleBack = (event) => setActiveTab(event.state?.attendQrTab ?? "scan");
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, []);

  const navigateToTab = (tab) => {
    setActiveTab(tab);
    window.history.pushState({ attendQrTab: tab }, "", window.location.pathname);
  };

  const goHome  = () => navigateToTab("scan");
  const goBack  = () => window.history.back();

  const myRecords    = attendanceRecords.filter((r) => r.studentId === currentUser.studentId);
  const presentCount = myRecords.filter((r) => r.status === "present").length;
  const rate         = myRecords.length ? Math.round((presentCount / myRecords.length) * 100) : 0;
  const assignedClass = currentUser.assignedClass ?? classes[0] ?? null;

  const handleManualJoin = async (event) => {
    event.preventDefault();
    setJoinStatus({ type: "", message: "" });

    if (!classCode.trim()) {
      setJoinStatus({ type: "error", message: "Enter a class code first." });
      return;
    }

    const result = await joinClass(classCode);
    if (!result.success) {
      setJoinStatus({ type: "error", message: result.error });
      return;
    }

    setClassCode("");
    await refreshWorkspace();
    setJoinStatus({ type: "success", message: `Joined ${result.class.name} successfully.` });
  };

  return (
    <div className="flex min-h-screen bg-slate-900" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* ── Desktop sidebar (hidden on mobile) ─── */}
      <div className="hidden lg:flex">
        <Sidebar
          navItems={NAV}
          activeTab={activeTab}
          setActiveTab={navigateToTab}
          roleLabel={{ text: "Student", color: "text-emerald-400" }}
          avatarColor="bg-emerald-500/20 text-emerald-400"
          homeTab="scan"
          onHome={goHome}
          onBack={goBack}
        />
      </div>

      {/* ── Main content ─────────────────────────── */}
      <main className="flex-1 p-4 lg:p-7 pb-24 lg:pb-7 overflow-y-auto">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white font-black text-xl leading-tight">
              {HEADERS[activeTab].title}
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">{HEADERS[activeTab].subtitle}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-black">
            {currentUser.avatar}
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:block">
          <PageHeader title={HEADERS[activeTab].title} subtitle={HEADERS[activeTab].subtitle} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 lg:gap-4 mb-5 lg:mb-7">
          <StatCard
            label="Present"
            value={presentCount}
            icon="check"
            color="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          />
          <StatCard
            label="Class"
            value={assignedClass?.name ?? currentUser.class ?? "—"}
            icon="list"
            color="bg-slate-800/60 border-slate-700 text-white"
          />
          <StatCard
            label="Rate"
            value={`${rate}%`}
            icon="chart"
            color="bg-sky-500/10 border-sky-500/20 text-sky-400"
          />
        </div>

        {/* Join class form */}
        <form
          onSubmit={handleManualJoin}
          className="mb-5 lg:mb-7 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 grid gap-3 md:grid-cols-[1fr_auto]"
        >
          <input
            value={classCode}
            onChange={(e) => { setClassCode(e.target.value); setJoinStatus({ type: "", message: "" }); }}
            placeholder="Paste class code to join"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
          />
          <button className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-white hover:bg-emerald-400 transition-colors">
            Join
          </button>
          {joinStatus.message && (
            <div
              className={`md:col-span-2 rounded-xl border px-4 py-3 text-sm ${
                joinStatus.type === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-red-500/30 bg-red-500/10 text-red-300"
              }`}
            >
              {joinStatus.message}
            </div>
          )}
        </form>

        {/* Tab content */}
        {activeTab === "scan"    && <ScanQR />}
        {activeTab === "history" && <AttendanceHistory records={myRecords} />}
        {activeTab === "report"  && <AttendanceReport records={myRecords} />}
        {activeTab === "profile" && <Profile records={myRecords} />}
      </main>

      {/* ── Mobile bottom navigation bar ────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-md border-t border-slate-800"
           style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex items-center">
          {NAV.map((item) => {
            const active = activeTab === item.id;
            /* Scan QR tab gets a special FAB-style treatment */
            if (item.id === "scan") {
              return (
                <div key={item.id} className="flex-1 flex justify-center -mt-5">
                  <button
                    onClick={() => navigate("/student/scan")}
                    className="w-16 h-16 rounded-full bg-sky-500 hover:bg-sky-400 active:scale-95 shadow-xl shadow-sky-500/40 flex flex-col items-center justify-center transition-all border-4 border-slate-950"
                    aria-label="Scan QR code"
                  >
                    <Icon name="camera" className="w-6 h-6 text-white" />
                  </button>
                </div>
              );
            }
            return (
              <button
                key={item.id}
                onClick={() => navigateToTab(item.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                  active ? "text-sky-400" : "text-slate-500"
                }`}
              >
                <Icon name={item.icon} className="w-5 h-5" />
                <span className="text-[10px] font-semibold">{item.label}</span>
                {active && <span className="w-1 h-1 rounded-full bg-sky-400" />}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
