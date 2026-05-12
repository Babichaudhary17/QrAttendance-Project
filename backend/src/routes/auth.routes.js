import { Router } from "express";
import { changePassword, getMe, loginUser, registerUser } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/security.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { changePasswordValidator, registerValidator, loginValidator } from "../validators/auth.validator.js";

const router = Router();

router.post("/register", authLimiter, validate(registerValidator), registerUser);
router.post("/login", authLimiter, validate(loginValidator), loginUser);
router.get("/me", protect, getMe);
router.post("/change-password", protect, validate(changePasswordValidator), changePassword);

export default router;
