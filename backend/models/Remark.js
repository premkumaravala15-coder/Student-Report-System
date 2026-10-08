const mongoose = require("mongoose");

const remarkSchema = new mongoose.Schema({
  student: {
    type: String,
    required: true
  },

  remark: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Remark", remarkSchema);