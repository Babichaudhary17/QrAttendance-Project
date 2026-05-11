import { useAuth } from "../../Context/AuthContext";
import Icon from "../../Components/UI/Icon";

const FeatureCard = ({ icon, label, desc, bg, tc }) => (
  <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 text-center hover:border-slate-600 transition-all">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3 ${bg}`}>
      <Icon name={icon} className={`w-5 h-5 ${tc}`} />
    </div>
    <p className="text-white font-bold text-sm mb-1">{label}</p>
    <p className="text-slate-600 text-xs">{desc}</p>
  </div>
);

export default function StudentView() {
  const { students } = useAuth();

  return (
    <div className="bg-slate-800/50 border border-emerald-500/20 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
          Viewing as Student
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <FeatureCard icon="camera" label="Scan QR" desc="Mark attendance" bg="bg-emerald-500/10" tc="text-emerald-400" />
        <FeatureCard icon="chart" label="Attendance History" desc="Personal log & stats" bg="bg-teal-500/10" tc="text-teal-400" />
        <FeatureCard icon="user" label="Profile" desc="Info & QR code" bg="bg-green-500/10" tc="text-green-400" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {students.slice(0, 4).map((student) => (
          <div key={student.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex items-center gap-3 hover:border-slate-600 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xs font-black text-emerald-400 shrink-0">
              {student.name.split(" ").map((part) => part[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{student.name}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1 bg-slate-700 rounded-full">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all"
                    style={{ width: `${student.attendanceRate}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 shrink-0">{student.attendanceRate}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
