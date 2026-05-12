import { Router } from "express";
import {
  getAttendance,
  markAttendance,
  getAnalytics,
  getReport,
} from "../controllers/attendance.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";
import { validateObjectId } from "../middleware/objectId.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { attendanceQueryValidator, markAttendanceValidator } from "../validators/attendance.validator.js";

const router = Router();

router.use(protect);
router.get("/", validate(attendanceQueryValidator), getAttendance);
router.get("/analytics", getAnalytics);
router.get("/report/:classId", authorize("teacher", "admin"), validateObjectId("classId"), getReport);
router.post("/mark", authorize("student"), validate(markAttendanceValidator), markAttendance);

export default router;
