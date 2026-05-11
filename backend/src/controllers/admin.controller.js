import User from "../models/User.model.js";
import Class from "../models/Class.model.js";
import Attendance from "../models/Attendance.model.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password");
    res.json({ success: true, data: { users } });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    
    if (user.role === "admin") {
      res.status(400);
      throw new Error("Cannot delete an admin user");
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};
