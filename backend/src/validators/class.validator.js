import { body } from "express-validator";
import mongoose from "mongoose";

export const createClassValidator = [
  body("name").trim().notEmpty().withMessage("Class name is required"),
  body("subject").optional().trim(),
  body("classCode").optional().trim().isLength({ min: 3 }).withMessage("Class code is invalid"),
  body("isActive").optional().isBoolean().withMessage("isActive must be true or false"),
  body("teacherId")
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Teacher ID must be a valid ObjectId"),
];

export const addStudentValidator = [
  body("studentId").trim().notEmpty().withMessage("Student ID is required"),
  body("name").optional().trim(),
  body("email").optional().isEmail().withMessage("Must be a valid email"),
];
