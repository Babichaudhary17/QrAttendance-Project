import Attendance from "../models/Attendance.model.js";
import Class from "../models/Class.model.js";
import QrSession from "../models/QrSession.model.js";
import { canManageClass } from "../middleware/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import { toAttendanceDto } from "../utils/formatters.js";

export const getAttendance = asyncHandler(async (req, res) => {
    const query = {};

    if (req.user.role === "student") {
      query.student = req.user._id;
    }

    if (req.query.classId) {
      if (req.user.role === "student") {
        const enrolledClass = await Class.exists({
          _id: req.query.classId,
          students: req.user._id,
        });

        if (!enrolledClass) {
          res.status(403);
          throw new Error("You can only view attendance for joined classes.");
        }
      }
      query.class = req.query.classId;
    }

    if (req.query.date) {
      const start = new Date(`${req.query.date}T00:00:00.000Z`);
      const end = new Date(`${req.query.date}T23:59:59.999Z`);
      query.markedAt = { $gte: start, $lte: end };
    }

    if (req.user.role === "teacher") {
      const teacherClasses = await Class.find({ teacher: req.user._id }).select("_id");
      const ownedClassIds = teacherClasses.map((classDoc) => String(classDoc._id));

      if (req.query.classId && !ownedClassIds.includes(String(req.query.classId))) {
        res.status(403);
        throw new Error("You do not have permission to view this class attendance.");
      }

      query.class = req.query.classId
        ? req.query.classId
        : { $in: ownedClassIds };
    }

    const records = await Attendance.find(query)
      .populate("student", "name studentId")
      .populate("class", "name")
      .sort({ markedAt: -1 });

    res.json({
      success: true,
      data: { records: records.map(toAttendanceDto) },
    });
});

export const markAttendance = asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token || typeof token !== "string") {
      res.status(400);
      throw new Error("QR token is required.");
    }

    const session = await QrSession.findOne({
      token: token.trim(),
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      res.status(410);
      throw new Error("Attendance session was not found, is expired, or is no longer active.");
    }

    const classDoc = await Class.findOne({ _id: session.class, isActive: true })
      .select("students teacher")
      .populate("teacher", "name");

    if (!classDoc?.students.some((id) => String(id) === String(req.user._id))) {
      res.status(403);
      throw new Error("You are not enrolled in this class.");
    }

    const result = await Attendance.updateOne(
      { student: req.user._id, qrSession: session._id },
      {
        $setOnInsert: {
          student: req.user._id,
          class: session.class,
          qrSession: session._id,
          status: "present",
          markedAt: new Date(),
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount === 0) {
      res.status(409);
      throw new Error("Attendance has already been marked for this session.");
    }

    const record = await Attendance.findOne({
      student: req.user._id,
      qrSession: session._id,
    });

    await record.populate("student", "name studentId");
    await record.populate({ path: "class", select: "name teacher", populate: { path: "teacher", select: "name" } });

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully.",
      data: { record: toAttendanceDto(record) },
    });
});

export const getAnalytics = asyncHandler(async (req, res) => {
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
});

export const getReport = asyncHandler(async (req, res) => {
    const classId = req.params.classId;
    
    const classDoc = await Class.findById(classId).populate("students", "name email studentId");
    
    if (!classDoc) {
      res.status(404);
      throw new Error("Class not found.");
    }

    if (!canManageClass(req.user, classDoc)) {
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
});
