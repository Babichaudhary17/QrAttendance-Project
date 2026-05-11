import { useAuth } from "../../Context/AuthContext";
import StatusBadge from "../../Components/UI/StatusBadge";

export default function AllUsers() {
  const { users } = useAuth();

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-slate-700">
        <h3 className="text-white font-bold text-xs uppercase tracking-wider">System Users</h3>
      </div>

      <table className="w-full">
        <thead>
          <tr className="text-xs uppercase text-slate-500 border-b border-slate-700">
            {["Name", "Email", "Role", "Class"].map((column) => (
              <th key={column} className="px-5 py-3 text-left">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                      user.role === "admin"
                        ? "bg-amber-500/20 text-amber-400"
                        : user.role === "teacher"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-emerald-500/20 text-emerald-400"
                    }`}
                  >
                    {user.avatar}
                  </div>
                  <span className="text-white text-sm font-semibold">{user.name}</span>
                </div>
              </td>
              <td className="px-5 py-3.5 text-slate-400 text-sm">{user.email}</td>
              <td className="px-5 py-3.5"><StatusBadge status={user.role} /></td>
              <td className="px-5 py-3.5 text-slate-500 text-sm">{user.class || "--"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
