import { Router } from "express";
import { getAllUsers, deleteUser, getDashboardStats } from "../controllers/admin.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);
router.use(authorize("admin"));

router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.get("/dashboard", getDashboardStats);

export default router;
