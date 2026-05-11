import { Router } from "express";
import { createQrSession } from "../controllers/session.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);
router.post("/:classId", authorize("teacher"), createQrSession);

export default router;
