import { Router } from "express";
import { createQrSession } from "../controllers/session.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";
import { validateObjectId } from "../middleware/objectId.middleware.js";

const router = Router();

router.use(protect);
router.post("/:classId", authorize("teacher", "admin"), validateObjectId("classId"), createQrSession);

export default router;
