// seed.js
const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = require("./config/db");
const User = require("./models/user");
const Classroom = require("./models/classroom");
const bcrypt = require("bcrypt");

async function seed() {
  await connectDB();

  // admin
  if (!await User.findOne({ username: "admin" })) {
    const h = await bcrypt.hash("admin123", 10);
    const admin = new User({ username: "admin", password: h, fullName: "Administrator", role: "admin" });
    await admin.save();
    console.log("admin created");
  }

  // sample classroom
  if (!await Classroom.findOne({ name: "B-101" })) {
    const cls = new Classroom({
      name: "B-101",
      rows: 5,
      benchesPerRow: 2,
      seatsPerBench: 2,
      capacity: 20,
      pattern: "gap",
      gap: 2,
      classesAllowed: ["CSE-A","CSE-B","CSE-C"]
    });
    await cls.save();
    console.log("classroom created");
  }

  // create teachers
  if (!await User.findOne({ username: "teacher1" })) {
    const h = await bcrypt.hash("teach123", 10);
    const t = new User({ username: "teacher1", password: h, fullName: "T One", role: "teacher" });
    await t.save();
    console.log("teacher1 created");
  }

  // create some students across classes
  const existing = await User.findOne({ username: "s1" });
  if (!existing) {
    let students = [];
    let idx = 1;
    for (let clsName of ["CSE-A","CSE-B","CSE-C"]) {
      for (let r = 1; r <= (clsName==="CSE-A"?8:(clsName==="CSE-B"?7:5)); r++) {
        const username = `s${idx}`;
        const pwd = await bcrypt.hash("student123", 10);
        students.push({ username, password: pwd, fullName: `${clsName}-Student-${r}`, role: "student", rollNumber: r, className: clsName });
        idx++;
      }
    }
    await User.insertMany(students);
    console.log("students created");
  }

  console.log("Seed done");
  process.exit(0);
}

seed();
