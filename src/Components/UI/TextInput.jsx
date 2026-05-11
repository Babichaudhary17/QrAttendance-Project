export default function TextInput({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1.5 font-semibold">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-sky-500 transition-all placeholder-slate-600"
      />
    </div>
  );
}
