import Department from "../models/Department.model.js";
import Program from "../models/Program.model.js";
import Semester from "../models/Semester.model.js";
import Subject from "../models/Subject.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// ==========================================
// DEPARTMENT CONTROLLERS
// ==========================================

export const createDepartment = asyncHandler(async (req, res) => {
  const { name, code } = req.body;

  if (!name?.trim() || !code?.trim()) {
    res.status(400);
    throw new Error("Department name and code are required.");
  }

  const existingDept = await Department.findOne({
    $or: [{ name: name.trim() }, { code: code.trim().toUpperCase() }],
  });

  if (existingDept) {
    res.status(409);
    throw new Error("A department with this name or code already exists.");
  }

  const department = await Department.create({
    name: name.trim(),
    code: code.trim().toUpperCase(),
  });

  res.status(201).json({
    success: true,
    message: "Department created successfully.",
    data: { department },
  });
});

export const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find({}).sort({ name: 1 });
  res.status(200).json({
    success: true,
    data: { departments },
  });
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const { name, code, isActive } = req.body;
  const department = await Department.findById(req.params.id);

  if (!department) {
    res.status(404);
    throw new Error("Department not found.");
  }

  if (name) department.name = name.trim();
  if (code) department.code = code.trim().toUpperCase();
  if (typeof isActive === "boolean") department.isActive = isActive;

  await department.save();

  res.status(200).json({
    success: true,
    message: "Department updated successfully.",
    data: { department },
  });
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);

  if (!department) {
    res.status(404);
    throw new Error("Department not found.");
  }

  await Department.deleteOne({ _id: department._id });

  res.status(200).json({
    success: true,
    message: "Department deleted successfully.",
  });
});

// ==========================================
// PROGRAM CONTROLLERS
// ==========================================

export const createProgram = asyncHandler(async (req, res) => {
  const { name, code, departmentId } = req.body;

  if (!name?.trim() || !code?.trim() || !departmentId) {
    res.status(400);
    throw new Error("Program name, code, and department are required.");
  }

  const department = await Department.findById(departmentId);
  if (!department) {
    res.status(404);
    throw new Error("Referenced department not found.");
  }

  const existingProg = await Program.findOne({
    $or: [{ name: name.trim() }, { code: code.trim().toUpperCase() }],
  });

  if (existingProg) {
    res.status(409);
    throw new Error("A program with this name or code already exists.");
  }

  const program = await Program.create({
    name: name.trim(),
    code: code.trim().toUpperCase(),
    department: departmentId,
  });

  res.status(201).json({
    success: true,
    message: "Program created successfully.",
    data: { program },
  });
});

export const getPrograms = asyncHandler(async (req, res) => {
  const programs = await Program.find({}).populate("department", "name code").sort({ name: 1 });
  res.status(200).json({
    success: true,
    data: { programs },
  });
});

export const updateProgram = asyncHandler(async (req, res) => {
  const { name, code, departmentId, isActive } = req.body;
  const program = await Program.findById(req.params.id);

  if (!program) {
    res.status(404);
    throw new Error("Program not found.");
  }

  if (departmentId) {
    const department = await Department.findById(departmentId);
    if (!department) {
      res.status(404);
      throw new Error("Referenced department not found.");
    }
    program.department = departmentId;
  }

  if (name) program.name = name.trim();
  if (code) program.code = code.trim().toUpperCase();
  if (typeof isActive === "boolean") program.isActive = isActive;

  await program.save();
  await program.populate("department", "name code");

  res.status(200).json({
    success: true,
    message: "Program updated successfully.",
    data: { program },
  });
});

export const deleteProgram = asyncHandler(async (req, res) => {
  const program = await Program.findById(req.params.id);

  if (!program) {
    res.status(404);
    throw new Error("Program not found.");
  }

  await Program.deleteOne({ _id: program._id });

  res.status(200).json({
    success: true,
    message: "Program deleted successfully.",
  });
});

// ==========================================
// SEMESTER CONTROLLERS
// ==========================================

