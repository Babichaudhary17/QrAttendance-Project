import { useEffect, useState } from "react";
import Icon from "../../Components/UI/Icon";
import StatusBadge from "../../Components/UI/StatusBadge";
import Modal from "../../Components/UI/Modal";
import TextInput from "../../Components/UI/TextInput";

export default function ManageStudents({
  students,
  classes,
  onAdd,
  onDelete,
  onShowToast,
}) {
  const [showModal, setShowModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    studentId: "",
    classId: classes[0]?.id ?? "",
  });

  useEffect(() => {
    if (!classes.some((cls) => cls.id === form.classId)) {
      setForm((current) => ({
        ...current,
        classId: classes[0]?.id ?? "",
      }));
    }
  }, [classes, form.classId]);

  const resetForm = () => {
    setForm({ name: "", studentId: "", classId: classes[0]?.id ?? "" });
    setError("");
  };

  const handleClose = () => {
    resetForm();
    setShowModal(false);
  };

  const handleAdd = async () => {
    if (!form.name.trim() || !form.studentId.trim() || !form.classId) {
      setError("Name, student ID, and class are required.");
      return;
    }

    const result = await onAdd(form.classId, {
      id: form.studentId,
      name: form.name,
    });

    if (!result?.success) {
      setError(result?.error ?? "Unable to add student.");
      return;
    }

    onShowToast?.(`${result.student.name} added to ${result.className}`);
    handleClose();
  };

  return (
    <>
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-white font-bold text-xs uppercase tracking-wider">
            Student Roster
          </h3>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-sky-500 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-sky-400 transition-all"
          >
            <Icon name="plus" className="w-3.5 h-3.5" /> Add Student
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="text-xs uppercase text-slate-500 border-b border-slate-700">
              {["Name", "ID", "Class", "Attendance", "Status", ""].map((column, index) => (
                <th key={index} className="px-5 py-3 text-left">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr
                key={student.id}
                className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-xs font-black text-slate-300">
                      {student.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </div>
                    <span className="text-white text-sm font-semibold">
                      {student.name}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-slate-500 text-sm">{student.id}</td>
                <td className="px-5 py-3.5 text-slate-400 text-sm">
                  {student.className ?? student.class}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${student.attendanceRate >= 80
                            ? "bg-emerald-400"
                            : student.attendanceRate >= 60
                              ? "bg-amber-400"
                              : "bg-red-400"
                          }`}
                        style={{ width: `${student.attendanceRate}%` }}
                      />
                    </div>
                    <span className="text-slate-400 text-xs">
                      {student.attendanceRate}%
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={student.status} />
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => setStudentToDelete(student)}
                    className="p-2 text-slate-500 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors"
                    title="Delete Student"
                  >
                    <Icon name="trash" className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title="Add New Student" onClose={handleClose}>
          <div className="space-y-3">
            <TextInput
              label="Full Name"
              value={form.name}
              onChange={(event) => {
                setForm((current) => ({ ...current, name: event.target.value }));
                setError("");
              }}
              placeholder="Aarav Thapa"
            />
            <TextInput
              label="Student ID"
              value={form.studentId}
              onChange={(event) => {
                setForm((current) => ({
                  ...current,
                  studentId: event.target.value,
                }));
                setError("");
              }}
              placeholder="S-1099"
            />
            <div>
              <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1.5 font-semibold">
                Class
              </label>
              <select
                value={form.classId}
                onChange={(event) => {
                  setForm((current) => ({
                    ...current,
                    classId: event.target.value,
                  }));
                  setError("");
                }}
                className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-sky-500 transition-all"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              onClick={handleAdd}
              className="w-full bg-sky-500 text-white font-black py-3 rounded-xl hover:bg-sky-400 transition-all text-sm mt-1"
            >
              Add Student
            </button>
          </div>
        </Modal>
      )}

      {studentToDelete && (
        <Modal title="Confirm Deletion" onClose={() => setStudentToDelete(null)}>
          <div className="space-y-4 mt-2">
            <p className="text-slate-300 text-sm">
              Are you sure you want to remove <span className="text-white font-bold">{studentToDelete.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStudentToDelete(null)}
                className="flex-1 bg-slate-700 text-white font-bold py-3 rounded-xl hover:bg-slate-600 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await onDelete?.(studentToDelete.classId, studentToDelete.id);
                  onShowToast?.(`${studentToDelete.name} deleted successfully`);
                  setStudentToDelete(null);
                }}
                className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-400 transition-all text-sm"
              >
                Delete Student
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
