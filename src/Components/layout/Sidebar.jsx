import { useAuth } from "../../Context/AuthContext";
import { QRIcon } from "../UI/QRMark";
import Icon from "../UI/Icon";

export default function Sidebar({
  navItems,
  activeTab,
  setActiveTab,
  roleLabel,
  avatarColor,
  homeTab,
  onHome,
  onBack,
}) {
  const { currentUser, logout } = useAuth();
  const homeItem = homeTab ?? navItems[0]?.id;
  const openHome = () => {
    if (onHome) {
      onHome();
      return;
    }

    if (homeItem) {
      setActiveTab(homeItem);
    }
  };

  return (
    <aside className="w-60 bg-slate-950 border-r border-slate-800 flex flex-col h-screen sticky top-0 shrink-0">

      {/* Brand */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 hover:bg-slate-800/70 transition-all flex items-center justify-center"
            title="Back"
          >
            <Icon name="arrowLeft" className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={openHome}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-1 text-left hover:bg-slate-800/60 transition-all"
            title="Go to dashboard home"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ring-2 ring-slate-800 ${avatarColor}`}>
              {currentUser.avatar}
            </div>
            <div className="min-w-0">
              <span className="block text-white font-black text-lg leading-5">AttendQR</span>
              <span className="block text-xs font-semibold text-slate-500 truncate">{currentUser.name}</span>
            </div>
          </button>
        </div>
        <button
          type="button"
          onClick={openHome}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
        >
          <div className="w-7 h-7 text-sky-400">
            <QRIcon />
          </div>
          <span className="text-sm font-bold">Menu</span>
        </button>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ${avatarColor}`}>
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
