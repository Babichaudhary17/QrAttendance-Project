import mongoose from "mongoose";
import Class from "../models/Class.model.js";
import User from "../models/User.model.js";
import { v4 as uuidv4 } from "uuid";
import { assignedClassId, canAccessClass, canManageClass } from "../middleware/auth.middleware.js";
import { deleteClassWithCleanup } from "../services/class.service.js";
import { env } from "../config/env.js";
import asyncHandler from "../utils/asyncHandler.js";
import { toClassDto, toEnrollmentClassDto, toStudentDto } from "../utils/formatters.js";
import { generateTemporaryPassword, passwordDeliveryMessage } from "../utils/password.js";
import { runInTransaction } from "../utils/transactions.js";

const buildInviteLink = (classCode) => `${env.clientUrl.replace(/\/$/, "")}/join/${classCode}`;

const ensureInviteMetadata = async (classDoc) => {
  let changed = false;

  if (!classDoc.classCode) {
    classDoc.classCode = uuidv4();
    changed = true;
  }

  if (!classDoc.inviteLink) {
    classDoc.inviteLink = buildInviteLink(classDoc.classCode);
    changed = true;
  }

  if (changed) {
    await classDoc.save();
  }

  return classDoc;
};

export const getEnrollmentClasses = asyncHandler(async (_req, res) => {
    const classes = await Class.find({ isActive: true })
      .select("name subject")
      .sort({ name: 1 });

    res.json({ success: true, data: { classes: classes.map(toEnrollmentClassDto) } });
});

export const getTeacherClasses = asyncHandler(async (req, res) => {
    const query = req.user.role === "admin" ? {} : { teacher: req.user._id };
    const classes = await Class.find(query)
      .populate("students", "name email studentId")
      .populate("subject", "name code")
      .populate("department", "name code")
      .populate("program", "name code")
      .populate("semester", "name code number")
      .sort({ createdAt: -1 });

    const classesWithInvites = await Promise.all(classes.map(ensureInviteMetadata));

    res.json({ success: true, data: { classes: classesWithInvites.map(toClassDto) } });
});

export const getStudentClasses = asyncHandler(async (req, res) => {
    const query =
      req.user.role === "admin"
        ? {}
        : { students: req.user._id, isActive: true };
    const classes = await Class.find(query)
      .populate("students", "name email studentId")
      .populate("teacher", "name email")
      .populate("subject", "name code")
      .populate("department", "name code")
      .populate("program", "name code")
      .populate("semester", "name code number")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { classes: classes.map(toClassDto) } });
});

export const createClass = asyncHandler(async (req, res) => {
    const { name, subject, subjectId, department, departmentId, program, programId, semester, semesterId, isActive } = req.body;

    if (!name?.trim()) {
      res.status(400);
      throw new Error("Class name is required.");
    }

    let teacherId = req.user._id;

    if (req.user.role === "admin" && req.body.teacherId) {
      const teacher = await User.findOne({ _id: req.body.teacherId, role: "teacher" });

      if (!teacher) {
        res.status(400);
        throw new Error("Teacher ID must reference an existing teacher.");
      }

      teacherId = teacher._id;
    }

    const subjectValue = subjectId || subject;
    const isValidObjectId = subjectValue && mongoose.Types.ObjectId.isValid(subjectValue);

    const classDoc = new Class({
      name: name.trim(),
      subject: isValidObjectId ? subjectValue : undefined,
      subjectName: !isValidObjectId && subjectValue ? String(subjectValue).trim() : undefined,
      department: departmentId || department,
      program: programId || program,
      semester: semesterId || semester,
      isActive: isActive ?? true,
      teacher: teacherId,
    });

    await classDoc.validate();
    classDoc.inviteLink = buildInviteLink(classDoc.classCode);
    await classDoc.save();
    
    await classDoc.populate([
      { path: "students", select: "name email studentId" },
      { path: "subject", select: "name code" },
      { path: "department", select: "name code" },
      { path: "program", select: "name code" },
      { path: "semester", select: "name code number" },
    ]);

    res.status(201).json({
      success: true,
      message: "Class created successfully.",
      data: { class: toClassDto(classDoc) },
    });
});

