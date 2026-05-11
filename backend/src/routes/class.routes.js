import { Router } from "express";
import {
  addStudentToClass,
  createClass,
  deleteClass,
  getStudentClasses,
  getTeacherClasses,
  removeStudentFromClass,
  getAllClasses,
  getClassById,
  updateClass,
} from "../controllers/class.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createClassValidator, addStudentValidator } from "../validators/class.validator.js";

const router = Router();

router.use(protect);

router.get("/teacher", authorize("teacher", "admin"), getTeacherClasses);
router.get("/student", authorize("student", "admin"), getStudentClasses);
router.get("/", authorize("admin"), getAllClasses);
router.get("/:id", authorize("teacher", "admin"), getClassById);
router.put("/:id", authorize("teacher", "admin"), updateClass);
router.post("/", authorize("teacher", "admin"), validate(createClassValidator), createClass);
router.delete("/:classId", authorize("teacher", "admin"), deleteClass);
router.post("/:classId/students", authorize("teacher", "admin"), validate(addStudentValidator), addStudentToClass);
router.delete(
  "/:classId/students/:studentId",
  authorize("teacher", "admin"),
  removeStudentFromClass
);

export default router;
