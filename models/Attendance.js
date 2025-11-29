const mongoose = require("mongoose");
const { Schema } = mongoose;
const AttendanceSchema = new Schema({
  classroom: { type: Schema.Types.ObjectId, ref: "Classroom" },
  teacher: { type: Schema.Types.ObjectId, ref: "User" },
  student: { type: Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["present","absent"], default: "present" },
  timestamp: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Attendance", AttendanceSchema);
