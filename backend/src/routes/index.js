import { Router } from "express";
import authRoutes from "./auth.routes.js";
import attendanceRoutes from "./attendance.routes.js";
import classRoutes from "./class.routes.js";
import healthRoutes from "./health.routes.js";
import sessionRoutes from "./session.routes.js";
import adminRoutes from "./admin.routes.js";
import academicRoutes from "./academic.routes.js";
import { authLimiter } from "../middleware/security.middleware.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authLimiter, authRoutes);
router.use("/classes", classRoutes);
router.use("/sessions", sessionRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/admin", adminRoutes);
router.use("/academic", academicRoutes);

export default router;
