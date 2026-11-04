
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/students";

const emptyForm = {
  name: "",
  rollNumber: "",
  className: "",
  email: "",
};

function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  // Send the saved login token with every request.
  function getHeaders(includeJson = false) {
    const token = localStorage.getItem("token");

    return {
      ...(includeJson ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
    };
  }

  async function loadStudents() {
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load students.");
      }

      setStudents(data);
    } catch (error) {
      setMessage(error.message || "Cannot connect to the backend.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  }

  function validateForm() {
    const name = form.name.trim();
    const rollNumber = form.rollNumber.trim();
    const className = form.className.trim();
    const email = form.email.trim();

    if (!name || !rollNumber || !className || !email) {
      return "Please fill in all fields.";
    }

    if (name.length < 2) {
      return "Student name must contain at least 2 characters.";
    }

    if (!/^[a-zA-Z\s.'-]+$/.test(name)) {
      return "Name can contain letters, spaces, apostrophes, dots, and hyphens only.";
    }

    if (!/^[a-zA-Z0-9/-]+$/.test(rollNumber)) {
      return "Roll number can contain letters, numbers, hyphens, and slashes only.";
    }

    if (!/^[a-zA-Z0-9\s-]+$/.test(className)) {
      return "Class can contain letters, numbers, spaces, and hyphens only.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address.";
    }

    const duplicateRollNumber = students.some(
      (student) =>
        student.rollNumber?.trim().toLowerCase() ===
          rollNumber.toLowerCase() &&
        student._id !== editingId
    );

    if (duplicateRollNumber) {
      return "This roll number already exists. Use a different one.";
    }

    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    const validationError = validateForm();

    if (validationError) {
      setMessage(validationError);
      setMessageType("error");
      return;
    }

    const studentData = {
      name: form.name.trim(),
      rollNumber: form.rollNumber.trim(),
      className: form.className.trim(),
      email: form.email.trim().toLowerCase(),
    };

    const url = editingId
      ? `${API_URL}/${editingId}`
      : API_URL;

    try {
      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: getHeaders(true),
        body: JSON.stringify(studentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save student.");
      }

      setMessage(
        editingId
          ? "Student updated successfully!"
          : "Student added successfully!"
      );
      setMessageType("success");

      setForm(emptyForm);
      setEditingId(null);

      await loadStudents();
    } catch (error) {
      setMessage(error.message || "Unable to save student.");
      setMessageType("error");
    }
  }

  function handleEdit(student) {
    setForm({
      name: student.name || "",
      rollNumber: student.rollNumber || "",
      className: student.className || "",
      email: student.email || "",
    });

    setEditingId(student._id);
    setMessage("");
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete student.");
      }

      if (editingId === id) {
        cancelEdit();
      }

      setMessage("Student deleted successfully!");
      setMessageType("success");

      await loadStudents();
    } catch (error) {
      setMessage(error.message || "Unable to delete student.");
      setMessageType("error");
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  }

  const filteredStudents = students.filter((student) =>
    `${student.name || ""} ${student.rollNumber || ""} ${student.className || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div>
      <h2>Student Management</h2>
      <p>Add and manage student information.</p>

      {message && (
        <p
          role="status"
          style={{
            color: messageType === "error" ? "#dc2626" : "#15803d",
            background:
              messageType === "error" ? "#fef2f2" : "#f0fdf4",
            padding: "10px",
            borderRadius: "6px",
          }}
        >
          {message}
        </p>
      )}

      <form className="student-form" onSubmit={handleSubmit} noValidate>
        <input
          name="name"
          placeholder="Student Name"
          value={form.name}
          onChange={handleChange}
          maxLength={80}
          required
        />

        <input
          name="rollNumber"
          placeholder="Roll Number"
          value={form.rollNumber}
          onChange={handleChange}
          maxLength={30}
          required
        />

        <input
          name="className"
          placeholder="Class"
          value={form.className}
          onChange={handleChange}
          maxLength={30}
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          maxLength={254}
          required
        />

        <button type="submit">
          {editingId ? "Update Student" : "Add Student"}
        </button>

        {editingId && (
          <button type="button" onClick={cancelEdit}>
            Cancel
          </button>
        )}
      </form>

      <input
        className="student-search"
        placeholder="Search by name, roll number, or class..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="student-table-container">
        <table className="student-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll Number</th>
              <th>Class</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && students.length === 0 ? (
              <tr>
                <td colSpan="5">Loading students...</td>
              </tr>
            ) : (
              <>
                {filteredStudents.map((student) => (
                  <tr key={student._id}>
                    <td>{student.name}</td>
                    <td>{student.rollNumber}</td>
                    <td>{student.className}</td>
                    <td>{student.email}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleEdit(student)}
                      >
                        Edit
                      </button>{" "}
                      <button
                        type="button"
                        onClick={() => handleDelete(student._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan="5">No students found.</td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Students;
