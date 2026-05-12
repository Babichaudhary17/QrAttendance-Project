import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import Icon from "../../Components/UI/Icon";

function getClassCodeFromPath() {
  const match = window.location.pathname.match(/^\/join\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : "";
}

export default function JoinClass() {
  const { currentUser, getClassInvite, joinClass, refreshWorkspace } = useAuth();
  const classCode = useMemo(getClassCodeFromPath, []);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [toast, setToast] = useState({ type: "", message: "" });

  useEffect(() => {
    let active = true;

    async function loadInvite() {
      setLoading(true);
      setToast({ type: "", message: "" });

      try {
        const data = await getClassInvite(classCode);
        if (active) {
          setClassInfo(data.class);
        }
      } catch (error) {
        if (active) {
          setToast({ type: "error", message: error.message || "Class invitation could not be loaded." });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (currentUser?.role !== "student") {
      setLoading(false);
      setToast({ type: "error", message: "Only student accounts can join classes." });
      return undefined;
    }

    loadInvite();
    return () => {
      active = false;
    };
  }, [classCode, currentUser?.role]);

  const handleJoin = async () => {
    setJoining(true);
    const result = await joinClass(classCode);
    setJoining(false);

    if (!result.success) {
      setToast({ type: "error", message: result.error });
      return;
    }

    await refreshWorkspace();
    setClassInfo((current) => ({ ...current, alreadyJoined: true }));
    setToast({ type: "success", message: `Joined ${result.class.name} successfully.` });
  };

  const goDashboard = () => {
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg border border-slate-800 bg-slate-900 rounded-2xl p-6 shadow-2xl">
        <button
          onClick={goDashboard}
          className="mb-5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          Back to dashboard
        </button>

        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 flex items-center justify-center mb-5">
          <Icon name="users" className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-black">Join Class</h1>
        <p className="text-slate-500 text-sm mt-2 font-mono break-all">{classCode}</p>

        {loading && (
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 px-4 py-5 text-sm text-slate-400">
            Loading class invitation...
          </div>
        )}

        {!loading && classInfo && (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Class</p>
              <h2 className="text-xl font-black mt-1">{classInfo.name}</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Subject</p>
                  <p className="text-slate-200 font-semibold">{classInfo.subject || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Teacher</p>
                  <p className="text-slate-200 font-semibold">{classInfo.teacherName}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleJoin}
              disabled={joining || classInfo.alreadyJoined}
              className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-black text-white hover:bg-emerald-400 disabled:opacity-60 disabled:hover:bg-emerald-500 transition-colors"
            >
              {classInfo.alreadyJoined ? "Already Joined" : joining ? "Joining..." : "Join Class"}
            </button>
          </div>
        )}

        {toast.message && (
          <div
            className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
              toast.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/30 bg-red-500/10 text-red-300"
            }`}
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}
