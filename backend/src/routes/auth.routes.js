import { Router } from "express";
import { getMe, loginUser, registerUser } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerValidator, loginValidator } from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validate(registerValidator), registerUser);
router.post("/login", validate(loginValidator), loginUser);
router.get("/me", protect, getMe);

export default router;
