
import { useState, useEffect, useCallback } from "react";
import "./App.css";

import Students from "./pages/Students";
import Marks from "./pages/Marks";
import Attendance from "./pages/Attendance";
import Remarks from "./pages/Remarks";
import Reports from "./pages/Reports";

function App() {
  const [page, setPage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [studentsCount, setStudentsCount] = useState(0);
  const [marksCount, setMarksCount] = useState(0);
  const [attendancePercentage, setAttendancePercentage] = useState("0.0");
  const [reportsCount, setReportsCount] = useState(0);
  const [dashboardError, setDashboardError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Sidebar menu
  const menu = [
    "Students",
    "Marks",
    "Attendance",
    "Remarks",
    "Reports",
  ];

  // Load dashboard data
  const loadDashboard = useCallback(async () => {
    try {
      setRefreshing(true);
      setDashboardError("");

      const responses = await Promise.all([
        fetch("http://localhost:5000/students"),
        fetch("http://localhost:5000/marks"),
        fetch("http://localhost:5000/attendance"),
      ]);

      if (responses.some((response) => !response.ok)) {
        throw new Error("Unable to load dashboard data.");
      }

      const [students, marks, attendance] = await Promise.all(
        responses.map((response) => response.json())
      );

      // Update total students
      setStudentsCount(students.length);

      // Get registered student IDs
      const studentIds = new Set(
        students.map((student) => student._id).filter(Boolean)
      );

      // Count marks belonging to registered students
      const validMarks = marks.filter((item) => {
        const studentId =
          typeof item.studentId === "object"
            ? item.studentId?._id
            : item.studentId;

        return studentIds.has(studentId);
      });

      setMarksCount(validMarks.length);

      // Count attendance belonging to registered students
      const validAttendance = attendance.filter((item) => {
        const studentId =
          typeof item.studentId === "object"
            ? item.studentId?._id
            : item.studentId;

        return studentIds.has(studentId);
      });

      // Calculate attendance percentage
      const presentCount = validAttendance.filter(
        (item) => item.status === "Present"
      ).length;

      const percentage =
        validAttendance.length > 0
          ? (presentCount / validAttendance.length) * 100
          : 0;

      setAttendancePercentage(percentage.toFixed(1));

      // Count students who have marks records
      const studentsWithMarks = new Set(
        validMarks
          .map((item) =>
            typeof item.studentId === "object"
              ? item.studentId?._id
              : item.studentId
          )
          .filter(Boolean)
      );

      setReportsCount(studentsWithMarks.size);
    } catch (error) {
      console.error("Dashboard error:", error);

      setDashboardError(
        "Could not load dashboard data. Check that your backend is running and API access is enabled."
      );
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Load dashboard when application starts
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Dashboard button
  function handleDashboard() {
    setPage("Dashboard");
    setSidebarOpen(!sidebarOpen);
  }

  // Sidebar menu
  function handleMenuClick(item) {
    setPage(item);
    setSidebarOpen(false);
  }

  // Display selected page
  function showPage() {
    switch (page) {
      case "Dashboard":
        return (
          <>
            <div className="report-header">
              <div>
                <h1>Welcome to Student Report System</h1>
                <p>
                  Manage student marks, attendance, remarks,
                  and academic progress in one place.
                </p>
              </div>

              <button
                className="report-print-button"
                onClick={loadDashboard}
                disabled={refreshing}
              >
                {refreshing ? "Refreshing..." : "Refresh Dashboard"}
              </button>
            </div>

            {dashboardError && (
              <p style={{ color: "red" }}>{dashboardError}</p>
            )}

            <div className="cards">
              <div className="card">
                <h3>Total Students</h3>
                <h2>{studentsCount}</h2>
              </div>

              <div className="card">
                <h3>Marks Records</h3>
                <h2>{marksCount}</h2>
              </div>

              <div className="card">
                <h3>Attendance</h3>
                <h2>{attendancePercentage}%</h2>
              </div>

              <div className="card">
                <h3>Progress Reports</h3>
                <h2>{reportsCount}</h2>
              </div>
            </div>
          </>
        );

      case "Students":
        return <Students />;

      case "Marks":
        return <Marks />;

      case "Attendance":
        return <Attendance />;

      case "Remarks":
        return <Remarks />;

      case "Reports":
        return <Reports />;

      default:
        return (
          <section className="page-card">
            <h1>{page} Management</h1>
            <p>This page will be developed in the next steps.</p>
          </section>
        );
    }
  }

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <h2>Student Report</h2>
        <p>Academic Management</p>

        <nav>
          <button
            className={page === "Dashboard" ? "active" : ""}
            onClick={() => handleMenuClick("Dashboard")}
          >
            🏠 Dashboard
          </button>

          {menu.map((item) => (
            <button
              key={item}
              className={page === item ? "active" : ""}
              onClick={() => handleMenuClick(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main">
        <header>
          <button
            className="dashboard-btn"
            onClick={handleDashboard}
          >
            ☰ Dashboard
          </button>

          <span>Student Report System</span>
        </header>

        {showPage()}
      </main>
    </div>
  );
}

export default App;
