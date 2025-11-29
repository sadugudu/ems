const Classroom = require("../models/classroom");
const User = require("../models/user");
const { generateSeating } = require("../utils/seating");
const mongoose = require("mongoose");

// create classroom
async function createClassroom(req, res) {
  try {
    const { name, rows, benchesPerRow, seatsPerBench, capacity, pattern, gap, classesAllowed } = req.body;
    const calcCap = rows * benchesPerRow * seatsPerBench;
    if (capacity > calcCap) return res.status(400).json({ error: `capacity ${capacity} exceeds max ${calcCap}` });

    const c = new Classroom({
      name,
      rows,
      benchesPerRow,
      seatsPerBench,
      capacity,
      pattern,
      gap,
      classesAllowed
    });
    await c.save();
    res.json({ ok: true, id: c._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function listClassrooms(req, res) {
  try {
    const list = await Classroom.find({});
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// generate seating for classroomId
async function generateSeatingForClassroom(req, res) {
  try {
    const classroomId = req.params.id;
    const cls = await Classroom.findById(classroomId);
    if (!cls) return res.status(404).json({ error: "Classroom not found" });

    // fetch students whose className is in cls.classesAllowed (sorted by class then roll)
    const students = await User.find({
      role: "student",
      className: { $in: cls.classesAllowed }
    }).sort({ className: 1, rollNumber: 1 }).lean();

    const seating = generateSeating(cls.toObject(), students);
    res.json({ classroom: cls.name, seating });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// bulk upload students (simple array)
async function bulkCreateStudents(req, res) {
  try {
    const list = req.body.students; // [{username,password,fullName,rollNumber,className},...]
    if (!Array.isArray(list)) return res.status(400).json({ error: "students array required" });
    const created = [];
    for (let s of list) {
      const exists = await User.findOne({ username: s.username });
      if (exists) continue;
      const bcrypt = require("bcrypt");
      const hash = await bcrypt.hash(s.password || "student123", 10);
      const user = new User({ username: s.username, password: hash, fullName: s.fullName, role: "student", rollNumber: s.rollNumber, className: s.className });
      await user.save();
      created.push(user);
    }
    res.json({ ok: true, created: created.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// assign teacher to classroom
async function assignTeacher(req, res) {
  try {
    const { teacherId, classroomId } = req.body;
    const teacher = await User.findById(teacherId);
    const cls = await Classroom.findById(classroomId);
    if (!teacher || teacher.role !== "teacher") return res.status(400).json({ error: "teacher not found or role mismatch" });
    if (!cls) return res.status(400).json({ error: "classroom not found" });
    teacher.assignedClassroom = cls._id;
    await teacher.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createClassroom, listClassrooms, generateSeatingForClassroom, bulkCreateStudents, assignTeacher };
