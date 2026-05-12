import { body, query } from "express-validator";
import mongoose from "mongoose";

const objectId = (field) =>
  body(field)
    .notEmpty()
    .withMessage(`${field} is required`)
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage(`${field} must be a valid ObjectId`);

export const markAttendanceValidator = [
  objectId("classId"),
  objectId("sessionId"),
  body("token").trim().notEmpty().withMessage("QR token is required"),
];

export const attendanceQueryValidator = [
  query("classId")
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("classId must be a valid ObjectId"),
  query("date").optional().isISO8601().withMessage("date must use ISO-8601 format"),
];
