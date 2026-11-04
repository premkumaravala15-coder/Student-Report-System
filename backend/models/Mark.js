
const mongoose = require("mongoose");

const markSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

markSchema.pre("validate", function () {
  if (this.marksObtained > this.totalMarks) {
    this.invalidate(
      "marksObtained",
      "Marks obtained cannot exceed total marks."
    );
  }
});

module.exports = mongoose.model("Mark", markSchema);
