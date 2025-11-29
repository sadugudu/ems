const Classroom = require("../models/classroom");
const User = require("../models/user");
const { generateSeating } = require("../utils/seating");

async function mySeat(req, res) {
  try {
    const student = req.user;
    // find a classroom that includes student's className
    const cls = await Classroom.findOne({ classesAllowed: student.className });
    if (!cls) return res.status(404).json({ error: "No classroom found for your class" });

    const students = await User.find({ role: "student", className: { $in: cls.classesAllowed } }).sort({ className: 1, rollNumber: 1 }).lean();
    const seating = generateSeating(cls.toObject(), students);

    // find seat where student.id matches
    const seat = seating.find(s => s.student && String(s.student.id) === String(student._id));
    if (!seat) return res.status(404).json({ error: "Seat not assigned" });
    res.json({ classroom: cls.name, seat });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { mySeat };
