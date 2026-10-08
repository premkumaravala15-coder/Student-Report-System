import { useEffect, useState } from "react";

function Marks() {
  const [students, setStudents] = useState([]);
  const [marksList, setMarksList] = useState([]);

  const [studentId, setStudentId] = useState("");
  const [subject, setSubject] = useState("");
  const [marks, setMarks] = useState("");

  const [editingId, setEditingId] = useState(null);

  // =========================
  // GET STUDENTS
  // =========================

  const getStudents = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/students"
      );

      const data = await response.json();

      setStudents(data);
    } catch (error) {
      console.log("Error loading students:", error);
    }
  };

  // =========================
  // GET MARKS
  // =========================

  const getMarks = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/marks"
      );

      const data = await response.json();

      setMarksList(data);
    } catch (error) {
      console.log("Error loading marks:", error);
    }
  };

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
    getStudents();
    getMarks();
  }, []);

  // =========================
  // ADD / UPDATE MARKS
  // =========================

  const saveMarks = async (e) => {
    e.preventDefault();

    if (!studentId || !subject || marks === "") {
      alert("Please fill all fields");
      return;
    }

    const marksData = {
      studentId: studentId,
      subject: subject,
      marks: Number(marks),
    };

    try {
      let response;

      // UPDATE
      if (editingId) {
        response = await fetch(
          `http://localhost:5000/marks/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(marksData),
          }
        );
      }

      // ADD
      else {
        response = await fetch(
          "http://localhost:5000/marks",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(marksData),
          }
        );
      }

      const data = await response.json();

      if (response.ok) {
        alert(
          editingId
            ? "Marks updated successfully!"
            : "Marks added successfully!"
        );

        clearForm();
        getMarks();
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error);
      alert("Cannot connect to backend");
    }
  };

  // =========================
  // EDIT
  // =========================

  const editMarks = (mark) => {
    setEditingId(mark._id);
    setStudentId(mark.studentId);
    setSubject(mark.subject || "");
    setMarks(mark.marks ?? "");
  };

  // =========================
  // DELETE
  // =========================

  const deleteMarks = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete these marks?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/marks/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Marks deleted successfully!");
        getMarks();
      } else {
        alert("Error deleting marks");
      }
    } catch (error) {
      console.log(error);
      alert("Cannot connect to backend");
    }
  };

  // =========================
  // CLEAR FORM
  // =========================

  const clearForm = () => {
    setStudentId("");
    setSubject("");
    setMarks("");
    setEditingId(null);
  };

  // =========================
  // GET STUDENT NAME
  // =========================

  const getStudentName = (id) => {
    const student = students.find(
      (item) => item._id === id
    );

    if (!student) {
      return "Unknown Student";
    }

    return `${student.name} - ${student.rollNumber}`;
  };

  // =========================
  // PAGE
  // =========================

  return (
    <div className="page marks-page">

      <div className="page-heading">
        <div>
          <h1>Marks Management</h1>

          <p>
            Add and manage student marks
          </p>
        </div>

        <div className="page-heading-icon">
          📝
        </div>
      </div>

      {/* =========================
          ADD MARKS
      ========================= */}

      <div className="form-container marks-form">

        <div className="section-title">
          <span>📊</span>

          <div>
            <h2>
              {editingId
                ? "Edit Marks"
                : "Add Student Marks"}
            </h2>

            <p>
              Select a student from your student records
            </p>
          </div>
        </div>

        <form onSubmit={saveMarks}>

          {/* STUDENT */}

          <div className="input-group">

            <label>
              Student
            </label>

            <select
              value={studentId}
              onChange={(e) =>
                setStudentId(e.target.value)
              }
            >

              <option value="">
                Select Student
              </option>

              {students.map((student) => (

                <option
                  key={student._id}
                  value={student._id}
                >
                  {student.name} - Roll No.{" "}
                  {student.rollNumber}
                </option>

              ))}

            </select>

          </div>

          {/* SUBJECT */}

          <div className="input-group">

            <label>
              Subject
            </label>

            <select
              value={subject}
              onChange={(e) =>
                setSubject(e.target.value)
              }
            >

              <option value="">
                Select Subject
              </option>

              <option value="Mathematics">
                Mathematics
              </option>

              <option value="Physics">
                Physics
              </option>

              <option value="Chemistry">
                Chemistry
              </option>

              <option value="Computer Science">
                Computer Science
              </option>

              <option value="English">
                English
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>

          {/* MARKS */}

          <div className="input-group">

            <label>
              Marks
            </label>

            <input
              type="number"
              min="0"
              max="100"
              placeholder="Enter marks"
              value={marks}
              onChange={(e) =>
                setMarks(e.target.value)
              }
            />

          </div>

          {/* BUTTONS */}

          <div className="form-actions">

            <button
              type="submit"
              className="primary-button"
            >
              {editingId
                ? "Update Marks"
                : "Add Marks"}
            </button>

            {editingId && (

              <button
                type="button"
                className="cancel-button"
                onClick={clearForm}
              >
                Cancel
              </button>

            )}

          </div>

        </form>

      </div>

      {/* =========================
          MARKS LIST
      ========================= */}

      <div className="students-section marks-list">

        <div className="list-heading">

          <div>
            <h2>
              Student Marks
            </h2>

            <p>
              {marksList.length} record
              {marksList.length !== 1
                ? "s"
                : ""}
            </p>
          </div>

          <div className="list-icon">
            📚
          </div>

        </div>

        {marksList.length === 0 ? (

          <div className="empty-state">

            <div>
              📝
            </div>

            <h3>
              No marks available
            </h3>

            <p>
              Add marks for a student using
              the form above.
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>
                    Student
                  </th>

                  <th>
                    Subject
                  </th>

                  <th>
                    Marks
                  </th>

                  <th>
                    Performance
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {marksList.map((mark) => (

                  <tr key={mark._id}>

                    <td>

                      <strong>
                        {getStudentName(
                          mark.studentId
                        )}
                      </strong>

                    </td>

                    <td>
                      {mark.subject}
                    </td>

                    <td>

                      <span className="marks-value">
                        {mark.marks}
                      </span>
                      /100

                    </td>

                    <td>

                      {mark.marks >= 75 ? (
                        <span className="status-badge good">
                          Excellent
                        </span>
                      ) : mark.marks >= 50 ? (
                        <span className="status-badge average">
                          Average
                        </span>
                      ) : (
                        <span className="status-badge low">
                          Needs Improvement
                        </span>
                      )}

                    </td>

                    <td>

                      <button
                        className="edit-button"
                        onClick={() =>
                          editMarks(mark)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() =>
                          deleteMarks(
                            mark._id
                          )
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Marks;