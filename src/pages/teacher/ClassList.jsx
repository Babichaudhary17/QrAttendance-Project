import { useState } from "react";

const CLASS_COLORS = [
  { border: "#3b82f6", dot: "#60a5fa", glow: "rgba(59,130,246,0.15)", num: "#93c5fd" },
  { border: "#7c3aed", dot: "#a78bfa", glow: "rgba(124,58,237,0.15)", num: "#c4b5fd" },
  { border: "#10b981", dot: "#34d399", glow: "rgba(16,185,129,0.15)", num: "#6ee7b7" },
  { border: "#f59e0b", dot: "#fbbf24", glow: "rgba(245,158,11,0.15)",  num: "#fcd34d" },
  { border: "#f43f5e", dot: "#fb7185", glow: "rgba(244,63,94,0.15)",   num: "#fda4af" },
  { border: "#06b6d4", dot: "#22d3ee", glow: "rgba(6,182,212,0.15)",   num: "#67e8f9" },
];

function ClassCard({ cls, index, onSelect, onDelete }) {
  const [hovered,       setHovered]       = useState(false);
  const [deleteHovered, setDeleteHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState("");
  const color    = CLASS_COLORS[index % CLASS_COLORS.length];
  const initials = cls.name.replace("Grade ", "G").replace(" – ", "").replace(" - ", "");

  const handleDeleteClick = async (e) => {
    e.stopPropagation();
    if (confirmDelete) { await onDelete(cls.id); }
    else { setConfirmDelete(true); }
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setConfirmDelete(false);
  };

  const copyValue = async (event, value, label) => {
    event.stopPropagation();
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(""), 1600);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirmDelete(false); }}
      style={{
        position: "relative",
        background: hovered
          ? `linear-gradient(135deg, ${color.glow}, rgba(15,23,42,0.9))`
          : "linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.95))",
        border: `1px solid ${hovered ? color.border : "rgba(51,65,85,0.6)"}`,
        borderRadius: "16px",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered
          ? `0 20px 40px ${color.glow}, 0 0 0 1px ${color.border}33`
          : "0 4px 16px rgba(0,0,0,0.3)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: "180px",
      }}
    >
      {/* Top accent bar */}
      <div style={{
        height: "3px",
        background: `linear-gradient(90deg, ${color.border}, ${color.dot}88)`,
        opacity: hovered ? 1 : 0.4,
        transition: "opacity 0.25s",
        flexShrink: 0,
      }} />

      {/* Card body — clickable */}
      <div
        onClick={() => onSelect(cls)}
        style={{ padding: "20px 22px 22px", flex: 1, display: "flex", flexDirection: "column", cursor: "pointer" }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "12px",
            background: `${color.border}22`, border: `1px solid ${color.border}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", fontWeight: 700, color: color.dot,
            letterSpacing: "0.05em", fontFamily: "monospace",
            transition: "transform 0.25s",
            transform: hovered ? "scale(1.08)" : "scale(1)",
          }}>
            {initials}
          </div>
          <div style={{
            width: "28px", height: "28px", borderRadius: "8px",
            background: hovered ? `${color.border}22` : "rgba(51,65,85,0.4)",
            border: `1px solid ${hovered ? color.border + "44" : "rgba(51,65,85,0.4)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.25s",
            transform: hovered ? "rotate(-45deg)" : "rotate(0deg)",
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={hovered ? color.dot : "#64748b"} strokeWidth="1.8">
              <path d="M2.5 9.5l7-7M3 2.5h6.5V9" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <div style={{
          fontSize: "16px", fontWeight: 600,
          color: hovered ? "#f8fafc" : "#e2e8f0",
          lineHeight: 1.3, marginBottom: "6px", transition: "color 0.2s",
        }}>
          {cls.name}
        </div>
        <div style={{ fontSize: "12px", color: "#94a3b8", minHeight: "18px" }}>
          {cls.subject || "No subject"}
        </div>

        <div style={{
          height: "1px",
          background: hovered ? `${color.border}33` : "rgba(51,65,85,0.4)",
          margin: "10px 0", transition: "background 0.25s",
        }} />

        <div style={{ display: "grid", gap: "8px", marginBottom: "12px" }}>
          <InviteRow
            label="Code"
            value={cls.classCode}
            onCopy={(event) => copyValue(event, cls.classCode, "code")}
          />
          <InviteRow
            label="Link"
            value={cls.inviteLink}
            onCopy={(event) => copyValue(event, cls.inviteLink, "link")}
          />
          {copied && (
            <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 600 }}>
              Copied {copied}
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
          <div style={{ display: "flex" }}>
            {[...Array(Math.min(3, cls.students.length))].map((_, i) => (
              <div key={i} style={{
                width: "20px", height: "20px", borderRadius: "50%",
                background: `${color.border}33`, border: `1.5px solid ${color.border}55`,
                marginLeft: i > 0 ? "-6px" : "0",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "8px", color: color.dot, fontWeight: 600,
              }}>
                {cls.students[i]?.name?.[0]}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ fontSize: "20px", fontWeight: 700, color: color.num, lineHeight: 1 }}>
              {cls.students.length}
            </span>
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>students</span>
          </div>
        </div>
      </div>

      {/* Delete controls — appear on hover */}
      {hovered && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: "absolute", top: "14px",
            right: "14px",
            display: "flex", alignItems: "center", gap: "6px",
          }}
        >
          {confirmDelete ? (
            <>
              <button onClick={handleCancelDelete} style={{
                fontSize: "10px", fontWeight: 600, padding: "3px 8px",
                background: "rgba(15,23,42,0.95)", border: "1px solid #475569",
                borderRadius: "6px", color: "#94a3b8", cursor: "pointer",
              }}>
                Cancel
              </button>
              <button onClick={handleDeleteClick} style={{
                fontSize: "10px", fontWeight: 600, padding: "3px 8px",
                background: "rgba(239,68,68,0.15)", border: "1px solid #ef4444",
                borderRadius: "6px", color: "#f87171", cursor: "pointer",
              }}>
                Confirm
              </button>
            </>
          ) : (
            <button
              onClick={handleDeleteClick}
              onMouseEnter={() => setDeleteHovered(true)}
              onMouseLeave={() => setDeleteHovered(false)}
              style={{
                width: "26px", height: "26px", borderRadius: "7px",
                background: deleteHovered ? "rgba(239,68,68,0.2)" : "rgba(15,23,42,0.85)",
                border: `1px solid ${deleteHovered ? "#ef4444" : "#475569"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={deleteHovered ? "#f87171" : "#64748b"} strokeWidth="1.6">
                <path d="M1.5 3h9M4.5 3V1.5h3V3M5 5.5v4M7 5.5v4M2.5 3l.5 7.5h6L10 3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Dot grid overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `radial-gradient(circle, ${color.border}08 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
        opacity: hovered ? 1 : 0, transition: "opacity 0.3s", borderRadius: "16px",
      }} />
    </div>
  );
}

function InviteRow({ label, value, onCopy }) {
  return (
    <div
      onClick={(event) => event.stopPropagation()}
      style={{
        display: "grid",
        gridTemplateColumns: "38px 1fr auto",
        alignItems: "center",
        gap: "8px",
        border: "1px solid rgba(51,65,85,0.65)",
        background: "rgba(15,23,42,0.7)",
        borderRadius: "8px",
        padding: "7px 8px",
      }}
    >
      <span style={{ fontSize: "10px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
        {label}
      </span>
      <span style={{ fontSize: "11px", color: "#cbd5e1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "monospace" }}>
        {value || "Generating..."}
      </span>
      <button
        onClick={onCopy}
        disabled={!value}
        style={{
          width: "26px",
          height: "26px",
          borderRadius: "7px",
          border: "1px solid rgba(59,130,246,0.35)",
          background: "rgba(59,130,246,0.12)",
          color: "#93c5fd",
          cursor: value ? "pointer" : "not-allowed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        title={`Copy ${label.toLowerCase()}`}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 4V2.5A1.5 1.5 0 0 1 5.5 1h3A1.5 1.5 0 0 1 10 2.5v3A1.5 1.5 0 0 1 8.5 7H7" />
          <path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h3A1.5 1.5 0 0 1 8 5.5v3A1.5 1.5 0 0 1 6.5 10h-3A1.5 1.5 0 0 1 2 8.5z" />
        </svg>
      </button>
    </div>
  );
}

function AddClassForm({ onAdd, onCancel }) {
  const [name,  setName]  = useState("");
  const [subject, setSubject] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Class name is required."); return; }
    const id = name.trim().replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, "") + Date.now();
    await onAdd({ id, name: name.trim(), subject: subject.trim(), students: [] });
    setName(""); setSubject(""); setError("");
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #1e293b, #0f172a)",
      border: "1px solid #334155", borderRadius: "14px",
      padding: "20px", marginBottom: "24px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <div style={{
          width: "28px", height: "28px", borderRadius: "8px",
          background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#60a5fa" strokeWidth="1.8">
            <path d="M7 1v12M1 7h12" strokeLinecap="round"/>
          </svg>
        </div>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "#f1f5f9" }}>New Class</span>
      </div>

      <label style={{
        fontSize: "11px", fontWeight: 600, color: "#64748b",
        textTransform: "uppercase", letterSpacing: "0.05em",
        display: "block", marginBottom: "6px",
      }}>
        Class Name
      </label>
      <input
        type="text"
        value={name}
        onChange={e => { setName(e.target.value); setError(""); }}
        placeholder="e.g. Grade 11 – A"
        autoFocus
        onKeyDown={e => e.key === "Enter" && handleSubmit()}
        style={{
          width: "100%", background: "#0f172a",
          border: "1px solid #334155", borderRadius: "8px",
          padding: "10px 12px", fontSize: "13px", color: "#f1f5f9",
          outline: "none", boxSizing: "border-box", marginBottom: "10px",
        }}
        onFocus={e => e.target.style.borderColor = "#3b82f6"}
        onBlur={e => e.target.style.borderColor = "#334155"}
      />

      <label style={{
        fontSize: "11px", fontWeight: 600, color: "#64748b",
        textTransform: "uppercase", letterSpacing: "0.05em",
        display: "block", marginBottom: "6px",
      }}>
        Subject
      </label>
      <input
        type="text"
        value={subject}
        onChange={e => setSubject(e.target.value)}
        placeholder="e.g. Mathematics"
        onKeyDown={e => e.key === "Enter" && handleSubmit()}
        style={{
          width: "100%", background: "#0f172a",
          border: "1px solid #334155", borderRadius: "8px",
          padding: "10px 12px", fontSize: "13px", color: "#f1f5f9",
          outline: "none", boxSizing: "border-box", marginBottom: "10px",
        }}
        onFocus={e => e.target.style.borderColor = "#3b82f6"}
        onBlur={e => e.target.style.borderColor = "#334155"}
      />

      {error && <p style={{ fontSize: "12px", color: "#f87171", margin: "0 0 10px" }}>{error}</p>}

      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={{
          background: "transparent", border: "1px solid #334155", borderRadius: "8px",
          color: "#94a3b8", fontSize: "12px", fontWeight: 500, padding: "8px 16px", cursor: "pointer",
        }}>
          Cancel
        </button>
        <button onClick={handleSubmit} style={{
          background: "linear-gradient(135deg, #2563eb, #1d4ed8)", border: "none",
          borderRadius: "8px", color: "#fff", fontSize: "12px", fontWeight: 600,
          padding: "8px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 1v10M1 6h10" strokeLinecap="round"/>
          </svg>
          Add Class
        </button>
      </div>
    </div>
  );
}

export default function ClassList({ classes, onSelect, onAddClass, onDeleteClass }) {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div>
      {/* Single header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "4px", height: "22px",
            background: "linear-gradient(180deg, #3b82f6, #8b5cf6)",
            borderRadius: "2px",
          }} />
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#f1f5f9", margin: 0, letterSpacing: "-0.02em" }}>
            My Classes
          </h2>
          <span style={{
            fontSize: "11px", fontWeight: 600, color: "#60a5fa",
            background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)",
            padding: "2px 8px", borderRadius: "99px",
          }}>
            {classes.length} total
          </span>
        </div>

        <button
          onClick={() => setShowAddForm(v => !v)}
          style={{
            display: "flex", alignItems: "center", gap: "7px",
            background: showAddForm ? "rgba(59,130,246,0.15)" : "rgba(30,41,59,0.8)",
            border: `1px solid ${showAddForm ? "#3b82f6" : "#334155"}`,
            borderRadius: "10px", color: showAddForm ? "#60a5fa" : "#94a3b8",
            fontSize: "13px", fontWeight: 600, padding: "9px 16px",
            cursor: "pointer", transition: "all 0.15s",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M7 1v12M1 7h12" strokeLinecap="round"/>
          </svg>
          Add Class
        </button>
      </div>

      {showAddForm && (
        <AddClassForm
          onAdd={async (cls) => { await onAddClass(cls); setShowAddForm(false); }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "16px",
      }}>
        {classes.map((cls, i) => (
          <ClassCard key={cls.id} cls={cls} index={i} onSelect={onSelect} onDelete={onDeleteClass} />
        ))}
        {classes.length === 0 && (
          <div style={{
            gridColumn: "1 / -1", textAlign: "center",
            padding: "60px 20px", color: "#475569", fontSize: "14px",
          }}>
            No classes yet. Click "Add Class" to create one.
          </div>
        )}
      </div>
    </div>
  );
}
