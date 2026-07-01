import { useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import Icon from "../../Components/UI/Icon";

export default function AdminSettings() {
  const { currentUser, updateAdminCredentials } = useAuth();
  const [form, setForm] = useState({
    email: currentUser.email,
    currentPassword: "",
    newPassword: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [saving, setSaving] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setStatus({ type: "", message: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus({ type: "", message: "" });

    const result = await updateAdminCredentials(form);
    setSaving(false);

    if (!result.success) {
      setStatus({ type: "error", message: result.error });
      return;
    }

    setForm((current) => ({ ...current, currentPassword: "", newPassword: "" }));
    setStatus({ type: "success", message: "Admin login details updated successfully." });
  };

  return (
    <div className="max-w-xl">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 space-y-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Icon name="key" className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-white text-lg font-black">Admin Login</h2>
            <p className="text-slate-500 text-sm">Change the admin username and password.</p>
          </div>
        </div>

        <label className="block">
          <span className="text-slate-400 text-sm font-semibold">Admin username</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-500"
            placeholder="admin123@gmail.com"
          />
        </label>

        <label className="block">
          <span className="text-slate-400 text-sm font-semibold">Current password</span>
          <input
            type="password"
            value={form.currentPassword}
            onChange={(event) => updateField("currentPassword", event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-500"
            placeholder="Enter current password"
          />
        </label>

        <label className="block">
          <span className="text-slate-400 text-sm font-semibold">New password</span>
          <input
            type="password"
            value={form.newPassword}
            onChange={(event) => updateField("newPassword", event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-500"
            placeholder="Leave blank to keep current password"
          />
        </label>

        {status.message && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              status.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/30 bg-red-500/10 text-red-300"
            }`}
          >
            {status.message}
          </div>
        )}

        <button
          disabled={saving}
          className="w-full rounded-xl bg-amber-500 px-5 py-3 text-sm font-black text-slate-950 hover:bg-amber-400 disabled:opacity-60 transition-colors"
        >
          {saving ? "Saving..." : "Save Admin Login"}
        </button>
      </form>
    </div>
  );
}
