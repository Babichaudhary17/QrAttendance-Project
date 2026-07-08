import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const AUTH_STORAGE_KEY = "attendqr_auth";
const TRANSIENT_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function getStoredAuth() {
  try {
    return JSON.parse(sessionStorage.getItem(AUTH_STORAGE_KEY)) || {};
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
  const [users, setUsers] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [enrollmentClasses, setEnrollmentClasses] = useState([]);
  const [activeQrSessions, setActiveQrSessions] = useState({});
  const [authNotice, setAuthNotice] = useState("");
  const [loading, setLoading] = useState(Boolean(storedAuth.token));

  const request = async (path, options = {}, attempt = 0) => {
    try {
      const response = await axios({
        url: `${API_URL}${path}`,
        method: options.method || "GET",
        data: options.body ? JSON.parse(options.body) : options.data,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      });

      const payload = response.data ?? {};
      return payload.data ?? payload;
    } catch (error) {
      const status = error.response?.status;
      if (attempt < 2 && TRANSIENT_STATUSES.has(status)) {
        await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
        return request(path, options, attempt + 1);
      }

      if (status) {
        throw new ApiError(error.response?.data?.message || "Request failed.", status);
      }

      if (!(error instanceof ApiError) && attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
        return request(path, options, attempt + 1);
      }

      throw error;
    }
  };

  const persistAuth = (nextUser, nextToken) => {
    setCurrentUser(nextUser);
    setToken(nextToken);
    sessionStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ user: nextUser, token: nextToken })
    );
  };

  const fetchEnrollmentClasses = async () => {
    const response = await axios.get(`${API_URL}/classes/enrollment-options`);

    const nextClasses = response.data?.data?.classes ?? [];
    setEnrollmentClasses(nextClasses);
    return nextClasses;
  };

  useEffect(() => {
    fetchEnrollmentClasses().catch(() => setEnrollmentClasses([]));
  }, []);

  const refreshWorkspace = async () => {
    if (!token || !currentUser) {
      return;
    }

    setLoading(true);
    try {
      const classPath =
        currentUser.role === "admin"
          ? "/classes"
          : currentUser.role === "teacher"
            ? "/classes/teacher"
            : "/classes/student";
      const requests = [
        request(classPath),
        request("/attendance"),
      ];

      if (currentUser.role === "admin") {
        requests.push(request("/admin/users"));
      }

      const [classData, attendanceData, userData] = await Promise.all(requests);

      setClasses(classData.classes ?? []);
      setAttendanceRecords(attendanceData.records ?? []);
      setUsers(userData?.users ?? []);
      setAuthNotice("");
    } catch (error) {
      if (error.status === 401) {
        logout();
        return;
      }

      setAuthNotice(error.message || "Workspace refresh failed. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshWorkspace();
  }, [token, currentUser?.id]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const data = response.data.data;

      persistAuth(data.user, data.token);
      // Return the role so the LoginPage can redirect to the correct dashboard
      // immediately, without waiting for a re-render cycle.
      return { success: true, role: data.user.role };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        // Expose status so the caller can distinguish 404 (email not found)
        // from 401 (wrong password) and show appropriate UI.
        status: error.response?.status,
      };
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
      };

      if (form.role === "student") {
        if (form.classId) {
          body.classId = form.classId;
        }
        if (form.classCode) {
          body.classCode = form.classCode;
        }
        if (form.studentClass) {
          body.studentClass = form.studentClass;
        }
      }

      await axios.post(`${API_URL}/auth/register`, body);

      // Do NOT auto-login after registration. The RegisterPage shows a success
      // screen then navigates to /login — persisting auth here would cause the
      // Router to redirect straight to the dashboard, bypassing that flow.
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  const logout = async () => {
    // Best-effort server-side logout (for future token blacklisting).
    // We clear the local session regardless of whether the API call succeeds.
    try {
      if (token) {
        await axios.post(
          `${API_URL}/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch {
      // Ignore — local session is cleared below regardless.
    }

    setCurrentUser(null);
    setToken("");
    setClasses([]);
    setUsers([]);
    setAttendanceRecords([]);
    setActiveQrSessions({});
    setAuthNotice("");
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await request("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const nextUser = { ...currentUser, forcePasswordReset: false };
      persistAuth(nextUser, token);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateAdminCredentials = async ({ email, currentPassword, newPassword }) => {
    try {
      const data = await request("/auth/admin-credentials", {
        method: "PATCH",
        body: JSON.stringify({ email, currentPassword, newPassword }),
      });

      persistAuth(data.user, data.token);
      return { success: true };
    } catch (error) {
      if (error.status === 401) {
        logout();
      }

      return { success: false, error: error.message };
    }
  };

  const addClass = async (newClass) => {
    try {
      const data = await request("/classes", {
        method: "POST",
        body: JSON.stringify({
          name: newClass.name,
          subject: newClass.subject,
        }),
      });
      setClasses((previous) => [data.class, ...previous]);
      return { success: true, class: data.class };
    } catch (error) {
      return { success: false, error: error.message || "Failed to create class." };
    }
  };

  const getClassInvite = async (classCode) => {
    return request(`/classes/join/${encodeURIComponent(classCode.trim())}`);
  };

  const joinClass = async (classCode) => {
    try {
      const data = await request(`/classes/join/${encodeURIComponent(classCode.trim())}`, {
        method: "POST",
      });

      setClasses((previous) => {
        if (previous.some((cls) => cls.id === data.class.id)) {
          return previous;
        }

        return [data.class, ...previous];
      });

      if (!currentUser.classId) {
        persistAuth(
          {
            ...currentUser,
            classId: data.class.id,
            class: data.class.name,
            assignedClass: data.class,
          },
          token
        );
      }

      return { success: true, class: data.class };
    } catch (error) {
      if (error.status === 401) {
        logout();
      }

      return { success: false, error: error.message };
    }
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

  const getAttendanceReport = async (classId) => {
    try {
      const data = await request(`/attendance/report/${classId}`);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const addAttendanceRecord = async ({ token: qrToken }) => {
    try {
      const data = await request("/attendance/mark", {
        method: "POST",
        body: JSON.stringify({ token: qrToken }),
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
        users,
        students,
        attendanceRecords,
        activeQrSessions,
        authNotice,
        enrollmentClasses,
        login,
        register,
        fetchEnrollmentClasses,
        logout,
        changePassword,
        updateAdminCredentials,
        refreshWorkspace,
        addClass,
        getClassInvite,
        joinClass,
        deleteClass,
        startQrSession,
        stopQrSession,
        addStudentToClass,
        deleteStudent,
        addAttendanceRecord,
        getAttendanceReport,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
