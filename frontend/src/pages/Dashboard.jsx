function Dashboard() {
  return (
    <div className="dashboard">

      <div className="dashboard-header">
        <div>
          <div className="dashboard-tag">
            STUDENT REPORT SYSTEM
          </div>

          <h1>Dashboard</h1>

          <p>
            Welcome to your academic management dashboard.
          </p>
        </div>

        <div className="academic-year">
          📅 2026 Academic Year
        </div>
      </div>


      <div className="welcome-dashboard">

        <div className="welcome-dashboard-content">
          <span>WELCOME BACK 👋</span>

          <h2>Track Student Progress</h2>

          <p>
            Manage students, marks, attendance and reports
            from one simple platform.
          </p>
        </div>

        <div className="welcome-dashboard-icon">
          🎓
        </div>

      </div>


      <h2 className="section-title">
        Quick Access
      </h2>


      <div className="quick-access">

        <div className="quick-card">
          <div className="quick-icon students-icon">
            👨‍🎓
          </div>

          <h3>Students</h3>

          <p>
            Manage student information and records.
          </p>
        </div>


        <div className="quick-card">
          <div className="quick-icon marks-icon">
            📝
          </div>

          <h3>Marks</h3>

          <p>
            Add and manage student subject marks.
          </p>
        </div>


        <div className="quick-card">
          <div className="quick-icon attendance-icon">
            📅
          </div>

          <h3>Attendance</h3>

          <p>
            Record and monitor attendance.
          </p>
        </div>


        <div className="quick-card">
          <div className="quick-icon report-icon">
            📊
          </div>

          <h3>Reports</h3>

          <p>
            View complete academic reports.
          </p>
        </div>

      </div>


      <div className="dashboard-bottom">

        <div className="dashboard-box">

          <h2>📚 Academic Management</h2>

          <p>
            Everything you need to manage student
            academic information.
          </p>

          <div className="feature">
            ✓ Manage student information
          </div>

          <div className="feature">
            ✓ Record examination marks
          </div>

          <div className="feature">
            ✓ Track attendance
          </div>

          <div className="feature">
            ✓ Add teacher remarks
          </div>

          <div className="feature">
            ✓ Generate academic reports
          </div>

        </div>


        <div className="dashboard-box">

          <h2>⚡ System Overview</h2>

          <p>
            Simple academic management for everyone.
          </p>

          <div className="system-item">
            🔐 Secure student access
          </div>

          <div className="system-item">
            📈 Academic progress tracking
          </div>

          <div className="system-item">
            📋 Complete student reports
          </div>

        </div>

      </div>


      <div className="dashboard-footer">
        🎓 Track • Learn • Grow
      </div>

    </div>
  );
}

export default Dashboard;