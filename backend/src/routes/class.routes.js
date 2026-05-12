import { Router } from "express";
import {
  addStudentToClass,
  createClass,
  deleteClass,
  getEnrollmentClasses,
  getClassInvite,
  getStudentClasses,
  getTeacherClasses,
  joinClassByCode,
  removeStudentFromClass,
  getAllClasses,
  getClassById,
  updateClass,
} from "../controllers/class.controller.js";
import { protect, authorize, authorizeStudentClassAccess } from "../middleware/auth.middleware.js";
import { validateObjectId } from "../middleware/objectId.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createClassValidator, addStudentValidator } from "../validators/class.validator.js";

const router = Router();

router.get("/enrollment-options", getEnrollmentClasses);

router.use(protect);

router.get("/teacher", authorize("teacher", "admin"), getTeacherClasses);
router.get("/student", authorize("student", "admin"), getStudentClasses);
router.get("/join/:classCode", authorize("student"), getClassInvite);
router.post("/join/:classCode", authorize("student"), joinClassByCode);
router.get("/", authorize("admin"), getAllClasses);
router.get("/:id", authorize("teacher", "student", "admin"), validateObjectId("id"), authorizeStudentClassAccess("id"), getClassById);
router.put("/:id", authorize("teacher", "admin"), validateObjectId("id"), updateClass);
router.post("/", authorize("teacher", "admin"), validate(createClassValidator), createClass);
router.delete("/:classId", authorize("teacher", "admin"), validateObjectId("classId"), deleteClass);
router.post(
  "/:classId/students",
  authorize("teacher", "admin"),
  validateObjectId("classId"),
  validate(addStudentValidator),
  addStudentToClass
);
router.delete(
  "/:classId/students/:studentId",
  authorize("teacher", "admin"),
  validateObjectId("classId"),
  removeStudentFromClass
);

export default router;
