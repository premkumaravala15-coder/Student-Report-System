
import { useEffect, useState } from "react";

const STUDENTS_URL = "http://localhost:5000/students";
const MARKS_URL = "http://localhost:5000/marks";

const emptyForm = {
  studentId: "",
  subject: "",
  marksObtained: "",
  totalMarks: "",
};

function Marks() {
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  // Add the login token to every protected API request.
  function getHeaders(includeJson = false) {
    const token = localStorage.getItem("token");

    return {
      ...(includeJson ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
    };
  }

  async function loadData() {
    setLoading(true);

    try {
      const [studentsResponse, marksResponse] = await Promise.all([
        fetch(STUDENTS_URL, { headers: getHeaders() }),
        fetch(MARKS_URL, { headers: getHeaders() }),
      ]);

      const studentsData = await studentsResponse.json();
      const marksData = await marksResponse.json();

      if (!studentsResponse.ok) {
        throw new Error(
          studentsData.message || "Could not load students."
        );
      }

      if (!marksResponse.ok) {
        throw new Error(
          marksData.message || "Could not load marks."
        );
      }

      setStudents(studentsData);
      setMarks(marksData);
    } catch (error) {
      setMessage(error.message || "Cannot load data. Check the backend.");
      setMessageType("error");
    } finally {
      setLoading(false);
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
  }

  function validateForm() {
    const subject = form.subject.trim();

    if (!form.studentId) {
      return "Please select a student.";
    }

    if (!subject) {
      return "Please enter a subject name.";
    }

    if (!/[a-zA-Z]/.test(subject)) {
      return "Subject name must contain letters.";
    }

    if (!/^[a-zA-Z0-9][a-zA-Z0-9 .&()_-]*$/.test(subject)) {
      return "Subject name contains invalid characters.";
    }

    if (
      form.marksObtained.trim() === "" ||
      form.totalMarks.trim() === ""
    ) {
      return "Please enter both obtained marks and total marks.";
    }

    const obtained = Number(form.marksObtained);
    const total = Number(form.totalMarks);

    if (
      !Number.isFinite(obtained) ||
      !Number.isFinite(total)
    ) {
      return "Please enter valid numeric marks.";
    }

    if (obtained < 0) {
      return "Obtained marks cannot be negative.";
    }

    if (total <= 0) {
      return "Total marks must be greater than 0.";
    }

    if (obtained > total) {
      return "Obtained marks cannot exceed total marks.";
    }

    const duplicate = marks.some((mark) => {
      const existingStudentId =
        mark.studentId?._id || mark.studentId;

      return (
        existingStudentId === form.studentId &&
        mark.subject?.trim().toLowerCase() === subject.toLowerCase() &&
        mark._id !== editingId
      );
    });

    if (duplicate) {
      return "Marks for this subject and student already exist.";
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
        editingId ? `${MARKS_URL}/${editingId}` : MARKS_URL,
        {
          method: editingId ? "PUT" : "POST",
          headers: getHeaders(true),
          body: JSON.stringify({
            studentId: form.studentId,
            subject: form.subject.trim(),
            marksObtained: Number(form.marksObtained),
            totalMarks: Number(form.totalMarks),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save marks.");
      }

      setMessage(
        editingId
          ? "Marks updated successfully!"
          : "Marks added successfully!"
      );
      setMessageType("success");

      cancelEdit();
      await loadData();
    } catch (error) {
      setMessage(error.message || "Unable to save marks.");
      setMessageType("error");
    }
  }

  function handleEdit(mark) {
    setForm({
      studentId: mark.studentId?._id || mark.studentId || "",
      subject: mark.subject || "",
      marksObtained: String(mark.marksObtained ?? ""),
      totalMarks: String(mark.totalMarks ?? ""),
    });

    setEditingId(mark._id);
    setMessage("");
    setMessageType("");
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete these marks?")) {
      return;
    }

    try {
      const response = await fetch(`${MARKS_URL}/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete marks.");
      }

      setMessage("Marks deleted successfully!");
      setMessageType("success");

      if (editingId === id) {
        cancelEdit();
      }

      await loadData();
    } catch (error) {
      setMessage(error.message || "Unable to delete marks.");
      setMessageType("error");
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  return (
    <div>
      <h2>Marks Management</h2>
      <p>Add, update, and manage student subject marks.</p>

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
          name="subject"
          placeholder="Subject Name"
          value={form.subject}
          onChange={handleChange}
          maxLength={60}
          required
        />

        <input
          name="marksObtained"
          type="number"
          placeholder="Marks Obtained"
          value={form.marksObtained}
          onChange={handleChange}
          min="0"
          step="any"
          required
        />

        <input
          name="totalMarks"
          type="number"
          placeholder="Total Marks"
          value={form.totalMarks}
          onChange={handleChange}
          min="0.01"
          step="any"
          required
        />

        <button type="submit">
          {editingId ? "Update Marks" : "Add Marks"}
        </button>

        {editingId && (
          <button type="button" onClick={cancelEdit}>
            Cancel
          </button>
        )}
      </form>

      <div className="student-table-container">
        <table className="student-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Roll Number</th>
              <th>Subject</th>
              <th>Marks</th>
              <th>Percentage</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && marks.length === 0 ? (
              <tr>
                <td colSpan="6">Loading marks...</td>
              </tr>
            ) : (
              <>
                {marks.map((mark) => (
                  <tr key={mark._id}>
                    <td>{mark.studentId?.name || "Student deleted"}</td>
                    <td>{mark.studentId?.rollNumber || "-"}</td>
                    <td>{mark.subject}</td>
                    <td>
                      {mark.marksObtained} / {mark.totalMarks}
                    </td>
                    <td>
                      {Number(mark.totalMarks) > 0
                        ? (
                            (mark.marksObtained / mark.totalMarks) *
                            100
                          ).toFixed(1) + "%"
                        : "-"}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleEdit(mark)}
                      >
                        Edit
                      </button>{" "}
                      <button
                        type="button"
                        onClick={() => handleDelete(mark._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {marks.length === 0 && (
                  <tr>
                    <td colSpan="6">No marks records found.</td>
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

export default Marks;
