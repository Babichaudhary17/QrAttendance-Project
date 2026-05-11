import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const AUTH_STORAGE_KEY = "attendqr_auth";

function getStoredAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function buildStudents(classes, attendanceRecords) {
  return classes.flatMap((cls) =>
    cls.students.map((student) => {
      const records = attendanceRecords.filter(
        (record) => record.studentId === student.studentId
      );
      const present = records.filter((record) => record.status === "present").length;

      return {
        ...student,
        classId: cls.id,
        class: cls.id,
        className: cls.name,
        attendanceRate: records.length ? Math.round((present / records.length) * 100) : 0,
        status: "active",
      };
    })
  );
}

export function AuthProvider({ children }) {
  const storedAuth = getStoredAuth();
  const [currentUser, setCurrentUser] = useState(storedAuth.user ?? null);
  const [token, setToken] = useState(storedAuth.token ?? "");
  const [classes, setClasses] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [activeQrSessions, setActiveQrSessions] = useState({});
  const [loading, setLoading] = useState(Boolean(storedAuth.token));

  const request = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.message || "Request failed.");
    }

    return payload.data ?? payload;
  };

  const persistAuth = (nextUser, nextToken) => {
    setCurrentUser(nextUser);
    setToken(nextToken);
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ user: nextUser, token: nextToken })
    );
  };

  const refreshWorkspace = async () => {
    if (!token || !currentUser) {
      return;
    }

    setLoading(true);
    try {
      const classPath =
        currentUser.role === "teacher" ? "/classes/teacher" : "/classes/student";
      const [classData, attendanceData] = await Promise.all([
        request(classPath),
        request("/attendance"),
      ]);

      setClasses(classData.classes ?? []);
      setAttendanceRecords(attendanceData.records ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshWorkspace().catch(() => {
      logout();
    });
  }, [token, currentUser?.id]);

  const login = async (email, password, role) => {
    try {
      const data = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }).then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.message || "Invalid email or password.");
        }
        return payload.data;
      });

      if (role && data.user.role !== role) {
        return { success: false, error: `This account is not a ${role} account.` };
      }

      persistAuth(data.user, data.token);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (form) => {
    try {
      const body = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        teacherId: form.teacherId,
        studentId: form.studentId,
        studentClass: form.studentClass,
      };

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Registration failed.");
      }

      persistAuth(payload.data.user, payload.data.token);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken("");
    setClasses([]);
    setAttendanceRecords([]);
    setActiveQrSessions({});
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const addClass = async (newClass) => {
    const data = await request("/classes", {
      method: "POST",
      body: JSON.stringify({
        name: newClass.name,
        subject: newClass.subject,
      }),
    });
    setClasses((previous) => [data.class, ...previous]);
    return data.class;
  };

  const deleteClass = async (classId) => {
    await request(`/classes/${classId}`, { method: "DELETE" });
    setClasses((previous) => previous.filter((cls) => cls.id !== classId));
    setAttendanceRecords((previous) =>
      previous.filter((record) => record.classId !== classId)
    );
  };

  const addStudentToClass = async (classId, studentInput) => {
    try {
      const data = await request(`/classes/${classId}/students`, {
        method: "POST",
        body: JSON.stringify({
          name: studentInput.name,
          studentId: studentInput.id ?? studentInput.studentId,
          email: studentInput.email,
        }),
      });

      setClasses((previous) =>
        previous.map((cls) => (cls.id === classId ? data.class : cls))
      );

      return {
        success: true,
        student: data.student,
        classId,
        className: data.class.name,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteStudent = async (classId, studentId) => {
    await request(`/classes/${classId}/students/${studentId}`, {
      method: "DELETE",
    });
    setClasses((previous) =>
      previous.map((cls) =>
        cls.id === classId
          ? { ...cls, students: cls.students.filter((s) => s.id !== studentId) }
          : cls
      )
    );
  };

  const startQrSession = async (classId) => {
    const data = await request(`/sessions/${classId}`, { method: "POST" });
    const session = {
      ...data.session,
      expiresAt: new Date(data.session.expiresAt).getTime(),
      createdAt: new Date(data.session.createdAt).getTime(),
    };

    setActiveQrSessions((previous) => ({
      ...previous,
      [classId]: session,
    }));

    return session;
  };

  const stopQrSession = (classId) => {
    setActiveQrSessions((previous) => {
      const next = { ...previous };
      delete next[classId];
      return next;
    });
  };

  const addAttendanceRecord = async ({ classId, sessionId, token: qrToken }) => {
    try {
      const data = await request("/attendance/mark", {
        method: "POST",
        body: JSON.stringify({ classId, sessionId, token: qrToken }),
      });
      setAttendanceRecords((previous) => [data.record, ...previous]);
      return { success: true, record: data.record };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const students = useMemo(
    () => buildStudents(classes, attendanceRecords),
    [classes, attendanceRecords]
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        loading,
        classes,
        students,
        attendanceRecords,
        activeQrSessions,
        login,
        register,
        logout,
        refreshWorkspace,
        addClass,
        deleteClass,
        startQrSession,
        stopQrSession,
        addStudentToClass,
        deleteStudent,
        addAttendanceRecord,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
