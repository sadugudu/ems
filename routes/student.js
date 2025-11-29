const express = require("express");
const router = express.Router();
const studentCtrl = require("../controllers/studentController");
const { authMiddleware, requireRole } = require("../middleware/auth");

router.get("/myseat", authMiddleware, requireRole("student"), studentCtrl.mySeat);

module.exports = router;
