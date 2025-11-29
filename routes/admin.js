const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authMiddleware, requireRole } = require("../middleware/auth");

router.post(
  "/classrooms",
  authMiddleware,
  requireRole("admin"),
  adminController.createClassroom
);

router.get(
  "/classrooms",
  authMiddleware,
  requireRole("admin"),
  adminController.listClassrooms
);

router.get(
  "/classrooms/:id/generate",
  authMiddleware,
  requireRole("admin"),
  adminController.generateSeatingForClassroom
);

router.post(
  "/students/bulk",
  authMiddleware,
  requireRole("admin"),
  adminController.bulkCreateStudents
);

router.post(
  "/assign-teacher",
  authMiddleware,
  requireRole("admin"),
  adminController.assignTeacher
);

module.exports = router;