export const getClassInvite = asyncHandler(async (req, res) => {
    const classDoc = await Class.findOne({
      classCode: req.params.classCode,
      isActive: true,
    }).populate("teacher", "name email");

    if (!classDoc) {
      res.status(404);
      throw new Error("Class invitation was not found or is inactive.");
    }

    res.json({
      success: true,
      data: {
        class: {
          id: String(classDoc._id),
          name: classDoc.name,
          subject: classDoc.subject,
          classCode: classDoc.classCode,
          teacherName: classDoc.teacher?.name ?? "Teacher",
          alreadyJoined: classDoc.students.some((id) => String(id) === String(req.user._id)),
        },
      },
    });
});

export const joinClassByCode = asyncHandler(async (req, res) => {
    const classDoc = await runInTransaction(async (session) => {
      const classDoc = await Class.findOne({
        classCode: req.params.classCode,
        isActive: true,
      }).session(session);

      if (!classDoc) {
        res.status(404);
        throw new Error("Class invitation was not found or is inactive.");
      }

      if (classDoc.students.some((id) => String(id) === String(req.user._id))) {
        res.status(409);
        throw new Error("You have already joined this class.");
      }

      await Class.updateOne(
        { _id: classDoc._id, students: { $ne: req.user._id }, isActive: true },
        { $addToSet: { students: req.user._id } },
        { session }
      );

      if (!assignedClassId(req.user)) {
        await User.updateOne(
          { _id: req.user._id },
          { class: classDoc._id, studentClass: classDoc.name },
          { session }
        );
      }

      return classDoc;
    });

    const populatedClass = await Class.findById(classDoc._id)
      .populate("teacher", "name email")
      .populate("students", "name email studentId");

    res.status(201).json({
      success: true,
      message: "Class joined successfully.",
      data: { class: toClassDto(populatedClass) },
    });
});

export const deleteClass = asyncHandler(async (req, res) => {
    const classDoc = await deleteClassWithCleanup({
      classId: req.params.classId,
      actor: req.user,
    });

    if (!classDoc) {
      res.status(404);
      throw new Error("Class was not found.");
    }

    res.json({ success: true, message: "Class deleted successfully." });
});

export const addStudentToClass = asyncHandler(async (req, res) => {
    const { studentId, name, email } = req.body;

    if (!studentId?.trim()) {
      res.status(400);
      throw new Error("Student ID is required.");
    }

    const { classDoc, student } = await runInTransaction(async (session) => {
      const classDoc = await Class.findById(req.params.classId).session(session);

      if (!classDoc || !canManageClass(req.user, classDoc)) {
        res.status(404);
        throw new Error("Class was not found.");
      }

      if (!classDoc.isActive) {
        res.status(400);
        throw new Error("Cannot enroll students into an inactive class.");
      }

      let student = await User.findOne({ studentId: studentId.trim(), role: "student" }).session(session);

      if (student?.class && String(student.class) !== String(classDoc._id)) {
        res.status(409);
        throw new Error("Student is already assigned to another class.");
      }

      if (!student) {
        if (!name?.trim()) {
          res.status(400);
          throw new Error("Student name is required for a new student account.");
        }

        const temporaryPassword = generateTemporaryPassword();
        const [createdStudent] = await User.create(
          [
            {
              name: name.trim(),
              email: email?.trim() || `${studentId.trim().toLowerCase()}@student.local`,
              password: temporaryPassword,
              role: "student",
              studentId: studentId.trim(),
              class: classDoc._id,
              studentClass: classDoc.name,
              forcePasswordReset: true,
            },
          ],
          { session }
        );
        student = createdStudent;
        student.temporaryPassword = temporaryPassword;
      } else if (!student.class) {
        student.class = classDoc._id;
        student.studentClass = classDoc.name;
        await student.save({ session });
      }

      await Class.updateOne(
        { _id: classDoc._id },
        { $addToSet: { students: student._id } },
        { session }
      );

      return { classDoc, student };
    });

    const populatedClass = await Class.findById(classDoc._id)
      .populate("students", "name email studentId");

    res.status(201).json({
      success: true,
      message: "Student added successfully.",
      data: {
        class: toClassDto(populatedClass),
        student: toStudentDto(student, populatedClass),
        onboarding: student.temporaryPassword
          ? {
              temporaryPassword:
                process.env.NODE_ENV === "production" ? undefined : student.temporaryPassword,
              message: passwordDeliveryMessage(student, student.temporaryPassword),
            }
          : undefined,
      },
    });
});

