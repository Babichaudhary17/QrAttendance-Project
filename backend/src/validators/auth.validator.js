import { body } from "express-validator";
import mongoose from "mongoose";

export const registerValidator = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
    .withMessage("Password must be at least 8 characters and include upper, lower, number, and symbol characters"),
  body("role")
    .isIn(["teacher", "student"])
    .withMessage("Public registration is only available for teacher and student accounts"),
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

export const adminCredentialsValidator = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .optional({ checkFalsy: true })
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
    .withMessage("New password must be at least 8 characters and include upper, lower, number, and symbol characters"),
];

export const forgotPasswordValidator = [
  body("email").isEmail().withMessage("Valid email is required"),
];

export const verifyOtpValidator = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("code")
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage("Verification code must be exactly 6 digits"),
];

export const resetPasswordValidator = [
  body("resetToken").notEmpty().withMessage("Reset token is required"),
  body("newPassword")
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
    .withMessage("Password must be at least 8 characters and include upper, lower, number, and symbol characters"),
];
