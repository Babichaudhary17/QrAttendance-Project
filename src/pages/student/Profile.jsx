import { useAuth } from "../../Context/AuthContext";

export default function Profile({ records }) {
  const { currentUser } = useAuth();

  const presentCount = records.filter(r => r.status === "present").length;
  const rate = records.length ? Math.round((presentCount / records.length) * 100) : 0;
  const className = currentUser.assignedClass?.name ?? currentUser.class ?? "Not assigned";

  const details = [
    ["Student ID",      currentUser.studentId || "STU-001"],
    ["Email Address",   currentUser.email],
    ["Class",           className],
    ["Days Present",    `${presentCount} / ${records.length}`],
    ["Attendance Rate", `${rate}%`],
  ];

  return (
    <div className="max-w-md">
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">

        {/* Avatar + name */}
        <div className="flex items-center gap-5 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/30 flex items-center justify-center text-xl font-black text-emerald-400">
            {currentUser.avatar}
          </div>
          <div>
            <h2 className="text-white font-black text-xl">{currentUser.name}</h2>
            <p className="text-emerald-400 font-semibold text-sm mt-1">Student</p>
            <p className="text-slate-500 text-xs">{className}</p>
          </div>
        </div>

        {/* Details list */}
        {details.map(([label, value]) => (
          <div key={label} className="flex justify-between items-center py-3.5 border-b border-slate-700/50 last:border-0">
            <span className="text-slate-500 text-sm">{label}</span>
            <span className="text-white text-sm font-semibold">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
