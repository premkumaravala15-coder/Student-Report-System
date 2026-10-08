import { useEffect, useState } from "react";

function Remarks() {
  const [students, setStudents] = useState([]);
  const [remarksList, setRemarksList] = useState([]);

  const [studentId, setStudentId] = useState("");
  const [remark, setRemark] = useState("");

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
  // GET REMARKS
  // =========================

  const getRemarks = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/remarks"
      );

      const data = await response.json();

      setRemarksList(data);
    } catch (error) {
      console.log("Error loading remarks:", error);
    }
  };

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
    getStudents();
    getRemarks();
  }, []);

  // =========================
  // ADD / UPDATE REMARK
  // =========================

  const saveRemark = async (e) => {
    e.preventDefault();

    if (!studentId || !remark.trim()) {
      alert("Please select a student and enter a remark");
      return;
    }

    const remarkData = {
      studentId: studentId,
      remark: remark.trim(),
    };

    try {
      let response;

      // UPDATE
      if (editingId) {
        response = await fetch(
          `http://localhost:5000/remarks/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(remarkData),
          }
        );
      }

      // ADD
      else {
        response = await fetch(
          "http://localhost:5000/remarks",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(remarkData),
          }
        );
      }

      const data = await response.json();

      if (response.ok) {
        alert(
          editingId
            ? "Remark updated successfully!"
            : "Remark added successfully!"
        );

        clearForm();
        getRemarks();
      } else {
        alert(
          data.message || "Something went wrong"
        );
      }
    } catch (error) {
      console.log(error);

      alert("Cannot connect to backend");
    }
  };

  // =========================
  // EDIT
  // =========================

  const editRemark = (item) => {
    setEditingId(item._id);

    setStudentId(item.studentId);

    setRemark(
      item.remark ||
      item.remarks ||
      ""
    );
  };

  // =========================
  // DELETE
  // =========================

  const deleteRemark = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this remark?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/remarks/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Remark deleted successfully!");

        getRemarks();
      } else {
        alert("Error deleting remark");
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
    setRemark("");
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
    <div className="page remarks-page">

      {/* PAGE HEADER */}

      <div className="page-heading">

        <div>
          <h1>
            Teacher Remarks
          </h1>

          <p>
            Add and manage student performance remarks
          </p>
        </div>

        <div className="page-heading-icon">
          💬
        </div>

      </div>

      {/* =========================
          ADD REMARK
      ========================= */}

      <div className="form-container remarks-form">

        <div className="section-title">

          <span>💬</span>

          <div>
            <h2>
              {editingId
                ? "Edit Remark"
                : "Add Student Remark"}
            </h2>

            <p>
              Select a student and enter a teacher remark
            </p>
          </div>

        </div>

        <form onSubmit={saveRemark}>

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

          {/* REMARK */}

          <div className="input-group remark-input">

            <label>
              Teacher Remark
            </label>

            <textarea
              placeholder="Enter student's performance, behaviour or academic remark..."
              value={remark}
              onChange={(e) =>
                setRemark(e.target.value)
              }
              rows="5"
            />

          </div>

          {/* BUTTONS */}

          <div className="form-actions">

            <button
              type="submit"
              className="primary-button"
            >
              {editingId
                ? "Update Remark"
                : "Add Remark"}
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
          REMARKS LIST
      ========================= */}

      <div className="students-section remarks-list">

        <div className="list-heading">

          <div>

            <h2>
              Student Remarks
            </h2>

            <p>
              {remarksList.length} record
              {remarksList.length !== 1
                ? "s"
                : ""}
            </p>

          </div>

          <div className="list-icon">
            💬
          </div>

        </div>

        {remarksList.length === 0 ? (

          <div className="empty-state">

            <div>
              💬
            </div>

            <h3>
              No remarks available
            </h3>

            <p>
              Add a teacher remark using
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
                    Teacher Remark
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {remarksList.map((item) => (

                  <tr key={item._id}>

                    <td>

                      <strong>
                        {getStudentName(
                          item.studentId
                        )}
                      </strong>

                    </td>

                    <td>

                      <div className="remark-display">

                        <span className="quote-icon">
                          “
                        </span>

                        <span>
                          {item.remark ||
                            item.remarks ||
                            "No remark"}
                        </span>

                      </div>

                    </td>

                    <td>

                      <button
                        className="edit-button"
                        onClick={() =>
                          editRemark(item)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() =>
                          deleteRemark(
                            item._id
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

export default Remarks;