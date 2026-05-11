 import { useAuth } from "../../Context/AuthContext";
import { QRIcon } from "../UI/QRMark";
import Icon from "../UI/Icon";

export default function Sidebar({ navItems, activeTab, setActiveTab, roleLabel, avatarColor }) {
  const { currentUser, logout } = useAuth();

  return (
    <aside className="w-60 bg-slate-950 border-r border-slate-800 flex flex-col h-screen sticky top-0 shrink-0">

      {/* Brand */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 text-sky-400">
          <QRIcon />
        </div>
        <span className="text-white font-black text-lg">AttendQR</span>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black ${avatarColor}`}>
          {currentUser.avatar}
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-bold truncate">{currentUser.name}</p>
          <p className={`text-xs font-semibold ${roleLabel.color}`}>{roleLabel.text}</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left
              ${activeTab === item.id
                ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/60"
              }`}
          >
            <Icon name={item.icon} className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <Icon name="logout" className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
