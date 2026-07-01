import { Router } from "express";
import { changePassword, getMe, loginUser, registerUser, updateAdminCredentials } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { adminCredentialsValidator, changePasswordValidator, registerValidator, loginValidator } from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validate(registerValidator), registerUser);
router.post("/login", validate(loginValidator), loginUser);
router.get("/me", protect, getMe);
router.post("/change-password", protect, validate(changePasswordValidator), changePassword);
router.patch("/admin-credentials", protect, validate(adminCredentialsValidator), updateAdminCredentials);

export default router;
