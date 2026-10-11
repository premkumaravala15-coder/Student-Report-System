
import { useState } from "react";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("teacher");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const usesUsername = role === "student" || role === "parent";

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const loginDetails = {
        password,
        role,
        ...(usesUsername
          ? { username: username.trim() }
          : { email: email.trim() }),
      };

      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginDetails),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      onLogin(data.user);
    } catch (error) {
      setMessage(
        error.message === "Failed to fetch"
          ? "Cannot connect to the backend. Check whether the server is running."
          : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleLogin} style={styles.card}>
        <div style={styles.logo}>SR</div>

        <h1 style={styles.heading}>Student Report System</h1>
        <p style={styles.subtitle}>
          Welcome back! Sign in to continue.
        </p>

        <label style={styles.label}>Login as</label>
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setEmail("");
            setUsername("");
            setPassword("");
            setMessage("");
          }}
          style={styles.input}
        >
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
          <option value="parent">Parent</option>
        </select>

        {usesUsername ? (
          <>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              style={styles.input}
            />
          </>
        ) : (
          <>
            <label style={styles.label}>Email address</label>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              style={styles.input}
            />
          </>
        )}

        <label style={styles.label}>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          style={styles.input}
        />

        {message && (
          <p style={styles.error} role="alert">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Signing in..." : "Login →"}
        </button>

        <p style={styles.footer}>
          Student Report System · Secure Login
        </p>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "24px",
    boxSizing: "border-box",
    background:
      "radial-gradient(ellipse at top left, rgba(129,140,248,0.45), transparent 45%), radial-gradient(ellipse at bottom right, rgba(192,132,252,0.35), transparent 45%), linear-gradient(135deg, #eef2ff, #f5f3ff, #e0e7ff)",
  },

  card: {
    width: "100%",
    maxWidth: "440px",
    padding: "38px",
    background: "rgba(255, 255, 255, 0.94)",
    border: "1px solid rgba(255, 255, 255, 0.95)",
    borderRadius: "24px",
    boxShadow: "0 24px 70px rgba(49, 46, 129, 0.16)",
    boxSizing: "border-box",
    backdropFilter: "blur(14px)",
  },

  logo: {
    width: "62px",
    height: "62px",
    margin: "0 auto 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "18px",
    background: "linear-gradient(135deg, #4f46e5, #9333ea)",
    color: "#ffffff",
    fontSize: "23px",
    fontWeight: "800",
    letterSpacing: "1px",
    boxShadow: "0 8px 20px rgba(79, 70, 229, 0.25)",
  },

  heading: {
    color: "#312e81",
    textAlign: "center",
    fontSize: "27px",
    fontWeight: "800",
    letterSpacing: "-0.7px",
    lineHeight: 1.3,
    margin: "0 0 10px",
  },

  subtitle: {
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px",
    margin: "0 0 30px",
  },

  label: {
    display: "block",
    fontWeight: "650",
    marginBottom: "8px",
    color: "#334155",
    fontSize: "14px",
  },

  input: {
    display: "block",
    width: "100%",
    padding: "13px 14px",
    marginBottom: "20px",
    border: "1px solid #dbe1f0",
    borderRadius: "10px",
    background: "#f8faff",
    color: "#1e293b",
    boxSizing: "border-box",
    fontSize: "15px",
    outline: "none",
  },

  button: {
    display: "block",
    width: "100%",
    padding: "14px",
    marginTop: "5px",
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "#ffffff",
    border: "none",
    borderRadius: "11px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(79, 70, 229, 0.24)",
  },

  error: {
    color: "#b91c1c",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "9px",
    padding: "12px 14px",
    fontSize: "14px",
    marginBottom: "16px",
  },

  footer: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "12px",
    margin: "24px 0 0",
  },
};

export default Login;
