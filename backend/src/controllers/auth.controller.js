import User from "../models/User.model.js";
import generateToken from "../utils/generateToken.js";

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
    class: user.studentClass,
  },
  token: generateToken(user),
});

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, teacherId, studentId, studentClass } =
      req.body;

    if (!name || !email || !password || !role) {
      res.status(400);
      throw new Error("Name, email, password, and role are required.");
    }

    if (!["admin", "teacher", "student"].includes(role)) {
      res.status(400);
      throw new Error("Role must be admin, teacher or student.");
    }

    if (role === "teacher" && !teacherId) {
      res.status(400);
      throw new Error("Teacher ID is required.");
    }

    if (role === "student" && (!studentId || !studentClass)) {
      res.status(400);
      throw new Error("Student ID and class are required.");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(409);
      throw new Error("A user with this email already exists.");
    }

    const duplicateProfile = await User.findOne({
      $or: [
        ...(teacherId ? [{ teacherId }] : []),
        ...(studentId ? [{ studentId }] : []),
      ],
    });

    if (duplicateProfile) {
      res.status(409);
      throw new Error("This teacher or student ID is already registered.");
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      teacherId: role === "teacher" ? teacherId : undefined,
      studentId: role === "student" ? studentId : undefined,
      studentClass: role === "student" ? studentClass : undefined,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: buildAuthResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required.");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid email or password.");
    }

    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: buildAuthResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
};
