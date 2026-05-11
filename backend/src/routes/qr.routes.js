import { Router } from "express";
import { createQrSession } from "../controllers/session.controller.js";
import { markAttendance } from "../controllers/attendance.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

// Generate QR Code for a class session
router.post("/generate/:classId", authorize("teacher"), createQrSession);

// Scan QR Code to mark attendance
router.post("/scan", authorize("student"), markAttendance);

export default router;
