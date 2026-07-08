import { useState, useRef } from "react";
import { useAuth } from "../../Context/AuthContext";
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

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/* ── Print styles injected once ───────────────────────────────────────── */
const PRINT_STYLE = `
  @media print {
    body > *:not(#attendance-report-print-root) { display: none !important; }
    #attendance-report-print-root { display: block !important; }
    .no-print { display: none !important; }
    @page { margin: 16mm; size: A4; }
  }
`;

/* ─────────────────────────────────────────────────────────────────────── */
export default function AttendanceReport({ records }) {
  const { currentUser, classes } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const reportRef = useRef(null);

  /* ── Derive stats ──────────────────────────────────────────────── */
  const myRecords = records;                  // already filtered for this student
  const present   = myRecords.filter(r => r.status === "present").length;
  const absent    = myRecords.length - present;
  const rate      = myRecords.length ? Math.round((present / myRecords.length) * 100) : 0;
  const colors    = rateColor(rate);
  const gradeInfo = grade(rate);

  /* Per-class breakdown */
  const classSummary = classes.map(cls => {
    const clsRecords = myRecords.filter(r => r.class === cls.name || r.classId === cls.id);
    const clsPresent = clsRecords.filter(r => r.status === "present").length;
    const clsRate    = clsRecords.length ? Math.round((clsPresent / clsRecords.length) * 100) : 0;
    return { name: cls.name, subject: cls.subject, present: clsPresent, total: clsRecords.length, rate: clsRate };
  }).filter(c => c.total > 0);

  const firstDate = myRecords.length ? formatDate(myRecords[myRecords.length - 1]?.date) : "—";
  const lastDate  = myRecords.length ? formatDate(myRecords[0]?.date)                     : "—";

  /* ── Generate / print ──────────────────────────────────────────── */
  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setReportVisible(true);
    }, 600);
  };

  const handlePrint = () => {
    // Inject print CSS once
    if (!document.getElementById("attendance-report-print-style")) {
      const tag = document.createElement("style");
      tag.id   = "attendance-report-print-style";
      tag.textContent = PRINT_STYLE;
      document.head.appendChild(tag);
    }
    if (reportRef.current) {
      reportRef.current.id = "attendance-report-print-root";
    }
    window.print();
  };

  /* ── Render ────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">

      {/* ── Trigger card ── */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
              <Icon name="chart" className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h3 className="text-white font-black text-base">My Attendance Report</h3>
              <p className="text-slate-500 text-sm mt-0.5">
                Generate a full report card of your attendance across all classes
              </p>
            </div>
          </div>
          <button
            id="btn-generate-student-report"
            onClick={handleGenerate}
            disabled={generating || myRecords.length === 0}
            className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-sm text-white shadow-lg shadow-violet-500/20"
          >
            {generating ? (
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

        {myRecords.length === 0 && (
          <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            No attendance records found yet. Scan your class QR codes first.
          </div>
        )}
      </div>

      {/* ── Report card ── */}
      {reportVisible && (
        <div
          ref={reportRef}
          className="rounded-2xl border border-slate-700 bg-slate-900 overflow-hidden shadow-2xl"
        >
          {/* Header bar */}
          <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-600 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="text-violet-200 text-xs font-bold uppercase tracking-widest mb-1">
                  AttendQR — Official Report Card
                </div>
                <h2 className="text-white text-2xl font-black leading-tight">
                  {currentUser.name}
                </h2>
                <p className="text-violet-200 text-sm mt-1">
                  {currentUser.studentId && `Student ID: ${currentUser.studentId} · `}
                  {currentUser.email}
                </p>
              </div>
              <div className="text-right no-print">
                <button
                  id="btn-print-student-report"
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all text-white font-bold text-sm border border-white/20"
                >
                  <Icon name="list" className="w-4 h-4" />
                  Print / Save PDF
                </button>
              </div>
            </div>
          </div>

          {/* Overall stats */}
          <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-slate-800">
            {[
              { label: "Days Present",  value: present,         icon: "check",    color: "text-emerald-400" },
              { label: "Days Absent",   value: absent,          icon: "list",     color: "text-red-400"     },
              { label: "Total Sessions",value: myRecords.length,icon: "calendar", color: "text-sky-400"     },
              { label: "Overall Rate",  value: `${rate}%`,      icon: "chart",    color: colors.text        },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl border border-slate-800 bg-slate-800/40 p-4 text-center">
                <Icon name={stat.icon} className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                <div className="text-slate-500 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Grade + progress */}
          <div className="px-6 py-5 border-b border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              {/* Grade badge */}
              <div className={`flex items-center gap-4 rounded-2xl border px-6 py-4 shrink-0 ${colors.bg} ${colors.border}`}>
                <div>
                  <div className="text-slate-400 text-xs uppercase tracking-wider font-bold">Grade</div>
                  <div className={`text-4xl font-black mt-1 ${colors.text}`}>{gradeInfo.label}</div>
                </div>
                <div className="w-px h-12 bg-slate-700" />
                <div>
                  <div className={`font-black text-lg ${colors.text}`}>{gradeInfo.detail}</div>
                  <div className="text-slate-500 text-xs mt-0.5">Attendance performance</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400 font-semibold">Attendance Rate</span>
                  <span className={`font-black ${colors.text}`}>{rate}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${colors.bar}`}
                    style={{ width: `${rate}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-600 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Class-by-class breakdown */}
          {classSummary.length > 0 && (
            <div className="px-6 py-5 border-b border-slate-800">
              <h4 className="text-white font-black text-sm uppercase tracking-wider mb-4">
                Class-wise Breakdown
              </h4>
              <div className="space-y-3">
                {classSummary.map(cls => {
                  const c = rateColor(cls.rate);
                  return (
                    <div key={cls.name} className="flex items-center gap-4 rounded-xl bg-slate-800/40 border border-slate-800 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-bold text-sm truncate">{cls.name}</div>
                        {cls.subject && <div className="text-slate-500 text-xs">{cls.subject}</div>}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-slate-400 text-xs">{cls.present}/{cls.total} sessions</div>
                        <div className="w-20 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                          <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${cls.rate}%` }} />
                        </div>
                        <span className={`text-sm font-black w-10 text-right ${c.text}`}>{cls.rate}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-600">
            <span>Period: {firstDate} — {lastDate}</span>
            <span>Generated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
        </div>
      )}
    </div>
  );
}
