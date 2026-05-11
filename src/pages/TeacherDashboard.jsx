import { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import Sidebar from "../Components/layout/Sidebar";
import ClassList from "./teacher/ClassList";
import ClassDetail from "./teacher/ClassDetail";
import ViewAttendance from "./teacher/ViewAttendance";
import ManageStudents from "./teacher/ManageStudents";

const NAV = [
  { id: "classes", label: "Classes", icon: "calendar" },
  { id: "attendance", label: "View Attendance", icon: "list" },
  { id: "students", label: "Manage Students", icon: "users" },
];

function Toast({ message, onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 3000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        top: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: "#0f172a",
        border: "1px solid #10b981",
        borderRadius: "12px",
        padding: "12px 18px",
        boxShadow: "0 8px 32px rgba(16,185,129,0.2)",
        animation: "slideIn 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }`}</style>
      <div
        style={{
          width: "22px",
          height: "22px",
          borderRadius: "50%",
          background: "rgba(16,185,129,0.15)",
          border: "1px solid #10b981",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="#34d399" strokeWidth="2">
          <path d="M1.5 5.5l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span style={{ fontSize: "13px", fontWeight: 500, color: "#f1f5f9" }}>
        {message}
      </span>
    </div>
  );
}

export default function TeacherDashboard() {
  const {
    classes,
    attendanceRecords,
    students,
    addClass,
    deleteClass,
    addStudentToClass,
    deleteStudent,
  } = useAuth();
  const [activeTab, setActiveTab] = useState("classes");
  const [selectedClass, setSelectedClass] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message) => setToast(message);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedClass(null);
  };

  const handleSelectClass = (cls) => setSelectedClass(cls);
  const handleBack = () => setSelectedClass(null);

  const handleAddClass = async (newClass) => {
    const created = await addClass(newClass);
    showToast(`"${created.name}" added successfully`);
  };

  const handleDeleteClass = async (classId) => {
    const targetClass = classes.find((cls) => cls.id === classId);
    await deleteClass(classId);
    showToast(`"${targetClass?.name}" deleted`);
  };

  const detailSubtitle = selectedClass
    ? `${classes.find((cls) => cls.id === selectedClass.id)?.students.length ?? 0} students`
    : null;

  return (
    <div
      className="flex min-h-screen bg-slate-900"
      style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
    >
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <Sidebar
        navItems={NAV}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        roleLabel={{ text: "Teacher", color: "text-blue-400" }}
        avatarColor="bg-blue-500/20 text-blue-400"
      />

      <main className="flex-1 p-7 overflow-y-auto">
        {(activeTab !== "classes" || selectedClass) && (
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontSize: "20px", fontWeight: 500, color: "#f1f5f9", margin: 0 }}>
              {selectedClass
                ? selectedClass.name
                : activeTab === "attendance"
                  ? "View Attendance"
                  : "Manage Students"}
            </h1>
            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
              {selectedClass
                ? detailSubtitle
                : activeTab === "attendance"
                  ? "Filter and track daily attendance records"
                  : "Add and manage your student roster"}
            </p>
          </div>
        )}

        {activeTab === "classes" &&
          (selectedClass ? (
            <ClassDetail
              cls={classes.find((cls) => cls.id === selectedClass.id) ?? selectedClass}
              records={attendanceRecords}
              onBack={handleBack}
              onAddStudent={addStudentToClass}
              onShowToast={showToast}
            />
          ) : (
            <ClassList
              classes={classes}
              onSelect={handleSelectClass}
              onAddClass={handleAddClass}
              onDeleteClass={handleDeleteClass}
            />
          ))}

        {activeTab === "attendance" && <ViewAttendance records={attendanceRecords} />}
        {activeTab === "students" && (
          <ManageStudents
            students={students}
            classes={classes}
            onAdd={addStudentToClass}
            onDelete={deleteStudent}
            onShowToast={showToast}
          />
        )}
      </main>
    </div>
  );
}
