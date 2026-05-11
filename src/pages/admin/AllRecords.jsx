import { useAuth } from "../../Context/AuthContext";
import StatusBadge from "../../Components/UI/StatusBadge";

export default function AllRecords() {
  const { attendanceRecords } = useAuth();

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-slate-700">
        <h3 className="text-white font-bold text-xs uppercase tracking-wider">All Attendance Records</h3>
      </div>

      <table className="w-full">
        <thead>
          <tr className="text-xs uppercase text-slate-500 border-b border-slate-700">
            {["Student", "ID", "Date", "Time", "Class", "Status"].map((column) => (
              <th key={column} className="px-5 py-3 text-left">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {attendanceRecords.map((record) => (
            <tr key={record.id} className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
              <td className="px-5 py-3.5 text-white text-sm font-semibold">{record.studentName}</td>
              <td className="px-5 py-3.5 text-slate-500 text-sm">{record.studentId}</td>
              <td className="px-5 py-3.5 text-slate-400 text-sm">{record.date}</td>
              <td className="px-5 py-3.5 text-slate-400 text-sm">{record.time || "--"}</td>
              <td className="px-5 py-3.5 text-slate-400 text-sm">{record.class}</td>
              <td className="px-5 py-3.5"><StatusBadge status={record.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
