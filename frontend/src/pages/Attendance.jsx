import { useEffect, useState } from "react";

function Attendance() {
  const [students, setStudents] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);

  const [studentId, setStudentId] = useState("");
  const [percentage, setPercentage] = useState("");

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
  // GET ATTENDANCE
  // =========================

  const getAttendance = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/attendance"
      );

      const data = await response.json();

      setAttendanceList(data);
    } catch (error) {
      console.log(
        "Error loading attendance:",
        error
      );
    }
  };

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
    getStudents();
    getAttendance();
  }, []);

  // =========================
  // ADD / UPDATE
  // =========================

  const saveAttendance = async (e) => {
    e.preventDefault();

    if (!studentId || percentage === "") {
      alert("Please select a student and enter attendance");
      return;
    }

    const attendanceData = {
      studentId: studentId,
      percentage: Number(percentage),
    };

    try {
      let response;

      // UPDATE
      if (editingId) {
        response = await fetch(
          `http://localhost:5000/attendance/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(attendanceData),
          }
        );
      }

      // ADD
      else {
        response = await fetch(
          "http://localhost:5000/attendance",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(attendanceData),
          }
        );
      }

      const data = await response.json();

      if (response.ok) {
        alert(
          editingId
            ? "Attendance updated successfully!"
            : "Attendance added successfully!"
        );

        clearForm();
        getAttendance();
      } else {
        alert(
          data.message ||
            "Something went wrong"
        );
      }
    } catch (error) {
      console.log(error);

      alert(
        "Cannot connect to backend"
      );
    }
  };

  // =========================
  // EDIT
  // =========================

  const editAttendance = (item) => {
    setEditingId(item._id);

    setStudentId(item.studentId);

    setPercentage(
      item.percentage ??
        item.attendance ??
        item.present ??
        ""
    );
  };

  // =========================
  // DELETE
  // =========================

  const deleteAttendance = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this attendance?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/attendance/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert(
          "Attendance deleted successfully!"
        );

        getAttendance();
      } else {
        alert(
          "Error deleting attendance"
        );
      }
    } catch (error) {
      console.log(error);

      alert(
        "Cannot connect to backend"
      );
    }
  };

  // =========================
  // CLEAR FORM
  // =========================

  const clearForm = () => {
    setStudentId("");
    setPercentage("");
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
  // ATTENDANCE STATUS
  // =========================

  const getStatus = (value) => {
    if (value >= 75) {
      return (
        <span className="status-badge good">
          Good
        </span>
      );
    }

    if (value >= 60) {
      return (
        <span className="status-badge average">
          Average
        </span>
      );
    }

    return (
      <span className="status-badge low">
        Low
      </span>
    );
  };

  // =========================
  // PAGE
  // =========================

  return (
    <div className="page attendance-page">

      {/* PAGE HEADER */}

      <div className="page-heading">

        <div>
          <h1>
            Attendance Management
          </h1>

          <p>
            Track and manage student attendance
          </p>
        </div>

        <div className="page-heading-icon">
          📅
        </div>

      </div>

      {/* =========================
          ADD ATTENDANCE
      ========================= */}

      <div className="form-container attendance-form">

        <div className="section-title">

          <span>📊</span>

          <div>
            <h2>
              {editingId
                ? "Edit Attendance"
                : "Add Student Attendance"}
            </h2>

            <p>
              Select a student from your student records
            </p>
          </div>

        </div>

        <form onSubmit={saveAttendance}>

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

          {/* ATTENDANCE */}

          <div className="input-group">

            <label>
              Attendance Percentage
            </label>

            <input
              type="number"
              min="0"
              max="100"
              placeholder="Enter percentage"
              value={percentage}
              onChange={(e) =>
                setPercentage(
                  e.target.value
                )
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
                ? "Update Attendance"
                : "Add Attendance"}
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
          ATTENDANCE LIST
      ========================= */}

      <div className="students-section attendance-list">

        <div className="list-heading">

          <div>

            <h2>
              Student Attendance
            </h2>

            <p>
              {attendanceList.length} record
              {attendanceList.length !== 1
                ? "s"
                : ""}
            </p>

          </div>

          <div className="list-icon">
            📅
          </div>

        </div>

        {attendanceList.length === 0 ? (

          <div className="empty-state">

            <div>
              📅
            </div>

            <h3>
              No attendance available
            </h3>

            <p>
              Add attendance for a student
              using the form above.
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
                    Attendance
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {attendanceList.map(
                  (item) => {

                    const value =
                      item.percentage ??
                      item.attendance ??
                      item.present ??
                      0;

                    return (

                      <tr
                        key={item._id}
                      >

                        <td>

                          <strong>
                            {getStudentName(
                              item.studentId
                            )}
                          </strong>

                        </td>

                        <td>

                          <div className="attendance-value">

                            <strong>
                              {value}%
                            </strong>

                            <div className="attendance-bar">

                              <div
                                className="attendance-progress"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(
                                      0,
                                      Number(value)
                                    )
                                  )}%`,
                                }}
                              />

                            </div>

                          </div>

                        </td>

                        <td>
                          {getStatus(
                            Number(value)
                          )}
                        </td>

                        <td>

                          <button
                            className="edit-button"
                            onClick={() =>
                              editAttendance(
                                item
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              deleteAttendance(
                                item._id
                              )
                            }
                          >
                            Delete
                          </button>

                        </td>

                      </tr>

                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Attendance;