export default function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-7">
      <h1 className="text-2xl font-black text-white">{title}</h1>
      {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
    </div>
  );
}
