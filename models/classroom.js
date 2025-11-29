const mongoose = require("mongoose");
const { Schema } = mongoose;

const ClassroomSchema = new Schema({
  name: { type: String, unique: true },        // "B-101"
  rows: { type: Number, default: 0 },
  benchesPerRow: { type: Number, default: 0 }, // benches in one row
  seatsPerBench: { type: Number, default: 2 }, // typically 2
  capacity: { type: Number, default: 0 },      // must be <= rows*benchesPerRow*seatsPerBench
  pattern: { type: String, enum: ["normal","gap","zigzag"], default: "normal" },
  gap: { type: Number, default: 0 },
  classesAllowed: { type: [String], default: [] } // multiple classes
}, { timestamps: true });

module.exports = mongoose.model("Classroom", ClassroomSchema);
