import { AuthProvider, useAuth } from "./Context/AuthContext";
import LoginPage        from "./pages/LoginPage";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";

function Router() {
  const { currentUser, loading } = useAuth();

  if (loading && currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center">
        Loading workspace...
      </div>
    );
  }
  if (!currentUser)                   return <LoginPage />;
  if (currentUser.role === "teacher") return <TeacherDashboard />;
  if (currentUser.role === "student") return <StudentDashboard />;

  return <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
