const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const Student = require("./models/Student");
const Mark = require("./models/Mark");
const Attendance = require("./models/Attendance");
const Remark = require("./models/Remark");
const User = require("./models/User");

const app = express();

app.use(cors());
app.use(express.json());


// ==================== MONGODB ====================

mongoose
  .connect("mongodb://localhost:27017/student_report_db")
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error);
  });


// ==================== TEST ====================

app.get("/", (req, res) => {
  res.send("Student Report System Backend is running!");
});


// ==================== LOGIN ====================

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      username: username,
      password: password
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    res.json({
      message: "Login successful",

      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        studentName: user.studentName
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Login error",
      error: error.message
    });
  }
});


// ==================== STUDENTS ====================

// Add Student

app.post("/students", async (req, res) => {
  try {

    const student = new Student(req.body);

    const savedStudent = await student.save();

    res.status(201).json(savedStudent);

  } catch (error) {

    res.status(400).json({
      message: "Error saving student",
      error: error.message
    });

  }
});


// Get all Students

app.get("/students", async (req, res) => {
  try {

    const students = await Student.find();

    res.json(students);

  } catch (error) {

    res.status(500).json({
      message: "Error fetching students",
      error: error.message
    });

  }
});


// Update Student

app.put("/students/:id", async (req, res) => {
  try {

    const updatedStudent =
      await Student.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      );

    res.json(updatedStudent);

  } catch (error) {

    res.status(500).json({
      message: "Error updating student",
      error: error.message
    });

  }
});


// Delete Student

app.delete("/students/:id", async (req, res) => {
  try {

    await Student.findByIdAndDelete(req.params.id);

    res.json({
      message: "Student deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: "Error deleting student",
      error: error.message
    });

  }
});


// ==================== MARKS ====================

// Add Mark

app.post("/marks", async (req, res) => {
  try {

    const mark = new Mark(req.body);

    const savedMark = await mark.save();

    res.status(201).json(savedMark);

  } catch (error) {

    res.status(400).json({
      message: "Error saving mark",
      error: error.message
    });

  }
});


// Get all Marks

app.get("/marks", async (req, res) => {
  try {

    const marks = await Mark.find();

    res.json(marks);

  } catch (error) {

    res.status(500).json({
      message: "Error fetching marks",
      error: error.message
    });

  }
});


// Delete Mark

app.delete("/marks/:id", async (req, res) => {
  try {

    await Mark.findByIdAndDelete(req.params.id);

    res.json({
      message: "Mark deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: "Error deleting mark",
      error: error.message
    });

  }
});


// ==================== ATTENDANCE ====================

// Add Attendance

app.post("/attendance", async (req, res) => {
  try {

    const attendance = new Attendance(req.body);

    const savedAttendance = await attendance.save();

    res.status(201).json(savedAttendance);

  } catch (error) {

    res.status(400).json({
      message: "Error saving attendance",
      error: error.message
    });

  }
});


// Get all Attendance

app.get("/attendance", async (req, res) => {
  try {

    const attendance = await Attendance.find();

    res.json(attendance);

  } catch (error) {

    res.status(500).json({
      message: "Error fetching attendance",
      error: error.message
    });

  }
});


// Delete Attendance

app.delete("/attendance/:id", async (req, res) => {
  try {

    await Attendance.findByIdAndDelete(req.params.id);

    res.json({
      message: "Attendance deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: "Error deleting attendance",
      error: error.message
    });

  }
});


// ==================== REMARKS ====================

// Add Remark

app.post("/remarks", async (req, res) => {
  try {

    const remark = new Remark(req.body);

    const savedRemark = await remark.save();

    res.status(201).json(savedRemark);

  } catch (error) {

    res.status(400).json({
      message: "Error saving remark",
      error: error.message
    });

  }
});


// Get all Remarks

app.get("/remarks", async (req, res) => {
  try {

    const remarks = await Remark.find();

    res.json(remarks);

  } catch (error) {

    res.status(500).json({
      message: "Error fetching remarks",
      error: error.message
    });

  }
});


// Delete Remark

app.delete("/remarks/:id", async (req, res) => {
  try {

    await Remark.findByIdAndDelete(req.params.id);

    res.json({
      message: "Remark deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: "Error deleting remark",
      error: error.message
    });

  }
});


// ==================== SERVER ====================

const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});