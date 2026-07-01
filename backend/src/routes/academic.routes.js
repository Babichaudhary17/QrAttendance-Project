import { Router } from "express";
import {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
  createProgram,
  getPrograms,
  updateProgram,
  deleteProgram,
  createSemester,
  getSemesters,
  updateSemester,
  deleteSemester,
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
} from "../controllers/academic.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { validateObjectId } from "../middleware/objectId.middleware.js";

const router = Router();

// Read operations are allowed for any authenticated user (e.g. students registering or teachers viewing)
router.get("/departments", protect, getDepartments);
router.get("/programs", protect, getPrograms);
router.get("/semesters", protect, getSemesters);
router.get("/subjects", protect, getSubjects);

// Write operations are strictly restricted to Admins
router.post("/departments", protect, authorize("admin"), createDepartment);
router.put("/departments/:id", protect, authorize("admin"), validateObjectId("id"), updateDepartment);
router.delete("/departments/:id", protect, authorize("admin"), validateObjectId("id"), deleteDepartment);

router.post("/programs", protect, authorize("admin"), createProgram);
router.put("/programs/:id", protect, authorize("admin"), validateObjectId("id"), updateProgram);
router.delete("/programs/:id", protect, authorize("admin"), validateObjectId("id"), deleteProgram);

router.post("/semesters", protect, authorize("admin"), createSemester);
router.put("/semesters/:id", protect, authorize("admin"), validateObjectId("id"), updateSemester);
router.delete("/semesters/:id", protect, authorize("admin"), validateObjectId("id"), deleteSemester);

router.post("/subjects", protect, authorize("admin"), createSubject);
router.put("/subjects/:id", protect, authorize("admin"), validateObjectId("id"), updateSubject);
router.delete("/subjects/:id", protect, authorize("admin"), validateObjectId("id"), deleteSubject);

export default router;
