import { useState } from "react";
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
  const { currentUser, attendanceRecords } = useAuth();
  const [activeTab, setActiveTab] = useState("scan");

  const myRecords = attendanceRecords.filter(
    (record) => record.studentId === currentUser.studentId
  );
  const presentCount = myRecords.filter(
    (record) => record.status === "present"
  ).length;
  const rate = myRecords.length
    ? Math.round((presentCount / myRecords.length) * 100)
    : 0;

  return (
    <div
      className="flex min-h-screen bg-slate-900"
      style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
    >
      <Sidebar
        navItems={NAV}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        roleLabel={{ text: "Student", color: "text-emerald-400" }}
        avatarColor="bg-emerald-500/20 text-emerald-400"
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
            label="Total Recorded"
            value={myRecords.length}
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

        {activeTab === "scan" && <ScanQR />}
        {activeTab === "history" && <AttendanceHistory records={myRecords} />}
        {activeTab === "profile" && <Profile records={myRecords} />}
      </main>
    </div>
  );
}
