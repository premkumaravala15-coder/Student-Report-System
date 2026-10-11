
import { useCallback, useEffect, useState } from "react";

const STUDENTS_URL = "http://localhost:5000/students";
const MARKS_URL = "http://localhost:5000/marks";
const ATTENDANCE_URL = "http://localhost:5000/attendance";
const REMARKS_URL = "http://localhost:5000/remarks";

// Add the teacher's login token to every API request.
function getHeaders() {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
}

function getStudentId(item) {
  return item?.studentId?._id || item?.studentId || "";
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN");
}

function Reports() {
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [remarks, setRemarks] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchReportData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const headers = getHeaders();

      const responses = await Promise.all([
        fetch(STUDENTS_URL, { headers }),
        fetch(MARKS_URL, { headers }),
        fetch(ATTENDANCE_URL, { headers }),
        fetch(REMARKS_URL, { headers }),
      ]);

      const responseData = await Promise.all(
        responses.map(async (response) => {
          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message || "Unable to load report data."
            );
          }

          return data;
        })
      );

      const [studentData, markData, attendanceData, remarkData] =
        responseData;

      if (
        !Array.isArray(studentData) ||
        !Array.isArray(markData) ||
        !Array.isArray(attendanceData) ||
        !Array.isArray(remarkData)
      ) {
        throw new Error("The backend returned invalid report data.");
      }

      setStudents(studentData);
      setMarks(markData);
      setAttendance(attendanceData);
      setRemarks(remarkData);

      setSelectedStudent((previousSelected) => {
        const studentStillExists = studentData.some(
          (student) => student._id === previousSelected
        );

        if (studentStillExists) {
          return previousSelected;
        }

        return studentData[0]?._id || "";
      });
    } catch (err) {
      setError(
        err.message ||
          "Cannot connect to the backend. Check your server."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const student = students.find(
    (item) => item._id === selectedStudent
  );

  const studentMarks = marks.filter(
    (item) => getStudentId(item) === selectedStudent
  );

  const studentAttendance = attendance.filter(
    (item) => getStudentId(item) === selectedStudent
  );

  const studentRemarks = remarks
    .filter((item) => getStudentId(item) === selectedStudent)
    .sort(
      (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
    );

  const totalObtained = studentMarks.reduce(
    (sum, item) => sum + Number(item.marksObtained || 0),
    0
  );

  const totalMarks = studentMarks.reduce(
    (sum, item) => sum + Number(item.totalMarks || 0),
    0
  );

  const overallPercentage =
    totalMarks > 0
      ? ((totalObtained / totalMarks) * 100).toFixed(2)
      : "0.00";

  const totalClasses = studentAttendance.length;

  const presentCount = studentAttendance.filter(
    (item) => item.status === "Present"
  ).length;

  const absentCount = studentAttendance.filter(
    (item) => item.status === "Absent"
  ).length;

  const attendancePercentage =
    totalClasses > 0
      ? ((presentCount / totalClasses) * 100).toFixed(2)
      : "0.00";

  if (loading) {
    return (
      <div className="report-page">
        <h2>Loading Progress Reports...</h2>
      </div>
    );
  }

  return (
    <div className="report-page">
      <div className="report-header">
        <div>
          <h1>Progress Reports</h1>
          <p>View student marks, attendance, and teacher remarks.</p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => fetchReportData(true)}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh Report"}
          </button>{" "}

          <button
            type="button"
            className="report-print-button"
            onClick={() => window.print()}
            disabled={!student}
          >
            Print Report
          </button>
        </div>
      </div>

      {error && (
        <div className="report-card">
          <p className="report-error">{error}</p>
          <p>Make sure your backend is running on port 5000.</p>
          <button
            type="button"
            onClick={() => fetchReportData(true)}
            disabled={refreshing}
          >
            Try Again
          </button>
        </div>
      )}

      <div className="report-card">
        <label htmlFor="report-student">Select Student</label>

        <select
          id="report-student"
          value={selectedStudent}
          onChange={(event) => setSelectedStudent(event.target.value)}
        >
          {students.length === 0 && (
            <option value="">No students available</option>
          )}

          {students.map((item) => (
            <option key={item._id} value={item._id}>
              {item.name} - {item.rollNumber}
            </option>
          ))}
        </select>
      </div>

      {!student ? (
        <div className="report-card">
          <p>Please add a student first to generate a report.</p>
        </div>
      ) : (
        <>
          <div className="report-card">
            <h2>Student Details</h2>

            <div className="report-student-details">
              <p><strong>Name:</strong> {student.name || "-"}</p>
              <p><strong>Roll Number:</strong> {student.rollNumber || "-"}</p>
              <p><strong>Class:</strong> {student.className || "-"}</p>
              <p><strong>Email:</strong> {student.email || "-"}</p>
            </div>
          </div>

          <div className="report-summary">
            <div className="report-stat-card">
              <h3>Overall Marks</h3>
              <p>{overallPercentage}%</p>
              <span>
                {totalObtained} / {totalMarks} marks
              </span>
            </div>

            <div className="report-stat-card">
              <h3>Attendance</h3>
              <p>{attendancePercentage}%</p>
              <span>
                {presentCount} present out of {totalClasses} classes
              </span>
            </div>

            <div className="report-stat-card">
              <h3>Subjects</h3>
              <p>{studentMarks.length}</p>
              <span>Subjects with saved marks</span>
            </div>

            <div className="report-stat-card">
              <h3>Teacher Remarks</h3>
              <p>{studentRemarks.length}</p>
              <span>Saved remarks</span>
            </div>
          </div>

          <div className="report-card">
            <h2>Subject-wise Marks</h2>

            {studentMarks.length === 0 ? (
              <p>No marks have been added for this student yet.</p>
            ) : (
              <div className="report-table-wrapper">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Marks Obtained</th>
                      <th>Total Marks</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>

                  <tbody>
                    {studentMarks.map((item) => {
                      const obtained = Number(item.marksObtained);
                      const total = Number(item.totalMarks);

                      const percentage =
                        Number.isFinite(obtained) &&
                        Number.isFinite(total) &&
                        total > 0
                          ? ((obtained / total) * 100).toFixed(2)
                          : "0.00";

                      return (
                        <tr key={item._id}>
                          <td>{item.subject || "-"}</td>
                          <td>{item.marksObtained ?? 0}</td>
                          <td>{item.totalMarks ?? 0}</td>
                          <td>{percentage}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="report-card">
            <h2>Attendance Summary</h2>

            <div className="report-student-details">
              <p><strong>Total Classes:</strong> {totalClasses}</p>
              <p><strong>Present:</strong> {presentCount}</p>
              <p><strong>Absent:</strong> {absentCount}</p>
              <p>
                <strong>Attendance Percentage:</strong>{" "}
                {attendancePercentage}%
              </p>
            </div>
          </div>

          <div className="report-card">
            <h2>Teacher Remarks</h2>

            {studentRemarks.length === 0 ? (
              <p>
                No teacher remarks have been added for this student yet.
              </p>
            ) : (
              <div className="report-table-wrapper">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Subject</th>
                      <th>Remark</th>
                    </tr>
                  </thead>

                  <tbody>
                    {studentRemarks.map((item) => (
                      <tr key={item._id}>
                        <td>{formatDate(item.date)}</td>
                        <td>{item.subject || "-"}</td>
                        <td>{item.remark || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;