export const createSemester = asyncHandler(async (req, res) => {
  const { name, code, number } = req.body;

  if (!name?.trim() || !code?.trim() || typeof number !== "number") {
    res.status(400);
    throw new Error("Semester name, code, and numerical number are required.");
  }

  const existingSem = await Semester.findOne({
    $or: [{ name: name.trim() }, { code: code.trim().toUpperCase() }, { number }],
  });

  if (existingSem) {
    res.status(409);
    throw new Error("A semester with this name, code, or number already exists.");
  }

  const semester = await Semester.create({
    name: name.trim(),
    code: code.trim().toUpperCase(),
    number,
  });

  res.status(201).json({
    success: true,
    message: "Semester created successfully.",
    data: { semester },
  });
});

export const getSemesters = asyncHandler(async (req, res) => {
  const semesters = await Semester.find({}).sort({ number: 1 });
  res.status(200).json({
    success: true,
    data: { semesters },
  });
});

export const updateSemester = asyncHandler(async (req, res) => {
  const { name, code, number, isActive } = req.body;
  const semester = await Semester.findById(req.params.id);

  if (!semester) {
    res.status(404);
    throw new Error("Semester not found.");
  }

  if (name) semester.name = name.trim();
  if (code) semester.code = code.trim().toUpperCase();
  if (typeof number === "number") semester.number = number;
  if (typeof isActive === "boolean") semester.isActive = isActive;

  await semester.save();

  res.status(200).json({
    success: true,
    message: "Semester updated successfully.",
    data: { semester },
  });
});

export const deleteSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.findById(req.params.id);

  if (!semester) {
    res.status(404);
    throw new Error("Semester not found.");
  }

  await Semester.deleteOne({ _id: semester._id });

  res.status(200).json({
    success: true,
    message: "Semester deleted successfully.",
  });
});

// ==========================================
// SUBJECT CONTROLLERS
// ==========================================

export const createSubject = asyncHandler(async (req, res) => {
  const { name, code, programId, semesterId } = req.body;

  if (!name?.trim() || !code?.trim() || !programId || !semesterId) {
    res.status(400);
    throw new Error("Subject name, code, program, and semester are required.");
  }

  const program = await Program.findById(programId);
  if (!program) {
    res.status(404);
    throw new Error("Referenced program not found.");
  }

  const semester = await Semester.findById(semesterId);
  if (!semester) {
    res.status(404);
    throw new Error("Referenced semester not found.");
  }

  const existingSubj = await Subject.findOne({ code: code.trim().toUpperCase() });
  if (existingSubj) {
    res.status(409);
    throw new Error("A subject with this code already exists.");
  }

  const subject = await Subject.create({
    name: name.trim(),
    code: code.trim().toUpperCase(),
    program: programId,
    semester: semesterId,
  });

  res.status(201).json({
    success: true,
    message: "Subject created successfully.",
    data: { subject },
  });
});

export const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find({})
    .populate("program", "name code")
    .populate("semester", "name code number")
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    data: { subjects },
  });
});

export const updateSubject = asyncHandler(async (req, res) => {
  const { name, code, programId, semesterId, isActive } = req.body;
  const subject = await Subject.findById(req.params.id);

  if (!subject) {
    res.status(404);
    throw new Error("Subject not found.");
  }

  if (programId) {
    const program = await Program.findById(programId);
    if (!program) {
      res.status(404);
      throw new Error("Referenced program not found.");
    }
    subject.program = programId;
  }

  if (semesterId) {
    const semester = await Semester.findById(semesterId);
    if (!semester) {
      res.status(404);
      throw new Error("Referenced semester not found.");
    }
    subject.semester = semesterId;
  }

  if (name) subject.name = name.trim();
  if (code) subject.code = code.trim().toUpperCase();
  if (typeof isActive === "boolean") subject.isActive = isActive;

  await subject.save();
  await subject.populate("program", "name code");
  await subject.populate("semester", "name code number");

  res.status(200).json({
    success: true,
    message: "Subject updated successfully.",
    data: { subject },
  });
});

export const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);

  if (!subject) {
    res.status(404);
    throw new Error("Subject not found.");
  }

  await Subject.deleteOne({ _id: subject._id });

  res.status(200).json({
    success: true,
    message: "Subject deleted successfully.",
  });
});
