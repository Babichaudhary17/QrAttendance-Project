import Class from "../models/Class.model.js";
import User from "../models/User.model.js";
import { toClassDto, toStudentDto } from "../utils/formatters.js";

export const getTeacherClasses = async (req, res, next) => {
  try {
    const classes = await Class.find({ teacher: req.user._id })
      .populate("students", "name email studentId")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { classes: classes.map(toClassDto) } });
  } catch (error) {
    next(error);
  }
};

export const getStudentClasses = async (req, res, next) => {
  try {
    const classes = await Class.find({ students: req.user._id })
      .populate("students", "name email studentId")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { classes: classes.map(toClassDto) } });
  } catch (error) {
    next(error);
  }
};

export const createClass = async (req, res, next) => {
  try {
    const { name, subject } = req.body;

    if (!name?.trim()) {
      res.status(400);
      throw new Error("Class name is required.");
    }

    const classDoc = await Class.create({
      name: name.trim(),
      subject: subject?.trim(),
      teacher: req.user._id,
    });

    await classDoc.populate("students", "name email studentId");

    res.status(201).json({
      success: true,
      message: "Class created successfully.",
      data: { class: toClassDto(classDoc) },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteClass = async (req, res, next) => {
  try {
    const classDoc = await Class.findOneAndDelete({
      _id: req.params.classId,
      teacher: req.user._id,
    });

    if (!classDoc) {
      res.status(404);
      throw new Error("Class was not found.");
    }

    res.json({ success: true, message: "Class deleted successfully." });
  } catch (error) {
    next(error);
  }
};

export const addStudentToClass = async (req, res, next) => {
  try {
    const { studentId, name, email } = req.body;

    if (!studentId?.trim()) {
      res.status(400);
      throw new Error("Student ID is required.");
    }

    const classDoc = await Class.findOne({
      _id: req.params.classId,
      teacher: req.user._id,
    });

    if (!classDoc) {
      res.status(404);
      throw new Error("Class was not found.");
    }

    let student = await User.findOne({ studentId: studentId.trim(), role: "student" });

    if (!student) {
      if (!name?.trim()) {
        res.status(400);
        throw new Error("Student name is required for a new student account.");
      }

      student = await User.create({
        name: name.trim(),
        email: email?.trim() || `${studentId.trim().toLowerCase()}@student.local`,
        password: studentId.trim(),
        role: "student",
        studentId: studentId.trim(),
        studentClass: classDoc.name,
      });
    }

    if (classDoc.students.some((id) => String(id) === String(student._id))) {
      res.status(409);
      throw new Error("Student is already enrolled in this class.");
    }

    classDoc.students.push(student._id);
    await classDoc.save();
    await classDoc.populate("students", "name email studentId");

    res.status(201).json({
      success: true,
      message: "Student added successfully.",
      data: {
        class: toClassDto(classDoc),
        student: toStudentDto(student, classDoc),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const removeStudentFromClass = async (req, res, next) => {
  try {
    const classDoc = await Class.findOne({
      _id: req.params.classId,
      teacher: req.user._id,
    });

    if (!classDoc) {
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

    res.json({ success: true, message: "Student removed successfully." });
  } catch (error) {
    next(error);
  }
};

export const getAllClasses = async (req, res, next) => {
  try {
    const classes = await Class.find({})
      .populate("teacher", "name email")
      .populate("students", "name email studentId")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { classes: classes.map(toClassDto) } });
  } catch (error) {
    next(error);
  }
};

export const getClassById = async (req, res, next) => {
  try {
    const classDoc = await Class.findById(req.params.id)
      .populate("teacher", "name email")
      .populate("students", "name email studentId");

    if (!classDoc) {
      res.status(404);
      throw new Error("Class was not found.");
    }

    res.json({ success: true, data: { class: toClassDto(classDoc) } });
  } catch (error) {
    next(error);
  }
};

export const updateClass = async (req, res, next) => {
  try {
    const { name, subject } = req.body;

    const classDoc = await Class.findOne({
      _id: req.params.id,
      teacher: req.user._id,
    });

    if (!classDoc) {
      res.status(404);
      throw new Error("Class was not found.");
    }

    classDoc.name = name?.trim() || classDoc.name;
    classDoc.subject = subject?.trim() || classDoc.subject;

    await classDoc.save();
    await classDoc.populate("students", "name email studentId");

    res.json({
      success: true,
      message: "Class updated successfully.",
      data: { class: toClassDto(classDoc) },
    });
  } catch (error) {
    next(error);
  }
};
