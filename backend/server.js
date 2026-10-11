
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const Mark = require("./models/Mark");
const Attendance = require("./models/Attendance");
const Remark = require("./models/Remark");

const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/student_report_db";

if (!JWT_SECRET) {
  console.error("ERROR: JWT_SECRET is missing in backend/.env");
  process.exit(1);
}

// --------------------------------------------------
// STUDENT MODEL
// --------------------------------------------------

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    className: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

const Student =
  mongoose.models.Student ||
  mongoose.model("Student", studentSchema);

// --------------------------------------------------
// TEST BACKEND
// --------------------------------------------------

app.get("/", (req, res) => {
  res.send("Student Report System Backend is running!");
});

// --------------------------------------------------
// LOGIN API
// Teacher: email and password
// Student/Parent: username and password
// --------------------------------------------------

app.post("/login", async (req, res) => {
  try {
    const { email, username, password, role } = req.body;

    if (!password || !role) {
      return res.status(400).json({
        message: "Login details and password are required.",
      });
    }

    if (!["teacher", "student", "parent"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role.",
      });
    }

    let user;

    if (role === "teacher") {
      const normalizedEmail = String(email || "")
        .trim()
        .toLowerCase();

      if (!normalizedEmail) {
        return res.status(400).json({
          message: "Teacher email is required.",
        });
      }

      user = await User.findOne({
        email: normalizedEmail,
        role: "teacher",
      });
    } else {
      const normalizedUsername = String(username || "")
        .trim()
        .toLowerCase();

      if (!normalizedUsername) {
        return res.status(400).json({
          message: "Username is required.",
        });
      }

      user = await User.findOne({
        username: normalizedUsername,
        role,
      });
    }

    if (!user) {
      return res.status(401).json({
        message: "Invalid username/email, password, or role.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid username/email, password, or role.",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        studentId: user.studentId,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server error during login.",
    });
  }
});

// --------------------------------------------------
// AUTHENTICATION MIDDLEWARE
// --------------------------------------------------

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Access denied. Please log in.",
    });
  }

  jwt.verify(token, JWT_SECRET, (error, decoded) => {
    if (error) {
      return res.status(403).json({
        message: "Invalid or expired token.",
      });
    }

    req.user = decoded;
    next();
  });
}

// --------------------------------------------------
// TEACHER-ONLY MIDDLEWARE
// --------------------------------------------------

function requireTeacher(req, res, next) {
  if (req.user?.role !== "teacher") {
    return res.status(403).json({
      message: "Teacher access only.",
    });
  }

  next();
}

// --------------------------------------------------
// CREATE STUDENT LOGIN ACCOUNT
// --------------------------------------------------

