const mongoose = require("mongoose");

const markSchema = new mongoose.Schema({
  student: {
    type: String,
    required: true
  },

  subject: {
    type: String,
    required: true
  },

  exam: {
    type: String,
    required: true
  },

  mark: {
    type: Number,
    required: true
  },

  total: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model("Mark", markSchema);