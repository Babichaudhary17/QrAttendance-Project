import User from "../models/User.model.js";
import Class from "../models/Class.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";
import { toClassDto } from "../utils/formatters.js";
import { runInTransaction } from "../utils/transactions.js";

const buildAuthResponse = (user) => ({
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    teacherId: user.teacherId,
    studentId: user.studentId,
    classId: user.class ? String(user.class?._id ?? user.class) : undefined,
    class: user.class?.name ?? user.studentClass,
    assignedClass:
      user.class && typeof user.class === "object" && user.class.name
        ? toClassDto(user.class)
        : undefined,
    forcePasswordReset: user.forcePasswordReset,
  },
  token: generateToken(user),
});

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, teacherId, studentId, classId, classCode } =
      req.body;

    if (!name || !email || !password || !role) {
      res.status(400);
      throw new Error("Name, email, password, and role are required.");
    }

    if (!["teacher", "student"].includes(role)) {
      res.status(400);
      throw new Error("Public registration is only available for teacher and student accounts.");
    }

    if (role === "teacher" && !teacherId) {
      res.status(400);
      throw new Error("Teacher ID is required.");
    }

    if (role === "student" && !studentId) {
      res.status(400);
      throw new Error("Student ID is required.");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(409);
      throw new Error("A user with this email already exists.");
    }

    const profileChecks = [
      ...(teacherId ? [{ teacherId }] : []),
      ...(studentId ? [{ studentId }] : []),
    ];
    const duplicateProfile = profileChecks.length
      ? await User.findOne({ $or: profileChecks })
      : null;

    if (duplicateProfile) {
      res.status(409);
      throw new Error("This teacher or student ID is already registered.");
    }

    const user = await runInTransaction(async (session) => {
      let assignedClass = null;

      if (role === "student" && (classId || classCode)) {
        const classQuery = classId
          ? { _id: classId }
          : { classCode: classCode.trim() };

        assignedClass = await Class.findOne({ ...classQuery, isActive: true }).session(session);

        if (!assignedClass) {
          res.status(400);
          throw new Error("Selected class was not found or is inactive.");
        }
      }

      const [createdUser] = await User.create(
        [
          {
            name,
            email,
            password,
            role,
            teacherId: role === "teacher" ? teacherId : undefined,
            studentId: role === "student" ? studentId : undefined,
            class: role === "student" ? assignedClass._id : undefined,
            studentClass: role === "student" ? assignedClass.name : undefined,
          },
        ],
        { session }
      );

      if (assignedClass) {
        await Class.updateOne(
          { _id: assignedClass._id, isActive: true },
          { $addToSet: { students: createdUser._id } },
          { session }
        );
      }

      return createdUser;
    });

    await user.populate([
      { path: "class", populate: [
        { path: "subject", select: "name code" },
        { path: "department", select: "name code" },
        { path: "program", select: "name code" },
        { path: "semester", select: "name code number" }
      ]},
      { path: "department", select: "name code" },
      { path: "program", select: "name code" },
      { path: "semester", select: "name code number" }
    ]);

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: buildAuthResponse(user),
    });
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required.");
    }

    const user = await User.findOne({ email })
      .select("+password")
      .populate([
        { path: "class", populate: [
          { path: "subject", select: "name code" },
          { path: "department", select: "name code" },
          { path: "program", select: "name code" },
          { path: "semester", select: "name code number" }
        ]},
        { path: "department", select: "name code" },
        { path: "program", select: "name code" },
        { path: "semester", select: "name code number" }
      ]);

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid email or password.");
    }

    res.status(200).json({
      success: true,
      message: user.forcePasswordReset
        ? "Login successful. Password reset is required."
        : "Login successful.",
      data: buildAuthResponse(user),
    });
});

export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!user || !(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error("Current password is incorrect.");
  }

  user.password = newPassword;
  user.forcePasswordReset = false;
  await user.save();

  res.json({
    success: true,
    message: "Password changed successfully.",
  });
});

export const updateAdminCredentials = asyncHandler(async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Only admins can update admin credentials.");
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!user || !(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error("Current password is incorrect.");
  }

  const nextEmail = email.trim().toLowerCase();
  const emailOwner = await User.findOne({ email: nextEmail });

  if (emailOwner && String(emailOwner._id) !== String(user._id)) {
    res.status(409);
    throw new Error("This email is already used by another account.");
  }

  user.email = nextEmail;

  if (newPassword) {
    user.password = newPassword;
    user.forcePasswordReset = false;
  }

  await user.save();

  res.json({
    success: true,
    message: "Admin credentials updated successfully.",
    data: buildAuthResponse(user),
  });
});
