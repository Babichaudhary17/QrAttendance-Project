import { useEffect, useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import { getDefaultAttendanceDate } from "../../utils/attendance";
import GenerateQR from "./GenerateQR";

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Toast({ message, type = "success", onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 3000);
    return () => clearTimeout(timer);
  }, [onDone]);

  const colors = {
    success: {
      border: "#10b981",
      bg: "rgba(16,185,129,0.15)",
      icon: "#34d399",
    },
    error: {
      border: "#ef4444",
      bg: "rgba(239,68,68,0.15)",
      icon: "#f87171",
    },
  };
  const palette = colors[type];

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
        border: `1px solid ${palette.border}`,
        borderRadius: "12px",
        padding: "12px 18px",
        boxShadow: `0 8px 32px ${palette.bg}`,
        animation: "toastIn 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }`}</style>
      <div
        style={{
          width: "22px",
          height: "22px",
          borderRadius: "50%",
          background: palette.bg,
          border: `1px solid ${palette.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {type === "success" ? (
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke={palette.icon} strokeWidth="2">
            <path d="M1.5 5.5l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke={palette.icon} strokeWidth="2">
            <path d="M2 2l7 7M9 2l-7 7" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <span style={{ fontSize: "13px", fontWeight: 500, color: "#f1f5f9" }}>
        {message}
      </span>
    </div>
  );
}

function AddStudentForm({ classId, onAdd, onCancel }) {
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [error, setError] = useState("");

  const inputStyle = {
    width: "100%",
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "13px",
    color: "#f1f5f9",
    outline: "none",
    boxSizing: "border-box",
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Student name is required.");
      return;
    }

    if (!id.trim()) {
      setError("Student ID is required.");
      return;
    }

    const result = await onAdd({ id: id.trim(), name: name.trim(), classId });

    if (!result?.success) {
      setError(result?.error ?? "Unable to add student.");
      return;
    }

    setName("");
    setId("");
    setError("");
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1e293b, #0f172a)",
        border: "1px solid #334155",
        borderRadius: "14px",
        padding: "20px",
        marginBottom: "20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            background: "rgba(59,130,246,0.15)",
            border: "1px solid rgba(59,130,246,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#60a5fa" strokeWidth="1.8">
            <path d="M7 1v12M1 7h12" strokeLinecap="round" />
          </svg>
        </div>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "#f1f5f9" }}>
          Add New Student
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
        <div>
          <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
            placeholder="e.g. Sita Sharma"
            style={inputStyle}
            onFocus={(event) => {
              event.target.style.borderColor = "#3b82f6";
            }}
            onBlur={(event) => {
              event.target.style.borderColor = "#334155";
            }}
            onKeyDown={(event) => event.key === "Enter" && handleSubmit()}
          />
        </div>
        <div>
          <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
            Student ID
          </label>
          <input
            type="text"
            value={id}
            onChange={(event) => {
              setId(event.target.value);
              setError("");
            }}
            placeholder="e.g. S-1099"
            style={inputStyle}
            onFocus={(event) => {
              event.target.style.borderColor = "#3b82f6";
            }}
            onBlur={(event) => {
              event.target.style.borderColor = "#334155";
            }}
            onKeyDown={(event) => event.key === "Enter" && handleSubmit()}
          />
        </div>
      </div>

      {error && (
        <p style={{ fontSize: "12px", color: "#f87171", margin: "0 0 10px", display: "flex", alignItems: "center", gap: "4px" }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#f87171" strokeWidth="1.8">
            <circle cx="6" cy="6" r="5" />
            <path d="M6 4v2.5M6 8h.01" strokeLinecap="round" />
          </svg>
          {error}
        </p>
      )}

      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
        <button
          onClick={onCancel}
          style={{
            background: "transparent",
            border: "1px solid #334155",
            borderRadius: "8px",
            color: "#94a3b8",
            fontSize: "12px",
            fontWeight: 500,
            padding: "8px 16px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          style={{
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            border: "none",
            borderRadius: "8px",
            color: "#fff",
            fontSize: "12px",
            fontWeight: 600,
            padding: "8px 18px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 1v10M1 6h10" strokeLinecap="round" />
          </svg>
          Add Student
        </button>
      </div>
    </div>
  );
}

export default function ClassDetail({ cls, records, onBack, onAddStudent }) {
  const { currentUser } = useAuth();
  const [showQR, setShowQR] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [students, setStudents] = useState(cls.students);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setStudents(cls.students);
  }, [cls]);

  const showToast = (message, type = "success") => setToast({ message, type });

  const classRecords = records.filter((record) => record.classId === cls.id);
  const activeDate = getDefaultAttendanceDate(classRecords);
  const todayRecords = classRecords.filter((record) => record.date === activeDate);

  const getStatus = (studentId) => {
    const record = todayRecords.find((item) => item.studentId === studentId);
    return record ? record.status : activeDate ? "absent" : null;
  };

  const handleAdd = async (newStudent) => {
    const result = onAddStudent
      ? await onAddStudent(cls.id, newStudent)
      : { success: true, student: newStudent };

    if (!result?.success) {
      showToast(result?.error ?? "Unable to add student.", "error");
      return result;
    }

    setStudents((current) => [...current, result.student]);
    setShowAddForm(false);
    showToast(`${result.student.name} added successfully`);
    return result;
  };

  return (
    <div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}

      <button
        onClick={onBack}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "12px",
          color: "#60a5fa",
          background: "#1e3a5f",
          border: "0.5px solid #1e40af",
          borderRadius: "8px",
          padding: "5px 12px",
          cursor: "pointer",
          marginBottom: "18px",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M8 2L4 6l4 4" />
        </svg>
        Back to classes
      </button>

      <div
        style={{
          background: "#1e293b",
          border: "0.5px solid #334155",
          borderRadius: "12px",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <div>
          <p style={{ fontSize: "16px", fontWeight: 500, color: "#f1f5f9", margin: 0 }}>
            {cls.name}
          </p>
          <p style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>
            {students.length} students
          </p>
          {cls.classCode && (
            <p style={{ fontSize: "11px", color: "#38bdf8", marginTop: "3px", fontFamily: "monospace" }}>
              Class code: {cls.classCode}
            </p>
          )}
          {activeDate && (
            <p style={{ fontSize: "11px", color: "#475569", marginTop: "3px" }}>
              Status shown for {activeDate}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => {
              setShowAddForm((current) => !current);
              setShowQR(false);
            }}
            style={{
              background: showAddForm ? "rgba(16,185,129,0.15)" : "transparent",
              border: `1px solid ${showAddForm ? "#10b981" : "#334155"}`,
              borderRadius: "8px",
              color: showAddForm ? "#34d399" : "#94a3b8",
              fontSize: "12px",
              fontWeight: 500,
              padding: "8px 14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.15s",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="5.5" cy="4" r="2.5" />
              <path d="M1 11c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" strokeLinecap="round" />
              <path d="M10 6v4M8 8h4" strokeLinecap="round" />
            </svg>
            Add Student
          </button>

          <button
            onClick={() => {
              setShowQR((current) => !current);
              setShowAddForm(false);
            }}
            style={{
              background: "#1d4ed8",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "12px",
              fontWeight: 500,
              padding: "9px 14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="1" y="1" width="5" height="5" rx="0.8" />
              <rect x="1" y="8" width="5" height="5" rx="0.8" />
              <rect x="8" y="1" width="5" height="5" rx="0.8" />
              <path d="M8 8h1.5M8 11h1.5M11 8v1.5M11 11v2" />
            </svg>
            Generate QR
          </button>
        </div>
      </div>

      {showQR && (
        <GenerateQR
          classId={cls.id}
          teacherId={currentUser.teacherId ?? currentUser.id}
        />
      )}
      {showAddForm && (
        <AddStudentForm
          classId={cls.id}
          onAdd={handleAdd}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {students.map((student) => {
          const status = getStatus(student.id);

          return (
            <div
              key={student.id}
              style={{
                background: "#1e293b",
                border: "0.5px solid #334155",
                borderRadius: "8px",
                padding: "11px 16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "#1e3a5f",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#93c5fd",
                  flexShrink: 0,
                }}
              >
                {initials(student.name)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "13px", fontWeight: 500, color: "#e2e8f0", margin: 0 }}>
                  {student.name}
                </p>
                <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>{student.id}</p>
              </div>
              {status && (
                <span
                  style={{
                    fontSize: "11px",
                    padding: "3px 9px",
                    borderRadius: "99px",
                    background: status === "present" ? "#064e3b" : "#450a0a",
                    color: status === "present" ? "#34d399" : "#f87171",
                  }}
                >
                  {status === "present" ? "Present" : "Absent"}
                </span>
              )}
            </div>
          );
        })}
        {students.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "#475569", fontSize: "13px" }}>
            No students yet. Click "Add Student" to get started.
          </div>
        )}
      </div>
    </div>
  );
}
