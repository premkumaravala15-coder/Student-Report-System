import { useState } from "react";
import "./App.css";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Marks from "./pages/Marks";
import Attendance from "./pages/Attendance";
import Remarks from "./pages/Remarks";
import Reports from "./pages/Reports";

function App() {
const [user, setUser] = useState(null);
const [page, setPage] = useState("Dashboard");

// Login
const handleLogin = (userData) => {
setUser(userData);
setPage("Dashboard");
};

// Logout
const handleLogout = () => {
setUser(null);
setPage("Dashboard");
};

// Show selected page
const showPage = () => {
if (page === "Dashboard") {
return <Dashboard />;
}

if (page === "Students" && user.role === "teacher") {
  return <Students />;
}

if (page === "Marks" && user.role === "teacher") {
  return <Marks />;
}

if (page === "Attendance" && user.role === "teacher") {
  return <Attendance />;
}

if (page === "Remarks" && user.role === "teacher") {
  return <Remarks />;
}

if (page === "Reports") {
  return <Reports user={user} />;
}

return <Dashboard />;

};

// Before login
if (!user) {
return <Login onLogin={handleLogin} />;
}

// After login
return ( <div className="app">

  {/* SIDEBAR */}
  <aside className="sidebar">

    <div className="sidebar-logo">
      📘
      <span>Student Report</span>
    </div>

    <div className="user-card">
      <div className="user-icon">
        {user.role === "teacher"
          ? "👨‍🏫"
          : user.role === "parent"
          ? "👨‍👩‍👧"
          : "👨‍🎓"}
      </div>

      <div>
        <h3>{user.username}</h3>
        <p>{user.role}</p>
      </div>
    </div>

    <nav className="sidebar-nav">

      <button
        className={page === "Dashboard" ? "active" : ""}
        onClick={() => setPage("Dashboard")}
      >
        🏠 Dashboard
      </button>

      {/* STUDENT */}
      {user.role === "student" && (
        <button
          className={page === "Reports" ? "active" : ""}
          onClick={() => setPage("Reports")}
        >
          📊 My Report
        </button>
      )}

      {/* TEACHER */}
      {user.role === "teacher" && (
        <>
          <button
            className={page === "Students" ? "active" : ""}
            onClick={() => setPage("Students")}
          >
            👨‍🎓 Students
          </button>

          <button
            className={page === "Marks" ? "active" : ""}
            onClick={() => setPage("Marks")}
          >
            📝 Marks
          </button>

          <button
            className={page === "Attendance" ? "active" : ""}
            onClick={() => setPage("Attendance")}
          >
            📅 Attendance
          </button>

          <button
            className={page === "Remarks" ? "active" : ""}
            onClick={() => setPage("Remarks")}
          >
            💬 Remarks
          </button>

          <button
            className={page === "Reports" ? "active" : ""}
            onClick={() => setPage("Reports")}
          >
            📊 Reports
          </button>
        </>
      )}

      {/* PARENT */}
      {user.role === "parent" && (
        <button
          className={page === "Reports" ? "active" : ""}
          onClick={() => setPage("Reports")}
        >
          👨‍👩‍👧 Child Report
        </button>
      )}

    </nav>

    <button
      className="logout-button"
      onClick={handleLogout}
    >
      🚪 Logout
    </button>

  </aside>

  {/* MAIN CONTENT */}
  <main className="main-content">
    {showPage()}
  </main>

</div>

);
}

export default App;
