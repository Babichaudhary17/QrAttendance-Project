import { useState, useMemo } from "react";
import { useAuth } from "../../Context/AuthContext";
import TeachersList from "./TeachersList";
import StudentsList from "./StudentsList";

/* ─── Premium SVG Icons ────────────────────────────────────────────── */
function TeacherIcon() {
  return (
    <svg
      className="w-10 h-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      {/* Blackboard/Screen */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5h18v10H3z"
      />
      {/* Stand for board */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 15v4m6-4v4M6 19h12"
      />
      {/* Teaching staff avatar */}
      <circle cx="12" cy="10" r="2" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 13c0-1.5 2-1.5 4-1.5s4 0 4 1.5"
      />
    </svg>
  );
}

function StudentIcon() {
  return (
    <svg
      className="w-10 h-10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      {/* Graduation Cap */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 14l9-5-9-5-9 5 9 5z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
      />
      {/* Tassel */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 9v6"
      />
    </svg>
  );
}

export default function AllUsers() {
  const { users } = useAuth();
  const [activeView, setActiveView] = useState(null);

  /* Filter lengths for selection cards */
  const teacherCount = useMemo(() => users.filter((u) => u.role === "teacher").length, [users]);
  const studentCount = useMemo(() => users.filter((u) => u.role === "student").length, [users]);

  if (activeView === null) {
    return (
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div>
          <h3 className="text-white font-bold text-sm uppercase tracking-wider">System Users Directory</h3>
          <p className="text-xs text-slate-500 mt-1">
            Access, view rosters, and search across registered academic groups.
          </p>
        </div>

        {/* Large container cards with rich, interactive details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          
          {/* Teacher Container */}
          <button
            onClick={() => setActiveView("teachers")}
            className="flex flex-col items-center justify-between p-12 rounded-[2.5rem] border-2 bg-slate-800/30 border-slate-700/60 text-slate-300 hover:bg-slate-800/60 hover:border-blue-500/80 hover:text-white hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer relative overflow-hidden group min-h-[300px]"
          >
            {/* Visual background gradient decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/0 via-blue-500/0 to-blue-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Glowing Icon Wrapper */}
            <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 group-hover:border-blue-500/40 group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all duration-500 relative z-10">
              <TeacherIcon />
            </div>

            {/* Typography content */}
            <div className="my-6 relative z-10 flex flex-col items-center">
              <span className="text-3xl font-black tracking-wide text-white group-hover:text-blue-400 transition-colors duration-300">
                Teacher
              </span>
              <span className="text-xs text-slate-500 mt-2 max-w-[200px] text-center leading-relaxed">
                Manage academic staff profiles, class permissions, and course lists.
              </span>
            </div>

            {/* Pulse tag status */}
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-bold tracking-wide relative z-10">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              {teacherCount} Registered
            </div>
          </button>

          {/* Students Container */}
          <button
            onClick={() => setActiveView("students")}
            className="flex flex-col items-center justify-between p-12 rounded-[2.5rem] border-2 bg-slate-800/30 border-slate-700/60 text-slate-300 hover:bg-slate-800/60 hover:border-emerald-500/80 hover:text-white hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer relative overflow-hidden group min-h-[300px]"
          >
            {/* Visual background gradient decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/0 via-emerald-500/0 to-emerald-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Glowing Icon Wrapper */}
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 group-hover:shadow-lg group-hover:shadow-emerald-500/20 transition-all duration-500 relative z-10">
              <StudentIcon />
            </div>

            {/* Typography content */}
            <div className="my-6 relative z-10 flex flex-col items-center">
              <span className="text-3xl font-black tracking-wide text-white group-hover:text-emerald-400 transition-colors duration-300">
                Students
              </span>
              <span className="text-xs text-slate-500 mt-2 max-w-[200px] text-center leading-relaxed">
                Browse student logs, enrollment codes, and academic class assignments.
              </span>
            </div>

            {/* Pulse tag status */}
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-bold tracking-wide relative z-10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {studentCount} Registered
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Back Button */}
      <div className="flex items-center">
        <button
          onClick={() => setActiveView(null)}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold transition-colors duration-200"
        >
          <svg
            width="18"
            height="18"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Selection
        </button>
      </div>

      <div>
        {activeView === "teachers" ? <TeachersList /> : <StudentsList />}
      </div>
    </div>
  );
}
