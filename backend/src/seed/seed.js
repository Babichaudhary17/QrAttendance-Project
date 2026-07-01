import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.model.js";
import Class from "../models/Class.model.js";
import Attendance from "../models/Attendance.model.js";
import QrSession from "../models/QrSession.model.js";
import Department from "../models/Department.model.js";
import Program from "../models/Program.model.js";
import Semester from "../models/Semester.model.js";
import Subject from "../models/Subject.model.js";
import { runInTransaction } from "../utils/transactions.js";
import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from "../utils/ensureDefaultAdmin.js";

dotenv.config();

const adminEmail = DEFAULT_ADMIN_EMAIL;
const adminPassword = DEFAULT_ADMIN_PASSWORD;
const teacherEmail = process.env.SEED_TEACHER_EMAIL || "raj@teacher.local";
const teacherPassword = process.env.SEED_TEACHER_PASSWORD || "TeacherPass123!";
const studentEmail = process.env.SEED_STUDENT_EMAIL || "arjun@student.local";
const studentPassword = process.env.SEED_STUDENT_PASSWORD || "StudentPass123!";

const seed = async () => {
  await connectDB();

  await runInTransaction(async (session) => {
    const opts = session ? { session } : {};

    // Clear out existing records
    await Attendance.deleteMany({}, opts);
    await QrSession.deleteMany({}, opts);
    await Class.deleteMany({}, opts);
    await User.deleteMany(
      { email: { $in: [adminEmail, teacherEmail, studentEmail] } },
      opts
    );

    await Department.deleteMany({}, opts);
    await Program.deleteMany({}, opts);
    await Semester.deleteMany({}, opts);
    await Subject.deleteMany({}, opts);

    // 1. Create Academic Hierarchy
    const dept = await Department.create(
      [
        {
          name: "Computer Science & Information Technology",
          code: "CSIT",
        },
      ],
      opts
    ).then((res) => res[0]);

    const prog = await Program.create(
      [
        {
          name: "BSc Computer Science & Information Technology",
          code: "BSC-CSIT",
          department: dept._id,
        },
      ],
      opts
    ).then((res) => res[0]);

    const semester = await Semester.create(
      [
        {
          name: "7th Semester",
          code: "S7",
          number: 7,
        },
      ],
      opts
    ).then((res) => res[0]);

    const subj = await Subject.create(
      [
        {
          name: "Advanced Database Management Systems",
          code: "CSC409",
          program: prog._id,
          semester: semester._id,
        },
      ],
      opts
    ).then((res) => res[0]);

    // 2. Create Users
    const admin = await User.create(
      [
        {
          name: "Admin User",
          email: adminEmail,
          password: adminPassword,
          role: "admin",
        },
      ],
      opts
    ).then((res) => res[0]);

    const teacher = await User.create(
      [
        {
          name: "Mr. Raj Kumar",
          email: teacherEmail,
          password: teacherPassword,
          role: "teacher",
          teacherId: "T-001",
        },
      ],
      opts
    ).then((res) => res[0]);

    const student = await User.create(
      [
        {
          name: "Arjun Kumar",
          email: studentEmail,
          password: studentPassword,
          role: "student",
          studentId: "S-1021",
          forcePasswordReset: true,
          department: dept._id,
          program: prog._id,
          semester: semester._id,
        },
      ],
      opts
    ).then((res) => res[0]);

    // 3. Create Class linked to academic details
    const createdClass = await Class.create(
      [
        {
          name: "BSc CSIT - 7th Semester (ADMS)",
          subject: subj._id,
          department: dept._id,
          program: prog._id,
          semester: semester._id,
          teacher: teacher._id,
          students: [student._id],
        },
      ],
      opts
    ).then((res) => res[0]);

    // Update student's primary class
    student.class = createdClass._id;
    await student.save(opts);

    console.log("=========================================");
    console.log("Academic database seeding completed successfully!");
    console.log(`Admin Account   : ${admin.email} / ${adminPassword}`);
    console.log(`Teacher Account : ${teacher.email} / ${teacherPassword}`);
    console.log(`Student Account : ${student.email} / ${studentPassword}`);
    console.log("=========================================");
  });

  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error("Database seeding failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
