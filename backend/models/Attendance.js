const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  student: {
    type: String,
    required: true
  },

  totalClasses: {
    type: Number,
    required: true
  },

  present: {
    type: Number,
    required: true
  },

  absent: {
    type: Number,
    required: true
  },

  percentage: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model("Attendance", attendanceSchema);