import { Router } from "express";
import {
  getAttendance,
  markAttendance,
  getAnalytics,
  getReport,
} from "../controllers/attendance.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);
router.get("/", getAttendance);
router.get("/analytics", getAnalytics);
router.get("/report/:classId", authorize("teacher", "admin"), getReport);
router.post("/mark", authorize("student"), markAttendance);

export default router;
