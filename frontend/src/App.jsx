import { useState, useEffect, useCallback } from "react";
import "./App.css";

import Login from "./Login";
import Students from "./pages/Students";
import Marks from "./pages/Marks";
import Attendance from "./pages/Attendance";
import Remarks from "./pages/Remarks";
import Reports from "./pages/Reports";
import StudentParentDashboard from "./StudentParentDashboard";
import Accounts from "./pages/Accounts";

function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      if (
        token &&
        savedUser &&
        ["teacher", "student", "parent"].includes(savedUser.role)
      ) {
        return savedUser;
      }
    } catch {
      // Ignore invalid saved login data.
    }

    return null;
  });

  const [page, setPage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [studentsCount, setStudentsCount] = useState(0);
  const [marksCount, setMarksCount] = useState(0);
  const [attendancePercentage, setAttendancePercentage] = useState("0.0");
  const [reportsCount, setReportsCount] = useState(0);
  const [dashboardError, setDashboardError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const menu = [
  "Students",
  "Marks",
  "Attendance",
  "Remarks",
  "Reports",
  "Accounts",
];

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setPage("Dashboard");
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setPage("Dashboard");
    setSidebarOpen(false);

    setStudentsCount(0);
    setMarksCount(0);
    setAttendancePercentage("0.0");
    setReportsCount(0);
    setDashboardError("");
  };

  const loadDashboard = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      handleLogout();
      return;
    }

    try {
      setRefreshing(true);
      setDashboardError("");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const responses = await Promise.all([
        fetch("http://localhost:5000/students", { headers }),
        fetch("http://localhost:5000/marks", { headers }),
        fetch("http://localhost:5000/attendance", { headers }),
      ]);

      if (
        responses.some(
          (response) =>
            response.status === 401 || response.status === 403
        )
      ) {
        handleLogout();
        return;
      }

      if (responses.some((response) => !response.ok)) {
        throw new Error("Unable to load dashboard data.");
      }

      const [students, marks, attendance] = await Promise.all(
        responses.map((response) => response.json())
      );

      setStudentsCount(students.length);
      setMarksCount(marks.length);

      const presentCount = attendance.filter(
        (item) => item.status === "Present"
      ).length;

      const percentage =
        attendance.length > 0
          ? (presentCount / attendance.length) * 100
          : 0;

      setAttendancePercentage(percentage.toFixed(1));

      const studentsWithMarks = new Set(
        marks
          .map((item) =>
            typeof item.studentId === "object"
              ? item.studentId?._id
              : item.studentId
          )
          .filter(Boolean)
      );

      setReportsCount(studentsWithMarks.size);
    } catch {
      setDashboardError(
        "Could not load dashboard data. Check that your backend is running."
      );
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "teacher") {
      loadDashboard();
    }
  }, [user, loadDashboard]);

  function handleDashboard() {
    setSidebarOpen(!sidebarOpen);
    setPage("Dashboard");
  }

  function handleMenuClick(item) {
    setPage(item);
    setSidebarOpen(false);
  }

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

      case "Accounts":
        return <Accounts />;

      default:
        return (
          <section className="page-card">
            <h1>{page} Management</h1>
            <p>This page will be developed in the next steps.</p>
          </section>
        );
    }
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Students and parents see only their personal progress report.
  if (user.role === "student" || user.role === "parent") {
    return (
      <StudentParentDashboard
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  // Teacher dashboard and management pages remain unchanged.
  return (
    <div className="app">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <h2>Student Report</h2>
        <p>Academic Management</p>

        {menu.map((item) => (
          <button
            key={item}
            className={page === item ? "active" : ""}
            onClick={() => handleMenuClick(item)}
          >
            {item}
          </button>
        ))}
      </aside>

      <main className="main">
        <header>
          <button
            className="dashboard-btn"
            onClick={handleDashboard}
          >
            ☰ Dashboard
          </button>

          <span>Student Report System</span>

          <button onClick={handleLogout}>Logout</button>
        </header>

        {showPage()}
      </main>
    </div>
  );
}

export default App;