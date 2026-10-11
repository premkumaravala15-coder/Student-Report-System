
import { useEffect, useState } from "react";

const STUDENTS_URL = "http://localhost:5000/students";
const REMARKS_URL = "http://localhost:5000/remarks";

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateValue(value) {
  if (!value) return getToday();

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return getToday();
  }

  return parsedDate.toISOString().slice(0, 10);
}

function Remarks() {
  const [students, setStudents] = useState([]);
  const [remarks, setRemarks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [form, setForm] = useState({
    studentId: "",
    subject: "",
    remark: "",
    date: getToday(),
  });

  // Include the teacher login token in every request.
  function getHeaders(includeJson = false) {
    const token = localStorage.getItem("token");

    return {
      ...(includeJson ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
    };
  }

  async function loadData() {
    try {
      const [studentsResponse, remarksResponse] = await Promise.all([
        fetch(STUDENTS_URL, { headers: getHeaders() }),
        fetch(REMARKS_URL, { headers: getHeaders() }),
      ]);

      const studentsData = await studentsResponse.json();
      const remarksData = await remarksResponse.json();

      if (!studentsResponse.ok) {
        throw new Error(
          studentsData.message || "Unable to load students."
        );
      }

      if (!remarksResponse.ok) {
        throw new Error(
          remarksData.message || "Unable to load remarks."
        );
      }

      setStudents(studentsData);
      setRemarks(remarksData);
    } catch (error) {
      setMessage(error.message || "Unable to load data. Check the backend.");
      setMessageType("error");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    setMessage("");
    setMessageType("");
  }

  function resetForm() {
    setEditingId(null);

    setForm({
      studentId: "",
      subject: "",
      remark: "",
      date: getToday(),
    });
  }

  function validateForm() {
    if (!form.studentId) {
      return "Please select a student.";
    }

    const selectedStudent = students.find(
      (student) => student._id === form.studentId
    );

    if (!selectedStudent) {
      return "Selected student was not found. Please select again.";
    }

    const subject = form.subject.trim();

    if (!subject) {
      return "Please enter a subject.";
    }

    if (subject.length < 2) {
      return "Subject must contain at least 2 characters.";
    }

    if (!/[a-zA-Z]/.test(subject)) {
      return "Subject must contain at least one letter.";
    }

    if (!/^[a-zA-Z0-9][a-zA-Z0-9 .&()_-]*$/.test(subject)) {
      return "Subject contains invalid characters.";
    }

    const remarkText = form.remark.trim();

    if (!remarkText) {
      return "Please enter a remark.";
    }

    if (remarkText.length < 3) {
      return "Remark must contain at least 3 characters.";
    }

    if (remarkText.length > 500) {
      return "Remark cannot exceed 500 characters.";
    }

    if (!form.date) {
      return "Please select a date.";
    }

    const selectedDate = new Date(`${form.date}T00:00:00`);

    if (Number.isNaN(selectedDate.getTime())) {
      return "Please enter a valid date.";
    }

    if (form.date > getToday()) {
      return "Remark date cannot be in the future.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setMessageType("");

    const validationError = validateForm();

    if (validationError) {
      setMessage(validationError);
      setMessageType("error");
      return;
    }

    try {
      const response = await fetch(
        editingId ? `${REMARKS_URL}/${editingId}` : REMARKS_URL,
        {
          method: editingId ? "PUT" : "POST",
          headers: getHeaders(true),
          body: JSON.stringify({
            studentId: form.studentId,
            subject: form.subject.trim(),
            remark: form.remark.trim(),
            date: form.date,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save remark.");
      }

      setMessage(
        editingId
          ? "Remark updated successfully!"
          : "Remark added successfully!"
      );
      setMessageType("success");

      resetForm();
      await loadData();
    } catch (error) {
      setMessage(error.message || "Unable to save remark.");
      setMessageType("error");
    }
  }

  function handleEdit(item) {
    setForm({
      studentId: item.studentId?._id || item.studentId || "",
      subject: item.subject || "",
      remark: item.remark || "",
      date: getDateValue(item.date),
    });

    setEditingId(item._id);
    setMessage("");
    setMessageType("");
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this remark?")) {
      return;
    }

    try {
      const response = await fetch(`${REMARKS_URL}/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete remark.");
      }

      setMessage("Remark deleted successfully!");
      setMessageType("success");

      if (editingId === id) {
        resetForm();
      }

      await loadData();
    } catch (error) {
      setMessage(error.message || "Unable to delete remark.");
      setMessageType("error");
    }
  }

  const searchText = search.trim().toLowerCase();

  const filteredRemarks = remarks.filter((item) => {
    const studentName = String(item.studentId?.name || "");
    const rollNumber = String(item.studentId?.rollNumber || "");
    const subject = String(item.subject || "");
    const remark = String(item.remark || "");

    return (
      studentName.toLowerCase().includes(searchText) ||
      rollNumber.toLowerCase().includes(searchText) ||
      subject.toLowerCase().includes(searchText) ||
      remark.toLowerCase().includes(searchText)
    );
  });

  return (
    <div>
      <h2>Remarks Management</h2>
      <p>Add and manage feedback about student performance.</p>

      {message && (
        <p
          role="status"
          style={{
            color: messageType === "error" ? "#dc2626" : "#15803d",
            background:
              messageType === "error" ? "#fee2e2" : "#dcfce7",
            padding: "10px",
            borderRadius: "6px",
          }}
        >
          {message}
        </p>
      )}

      <form className="student-form" onSubmit={handleSubmit} noValidate>
        <select
          name="studentId"
          value={form.studentId}
          onChange={handleChange}
          required
        >
          <option value="">Select Student</option>

          {students.map((student) => (
            <option key={student._id} value={student._id}>
              {student.name} ({student.rollNumber})
            </option>
          ))}
        </select>

        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={form.subject}
          onChange={handleChange}
          maxLength={60}
          required
        />

        <textarea
          name="remark"
          placeholder="Enter teacher's remark"
          value={form.remark}
          onChange={handleChange}
          rows={3}
          maxLength={500}
          required
        />

        <input
          type="date"
          name="date"
          value={form.date}
          max={getToday()}
          onChange={handleChange}
          required
        />

        <button type="submit">
          {editingId ? "Update Remark" : "Add Remark"}
        </button>

        {editingId && (
          <button type="button" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>

      <input
        className="student-search"
        type="text"
        placeholder="Search by student, roll number, subject, or remark..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <div className="student-table-container">
        <table className="student-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Roll Number</th>
              <th>Subject</th>
              <th>Remark</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredRemarks.map((item) => (
              <tr key={item._id}>
                <td>{item.studentId?.name || "Student deleted"}</td>
                <td>{item.studentId?.rollNumber || "-"}</td>
                <td>{item.subject}</td>
                <td>{item.remark}</td>
                <td>
                  {item.date
                    ? new Date(item.date).toLocaleDateString("en-IN")
                    : "-"}
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </button>{" "}
                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {filteredRemarks.length === 0 && (
              <tr>
                <td colSpan="6">No remarks found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Remarks;