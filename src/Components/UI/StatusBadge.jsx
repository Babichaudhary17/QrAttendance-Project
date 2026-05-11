const STYLES = {
  present:  "bg-emerald-500/15 text-emerald-400",
  late:     "bg-amber-500/15  text-amber-400",
  absent:   "bg-red-500/15    text-red-400",
  active:   "bg-emerald-500/15 text-emerald-400",
  inactive: "bg-slate-700     text-slate-500",
  admin:    "bg-amber-500/15  text-amber-400",
  teacher:  "bg-blue-500/15   text-blue-400",
  student:  "bg-emerald-500/15 text-emerald-400",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${STYLES[status] ?? "bg-slate-700 text-slate-400"}`}>
      {status}
    </span>
  );
}