export const removeStudentFromClass = asyncHandler(async (req, res) => {
    const classDoc = await Class.findById(req.params.classId);

    if (!classDoc || !canManageClass(req.user, classDoc)) {
      res.status(404);
      throw new Error("Class was not found.");
    }

    const student = await User.findOne({
      studentId: req.params.studentId,
      role: "student",
    });

    if (!student) {
      res.status(404);
      throw new Error("Student was not found.");
    }

    classDoc.students = classDoc.students.filter(
      (id) => String(id) !== String(student._id)
    );
    await classDoc.save();
    if (String(student.class) === String(classDoc._id)) {
      await User.updateOne(
        { _id: student._id },
        { $unset: { class: "", studentClass: "" } }
      );
    }

    res.json({ success: true, message: "Student removed successfully." });
});

export const getAllClasses = asyncHandler(async (req, res) => {
    const classes = await Class.find({})
      .populate("teacher", "name email")
      .populate("students", "name email studentId")
      .sort({ createdAt: -1 });

    const classesWithInvites = await Promise.all(classes.map(ensureInviteMetadata));

    res.json({ success: true, data: { classes: classesWithInvites.map(toClassDto) } });
});

export const getClassById = asyncHandler(async (req, res) => {
    const classDoc = await Class.findById(req.params.id)
      .populate("teacher", "name email")
      .populate("students", "name email studentId")
      .populate("subject", "name code")
      .populate("department", "name code")
      .populate("program", "name code")
      .populate("semester", "name code number");

    if (!classDoc) {
      res.status(404);
      throw new Error("Class was not found.");
    }

    if (!canAccessClass(req.user, classDoc)) {
      res.status(403);
      throw new Error("You do not have permission to access this class.");
    }

    res.json({ success: true, data: { class: toClassDto(classDoc) } });
});

export const updateClass = asyncHandler(async (req, res) => {
    const { name, subject, subjectId, department, departmentId, program, programId, semester, semesterId, isActive } = req.body;

    const classDoc = await Class.findById(req.params.id);

    if (!classDoc || !canManageClass(req.user, classDoc)) {
      res.status(404);
      throw new Error("Class was not found.");
    }

    if (name) classDoc.name = name.trim();
    if (subjectId || subject) {
      const subjectValue = subjectId || subject;
      if (mongoose.Types.ObjectId.isValid(subjectValue)) {
        classDoc.subject = subjectValue;
        classDoc.subjectName = undefined;
      } else {
        classDoc.subject = undefined;
        classDoc.subjectName = String(subjectValue).trim();
      }
    }
    if (departmentId || department) classDoc.department = departmentId || department;
    if (programId || program) classDoc.program = programId || program;
    if (semesterId || semester) classDoc.semester = semesterId || semester;
    if (typeof isActive === "boolean") {
      classDoc.isActive = isActive;
    }

    await classDoc.save();
    
    await classDoc.populate([
      { path: "students", select: "name email studentId" },
      { path: "subject", select: "name code" },
      { path: "department", select: "name code" },
      { path: "program", select: "name code" },
      { path: "semester", select: "name code number" },
    ]);

    res.json({
      success: true,
      message: "Class updated successfully.",
      data: { class: toClassDto(classDoc) },
    });
});
