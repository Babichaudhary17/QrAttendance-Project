import { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import Sidebar from "../Components/layout/Sidebar";
import PageHeader from "../Components/layout/PageHeader";
import StatCard from "../Components/UI/StatCard";
import ScanQR from "./student/ScanQR";
import AttendanceHistory from "./student/AttendanceHistory";
import Profile from "./student/Profile";

const NAV = [
  { id: "scan", label: "Scan QR", icon: "camera" },
  { id: "history", label: "Attendance History", icon: "chart" },
  { id: "profile", label: "Profile", icon: "user" },
];

const HEADERS = {
  scan: {
    title: "Scan QR Code",
    subtitle: "Scan your unique QR code to mark attendance",
  },
  history: {
    title: "Attendance History",
    subtitle: "Your personal attendance records and stats",
  },
  profile: {
    title: "My Profile",
    subtitle: "Your student information and attendance summary",
  },
};

export default function StudentDashboard() {
  const { classes, currentUser, attendanceRecords, joinClass, refreshWorkspace } = useAuth();
  const [activeTab, setActiveTab] = useState("scan");
  const [classCode, setClassCode] = useState("");
  const [joinStatus, setJoinStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    window.history.replaceState(
      { ...(window.history.state ?? {}), attendQrTab: "scan" },
      "",
      window.location.pathname
    );

    const handleBack = (event) => {
      setActiveTab(event.state?.attendQrTab ?? "scan");
    };

    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, []);

  const navigateToTab = (tab) => {
    setActiveTab(tab);
    window.history.pushState({ attendQrTab: tab }, "", window.location.pathname);
  };

  const goHome = () => navigateToTab("scan");
  const goBack = () => window.history.back();

  const myRecords = attendanceRecords.filter(
    (record) => record.studentId === currentUser.studentId
  );
  const presentCount = myRecords.filter(
    (record) => record.status === "present"
  ).length;
  const rate = myRecords.length
    ? Math.round((presentCount / myRecords.length) * 100)
    : 0;
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
    <div
      className="flex min-h-screen bg-slate-900"
      style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
    >
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

      <main className="flex-1 p-7 overflow-y-auto">
        <PageHeader
          title={HEADERS[activeTab].title}
          subtitle={HEADERS[activeTab].subtitle}
        />

        <div className="grid grid-cols-3 gap-4 mb-7">
          <StatCard
            label="Present Days"
            value={presentCount}
            icon="check"
            color="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          />
          <StatCard
            label="My Class"
            value={assignedClass?.name ?? currentUser.class ?? "Not assigned"}
            icon="list"
            color="bg-slate-800/60 border-slate-700 text-white"
          />
          <StatCard
            label="My Rate"
            value={`${rate}%`}
            icon="chart"
            color="bg-sky-500/10 border-sky-500/20 text-sky-400"
          />
        </div>

        <form
          onSubmit={handleManualJoin}
          className="mb-7 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 grid gap-3 md:grid-cols-[1fr_auto]"
        >
          <input
            value={classCode}
            onChange={(event) => {
              setClassCode(event.target.value);
              setJoinStatus({ type: "", message: "" });
            }}
            placeholder="Paste class code"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
          />
          <button className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-white hover:bg-emerald-400 transition-colors">
            Join Class
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

        {activeTab === "scan" && <ScanQR />}
        {activeTab === "history" && <AttendanceHistory records={myRecords} />}
        {activeTab === "profile" && <Profile records={myRecords} />}
      </main>
    </div>
  );
}
