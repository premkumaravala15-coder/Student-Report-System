import { useEffect, useState } from "react";

function StudentParentDashboard({ user, onLogout }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadReport() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5000/my-report",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load your report."
          );
        }

        if (!cancelled) {
          setReport(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load your report.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadReport();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className="page-card"><h2>Loading your report...</h2></div>;
  }

  if (error) {
    return (
      <div className="page-card">
        <h2>Progress Report</h2>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={onLogout}>Logout</button>
      </div>
    );
  }

  if (!report?.student) {
    return <div className="page-card"><p>No student report found.</p></div>;
  }

  const { student, marks = [], attendance = [], remarks = [] } = report;

  const totalObtained = marks.reduce(
    (sum, item) => sum + Number(item.marksObtained || 0),
    0
  );

  const totalMarks = marks.reduce(
    (sum, item) => sum + Number(item.totalMarks || 0),
    0
  );

  const percentage =
    totalMarks > 0 ? (totalObtained / totalMarks) * 100 : 0;

  const presentCount = attendance.filter(
    (item) => item.status === "Present"
  ).length;

  const attendancePercentage =
    attendance.length > 0
      ? (presentCount / attendance.length) * 100
      : 0;

  return (
    <div className="page-card">
      <div className="report-header">
        <div>
          <h1>My Progress Report</h1>
          <p>
            Welcome, {user?.name || student.name}!
            {" "}Here is your academic progress.
          </p>
        </div>

        <button onClick={onLogout}>Logout</button>
      </div>

      <section>
        <h2>Student Details</h2>
        <p><strong>Name:</strong> {student.name}</p>
        <p><strong>Roll Number:</strong> {student.rollNumber}</p>
        <p><strong>Class:</strong> {student.className}</p>
      </section>

      <div className="cards">
        <div className="card">
          <h3>Total Marks</h3>
          <h2>{totalObtained} / {totalMarks}</h2>
        </div>

        <div className="card">
          <h3>Percentage</h3>
          <h2>{percentage.toFixed(1)}%</h2>
        </div>

        <div className="card">
          <h3>Attendance</h3>
          <h2>{attendancePercentage.toFixed(1)}%</h2>
        </div>

        <div className="card">
          <h3>Subjects</h3>
          <h2>{marks.length}</h2>
        </div>
      </div>

      <section>
        <h2>Subject Marks</h2>

        {marks.length === 0 ? (
          <p>No marks have been entered yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Marks Obtained</th>
                  <th>Total Marks</th>
                  <th>Percentage</th>
                </tr>
              </thead>

              <tbody>
                {marks.map((item) => (
                  <tr key={item._id}>
                    <td>{item.subject}</td>
                    <td>{item.marksObtained}</td>
                    <td>{item.totalMarks}</td>
                    <td>
                      {Number(item.totalMarks) > 0
                        ? (
                            (Number(item.marksObtained) /
                              Number(item.totalMarks)) *
                            100
                          ).toFixed(1) + "%"
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2>Attendance Records</h2>

        <p>
          Present: {presentCount} | Absent:{" "}
          {attendance.filter((item) => item.status === "Absent").length}
          {" "} | Total: {attendance.length}
        </p>

        {attendance.length === 0 ? (
          <p>No attendance records have been entered yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {attendance.map((item) => (
                  <tr key={item._id}>
                    <td>
                      {item.date
                        ? new Date(item.date).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2>Teacher Remarks</h2>

        {remarks.length === 0 ? (
          <p>No teacher remarks have been added yet.</p>
        ) : (
          remarks.map((item) => (
            <div
              className="card"
              key={item._id}
              style={{ marginBottom: "12px" }}
            >
              <h3>{item.subject || "General Remark"}</h3>
              <p>{item.remark}</p>
              <small>
                {item.date
                  ? new Date(item.date).toLocaleDateString()
                  : ""}
              </small>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default StudentParentDashboard;