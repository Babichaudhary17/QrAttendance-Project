import StatusBadge from "../UI/StatusBadge";

export default function AttendanceTable({ records }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="text-xs uppercase text-slate-500 border-b border-slate-700">
          {["Student", "ID", "Class", "Time", "Status"].map((column) => (
            <th key={column} className="px-5 py-3 text-left">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {records.length === 0 && (
          <tr>
            <td colSpan={5} className="text-center py-12 text-slate-600 text-sm">
              No records found.
            </td>
          </tr>
        )}
        {records.map((record) => (
          <tr
            key={record.id}
            className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors"
          >
            <td className="px-5 py-3.5 text-white text-sm font-semibold">
              {record.studentName}
            </td>
            <td className="px-5 py-3.5 text-slate-500 text-sm">
              {record.studentId}
            </td>
            <td className="px-5 py-3.5 text-slate-400 text-sm">
              {record.class}
            </td>
            <td className="px-5 py-3.5 text-slate-400 text-sm">
              {record.time || "--"}
            </td>
            <td className="px-5 py-3.5">
              <StatusBadge status={record.status} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
