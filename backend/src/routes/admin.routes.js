import { Router } from "express";
import { getAllUsers, deleteUser, getDashboardStats } from "../controllers/admin.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { validateObjectId } from "../middleware/objectId.middleware.js";
import { adminLimiter } from "../middleware/security.middleware.js";

const router = Router();

router.use(protect);
router.use(authorize("admin"));
router.use(adminLimiter);

router.get("/users", getAllUsers);
router.delete("/users/:id", validateObjectId("id"), deleteUser);
router.get("/dashboard", getDashboardStats);

export default router;
