const USER_BASE = [
  {
    id: "U-001",
    name: "Mr. Raj Kumar",
    email: "teacher@school.edu",
    role: "teacher",
  },
  {
    id: "U-002",
    name: "Admin User",
    email: "admin@school.edu",
    role: "admin",
  },
  {
    id: "U-003",
    name: "Arjun Kumar",
    email: "student@school.edu",
    role: "student",
  },
];

const USER_DETAILS = {
  "teacher@school.edu": { avatar: "RK", teacherId: "T-001" },
  "admin@school.edu": { avatar: "AU" },
  "student@school.edu": {
    avatar: "AK",
    studentId: "S-1021",
    class: "10A",
  },
};

export const USERS = USER_BASE.map((user) => ({
  ...user,
  ...USER_DETAILS[user.email],
}));

export const CLASSES = [
  {
    id: "10A",
    name: "Grade 10 - A",
    students: [
      { id: "S-1021", name: "Arjun Kumar" },
      { id: "S-1022", name: "Bina Rai" },
      { id: "S-1023", name: "Chetan Sharma" },
      { id: "S-1024", name: "Deepa Maharjan" },
      { id: "S-1025", name: "Elina Pandey" },
      { id: "S-1026", name: "Farhan Khan" },
      { id: "S-1027", name: "Gita Thapa" },
      { id: "S-1028", name: "Hari Joshi" },
    ],
  },
  {
    id: "10B",
    name: "Grade 10 - B",
    students: [
      { id: "S-1031", name: "Isha Rijal" },
      { id: "S-1032", name: "Jay Lama" },
      { id: "S-1033", name: "Kavita Niroula" },
      { id: "S-1034", name: "Laxmi Oli" },
      { id: "S-1035", name: "Mohan Gurung" },
      { id: "S-1036", name: "Nisha Basnet" },
    ],
  },
  {
    id: "9A",
    name: "Grade 9 - A",
    students: [
      { id: "S-0921", name: "Om Shrestha" },
      { id: "S-0922", name: "Priya KC" },
      { id: "S-0923", name: "Rabin Bista" },
      { id: "S-0924", name: "Samiksha Acharya" },
    ],
  },
  {
    id: "9B",
    name: "Grade 9 - B",
    students: [
      { id: "S-0931", name: "Tara Adhikari" },
      { id: "S-0932", name: "Ujjwal Devkota" },
      { id: "S-0933", name: "Vijay Rana" },
      { id: "S-0934", name: "Wangchuk Sherpa" },
    ],
  },
];

const RAW_ATTENDANCE_RECORDS = [
  { studentId: "S-1021", classId: "10A", date: "2026-03-28", time: "09:00", status: "present" },
  { studentId: "S-1022", classId: "10A", date: "2026-03-28", time: "09:02", status: "present" },
  { studentId: "S-1023", classId: "10A", date: "2026-03-28", status: "absent" },
  { studentId: "S-1024", classId: "10A", date: "2026-03-28", time: "09:05", status: "present" },
];

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function buildStudentDirectory(classes) {
  return classes.flatMap((cls) =>
    cls.students.map((student) => ({
      ...student,
      studentId: student.id,
      classId: cls.id,
      class: cls.id,
      className: cls.name,
      avatar: getInitials(student.name),
    }))
  );
}

function buildAttendanceRecords(rawRecords, students, classes) {
  const studentMap = new Map(students.map((student) => [student.id, student]));
  const classMap = new Map(classes.map((cls) => [cls.id, cls]));

  return rawRecords.map((record, index) => {
    const student = studentMap.get(record.studentId);
    const cls = classMap.get(record.classId);

    return {
      id: record.id ?? `${record.date}-${record.classId}-${record.studentId}-${index}`,
      ...record,
      studentName: student?.name ?? "Unknown Student",
      class: cls?.id ?? record.classId,
      className: cls?.name ?? record.classId,
      time: record.time ?? "--",
    };
  });
}

export function buildStudents(classes, attendanceRecords) {
  const directory = buildStudentDirectory(classes);

  return directory.map((student) => {
    const studentRecords = attendanceRecords.filter(
      (record) => record.studentId === student.studentId
    );
    const presentCount = studentRecords.filter(
      (record) => record.status === "present"
    ).length;
    const attendanceRate = studentRecords.length
      ? Math.round((presentCount / studentRecords.length) * 100)
      : 0;

    return {
      ...student,
      status: "active",
      attendanceRate,
    };
  });
}

export const ATTENDANCE_RECORDS = buildAttendanceRecords(
  RAW_ATTENDANCE_RECORDS,
  buildStudentDirectory(CLASSES),
  CLASSES
);

export const STUDENTS = buildStudents(CLASSES, ATTENDANCE_RECORDS);
