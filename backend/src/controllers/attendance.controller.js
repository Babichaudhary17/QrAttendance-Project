import Attendance from "../models/Attendance.model.js";
import Class from "../models/Class.model.js";
import QrSession from "../models/QrSession.model.js";
import { toAttendanceDto } from "../utils/formatters.js";

export const getAttendance = async (req, res, next) => {
  try {
    const query = {};

    if (req.user.role === "student") {
      query.student = req.user._id;
    }

    if (req.query.classId) {
      query.class = req.query.classId;
    }

    if (req.query.date) {
      const start = new Date(`${req.query.date}T00:00:00.000Z`);
      const end = new Date(`${req.query.date}T23:59:59.999Z`);
      query.markedAt = { $gte: start, $lte: end };
    }

    if (req.user.role === "teacher") {
      const teacherClasses = await Class.find({ teacher: req.user._id }).select("_id");
      query.class = req.query.classId
        ? req.query.classId
        : { $in: teacherClasses.map((classDoc) => classDoc._id) };
    }

    const records = await Attendance.find(query)
      .populate("student", "name studentId")
      .populate("class", "name")
      .sort({ markedAt: -1 });

    res.json({
      success: true,
      data: { records: records.map(toAttendanceDto) },
    });
  } catch (error) {
    next(error);
  }
};

export const markAttendance = async (req, res, next) => {
  try {
    const { classId, sessionId, token } = req.body;

    if (!classId || !sessionId || !token) {
      res.status(400);
      throw new Error("Class ID, session ID, and token are required.");
    }

    const session = await QrSession.findOne({
      _id: sessionId,
      class: classId,
      token,
      isActive: true,
    });

    if (!session) {
      res.status(404);
      throw new Error("Attendance session was not found or is no longer active.");
    }

    if (session.expiresAt.getTime() < Date.now()) {
      session.isActive = false;
      await session.save();
      res.status(410);
      throw new Error("This QR code has expired.");
    }

    const classDoc = await Class.findById(classId);

    if (!classDoc?.students.some((id) => String(id) === String(req.user._id))) {
      res.status(403);
      throw new Error("You are not enrolled in this class.");
    }

    const record = await Attendance.create({
      student: req.user._id,
      class: classId,
      qrSession: sessionId,
      status: "present",
    });

    await record.populate("student", "name studentId");
    await record.populate("class", "name");

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully.",
      data: { record: toAttendanceDto(record) },
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409);
      return next(new Error("Attendance has already been marked for this session."));
    }

    next(error);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
    const query = {};

    if (req.user.role === "student") {
      query.student = req.user._id;
    } else if (req.user.role === "teacher") {
      const teacherClasses = await Class.find({ teacher: req.user._id }).select("_id");
      query.class = { $in: teacherClasses.map((classDoc) => classDoc._id) };
    }

    const totalRecords = await Attendance.countDocuments(query);
    
    // Aggregating attendance by class
    const attendanceByClass = await Attendance.aggregate([
      { $match: query },
      { $group: { _id: "$class", count: { $sum: 1 } } }
    ]);
    
    // Populate class names
    await Class.populate(attendanceByClass, { path: "_id", select: "name subject" });

    res.json({
      success: true,
      data: {
        totalRecords,
        attendanceByClass: attendanceByClass.map(item => ({
          class: item._id,
          count: item.count
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getReport = async (req, res, next) => {
  try {
    const classId = req.params.classId;
    
    const classDoc = await Class.findById(classId).populate("students", "name email studentId");
    
    if (!classDoc) {
      res.status(404);
      throw new Error("Class not found.");
    }

    if (req.user.role === "teacher" && String(classDoc.teacher) !== String(req.user._id) && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Not authorized to view this class report.");
    }

    const records = await Attendance.find({ class: classId })
      .populate("student", "name studentId")
      .populate("qrSession");

    const sessions = await QrSession.find({ class: classId });
    const totalSessions = sessions.length;

    const studentReports = classDoc.students.map(student => {
      const studentRecords = records.filter(r => String(r.student?._id) === String(student._id));
      const presentCount = studentRecords.length;
      const attendanceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;
      
      return {
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        presentCount,
        absentCount: totalSessions - presentCount,
        attendanceRate
      };
    });

    res.json({
      success: true,
      data: {
        report: {
          className: classDoc.name,
          subject: classDoc.subject,
          totalSessions,
          totalStudents: classDoc.students.length,
          studentReports
        }
      }
    });

  } catch (error) {
    next(error);
  }
};
