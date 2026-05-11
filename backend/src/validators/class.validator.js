import { body } from "express-validator";

export const createClassValidator = [
  body("name").trim().notEmpty().withMessage("Class name is required"),
  body("subject").optional().trim(),
];

export const addStudentValidator = [
  body("studentId").trim().notEmpty().withMessage("Student ID is required"),
  body("name").optional().trim(),
  body("email").optional().isEmail().withMessage("Must be a valid email"),
];
