import { useAuth } from "../../Context/AuthContext";
import Icon from "../../Components/UI/Icon";
import StatusBadge from "../../Components/UI/StatusBadge";

const FeatureCard = ({ icon, label, desc, bg, tc }) => (
  <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 text-center hover:border-slate-600 transition-all">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3 ${bg}`}>
      <Icon name={icon} className={`w-5 h-5 ${tc}`} />
    </div>
    <p className="text-white font-bold text-sm mb-1">{label}</p>
    <p className="text-slate-600 text-xs">{desc}</p>
  </div>
);

export default function TeacherView() {
  const { attendanceRecords } = useAuth();

  return (
    <div className="bg-slate-800/50 border border-blue-500/20 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        <span className="text-blue-400 text-xs font-bold uppercase tracking-wider">
          Viewing as Teacher
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <FeatureCard icon="qr" label="Generate QR" desc="Student QR generation" bg="bg-blue-500/10" tc="text-blue-400" />
        <FeatureCard icon="list" label="View Attendance" desc="Filter & view records" bg="bg-sky-500/10" tc="text-sky-400" />
        <FeatureCard icon="users" label="Manage Students" desc="Full roster management" bg="bg-indigo-500/10" tc="text-indigo-400" />
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700">
          <p className="text-white font-bold text-sm">Recent Attendance</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-xs uppercase text-slate-600 border-b border-slate-800">
              {["Student", "Date", "Time", "Status"].map((column) => (
                <th key={column} className="px-5 py-3 text-left">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attendanceRecords.slice(0, 4).map((record) => (
              <tr key={record.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                <td className="px-5 py-3 text-white text-sm font-semibold">{record.studentName}</td>
                <td className="px-5 py-3 text-slate-500 text-sm">{record.date}</td>
                <td className="px-5 py-3 text-slate-500 text-sm">{record.time || "--"}</td>
                <td className="px-5 py-3"><StatusBadge status={record.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
