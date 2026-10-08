import { useState } from "react";

function Login({ onLogin }) {

  const [selectedRole, setSelectedRole] = useState(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  // ==================== LOGIN ====================

  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");

    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    try {

      const response = await fetch(
        "http://localhost:5000/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            username: username,
            password: password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid login details");
        return;
      }

      // Check selected role
      if (data.user.role !== selectedRole) {
        setError(
          `This account is not a ${selectedRole} account`
        );
        return;
      }

      // Send user information to App.jsx
      onLogin(data.user);

    } catch (error) {

      console.log(error);

      setError(
        "Cannot connect to backend. Make sure server is running."
      );

    }
  };


  // ==================== ROLE SELECTION ====================

  if (!selectedRole) {

    return (

      <div className="welcome-page">

        {/* HEADER */}

        <header className="welcome-header">

          <div className="logo">

            <span className="logo-icon">
              🎓
            </span>

            <span>
              Student Report System
            </span>

          </div>

          <div className="header-text">
            Track • Learn • Grow
          </div>

        </header>


        {/* HERO */}

        <section className="hero-section">

          <div className="hero-content">

            <span className="small-title">
              SMART ACADEMIC MANAGEMENT
            </span>

            <h1>
              Manage.
              <br />
              <span>Monitor.</span>
              <br />
              Succeed.
            </h1>

            <p className="hero-description">

              A simple and efficient platform to manage
              student information, marks, attendance,
              remarks and academic progress.

            </p>


            <div className="hero-features">

              <span>✓ Track Progress</span>

              <span>✓ Manage Reports</span>

              <span>✓ Monitor Performance</span>

            </div>

          </div>


          {/* ILLUSTRATION */}

          <div className="hero-illustration">

            <div className="graduation-cap">
              🎓
            </div>

            <div className="book book-one">
              📘
            </div>

            <div className="book book-two">
              📕
            </div>

            <div className="plant">
              🪴
            </div>

          </div>

        </section>


        {/* LOGIN OPTIONS */}

        <section className="login-options">

          <h2>
            Choose Your Login
          </h2>

          <p className="login-subtitle">
            Select your account type to continue
          </p>


          <div className="role-cards">


            {/* STUDENT */}

            <div
              className="role-card student-card"
              onClick={() => setSelectedRole("student")}
            >

              <div className="role-icon">
                👨‍🎓
              </div>

              <h3>
                Student
              </h3>

              <p>
                View your marks, attendance and
                progress report.
              </p>

              <button>
                Student Login →
              </button>

            </div>


            {/* TEACHER */}

            <div
              className="role-card teacher-card"
              onClick={() => setSelectedRole("teacher")}
            >

              <div className="role-icon">
                👨‍🏫
              </div>

              <h3>
                Teacher
              </h3>

              <p>
                Manage students, marks, attendance
                and reports.
              </p>

              <button>
                Teacher Login →
              </button>

            </div>


            {/* PARENT */}

            <div
              className="role-card parent-card"
              onClick={() => setSelectedRole("parent")}
            >

              <div className="role-icon">
                👨‍👩‍👧
              </div>

              <h3>
                Parent
              </h3>

              <p>
                View your child's performance and
                academic progress.
              </p>

              <button>
                Parent Login →
              </button>

            </div>

          </div>

        </section>


        {/* FOOTER */}

        <footer className="welcome-footer">

          © 2026 Student Report System
          &nbsp; • &nbsp;
          Track • Learn • Grow

        </footer>

      </div>

    );
  }


  // ==================== LOGIN FORM ====================

  return (

    <div className={`role-login-page ${selectedRole}`}>

      {/* HEADER */}

      <header className="login-header">

        <div className="login-logo">

          <span>
            🎓
          </span>

          Student Report System

        </div>

        <div>
          {selectedRole.toUpperCase()} LOGIN
        </div>

      </header>


      {/* LOGIN AREA */}

      <div className="login-layout">


        {/* LEFT SIDE */}

        <div className="login-introduction">

          <div className="login-role-icon">

            {selectedRole === "student" && "👨‍🎓"}

            {selectedRole === "teacher" && "👨‍🏫"}

            {selectedRole === "parent" && "👨‍👩‍👧"}

          </div>


          <div className="login-small-title">

            WELCOME BACK

          </div>


          <h1>

            {selectedRole === "student" &&
              "Student Portal"}

            {selectedRole === "teacher" &&
              "Teacher Portal"}

            {selectedRole === "parent" &&
              "Parent Portal"}

          </h1>


          <p>

            {selectedRole === "student" &&
              "Access your academic information, marks, attendance and progress reports."}

            {selectedRole === "teacher" &&
              "Manage student information, marks, attendance, remarks and academic reports."}

            {selectedRole === "parent" &&
              "Check your child's marks, attendance and overall academic progress."}

          </p>


          <div className="login-illustration">

            {selectedRole === "student" && (
              <>
                <div className="person">🧑‍🎓</div>
                <div className="laptop">💻</div>
                <div className="books">📚</div>
              </>
            )}

            {selectedRole === "teacher" && (
              <>
                <div className="person">👨‍🏫</div>
                <div className="board">📋</div>
                <div className="books">📚</div>
              </>
            )}

            {selectedRole === "parent" && (
              <>
                <div className="person">👨‍👩‍👧</div>
                <div className="heart">❤️</div>
              </>
            )}

          </div>

        </div>


        {/* LOGIN CARD */}

        <div className="login-card">

          <div className="login-card-header">

            <div className="card-icon">

              {selectedRole === "student" && "🎓"}

              {selectedRole === "teacher" && "📚"}

              {selectedRole === "parent" && "👨‍👩‍👧"}

            </div>

            <div>

              <h2>
                Sign In
              </h2>

              <p>
                Enter your account details
              </p>

            </div>

          </div>


          {/* ERROR */}

          {error && (

            <div className="login-error">

              ⚠️ {error}

            </div>

          )}


          {/* FORM */}

          <form onSubmit={handleLogin}>


            <label>
              Username
            </label>

            <div className="input-box">

              <span>
                👤
              </span>

              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
              />

            </div>


            <label>
              Password
            </label>

            <div className="input-box">

              <span>
                🔒
              </span>

              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

            </div>


            <button
              type="submit"
              className="main-login-button"
            >

              Login as{" "}
              {selectedRole.charAt(0).toUpperCase() +
                selectedRole.slice(1)}

            </button>

          </form>


          {/* BACK */}

          <button
            className="back-button"
            onClick={() => {

              setSelectedRole(null);
              setUsername("");
              setPassword("");
              setError("");

            }}
          >

            ← Back to Login Options

          </button>


          {/* DEMO ACCOUNT */}

          <div className="demo-account">

            <div className="demo-icon">
              💡
            </div>

            <div>

              <h4>
                Demo Account
              </h4>

              <p>
                Use the username and password
                created in MongoDB.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>

  );
}

export default Login;