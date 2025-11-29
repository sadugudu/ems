const Classroom = require("../models/classroom");
const User = require("../models/user");
const Attendance = require("../models/Attendance");
const { generateSeating } = require("../utils/seating");

// get assigned hall seating
async function myHall(req, res) {
  try {
    const teacher = req.user;
    if (!teacher.assignedClassroom) return res.status(404).json({ error: "No assigned classroom" });
    const cls = await Classroom.findById(teacher.assignedClassroom);
    if (!cls) return res.status(404).json({ error: "Classroom not found" });

    const students = await User.find({ role: "student", className: { $in: cls.classesAllowed } }).sort({ className: 1, rollNumber: 1 }).lean();
    const seating = generateSeating(cls.toObject(), students);
    res.json({ classroom: cls.name, seating });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function markAttendance(req, res) {
  try {
    const { studentId, status } = req.body; // status: present/absent
    const teacher = req.user;
    const att = new Attendance({ classroom: teacher.assignedClassroom, teacher: teacher._id, student: studentId, status });
    await att.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { myHall, markAttendance };
