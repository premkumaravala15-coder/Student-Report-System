
import { useEffect, useState } from "react";

function Accounts() {
  const [students, setStudents] = useState([]);

  const [studentId, setStudentId] = useState("");
  const [studentUsername, setStudentUsername] = useState("");
  const [studentPassword, setStudentPassword] = useState("");

  const [parentStudentId, setParentStudentId] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentUsername, setParentUsername] = useState("");
  const [parentPassword, setParentPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  useEffect(() => {
    async function loadStudents() {
      try {
        const response = await fetch(
          "http://localhost:5000/students",
          { headers: getHeaders() }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load students.");
        }

        setStudents(data);
      } catch (err) {
        setError(err.message || "Unable to load students.");
      }
    }

    loadStudents();
  }, []);

  function handleStudentChange(id) {
    setStudentId(id);
    setStudentUsername("");
    setMessage("");
    setError("");
  }

  async function createAccount(type, payload) {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `http://localhost:5000/accounts/${type}`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Account creation failed.");
      }

      setMessage(data.message || "Account created successfully.");

      if (type === "student") {
        setStudentPassword("");
      } else {
        setParentName("");
        setParentUsername("");
        setParentPassword("");
        setParentStudentId("");
      }
    } catch (err) {
      setError(err.message || "Account creation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-card">
      <h1>Student and Parent Accounts</h1>
      <p>Create secure login accounts linked to student records.</p>

      {message && (
        <p style={{ color: "green" }}>{message}</p>
      )}

      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}

      <hr />

      <h2>Create Student Account</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();

          createAccount("student", {
            studentId,
            username: studentUsername.trim(),
            password: studentPassword,
          });
        }}
      >
        <label>Select Student</label>
        <select
          value={studentId}
          onChange={(e) => handleStudentChange(e.target.value)}
          required
          style={inputStyle}
        >
          <option value="">Choose a student</option>

          {students.map((student) => (
            <option key={student._id} value={student._id}>
              {student.name} — {student.rollNumber}
            </option>
          ))}
        </select>

        <label>Username</label>
        <input
          type="text"
          value={studentUsername}
          onChange={(e) => setStudentUsername(e.target.value)}
          placeholder="Enter student username"
          autoComplete="username"
          minLength={3}
          maxLength={30}
          pattern="[a-zA-Z0-9._-]+"
          title="Use letters, numbers, dots, underscores, or hyphens."
          required
          style={inputStyle}
        />

        <label>Password</label>
        <input
          type="password"
          value={studentPassword}
          onChange={(e) => setStudentPassword(e.target.value)}
          placeholder="At least 8 characters"
          minLength={8}
          autoComplete="new-password"
          required
          style={inputStyle}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Student Account"}
        </button>
      </form>

      <hr />

      <h2>Create Parent Account</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();

          createAccount("parent", {
            studentId: parentStudentId,
            name: parentName.trim(),
            username: parentUsername.trim(),
            password: parentPassword,
          });
        }}
      >
        <label>Select Linked Student</label>
        <select
          value={parentStudentId}
          onChange={(e) => setParentStudentId(e.target.value)}
          required
          style={inputStyle}
        >
          <option value="">Choose a student</option>

          {students.map((student) => (
            <option key={student._id} value={student._id}>
              {student.name} — {student.rollNumber}
            </option>
          ))}
        </select>

        <label>Parent Name</label>
        <input
          type="text"
          value={parentName}
          onChange={(e) => setParentName(e.target.value)}
          placeholder="Enter parent name"
          autoComplete="name"
          required
          style={inputStyle}
        />

        <label>Parent Username</label>
        <input
          type="text"
          value={parentUsername}
          onChange={(e) => setParentUsername(e.target.value)}
          placeholder="Enter parent username"
          autoComplete="username"
          minLength={3}
          maxLength={30}
          pattern="[a-zA-Z0-9._-]+"
          title="Use letters, numbers, dots, underscores, or hyphens."
          required
          style={inputStyle}
        />

        <label>Parent Password</label>
        <input
          type="password"
          value={parentPassword}
          onChange={(e) => setParentPassword(e.target.value)}
          placeholder="At least 8 characters"
          minLength={8}
          autoComplete="new-password"
          required
          style={inputStyle}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Parent Account"}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "10px",
  marginTop: "6px",
  marginBottom: "16px",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  boxSizing: "border-box",
};

export default Accounts;
