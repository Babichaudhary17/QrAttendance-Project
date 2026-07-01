import { useEffect, useState } from "react";
import Sidebar from "../Components/layout/Sidebar";
import Overview from "./admin/Overview";
import TeacherView from "./admin/TeacherView";
import StudentView from "./admin/StudentView";
import AllUsers from "./admin/AllUsers";
import AllRecords from "./admin/AllRecords";
import AdminSettings from "./admin/AdminSettings";

const NAV = [
  { id: "overview", label: "Overview", icon: "home" },
  { id: "teacher", label: "Teacher View", icon: "qr" },
  { id: "student", label: "Student View", icon: "camera" },
  { id: "users", label: "All Users", icon: "users" },
  { id: "records", label: "All Records", icon: "list" },
  { id: "settings", label: "Settings", icon: "settings" },
];

const HEADERS = {
  overview: {
    title: "Admin Overview",
    subtitle: "Full system access - view everything across all roles",
  },
  teacher: {
    title: "Teacher Panel View",
    subtitle: "Previewing the teacher dashboard as admin",
  },
  student: {
    title: "Student Panel View",
    subtitle: "Previewing the student dashboard as admin",
  },
  users: {
    title: "All System Users",
    subtitle: "Every registered user across all roles",
  },
  records: {
    title: "All Attendance Records",
    subtitle: "Complete attendance log for all students",
  },
  settings: {
    title: "Admin Settings",
    subtitle: "Update the admin login username and password",
  },
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    window.history.replaceState(
      { ...(window.history.state ?? {}), attendQrTab: "overview" },
      "",
      window.location.pathname
    );

    const handleBack = (event) => {
      setActiveTab(event.state?.attendQrTab ?? "overview");
    };

    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, []);

  const navigateToTab = (tab) => {
    setActiveTab(tab);
    window.history.pushState({ attendQrTab: tab }, "", window.location.pathname);
  };

  const goHome = () => navigateToTab("overview");
  const goBack = () => window.history.back();

  return (
    <div
      className="flex min-h-screen bg-slate-900"
      style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
    >
      <Sidebar
        navItems={NAV}
        activeTab={activeTab}
        setActiveTab={navigateToTab}
        roleLabel={{ text: "Administrator", color: "text-amber-400" }}
        avatarColor="bg-amber-500/20 text-amber-400"
        homeTab="overview"
        onHome={goHome}
        onBack={goBack}
      />

      <main className="flex-1 p-7 overflow-y-auto">
        <div className="flex items-center gap-3 mb-7">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-white">
                {HEADERS[activeTab].title}
              </h1>
              <span className="bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full">
                ADMIN
              </span>
            </div>
            <p className="text-slate-500 text-sm">{HEADERS[activeTab].subtitle}</p>
          </div>
        </div>

        {activeTab === "overview" && <Overview onNavigate={navigateToTab} />}
        {activeTab === "teacher" && <TeacherView />}
        {activeTab === "student" && <StudentView />}
        {activeTab === "users" && <AllUsers />}
        {activeTab === "records" && <AllRecords />}
        {activeTab === "settings" && <AdminSettings />}
      </main>
    </div>
  );
}
