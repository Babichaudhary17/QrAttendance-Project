import { body } from "express-validator";
import mongoose from "mongoose";

export const registerValidator = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
    .withMessage("Password must be at least 8 characters and include upper, lower, number, and symbol characters"),
  body("role").isIn(["admin", "teacher", "student"]).withMessage("Invalid role"),
  body("classId")
    .if(body("role").equals("student"))
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Class must be a valid ObjectId"),
  body("classCode").optional().trim().isLength({ min: 3 }).withMessage("Class code is invalid"),
  body("studentClass").optional().trim(),
];

export const loginValidator = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const changePasswordValidator = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
    .withMessage("New password must be at least 8 characters and include upper, lower, number, and symbol characters"),
];
