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
  subject: classDoc.subject && typeof classDoc.subject === "object" && classDoc.subject.name
    ? classDoc.subject.name
    : classDoc.subjectName || classDoc.subject,
  subjectDetails: classDoc.subject && typeof classDoc.subject === "object"
    ? { id: String(classDoc.subject._id), name: classDoc.subject.name, code: classDoc.subject.code }
    : undefined,
  department: classDoc.department && typeof classDoc.department === "object"
    ? { id: String(classDoc.department._id), name: classDoc.department.name, code: classDoc.department.code }
    : classDoc.department,
  program: classDoc.program && typeof classDoc.program === "object"
    ? { id: String(classDoc.program._id), name: classDoc.program.name, code: classDoc.program.code }
    : classDoc.program,
  semester: classDoc.semester && typeof classDoc.semester === "object"
    ? { id: String(classDoc.semester._id), name: classDoc.semester.name, code: classDoc.semester.code, number: classDoc.semester.number }
    : classDoc.semester,
  teacher: classDoc.teacher,
  classCode: classDoc.classCode,
  inviteLink: classDoc.inviteLink,
  isActive: classDoc.isActive,
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

export const toEnrollmentClassDto = (classDoc) => ({
  id: String(classDoc._id),
  name: classDoc.name,
  subject: classDoc.subject && typeof classDoc.subject === "object" && classDoc.subject.name
    ? classDoc.subject.name
    : classDoc.subject,
});

export const toAttendanceDto = (record) => ({
  id: String(record._id),
  studentId: record.student?.studentId,
  studentName: record.student?.name ?? "Unknown Student",
  classId: String(record.class?._id ?? record.class),
  class: String(record.class?._id ?? record.class),
  className: record.class?.name,
  teacherName: record.class?.teacher?.name ?? null,
  sessionId: String(record.qrSession?._id ?? record.qrSession),
  date: record.markedAt.toISOString().slice(0, 10),
  time: record.markedAt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
  status: record.status,
});

