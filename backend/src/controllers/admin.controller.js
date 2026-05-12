import User from "../models/User.model.js";
import Class from "../models/Class.model.js";
import Attendance from "../models/Attendance.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { deleteUserWithCleanup } from "../services/user.service.js";

const toUserDto = (user) => ({
  id: String(user._id),
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  teacherId: user.teacherId,
  studentId: user.studentId,
  classId: user.class ? String(user.class?._id ?? user.class) : undefined,
  class: user.class?.name ?? user.studentClass,
  assignedClass:
    user.class && typeof user.class === "object" && user.class.name
      ? {
          id: String(user.class._id),
          name: user.class.name,
          subject: user.class.subject,
        }
      : undefined,
  forcePasswordReset: user.forcePasswordReset,
  avatar: user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase(),
});

export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select("-password").populate("class", "name subject");
    res.json({ success: true, data: { users: users.map(toUserDto) } });
});

export const deleteUser = asyncHandler(async (req, res) => {
    const user = await deleteUserWithCleanup(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json({ success: true, message: "User deleted successfully" });
});

export const getDashboardStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalClasses = await Class.countDocuments();
    const totalAttendance = await Attendance.countDocuments();
    
    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    const recentAttendance = await Attendance.find()
      .populate("student", "name")
      .populate("class", "name")
      .sort({ markedAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalClasses,
          totalAttendance
        },
        usersByRole,
        recentAttendance
      }
    });
});
