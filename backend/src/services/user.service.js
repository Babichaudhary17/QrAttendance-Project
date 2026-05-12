import Attendance from "../models/Attendance.model.js";
import Class from "../models/Class.model.js";
import QrSession from "../models/QrSession.model.js";
import User from "../models/User.model.js";
import { runInTransaction } from "../utils/transactions.js";

export const deleteUserWithCleanup = async (userId) => {
  return runInTransaction(async (session) => {
    const user = await User.findById(userId).session(session);

    if (!user) {
      return null;
    }

    if (user.role === "admin") {
      const error = new Error("Cannot delete an admin user.");
      error.statusCode = 400;
      throw error;
    }

    if (user.role === "student") {
      await Class.updateMany({ students: user._id }, { $pull: { students: user._id } }).session(session);
      await Attendance.deleteMany({ student: user._id }).session(session);
    }

    if (user.role === "teacher") {
      const classIds = await Class.find({ teacher: user._id }).distinct("_id").session(session);
      await Attendance.deleteMany({ class: { $in: classIds } }).session(session);
      await QrSession.deleteMany({ $or: [{ teacher: user._id }, { class: { $in: classIds } }] }).session(session);
      await Class.deleteMany({ _id: { $in: classIds } }).session(session);
    }

    await User.deleteOne({ _id: user._id }).session(session);
    return user;
  });
};