app.post(
  "/accounts/student",
  authenticateToken,
  requireTeacher,
  async (req, res) => {
    try {
      const { studentId, username, password } = req.body;

      if (!mongoose.isValidObjectId(studentId)) {
        return res.status(400).json({
          message: "Please select a valid student.",
        });
      }

      const normalizedUsername = String(username || "")
        .trim()
        .toLowerCase();

      if (!/^[a-z0-9._-]{3,30}$/.test(normalizedUsername)) {
        return res.status(400).json({
          message:
            "Username must be 3–30 characters and use letters, numbers, dots, underscores, or hyphens.",
        });
      }

      if (!password || password.length < 8) {
        return res.status(400).json({
          message: "Password must contain at least 8 characters.",
        });
      }

      const student = await Student.findById(studentId);

      if (!student) {
        return res.status(404).json({
          message: "Student not found.",
        });
      }

      const existingStudentAccount = await User.findOne({
        studentId: student._id,
        role: "student",
      });

      if (existingStudentAccount) {
        return res.status(409).json({
          message: "This student already has a login account.",
        });
      }

      const existingUsername = await User.findOne({
        username: normalizedUsername,
      });

      if (existingUsername) {
        return res.status(409).json({
          message: "Username is already taken. Choose another.",
        });
      }

      const normalizedEmail = student.email.trim().toLowerCase();

      const existingEmail = await User.findOne({
        email: normalizedEmail,
      });

      if (existingEmail) {
        return res.status(409).json({
          message:
            "An account already uses this student's email address.",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await User.create({
        name: student.name,
        username: normalizedUsername,
        email: normalizedEmail,
        password: hashedPassword,
        role: "student",
        studentId: student._id,
      });

      return res.status(201).json({
        message: "Student login account created successfully.",
        account: {
          id: user._id,
          name: user.name,
          username: user.username,
          role: user.role,
          studentId: user.studentId,
        },
      });
    } catch (error) {
      console.error("Student account error:", error);

      if (error.code === 11000) {
        return res.status(409).json({
          message: "Username or email already exists.",
        });
      }

      return res.status(500).json({
        message: "Unable to create student account.",
      });
    }
  }
);

// --------------------------------------------------
// CREATE PARENT LOGIN ACCOUNT
// Parent: username and password
// --------------------------------------------------

app.post(
  "/accounts/parent",
  authenticateToken,
  requireTeacher,
  async (req, res) => {
    try {
      const { studentId, name, username, password } = req.body;

      if (!mongoose.isValidObjectId(studentId)) {
        return res.status(400).json({
          message: "Please select a valid student.",
        });
      }

      if (!name?.trim()) {
        return res.status(400).json({
          message: "Parent name is required.",
        });
      }

      const normalizedUsername = String(username || "")
        .trim()
        .toLowerCase();

      if (!/^[a-z0-9._-]{3,30}$/.test(normalizedUsername)) {
        return res.status(400).json({
          message:
            "Username must be 3–30 characters and use letters, numbers, dots, underscores, or hyphens.",
        });
      }

      if (!password || password.length < 8) {
        return res.status(400).json({
          message: "Password must contain at least 8 characters.",
        });
      }

      const student = await Student.findById(studentId);

      if (!student) {
        return res.status(404).json({
          message: "Student not found.",
        });
      }

      const existingUsername = await User.findOne({
        username: normalizedUsername,
      });

      if (existingUsername) {
        return res.status(409).json({
          message: "Username is already taken. Choose another.",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await User.create({
        name: name.trim(),
        username: normalizedUsername,
        password: hashedPassword,
        role: "parent",
        studentId: student._id,
      });

      return res.status(201).json({
        message: "Parent login account created successfully.",
        account: {
          id: user._id,
          name: user.name,
          username: user.username,
          role: user.role,
          studentId: user.studentId,
        },
      });
    } catch (error) {
      console.error("Parent account error:", error);

      if (error.code === 11000) {
        return res.status(409).json({
          message: "Username already exists. Choose another.",
        });
      }

      return res.status(500).json({
        message: "Unable to create parent account.",
      });
    }
  }
);

// --------------------------------------------------
// PERSONAL PROGRESS REPORT
// --------------------------------------------------

app.get("/my-report", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(401).json({
        message: "User account not found. Please log in again.",
      });
    }

    if (!["student", "parent"].includes(user.role)) {
      return res.status(403).json({
        message:
          "This report is available to students and parents only.",
      });
    }

    if (!user.studentId) {
      return res.status(403).json({
        message: "Your account is not linked to a student.",
      });
    }

    const student = await Student.findById(user.studentId).select(
      "name rollNumber className email"
    );

    if (!student) {
      return res.status(404).json({
        message: "The linked student record was not found.",
      });
    }

    const [marks, attendance, remarks] = await Promise.all([
      Mark.find({ studentId: student._id })
        .select("studentId subject marksObtained totalMarks")
        .sort({ subject: 1 }),

      Attendance.find({ studentId: student._id })
        .select("studentId date status")
        .sort({ date: -1 }),

      Remark.find({ studentId: student._id })
        .select("studentId subject remark date")
        .sort({ date: -1 }),
    ]);

    return res.json({
      student,
      marks,
      attendance,
      remarks,
    });
  } catch (error) {
    console.error("Personal report error:", error);

    return res.status(500).json({
      message: "Unable to load your progress report.",
    });
  }
});

// --------------------------------------------------
// STUDENT CRUD APIs
// --------------------------------------------------

app.get(
  "/students",
  authenticateToken,
  requireTeacher,
  async (req, res) => {
    try {
      const students = await Student.find().sort({ createdAt: -1 });
      return res.json(students);
    } catch (error) {
      console.error("Get students error:", error);
      return res.status(500).json({ message: error.message });
    }
  }
);

app.post(
  "/students",
  authenticateToken,
  requireTeacher,
  async (req, res) => {
    try {
      const { name, rollNumber, className, email } = req.body;

      if (
        !name?.trim() ||
        !rollNumber ||
        !className?.trim() ||
        !email?.trim()
      ) {
        return res.status(400).json({
          message: "All student fields are required.",
        });
      }

      const student = await Student.create({
        name: name.trim(),
        rollNumber: String(rollNumber).trim(),
        className: String(className).trim(),
        email: email.trim().toLowerCase(),
      });

      return res.status(201).json(student);
    } catch (error) {
      console.error("Add student error:", error);

      return res.status(400).json({
        message:
          error.code === 11000
            ? "Roll number already exists."
            : error.message,
      });
    }
  }
);

app.put(
  "/students/:id",
  authenticateToken,
  requireTeacher,
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          message: "Invalid student ID.",
        });
      }

      const updates = { ...req.body };

      if (updates.email) {
        updates.email = updates.email.trim().toLowerCase();
      }

      const student = await Student.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );

      if (!student) {
        return res.status(404).json({
          message: "Student not found.",
        });
      }

      return res.json(student);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
);

