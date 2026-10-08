import { useEffect, useState } from "react";

function Reports({ user }) {
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [remarks, setRemarks] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState("");
  const [loading, setLoading] = useState(true);

  // =========================
  // LOAD ALL DATA
  // =========================

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          studentsRes,
          marksRes,
          attendanceRes,
          remarksRes,
        ] = await Promise.all([
          fetch("http://localhost:5000/students"),
          fetch("http://localhost:5000/marks"),
          fetch("http://localhost:5000/attendance"),
          fetch("http://localhost:5000/remarks"),
        ]);

        const studentsData = await studentsRes.json();
        const marksData = await marksRes.json();
        const attendanceData =
          await attendanceRes.json();
        const remarksData =
          await remarksRes.json();

        setStudents(studentsData);
        setMarks(marksData);
        setAttendance(attendanceData);
        setRemarks(remarksData);

        // Student login
        if (user?.role === "student") {
          const student = studentsData.find(
            (item) =>
              item.name === user.studentName ||
              item.rollNumber === user.rollNumber
          );

          if (student) {
            setSelectedStudent(student._id);
          }
        }

        // Parent login
        if (user?.role === "parent") {
          const student = studentsData.find(
            (item) =>
              item.name === user.studentName ||
              item.rollNumber === user.rollNumber
          );

          if (student) {
            setSelectedStudent(student._id);
          }
        }
      } catch (error) {
        console.log(
          "Error loading reports:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // =========================
  // SELECTED STUDENT
  // =========================

  const student = students.find(
    (item) => item._id === selectedStudent
  );

  // =========================
  // STUDENT MARKS
  // =========================

  const studentMarks = marks.filter(
    (item) =>
      item.studentId === selectedStudent
  );

  // =========================
  // STUDENT ATTENDANCE
  // =========================

  const studentAttendance =
    attendance.find(
      (item) =>
        item.studentId === selectedStudent
    );

  // =========================
  // STUDENT REMARKS
  // =========================

  const studentRemarks = remarks.filter(
    (item) =>
      item.studentId === selectedStudent
  );

  // =========================
  // CALCULATE MARKS
  // =========================

  const getMarkValue = (item) => {
    return Number(
      item.marks ??
        item.mark ??
        item.score ??
        0
    );
  };

  const totalMarks = studentMarks.reduce(
    (total, item) =>
      total + getMarkValue(item),
    0
  );

  const averageMarks =
    studentMarks.length > 0
      ? totalMarks / studentMarks.length
      : 0;

  // =========================
  // ATTENDANCE
  // =========================

  const attendanceValue =
    studentAttendance
      ? Number(
          studentAttendance.percentage ??
            studentAttendance.attendance ??
            studentAttendance.present ??
            0
        )
      : 0;

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="page">
        <div className="report-loading">
          <div className="loading-icon">
            📊
          </div>

          <h2>
            Loading Reports...
          </h2>

          <p>
            Please wait while we prepare the
            student report.
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // TEACHER VIEW
  // =========================

  return (
    <div className="page reports-page">

      {/* HEADER */}

      <div className="page-heading">

        <div>
          <h1>
            Academic Reports
          </h1>

          <p>
            View complete student academic
            performance
          </p>
        </div>

        <div className="page-heading-icon">
          📊
        </div>

      </div>

      {/* =========================
          TEACHER SELECT STUDENT
      ========================= */}

      {user?.role === "teacher" && (

        <div className="report-selector">

          <div>
            <h3>
              Select Student
            </h3>

            <p>
              Choose a student to view their
              complete report.
            </p>
          </div>

          <select
            value={selectedStudent}
            onChange={(e) =>
              setSelectedStudent(
                e.target.value
              )
            }
          >

            <option value="">
              Select Student
            </option>

            {students.map((item) => (

              <option
                key={item._id}
                value={item._id}
              >
                {item.name} - Roll No.{" "}
                {item.rollNumber}
              </option>

            ))}

          </select>

        </div>

      )}

      {/* =========================
          NO STUDENT
      ========================= */}

      {!student && (

        <div className="empty-state">

          <div>
            👨‍🎓
          </div>

          <h3>
            Select a Student
          </h3>

          <p>
            Select a student to view the
            complete academic report.
          </p>

        </div>

      )}

      {/* =========================
          REPORT
      ========================= */}

      {student && (

        <div className="complete-report">

          {/* STUDENT HEADER */}

          <div className="report-header">

            <div className="student-avatar">
              {student.name
                ? student.name
                    .charAt(0)
                    .toUpperCase()
                : "S"}
            </div>

            <div>

              <h2>
                {student.name}
              </h2>

              <p>
                Roll No. {student.rollNumber}
                {" • "}
                Class {student.className}
              </p>

              <span>
                {student.email}
              </span>

            </div>

          </div>

          {/* SUMMARY CARDS */}

          <div className="report-summary">

            <div className="summary-card">

              <span className="summary-icon">
                📝
              </span>

              <div>

                <p>
                  Average Marks
                </p>

                <h3>
                  {averageMarks.toFixed(1)}
                </h3>

              </div>

            </div>

            <div className="summary-card">

              <span className="summary-icon">
                📅
              </span>

              <div>

                <p>
                  Attendance
                </p>

                <h3>
                  {attendanceValue}%
                </h3>

              </div>

            </div>

            <div className="summary-card">

              <span className="summary-icon">
                📚
              </span>

              <div>

                <p>
                  Subjects
                </p>

                <h3>
                  {studentMarks.length}
                </h3>

              </div>

            </div>

            <div className="summary-card">

              <span className="summary-icon">
                💬
              </span>

              <div>

                <p>
                  Remarks
                </p>

                <h3>
                  {studentRemarks.length}
                </h3>

              </div>

            </div>

          </div>

          {/* =========================
              MARKS
          ========================= */}

          <div className="report-section">

            <div className="report-section-title">

              <div>
                📝
              </div>

              <div>
                <h3>
                  Academic Performance
                </h3>

                <p>
                  Subject-wise marks
                </p>
              </div>

            </div>

            {studentMarks.length === 0 ? (

              <div className="report-empty">
                No marks available.
              </div>

            ) : (

              <table className="report-table">

                <thead>

                  <tr>

                    <th>
                      Subject
                    </th>

                    <th>
                      Marks
                    </th>

                    <th>
                      Performance
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {studentMarks.map(
                    (item) => {

                      const value =
                        getMarkValue(item);

                      return (

                        <tr
                          key={item._id}
                        >

                          <td>
                            {item.subject ||
                              "Subject"}
                          </td>

                          <td>
                            <strong>
                              {value}
                            </strong>
                          </td>

                          <td>

                            {value >= 75 ? (
                              <span className="status-badge good">
                                Excellent
                              </span>
                            ) : value >= 50 ? (
                              <span className="status-badge average">
                                Average
                              </span>
                            ) : (
                              <span className="status-badge low">
                                Needs Improvement
                              </span>
                            )}

                          </td>

                        </tr>

                      );
                    }
                  )}

                </tbody>

              </table>

            )}

          </div>

          {/* =========================
              ATTENDANCE
          ========================= */}

          <div className="report-section">

            <div className="report-section-title">

              <div>
                📅
              </div>

              <div>
                <h3>
                  Attendance
                </h3>

                <p>
                  Student attendance record
                </p>
              </div>

            </div>

            {studentAttendance ? (

              <div className="attendance-report">

                <div className="attendance-circle">

                  <strong>
                    {attendanceValue}%
                  </strong>

                  <span>
                    Attendance
                  </span>

                </div>

                <div>

                  <h3>
                    Attendance Status
                  </h3>

                  <p>

                    {attendanceValue >= 75
                      ? "Good attendance"
                      : "Attendance needs improvement"}

                  </p>

                </div>

              </div>

            ) : (

              <div className="report-empty">
                No attendance available.
              </div>

            )}

          </div>

          {/* =========================
              REMARKS
          ========================= */}

          <div className="report-section">

            <div className="report-section-title">

              <div>
                💬
              </div>

              <div>
                <h3>
                  Teacher Remarks
                </h3>

                <p>
                  Feedback from teachers
                </p>
              </div>

            </div>

            {studentRemarks.length === 0 ? (

              <div className="report-empty">
                No teacher remarks available.
              </div>

            ) : (

              <div className="report-remarks">

                {studentRemarks.map(
                  (item) => (

                    <div
                      className="remark-card"
                      key={item._id}
                    >

                      <span>
                        “
                      </span>

                      <p>
                        {item.remark ||
                          item.remarks ||
                          "No remark"}
                      </p>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

          {/* FOOTER */}

          <div className="report-footer">

            <span>
              Student Report System
            </span>

            <span>
              Track • Learn • Grow
            </span>

          </div>

        </div>

      )}

    </div>
  );
}

export default Reports;