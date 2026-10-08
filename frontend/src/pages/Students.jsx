import { useEffect, useState } from "react";

function Students() {
  const [students, setStudents] = useState([]);

  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [className, setClassName] = useState("");
  const [email, setEmail] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  // GET STUDENTS
  const getStudents = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/students"
      );

      const data = await response.json();

      setStudents(data);
    } catch (error) {
      console.log("Error fetching students:", error);
    }
  };

  useEffect(() => {
    getStudents();
  }, []);

  // ADD / UPDATE
  const saveStudent = async (e) => {
    e.preventDefault();

    if (!name || !rollNumber || !className || !email) {
      alert("Please fill all fields");
      return;
    }

    const studentData = {
      name,
      rollNumber,
      className,
      email
    };

    try {
      let response;

      if (editingId) {
        response = await fetch(
          `http://localhost:5000/students/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(studentData)
          }
        );
      } else {
        response = await fetch(
          "http://localhost:5000/students",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(studentData)
          }
        );
      }

      const data = await response.json();

      if (response.ok) {
        alert(
          editingId
            ? "Student updated successfully!"
            : "Student added successfully!"
        );

        clearForm();
        getStudents();
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error);
      alert("Cannot connect to backend");
    }
  };

  // CLEAR FORM
  const clearForm = () => {
    setName("");
    setRollNumber("");
    setClassName("");
    setEmail("");
    setEditingId(null);
  };

  // EDIT
  const editStudent = (student) => {
    setEditingId(student._id);
    setName(student.name);
    setRollNumber(student.rollNumber);
    setClassName(student.className);
    setEmail(student.email);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // DELETE
  const deleteStudent = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:5000/students/${id}`,
        {
          method: "DELETE"
        }
      );

      if (response.ok) {
        alert("Student deleted successfully!");
        getStudents();
      } else {
        alert("Error deleting student");
      }
    } catch (error) {
      console.log(error);
      alert("Cannot connect to backend");
    }
  };

  // SEARCH
  const filteredStudents = students.filter((student) => {
    const text = search.toLowerCase();

    return (
      student.name?.toLowerCase().includes(text) ||
      student.rollNumber?.toString().includes(text) ||
      student.className?.toLowerCase().includes(text) ||
      student.email?.toLowerCase().includes(text)
    );
  });

  return (
    <div className="modern-page">

      {/* HEADER */}
      <div className="modern-page-header">

        <div>
          <div className="page-label">
            ACADEMIC MANAGEMENT
          </div>

          <h1>Students</h1>

          <p>
            Manage student information and academic profiles.
          </p>
        </div>

        <div className="header-stat">
          <span>👨‍🎓</span>
          <div>
            <strong>{students.length}</strong>
            <small>Total Students</small>
          </div>
        </div>

      </div>


      {/* STAT CARDS */}
      <div className="modern-stat-grid">

        <div className="modern-stat-card">
          <div className="stat-icon blue">👨‍🎓</div>

          <div>
            <span>Total Students</span>
            <strong>{students.length}</strong>
          </div>
        </div>


        <div className="modern-stat-card">
          <div className="stat-icon purple">📚</div>

          <div>
            <span>Classes</span>
            <strong>
              {new Set(
                students.map((student) => student.className)
              ).size}
            </strong>
          </div>
        </div>


        <div className="modern-stat-card">
          <div className="stat-icon green">✓</div>

          <div>
            <span>Active Records</span>
            <strong>{students.length}</strong>
          </div>
        </div>


        <div className="modern-stat-card">
          <div className="stat-icon orange">📈</div>

          <div>
            <span>Profiles</span>
            <strong>100%</strong>
          </div>
        </div>

      </div>


      {/* ADD STUDENT */}
      <div className="modern-card">

        <div className="modern-card-header">

          <div>
            <h2>
              {editingId
                ? "Edit Student"
                : "Add New Student"}
            </h2>

            <p>
              Enter the student's basic information.
            </p>
          </div>

          <div className="card-symbol">
            {editingId ? "✏️" : "➕"}
          </div>

        </div>


        <form
          className="modern-student-form"
          onSubmit={saveStudent}
        >

          <div className="modern-input-group">
            <label>Student Name</label>

            <input
              type="text"
              placeholder="Enter student name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />
          </div>


          <div className="modern-input-group">
            <label>Roll Number</label>

            <input
              type="text"
              placeholder="Enter roll number"
              value={rollNumber}
              onChange={(e) =>
                setRollNumber(e.target.value)
              }
            />
          </div>


          <div className="modern-input-group">
            <label>Class</label>

            <input
              type="text"
              placeholder="Enter class"
              value={className}
              onChange={(e) =>
                setClassName(e.target.value)
              }
            />
          </div>


          <div className="modern-input-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />
          </div>


          <div className="modern-form-buttons">

            <button
              type="submit"
              className="primary-modern-button"
            >
              {editingId
                ? "✓ Update Student"
                : "+ Add Student"}
            </button>


            {editingId && (
              <button
                type="button"
                className="secondary-modern-button"
                onClick={clearForm}
              >
                Cancel
              </button>
            )}

          </div>

        </form>

      </div>


      {/* STUDENT LIST */}
      <div className="modern-card">

        <div className="modern-list-header">

          <div>
            <h2>Student Directory</h2>

            <p>
              All registered students
            </p>
          </div>


          <div className="modern-search">

            <span>🔍</span>

            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

        </div>


        {filteredStudents.length === 0 ? (

          <div className="empty-modern">

            <div>👨‍🎓</div>

            <h3>
              No students found
            </h3>

            <p>
              Add a student or try another search.
            </p>

          </div>

        ) : (

          <div className="modern-table-wrapper">

            <table className="modern-table">

              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll Number</th>
                  <th>Class</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>


              <tbody>

                {filteredStudents.map(
                  (student) => (

                    <tr key={student._id}>

                      <td>

                        <div className="student-cell">

                          <div className="student-avatar">
                            {student.name
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {student.name}
                            </strong>

                            <small>
                              Student
                            </small>
                          </div>

                        </div>

                      </td>


                      <td>
                        <span className="roll-badge">
                          {student.rollNumber}
                        </span>
                      </td>


                      <td>
                        <span className="class-badge">
                          {student.className}
                        </span>
                      </td>


                      <td>
                        {student.email}
                      </td>


                      <td>

                        <div className="table-actions">

                          <button
                            className="edit-button"
                            onClick={() =>
                              editStudent(student)
                            }
                          >
                            ✏️ Edit
                          </button>


                          <button
                            className="delete-button"
                            onClick={() =>
                              deleteStudent(
                                student._id
                              )
                            }
                          >
                            🗑 Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Students;
