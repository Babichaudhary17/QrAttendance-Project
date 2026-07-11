import { Router } from "express";
import { changePassword, getMe, loginUser, logoutUser, registerUser, updateAdminCredentials, forgotPassword, verifyOtp, resetPassword } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { adminCredentialsValidator, changePasswordValidator, registerValidator, loginValidator, forgotPasswordValidator, verifyOtpValidator, resetPasswordValidator } from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validate(registerValidator), registerUser);
router.post("/login", validate(loginValidator), loginUser);
router.post("/logout", protect, logoutUser);
router.get("/me", protect, getMe);
router.post("/change-password", protect, validate(changePasswordValidator), changePassword);
router.patch("/admin-credentials", protect, validate(adminCredentialsValidator), updateAdminCredentials);

// Forgot Password flow (public — no protect middleware)
router.post("/forgot-password", validate(forgotPasswordValidator), forgotPassword);
router.post("/verify-otp", validate(verifyOtpValidator), verifyOtp);
router.post("/reset-password", validate(resetPasswordValidator), resetPassword);

export default router;
