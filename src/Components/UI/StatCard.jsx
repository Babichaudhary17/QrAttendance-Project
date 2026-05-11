import Icon from "./Icon";

export default function StatCard({ label, value, icon, color }) {
  return (
    <div className={`rounded-2xl p-5 border flex items-start justify-between gap-3 ${color}`}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest opacity-60 mb-1">{label}</p>
        <p className="text-3xl font-black">{value}</p>
      </div>
      <div className="opacity-40 mt-1">
        <Icon name={icon} className="w-8 h-8" />
      </div>
    </div>
  );
}
