
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Mark = require("./models/Mark");
const Attendance = require("./models/Attendance");
const Remark = require("./models/Remark");

const app = express();

app.use(cors());
app.use(express.json());

// Vercel routes requests with the /api prefix. Remove that prefix so the
// existing Express routes (/students, /marks, /attendance, /remarks) match.
app.use((req, res, next) => {
  if (req.url === "/api") {
    req.url = "/";
  } else if (req.url.startsWith("/api/")) {
    req.url = req.url.slice(4);
  }
  next();
});

// MongoDB connection. Set MONGO_URI in Vercel and in backend/.env locally.
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/student_report_db";

let mongoConnectionPromise;

async function connectToDatabase(req, res, next) {
  try {
    if (mongoose.connection.readyState === 1) {
      return next();
    }

    if (!mongoConnectionPromise) {
      mongoConnectionPromise = mongoose.connect(MONGO_URI).catch((error) => {
        mongoConnectionPromise = null;
        throw error;
      });
    }

    await mongoConnectionPromise;
    next();
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    res.status(500).json({ message: "Database connection failed." });
  }
}

app.use(connectToDatabase);

// Student schema
const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rollNumber: { type: String, required: true, unique: true },
    className: { type: String, required: true },
    email: { type: String, required: true },
  },
  { timestamps: true }
);

const Student =
  mongoose.models.Student ||
  mongoose.model("Student", studentSchema);

// Test route
app.get("/", (req, res) => {
  res.send("Student Report System Backend is running!");
});

// ================= STUDENTS API =================

// Get all students
app.get("/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add student
app.post("/students", async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({
      message: error.code === 11000
        ? "Roll number already exists"
        : error.message,
    });
  }
});

// Update student
app.put("/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete student
app.delete("/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ================= MARKS API =================

// Get all marks
app.get("/marks", async (req, res) => {
  try {
    const marks = await Mark.find().populate(
      "studentId",
      "name rollNumber className"
    );
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add marks
app.post("/marks", async (req, res) => {
  try {
    const { studentId, subject, marksObtained, totalMarks } = req.body;

    if (
      !mongoose.isValidObjectId(studentId) ||
      !subject?.trim() ||
      !Number.isFinite(Number(marksObtained)) ||
      !Number.isFinite(Number(totalMarks)) ||
      Number(marksObtained) < 0 ||
      Number(totalMarks) <= 0 ||
      Number(marksObtained) > Number(totalMarks)
    ) {
      return res.status(400).json({ message: "Enter valid marks details." });
    }

    const mark = await Mark.create({
      studentId,
      subject: subject.trim(),
      marksObtained: Number(marksObtained),
      totalMarks: Number(totalMarks),
    });

    const savedMark = await Mark.findById(mark._id).populate(
      "studentId",
      "name rollNumber className"
    );

    res.status(201).json(savedMark);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update marks
app.put("/marks/:id", async (req, res) => {
  try {
    const mark = await Mark.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("studentId", "name rollNumber className");

    if (!mark) {
      return res.status(404).json({ message: "Mark record not found." });
    }

    res.json(mark);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete marks
app.delete("/marks/:id", async (req, res) => {
  try {
    const mark = await Mark.findByIdAndDelete(req.params.id);

    if (!mark) {
      return res.status(404).json({ message: "Mark record not found." });
    }

    res.json({ message: "Marks deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= ATTENDANCE API =================

// Get attendance
app.get("/attendance", async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate("studentId", "name rollNumber className")
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add attendance
app.post("/attendance", async (req, res) => {
  try {
    const { studentId, date, status } = req.body;

    if (
      !mongoose.isValidObjectId(studentId) ||
      !date ||
      !["Present", "Absent"].includes(status)
    ) {
      return res.status(400).json({
        message: "Enter valid attendance details.",
      });
    }

    const record = await Attendance.create({
      studentId,
      date: new Date(date),
      status,
    });

    const savedRecord = await Attendance.findById(record._id).populate(
      "studentId",
      "name rollNumber className"
    );

    res.status(201).json(savedRecord);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update attendance
app.put("/attendance/:id", async (req, res) => {
  try {
    const record = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("studentId", "name rollNumber className");

    if (!record) {
      return res.status(404).json({
        message: "Attendance record not found.",
      });
    }

    res.json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete attendance
app.delete("/attendance/:id", async (req, res) => {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({
        message: "Attendance record not found.",
      });
    }

    res.json({ message: "Attendance deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= REMARKS API =================

// Get remarks
app.get("/remarks", async (req, res) => {
  try {
    const remarks = await Remark.find()
      .populate("studentId", "name rollNumber className")
      .sort({ date: -1 });

    res.json(remarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add remark
app.post("/remarks", async (req, res) => {
  try {
    const { studentId, subject, remark, date } = req.body;

    if (
      !mongoose.isValidObjectId(studentId) ||
      !subject?.trim() ||
      !remark?.trim()
    ) {
      return res.status(400).json({
        message: "Enter valid remark details.",
      });
    }

    const newRemark = await Remark.create({
      studentId,
      subject: subject.trim(),
      remark: remark.trim(),
      date: date ? new Date(date) : new Date(),
    });

    const savedRemark = await Remark.findById(newRemark._id).populate(
      "studentId",
      "name rollNumber className"
    );

    res.status(201).json(savedRemark);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update remark
app.put("/remarks/:id", async (req, res) => {
  try {
    const updatedRemark = await Remark.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("studentId", "name rollNumber className");

    if (!updatedRemark) {
      return res.status(404).json({ message: "Remark not found." });
    }

    res.json(updatedRemark);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete remark
app.delete("/remarks/:id", async (req, res) => {
  try {
    const deletedRemark = await Remark.findByIdAndDelete(req.params.id);

    if (!deletedRemark) {
      return res.status(404).json({ message: "Remark not found." });
    }

    res.json({ message: "Remark deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export the Express app for Vercel. Start a local HTTP server only when
// this file is run directly with "node server.js".
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
}

module.exports = app;
