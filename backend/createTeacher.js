
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function createTeacher() {
  try {
    await mongoose.connect(
      "mongodb://127.0.0.1:27017/student_report_db"
    );

    const email = "teacher@example.com";
    const password = "Teacher@123";

    const existingTeacher = await User.findOne({ email });

    if (existingTeacher) {
      console.log("Teacher account already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: "Main Teacher",
      email,
      password: hashedPassword,
      role: "teacher",
    });

    console.log("Teacher account created successfully.");
    console.log("Email:", email);
    console.log("Password:", password);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createTeacher();
