export const toStudentDto = (student, classDoc, records = []) => {
  const present = records.filter(
    (record) => String(record.student?._id ?? record.student) === String(student._id)
  ).length;
  const rate = records.length ? Math.round((present / records.length) * 100) : 0;

  return {
    id: student.studentId,
    _id: student._id,
    name: student.name,
    email: student.email,
    studentId: student.studentId,
    classId: String(classDoc._id),
    class: String(classDoc._id),
    className: classDoc.name,
    avatar: student.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    status: "active",
    attendanceRate: rate,
  };
};

export const toClassDto = (classDoc) => ({
  id: String(classDoc._id),
  _id: classDoc._id,
  name: classDoc.name,
  subject: classDoc.subject,
  teacher: classDoc.teacher,
  students: (classDoc.students ?? []).map((student) =>
    typeof student === "object" && student.name
      ? {
          id: student.studentId,
          _id: student._id,
          name: student.name,
          studentId: student.studentId,
        }
      : student
  ),
});

export const toAttendanceDto = (record) => ({
  id: String(record._id),
  studentId: record.student?.studentId,
  studentName: record.student?.name ?? "Unknown Student",
  classId: String(record.class?._id ?? record.class),
  class: String(record.class?._id ?? record.class),
  className: record.class?.name,
  sessionId: String(record.qrSession?._id ?? record.qrSession),
  date: record.markedAt.toISOString().slice(0, 10),
  time: record.markedAt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
  status: record.status,
});
