import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.model.js";
import Class from "../models/Class.model.js";
import Attendance from "../models/Attendance.model.js";
import QrSession from "../models/QrSession.model.js";
import { runInTransaction } from "../utils/transactions.js";

dotenv.config();

const users = [
  {
    name: "Admin User",
    email: process.env.SEED_ADMIN_EMAIL,
    password: process.env.SEED_ADMIN_PASSWORD,
    role: "admin",
  },
  {
    name: "Mr. Raj Kumar",
    email: process.env.SEED_TEACHER_EMAIL,
    password: process.env.SEED_TEACHER_PASSWORD,
    role: "teacher",
    teacherId: "T-001",
  },
  {
    name: "Arjun Kumar",
    email: process.env.SEED_STUDENT_EMAIL,
    password: process.env.SEED_STUDENT_PASSWORD,
    role: "student",
    studentId: "S-1021",
    studentClass: "Grade 10 - A",
    forcePasswordReset: true,
  },
];

const assertSeedEnv = () => {
  const missing = [
    "SEED_ADMIN_EMAIL",
    "SEED_ADMIN_PASSWORD",
    "SEED_TEACHER_EMAIL",
    "SEED_TEACHER_PASSWORD",
    "SEED_STUDENT_EMAIL",
    "SEED_STUDENT_PASSWORD",
  ].filter((name) => !process.env[name]);

  if (missing.length) {
    throw new Error(`Missing seed environment variables: ${missing.join(", ")}`);
  }
};

const seed = async () => {
  assertSeedEnv();
  await connectDB();

  await runInTransaction(async (session) => {
    await Attendance.deleteMany({}).session(session);
    await QrSession.deleteMany({}).session(session);
    await Class.deleteMany({}).session(session);
    await User.deleteMany({ email: { $in: users.map((user) => user.email) } }).session(session);

    const [admin, teacher, student] = await User.create(users, { session });

    await Class.create(
      [
        {
          name: "Grade 10 - A",
          subject: "General",
          teacher: teacher._id,
          students: [student._id],
        },
      ],
      { session }
    );

    console.log(`Seed complete: ${admin.email}, ${teacher.email}, ${student.email}`);
  });

  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
