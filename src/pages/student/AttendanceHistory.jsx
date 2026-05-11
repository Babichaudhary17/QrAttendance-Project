import AttendanceTable from "../../Components/UI/AttendanceTable";

export default function AttendanceHistory({ records }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-slate-700">
        <h3 className="text-white font-bold text-xs uppercase tracking-wider">My Attendance Log</h3>
      </div>
      <AttendanceTable records={records} />
    </div>
  );
}
