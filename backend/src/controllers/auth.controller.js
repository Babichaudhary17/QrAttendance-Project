import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import Otp from "../models/Otp.model.js";
import Class from "../models/Class.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";
import { toClassDto } from "../utils/formatters.js";
import { runInTransaction } from "../utils/transactions.js";
import { env } from "../config/env.js";
import { sendOtpEmail } from "../services/email.service.js";

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
            class: role === "student" ? assignedClass?._id : undefined,
            studentClass: role === "student" ? assignedClass?.name : undefined,
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

    if (!user) {
      res.status(404);
      throw new Error("No account was found with this email.");
    }

    if (!(await user.matchPassword(password))) {
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

export const logoutUser = asyncHandler(async (req, res) => {
  // JWT is stateless — the client drops the token. This endpoint exists for
  // API completeness and future token-blacklist / refresh-token revocation.
  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
});

/* ── Forgot Password Flow ──────────────────────────────────────────── */

const OTP_EXPIRY_MINUTES = 10;

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    res.status(404);
    throw new Error("No account was found with this email address.");
  }

  // Invalidate any previous OTPs for this email
  await Otp.deleteMany({ email: user.email });

  // Generate a cryptographically secure 6-digit code
  const plainCode = String(crypto.randomInt(100000, 999999));

  // Save hashed OTP with 10-minute expiry
  await Otp.create({
    email: user.email,
    code: plainCode,
    expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
  });

  // Send the OTP via email
  await sendOtpEmail(user.email, plainCode);

  res.status(200).json({
    success: true,
    message: "Verification code sent to your email.",
  });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  // Find the most recent unused OTP for this email
  const otpRecord = await Otp.findOne({
    email: normalizedEmail,
    used: false,
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    res.status(400);
    throw new Error("No verification code found. Please request a new one.");
  }

  // Check expiry
  if (otpRecord.expiresAt < new Date()) {
    res.status(410);
    throw new Error("Verification code has expired. Please request a new one.");
  }

  // Compare the plain code against the stored hash
  const isMatch = await otpRecord.matchCode(code);

  if (!isMatch) {
    res.status(400);
    throw new Error("Invalid verification code.");
  }

  // Mark OTP as used so it cannot be reused
  otpRecord.used = true;
  await otpRecord.save();

  // Generate a short-lived reset token (15 minutes)
  const resetToken = jwt.sign(
    { email: normalizedEmail, purpose: "password-reset" },
    env.jwtSecret,
    { expiresIn: "15m" }
  );

  res.status(200).json({
    success: true,
    message: "Verification successful.",
    data: { resetToken },
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;

  // Verify the reset token
  let payload;
  try {
    payload = jwt.verify(resetToken, env.jwtSecret);
  } catch {
    res.status(401);
    throw new Error("Reset link has expired or is invalid. Please start over.");
  }

  if (payload.purpose !== "password-reset") {
    res.status(401);
    throw new Error("Invalid reset token.");
  }

  const user = await User.findOne({ email: payload.email }).select("+password");

  if (!user) {
    res.status(404);
    throw new Error("User account not found.");
  }

  // Update password — the pre-save hook will hash it
  user.password = newPassword;
  user.forcePasswordReset = false;
  await user.save();

  // Clean up all OTPs for this email
  await Otp.deleteMany({ email: payload.email });

  res.status(200).json({
    success: true,
    message: "Password reset successfully. You can now sign in with your new password.",
  });
});
