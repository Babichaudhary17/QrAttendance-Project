import { useState, useRef } from "react";
import Icon from "../../Components/UI/Icon";

/* ── helpers ──────────────────────────────────────────────────────────── */
function rateColor(rate) {
  if (rate >= 80) return { text: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30", bar: "bg-emerald-500" };
  if (rate >= 60) return { text: "text-amber-400",   bg: "bg-amber-500/15",   border: "border-amber-500/30",   bar: "bg-amber-500"   };
  return            { text: "text-red-400",    bg: "bg-red-500/15",     border: "border-red-500/30",     bar: "bg-red-500"     };
}

function grade(rate) {
  if (rate >= 90) return { label: "A+", detail: "Outstanding" };
  if (rate >= 80) return { label: "A",  detail: "Excellent" };
  if (rate >= 70) return { label: "B",  detail: "Good" };
  if (rate >= 60) return { label: "C",  detail: "Satisfactory" };
  if (rate >= 50) return { label: "D",  detail: "Needs Improvement" };
  return                 { label: "F",  detail: "Poor" };
}

const PRINT_STYLE = `
  @media print {
    body > *:not(#teacher-report-print-root) { display: none !important; }
    #teacher-report-print-root { display: block !important; }
    .no-print { display: none !important; }
    @page { margin: 16mm; size: A4; }
  }
`;

/* ─────────────────────────────────────────────────────────────────────── */
export default function TeacherAttendanceReport({ classes, getAttendanceReport }) {
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id ?? "");
  const [loading,  setLoading]  = useState(false);
  const [report,   setReport]   = useState(null);
  const [error,    setError]    = useState("");
  const [search,   setSearch]   = useState("");
  const [sortKey,  setSortKey]  = useState("name"); // name | rate | present
  const [sortDir,  setSortDir]  = useState("asc");
  const reportRef = useRef(null);

  const handleGenerate = async () => {
    if (!selectedClassId) return;
    setLoading(true);
    setError("");
    setReport(null);
    try {
      const data = await getAttendanceReport(selectedClassId);
      setReport(data.report ?? data);
    } catch (err) {
      setError(err.message || "Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!document.getElementById("teacher-report-print-style")) {
      const tag = document.createElement("style");
      tag.id = "teacher-report-print-style";
      tag.textContent = PRINT_STYLE;
      document.head.appendChild(tag);
    }
    if (reportRef.current) {
      reportRef.current.id = "teacher-report-print-root";
    }
    window.print();
  };

  /* Sort & filter student rows */
  const rows = (() => {
    if (!report?.studentReports) return [];
    let list = report.studentReports.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.studentId ?? "").toLowerCase().includes(search.toLowerCase())
    );
    list = [...list].sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ?  1 : -1;
      return 0;
    });
    return list;
  })();

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ k }) => {
    if (sortKey !== k) return <span className="text-slate-700">↕</span>;
    return <span className="text-sky-400">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  /* ── Render ────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">

      {/* ── Controls card ── */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Icon name="chart" className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-white font-black text-base">Student Attendance Report</h3>
            <p className="text-slate-500 text-sm mt-0.5">
              Select a class to generate a detailed per-student attendance report card
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1.5 font-bold">
              Select Class
            </label>
            <select
              id="teacher-report-class-select"
              value={selectedClassId}
              onChange={e => { setSelectedClassId(e.target.value); setReport(null); setError(""); }}
              className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-all"
            >
              {classes.length === 0 && <option value="">No classes available</option>}
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}{cls.subject ? ` — ${cls.subject}` : ""}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              id="btn-teacher-generate-report"
              onClick={handleGenerate}
              disabled={loading || !selectedClassId || classes.length === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-sm text-white shadow-lg shadow-indigo-500/20"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Icon name="chart" className="w-4 h-4" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
      </div>

      {/* ── Report card ── */}
      {report && (
        <div ref={reportRef} className="rounded-2xl border border-slate-700 bg-slate-900 overflow-hidden shadow-2xl">

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">
                  AttendQR — Class Attendance Report
                </div>
                <h2 className="text-white text-2xl font-black leading-tight">{report.className}</h2>
                {report.subject && <p className="text-indigo-200 text-sm mt-1">{report.subject}</p>}
              </div>
              <div className="no-print">
                <button
                  id="btn-teacher-print-report"
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all text-white font-bold text-sm border border-white/20"
                >
                  <Icon name="list" className="w-4 h-4" />
                  Print / Save PDF
                </button>
              </div>
            </div>
          </div>

          {/* Summary stats */}
          <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-4 border-b border-slate-800">
            {[
              { label: "Total Sessions", value: report.totalSessions,  icon: "calendar", color: "text-sky-400"     },
              { label: "Total Students", value: report.totalStudents,  icon: "users",    color: "text-violet-400"  },
              { label: "Avg Attendance", value: (() => {
                if (!report.studentReports?.length) return "—";
                const avg = Math.round(report.studentReports.reduce((s, r) => s + r.attendanceRate, 0) / report.studentReports.length);
                return `${avg}%`;
              })(),                                                    icon: "chart",    color: rateColor(
                report.studentReports?.length
                  ? Math.round(report.studentReports.reduce((s, r) => s + r.attendanceRate, 0) / report.studentReports.length)
                  : 0
              ).text },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl border border-slate-800 bg-slate-800/40 p-4 text-center">
                <Icon name={stat.icon} className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                <div className="text-slate-500 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Student table */}
          <div className="px-6 pt-5 pb-2 border-b border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h4 className="text-white font-black text-sm uppercase tracking-wider">
                Per-Student Breakdown
              </h4>
              {/* Search */}
              <input
                type="text"
                placeholder="Search student…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="no-print bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-4 py-2 outline-none focus:border-indigo-500 transition-all w-full sm:w-56"
              />
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase text-slate-500 border-b border-slate-800 bg-slate-800/40">
                    {[
                      { label: "#",        key: null       },
                      { label: "Name",     key: "name"     },
                      { label: "ID",       key: "studentId"},
                      { label: "Present",  key: "presentCount" },
                      { label: "Absent",   key: "absentCount"  },
                      { label: "Rate",     key: "attendanceRate" },
                      { label: "Grade",    key: "attendanceRate" },
                    ].map(({ label, key }, i) => (
                      <th
                        key={i}
                        onClick={key ? () => toggleSort(key) : undefined}
                        className={`px-4 py-3 text-left select-none ${key ? "cursor-pointer hover:text-slate-300 transition-colors" : ""}`}
                      >
                        {label} {key && <SortIcon k={key} />}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-600">
                        {search ? "No students match your search." : "No student data available."}
                      </td>
                    </tr>
                  )}
                  {rows.map((student, idx) => {
                    const c = rateColor(student.attendanceRate);
                    const g = grade(student.attendanceRate);
                    return (
                      <tr key={student.studentId ?? idx} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3.5 text-slate-600 text-xs">{idx + 1}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-slate-300 shrink-0">
                              {student.name?.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-white font-semibold">{student.name}</div>
                              {student.email && <div className="text-slate-500 text-xs">{student.email}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 text-xs">{student.studentId || "—"}</td>
                        <td className="px-4 py-3.5">
                          <span className="text-emerald-400 font-bold">{student.presentCount}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-red-400 font-bold">{student.absentCount}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                              <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${student.attendanceRate}%` }} />
                            </div>
                            <span className={`font-black text-xs ${c.text}`}>{student.attendanceRate}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black border ${c.bg} ${c.border} ${c.text}`}>
                            {g.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 text-xs text-slate-600 text-right">
            Generated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      )}
    </div>
  );
}
