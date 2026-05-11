import { useEffect, useState } from "react";
import AttendanceTable from "../../Components/UI/AttendanceTable";
import { getDefaultAttendanceDate } from "../../utils/attendance";

export default function ViewAttendance({ records }) {
  const defaultDate = getDefaultAttendanceDate(records);
  const [filterDate, setFilterDate] = useState(defaultDate);

  useEffect(() => {
    if (!filterDate || !records.some((record) => record.date === filterDate)) {
      setFilterDate(defaultDate);
    }
  }, [defaultDate, filterDate, records]);

  const filtered = filterDate
    ? records.filter(r => r.date === filterDate)
    : records;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-slate-700 flex items-center justify-between">
        <h3 className="text-white font-bold text-xs uppercase tracking-wider">Attendance Log</h3>
        <input
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 outline-none"
        />
      </div>
      <AttendanceTable records={filtered} />
    </div>
  );
}
