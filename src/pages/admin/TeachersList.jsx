import { useState, useMemo } from "react";
import { useAuth } from "../../Context/AuthContext";
import StatusBadge from "../../Components/UI/StatusBadge";

function SearchIcon() {
  return (
    <svg
      width="15"
      height="15"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.2}
    >
      <circle cx="11" cy="11" r="8" />
      <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
    </svg>
  );
}

export default function TeachersList() {
  const { users } = useAuth();
  const [search, setSearch] = useState("");

  const teachers = useMemo(() => users.filter((u) => u.role === "teacher"), [users]);

  const query = search.toLowerCase().trim();
  const filteredTeachers = useMemo(
    () =>
      query
        ? teachers.filter(
            (u) =>
              u.name?.toLowerCase().includes(query) ||
              u.email?.toLowerCase().includes(query) ||
              u.teacherId?.toLowerCase().includes(query)
          )
        : teachers,
    [teachers, query]
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-800/30 border border-slate-700/80 rounded-2xl">
        <div>
          <h4 className="text-white font-bold text-sm">Teachers Directory</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Total registered teachers: {teachers.length}
          </p>
        </div>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teachers..."
            className="pl-9 pr-4 py-2 bg-slate-900/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 transition-colors w-full sm:w-64"
          />
        </div>
      </div>

      {query && (
        <div className="text-xs text-slate-500 px-1">
          Showing <span className="text-white font-semibold">{filteredTeachers.length}</span> of{" "}
          <span className="text-white font-semibold">{teachers.length}</span> teachers
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs uppercase text-slate-500 border-b border-slate-700">
                {["Name", "Email", "Teacher ID", "Role"].map((col) => (
                  <th key={col} className="px-5 py-3 text-left whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-500 text-sm">
                    {query ? "No teachers match your search." : "No teachers registered yet."}
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((user) => (
                  <tr
                    key={user._id ?? user.id}
                    className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black bg-blue-500/20 text-blue-400">
                          {(user.name ?? "?")[0].toUpperCase()}
                        </div>
                        <span className="text-white text-sm font-semibold">
                          {user.name ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-sm">
                      {user.email ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-sm font-mono">
                      {user.teacherId ?? "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={user.role} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
