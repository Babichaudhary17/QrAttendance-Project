import { body, query } from "express-validator";
import mongoose from "mongoose";

export const markAttendanceValidator = [
  body("token")
    .trim()
    .notEmpty()
    .withMessage("QR token is required")
    .isUUID(4)
    .withMessage("QR token must be a valid session id."),
];

export const attendanceQueryValidator = [
  query("classId")
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("classId must be a valid ObjectId"),
  query("date").optional().isISO8601().withMessage("date must use ISO-8601 format"),
];
