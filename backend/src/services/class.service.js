import Attendance from "../models/Attendance.model.js";
import Class from "../models/Class.model.js";
import QrSession from "../models/QrSession.model.js";
import User from "../models/User.model.js";
import { runInTransaction } from "../utils/transactions.js";

export const deleteClassWithCleanup = async ({ classId, actor }) => {
  return runInTransaction(async (session) => {
    const query = { _id: classId };

    if (actor.role === "teacher") {
      query.teacher = actor._id;
    }

    const classDoc = await Class.findOne(query).session(session);

    if (!classDoc) {
      return null;
    }

    await Attendance.deleteMany({ class: classDoc._id }).session(session);
    await QrSession.deleteMany({ class: classDoc._id }).session(session);
    await User.updateMany(
      { class: classDoc._id },
      { $unset: { class: "", studentClass: "" } }
    ).session(session);
    await Class.deleteOne({ _id: classDoc._id }).session(session);

    return classDoc;
  });
};
