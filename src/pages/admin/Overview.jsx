import { useAuth } from "../../Context/AuthContext";
import StatCard from "../../Components/UI/StatCard";
import Icon from "../../Components/UI/Icon";
import { getDefaultAttendanceDate } from "../../utils/attendance";

const PanelPreview = ({
  accentColor,
  dotColor,
  label,
  features,
  buttonLabel,
  onOpen,
}) => (
  <div className={`bg-slate-800/50 border ${accentColor.border} rounded-2xl p-6`}>
    <div className="flex items-center gap-2 mb-5">
      <div className={`w-2 h-2 rounded-full animate-pulse ${dotColor}`} />
      <span className={`text-xs font-bold uppercase tracking-wider ${accentColor.text}`}>
        {label}
      </span>
    </div>

    {features.map((feature) => (
      <div key={feature.label} className="flex items-center gap-4 py-3 border-b border-slate-700/50 last:border-0">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accentColor.iconBg}`}>
          <Icon name={feature.icon} className={`w-4 h-4 ${accentColor.text}`} />
        </div>
        <div>
          <p className="text-white text-sm font-semibold">{feature.label}</p>
          <p className="text-slate-600 text-xs">{feature.desc}</p>
        </div>
      </div>
    ))}

    <button
      onClick={onOpen}
      className={`mt-5 w-full text-sm border rounded-xl py-2.5 font-semibold transition-all ${accentColor.btn}`}
    >
      {buttonLabel} -
    </button>
  </div>
);

export default function Overview({ onNavigate }) {
  const { students, users, attendanceRecords } = useAuth();

  const latestDate = getDefaultAttendanceDate(attendanceRecords);
  const todayPresent = attendanceRecords.filter(
    (record) => record.date === latestDate && record.status === "present"
  ).length;
  const todayAbsent = attendanceRecords.filter(
    (record) => record.date === latestDate && record.status === "absent"
  ).length;

  return (
    <>
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Students"
          value={students.length}
          icon="users"
          color="bg-slate-800/60 border-slate-700 text-white"
        />
        <StatCard
          label="Present Today"
          value={todayPresent}
          icon="check"
          color="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
        />
        <StatCard
          label="Absent Today"
          value={todayAbsent}
          icon="x"
          color="bg-red-500/10 border-red-500/20 text-red-400"
        />
        <StatCard
          label="System Users"
          value={users.length}
          icon="shield"
          color="bg-amber-500/10 border-amber-500/20 text-amber-400"
        />
      </div>

      <p className="text-xs text-slate-600 uppercase tracking-widest font-bold mb-4">
        Simultaneous Panel Access
      </p>
      {latestDate && (
        <p className="text-sm text-slate-500 mb-4">
          Dashboard stats are showing attendance for {latestDate}.
        </p>
      )}

      <div className="grid grid-cols-2 gap-5">
        <PanelPreview
          label="Teacher Panel"
          dotColor="bg-blue-400"
          accentColor={{
            border: "border-blue-500/20",
            text: "text-blue-400",
            iconBg: "bg-blue-500/10",
            btn: "text-blue-400 border-blue-500/20 hover:bg-blue-500/10",
          }}
          features={[
            { icon: "qr", label: "Generate QR Code", desc: "Create student QR codes" },
            { icon: "list", label: "View Attendance", desc: "Track daily records" },
            { icon: "users", label: "Manage Students", desc: "Add / edit student roster" },
          ]}
          buttonLabel="Open Teacher View"
          onOpen={() => onNavigate("teacher")}
        />

        <PanelPreview
          label="Student Panel"
          dotColor="bg-emerald-400"
          accentColor={{
            border: "border-emerald-500/20",
            text: "text-emerald-400",
            iconBg: "bg-emerald-500/10",
            btn: "text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10",
          }}
          features={[
            { icon: "camera", label: "Scan QR Code", desc: "Mark attendance by scanning" },
            { icon: "chart", label: "Attendance History", desc: "Personal attendance log" },
            { icon: "user", label: "Profile", desc: "Student info & QR code" },
          ]}
          buttonLabel="Open Student View"
          onOpen={() => onNavigate("student")}
        />
      </div>
    </>
  );
}