app.delete(
  "/students/:id",
  authenticateToken,
  requireTeacher,
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          message: "Invalid student ID.",
        });
      }

      const student = await Student.findByIdAndDelete(req.params.id);

      if (!student) {
        return res.status(404).json({
          message: "Student not found.",
        });
      }

      return res.json({ message: "Student deleted successfully." });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

// --------------------------------------------------
// MARKS APIs
// --------------------------------------------------

app.get("/marks", authenticateToken, requireTeacher, async (req, res) => {
  try {
    const marks = await Mark.find()
      .populate("studentId", "name rollNumber className")
      .sort({ createdAt: -1 });

    return res.json(marks);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.post("/marks", authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { studentId, subject, marksObtained, totalMarks } = req.body;

    if (
      !mongoose.isValidObjectId(studentId) ||
      !subject?.trim() ||
      marksObtained === "" ||
      totalMarks === "" ||
      !Number.isFinite(Number(marksObtained)) ||
      !Number.isFinite(Number(totalMarks)) ||
      Number(marksObtained) < 0 ||
      Number(totalMarks) <= 0 ||
      Number(marksObtained) > Number(totalMarks)
    ) {
      return res.status(400).json({
        message: "Enter a valid student, subject, and marks.",
      });
    }

    const studentExists = await Student.exists({ _id: studentId });

    if (!studentExists) {
      return res.status(404).json({ message: "Student not found." });
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

    return res.status(201).json(savedMark);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.put("/marks/:id", authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { studentId, subject, marksObtained, totalMarks } = req.body;

    if (
      !mongoose.isValidObjectId(req.params.id) ||
      !mongoose.isValidObjectId(studentId) ||
      !subject?.trim() ||
      marksObtained === "" ||
      totalMarks === "" ||
      !Number.isFinite(Number(marksObtained)) ||
      !Number.isFinite(Number(totalMarks)) ||
      Number(marksObtained) < 0 ||
      Number(totalMarks) <= 0 ||
      Number(marksObtained) > Number(totalMarks)
    ) {
      return res.status(400).json({
        message: "Enter a valid student, subject, and marks.",
      });
    }

    const studentExists = await Student.exists({ _id: studentId });

    if (!studentExists) {
      return res.status(404).json({ message: "Student not found." });
    }

    const mark = await Mark.findByIdAndUpdate(
      req.params.id,
      {
        studentId,
        subject: subject.trim(),
        marksObtained: Number(marksObtained),
        totalMarks: Number(totalMarks),
      },
      { new: true, runValidators: true }
    ).populate("studentId", "name rollNumber className");

    if (!mark) {
      return res.status(404).json({ message: "Mark record not found." });
    }

    return res.json(mark);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.delete(
  "/marks/:id",
  authenticateToken,
  requireTeacher,
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid mark ID." });
      }

      const mark = await Mark.findByIdAndDelete(req.params.id);

      if (!mark) {
        return res.status(404).json({ message: "Mark record not found." });
      }

      return res.json({ message: "Marks deleted successfully." });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

// --------------------------------------------------
// ATTENDANCE APIs
// --------------------------------------------------

app.get(
  "/attendance",
  authenticateToken,
  requireTeacher,
  async (req, res) => {
    try {
      const records = await Attendance.find()
        .populate("studentId", "name rollNumber className")
        .sort({ date: -1 });

      return res.json(records);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

app.post(
  "/attendance",
  authenticateToken,
  requireTeacher,
  async (req, res) => {
    try {
      const { studentId, date, status } = req.body;

      if (!mongoose.isValidObjectId(studentId) || !date || !status) {
        return res.status(400).json({
          message: "Valid student, date, and status are required.",
        });
      }

      if (!["Present", "Absent"].includes(status)) {
        return res.status(400).json({
          message: "Status must be Present or Absent.",
        });
      }

      const studentExists = await Student.exists({ _id: studentId });

      if (!studentExists) {
        return res.status(404).json({ message: "Student not found." });
      }

      const attendanceDate = new Date(date);

      if (Number.isNaN(attendanceDate.getTime())) {
        return res.status(400).json({
          message: "Invalid attendance date.",
        });
      }

      attendanceDate.setUTCHours(0, 0, 0, 0);

      const record = await Attendance.create({
        studentId,
        date: attendanceDate,
        status,
      });

      const populatedRecord = await Attendance.findById(record._id)
        .populate("studentId", "name rollNumber className");

      return res.status(201).json(populatedRecord);
    } catch (error) {
      console.error("Add attendance error:", error);

      return res.status(400).json({
        message:
          error.code === 11000
            ? "Attendance is already recorded for this student on this date."
            : error.message,
      });
    }
  }
);

app.put(
  "/attendance/:id",
  authenticateToken,
  requireTeacher,
  async (req, res) => {
    try {
      const { studentId, date, status } = req.body;

      if (
        !mongoose.isValidObjectId(req.params.id) ||
        !mongoose.isValidObjectId(studentId) ||
        !date ||
        !["Present", "Absent"].includes(status)
      ) {
        return res.status(400).json({
          message: "Enter valid attendance details.",
        });
      }

      const studentExists = await Student.exists({ _id: studentId });

      if (!studentExists) {
        return res.status(404).json({ message: "Student not found." });
      }

      const attendanceDate = new Date(date);

      if (Number.isNaN(attendanceDate.getTime())) {
        return res.status(400).json({
          message: "Invalid attendance date.",
        });
      }

      attendanceDate.setUTCHours(0, 0, 0, 0);

      const record = await Attendance.findByIdAndUpdate(
        req.params.id,
        { studentId, date: attendanceDate, status },
        { new: true, runValidators: true }
      ).populate("studentId", "name rollNumber className");

      if (!record) {
        return res.status(404).json({
          message: "Attendance record not found.",
        });
      }

      return res.json(record);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
);

app.delete(
  "/attendance/:id",
  authenticateToken,
  requireTeacher,
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          message: "Invalid attendance ID.",
        });
      }

      const record = await Attendance.findByIdAndDelete(req.params.id);

      if (!record) {
        return res.status(404).json({
          message: "Attendance record not found.",
        });
      }

      return res.json({ message: "Attendance deleted successfully." });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

// --------------------------------------------------
// REMARKS APIs
// --------------------------------------------------

app.get("/remarks", authenticateToken, requireTeacher, async (req, res) => {
  try {
    const remarks = await Remark.find()
      .populate("studentId", "name rollNumber className")
      .sort({ date: -1 });

    return res.json(remarks);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.post("/remarks", authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { studentId, subject, remark, date } = req.body;

    if (
      !mongoose.isValidObjectId(studentId) ||
      !subject?.trim() ||
      !remark?.trim()
    ) {
      return res.status(400).json({
        message: "Student, subject, and remark are required.",
      });
    }

    const studentExists = await Student.exists({ _id: studentId });

    if (!studentExists) {
      return res.status(404).json({ message: "Student not found." });
    }

    const remarkDate = date ? new Date(date) : new Date();

    if (Number.isNaN(remarkDate.getTime())) {
      return res.status(400).json({
        message: "Invalid remark date.",
      });
    }

    const newRemark = await Remark.create({
      studentId,
      subject: subject.trim(),
      remark: remark.trim(),
      date: remarkDate,
    });

    const savedRemark = await Remark.findById(newRemark._id).populate(
      "studentId",
      "name rollNumber className"
    );

    return res.status(201).json(savedRemark);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.put(
  "/remarks/:id",
  authenticateToken,
  requireTeacher,
  async (req, res) => {
    try {
      const { studentId, subject, remark, date } = req.body;

      if (
        !mongoose.isValidObjectId(req.params.id) ||
        !mongoose.isValidObjectId(studentId) ||
        !subject?.trim() ||
        !remark?.trim()
      ) {
        return res.status(400).json({
          message: "Enter valid remark details.",
        });
      }

      const studentExists = await Student.exists({ _id: studentId });

      if (!studentExists) {
        return res.status(404).json({ message: "Student not found." });
      }

      const remarkDate = date ? new Date(date) : new Date();

      if (Number.isNaN(remarkDate.getTime())) {
        return res.status(400).json({
          message: "Invalid remark date.",
        });
      }

      const updatedRemark = await Remark.findByIdAndUpdate(
        req.params.id,
        {
          studentId,
          subject: subject.trim(),
          remark: remark.trim(),
          date: remarkDate,
        },
        { new: true, runValidators: true }
      ).populate("studentId", "name rollNumber className");

      if (!updatedRemark) {
        return res.status(404).json({ message: "Remark not found." });
      }

      return res.json(updatedRemark);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
);

app.delete(
  "/remarks/:id",
  authenticateToken,
  requireTeacher,
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid remark ID." });
      }

      const deletedRemark = await Remark.findByIdAndDelete(req.params.id);

      if (!deletedRemark) {
        return res.status(404).json({ message: "Remark not found." });
      }

      return res.json({ message: "Remark deleted successfully." });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

// --------------------------------------------------
// CONNECT TO MONGODB AND START SERVER
// --------------------------------------------------

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected successfully");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
}

startServer();
