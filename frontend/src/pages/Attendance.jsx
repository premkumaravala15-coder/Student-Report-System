
import { useEffect, useState } from "react";

const STUDENTS_URL = "http://localhost:5000/students";
const ATTENDANCE_URL = "http://localhost:5000/attendance";

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getRecordDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

function Attendance() {
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [date, setDate] = useState(getToday());
  const [statusByStudent, setStatusByStudent] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Include the login token in protected API requests.
  function getHeaders(includeJson = false) {
    const token = localStorage.getItem("token");

    return {
      ...(includeJson ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
    };
  }

  async function loadData(selectedDate = date) {
    setLoading(true);

    try {
      const [studentsResponse, attendanceResponse] =
        await Promise.all([
          fetch(STUDENTS_URL, { headers: getHeaders() }),
          fetch(ATTENDANCE_URL, { headers: getHeaders() }),
        ]);

      const studentsData = await studentsResponse.json();
      const attendanceData = await attendanceResponse.json();

      if (!studentsResponse.ok) {
        throw new Error(
          studentsData.message || "Unable to load students."
        );
      }

      if (!attendanceResponse.ok) {
        throw new Error(
          attendanceData.message || "Unable to load attendance."
        );
      }

      setStudents(studentsData);
      setRecords(attendanceData);

      const initialStatuses = {};

      studentsData.forEach((student) => {
        initialStatuses[student._id] = "Present";
      });

      attendanceData.forEach((record) => {
        const recordDate = getRecordDate(record.date);
        const studentId =
          record.studentId?._id || record.studentId;

        if (
          recordDate === selectedDate &&
          studentId &&
          initialStatuses[studentId] !== undefined
        ) {
          initialStatuses[studentId] = record.status;
        }
      });

      setStatusByStudent(initialStatuses);
      setMessage("");
      setMessageType("");
    } catch (error) {
      setMessage(error.message || "Cannot load attendance data.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(date);
  }, [date]);

  function handleDateChange(event) {
    setDate(event.target.value);
    setMessage("");
    setMessageType("");
  }

  function toggleAbsent(studentId, checked) {
    setStatusByStudent((previous) => ({
      ...previous,
      [studentId]: checked ? "Absent" : "Present",
    }));

    setMessage("");
    setMessageType("");
  }

  const totalStudents = students.length;

  const absentStudents = students.filter(
    (student) => statusByStudent[student._id] === "Absent"
  ).length;

  const presentStudents = totalStudents - absentStudents;

  const percentage =
    totalStudents > 0
      ? ((presentStudents / totalStudents) * 100).toFixed(1)
      : "0.0";

  const studentStatistics = students.map((student) => {
    const studentRecords = records.filter((record) => {
      const recordStudentId =
        record.studentId?._id || record.studentId;

      return recordStudentId === student._id;
    });

    const totalClasses = studentRecords.length;

    const present = studentRecords.filter(
      (record) => record.status === "Present"
    ).length;

    const absent = studentRecords.filter(
      (record) => record.status === "Absent"
    ).length;

    const attendancePercentage =
      totalClasses > 0
        ? ((present / totalClasses) * 100).toFixed(1)
        : "0.0";

    return {
      id: student._id,
      name: student.name,
      rollNumber: student.rollNumber,
      totalClasses,
      present,
      absent,
      attendancePercentage,
    };
  });

  async function saveAttendance() {
    setMessage("");
    setMessageType("");

    if (loading) {
      setMessage("Please wait until attendance data loads.");
      setMessageType("error");
      return;
    }

    if (!date) {
      setMessage("Please select an attendance date.");
      setMessageType("error");
      return;
    }

    if (date > getToday()) {
      setMessage("Attendance date cannot be in the future.");
      setMessageType("error");
      return;
    }

    if (students.length === 0) {
      setMessage("Please add students before taking attendance.");
      setMessageType("error");
      return;
    }

    const invalidStatus = students.some((student) => {
      const status = statusByStudent[student._id];

      return status !== "Present" && status !== "Absent";
    });

    if (invalidStatus) {
      setMessage("Please select a valid status for every student.");
      setMessageType("error");
      return;
    }

    setSaving(true);

    try {
      const results = await Promise.all(
        students.map(async (student) => {
          const status = statusByStudent[student._id];

          const existingRecord = records.find((record) => {
            const recordStudentId =
              record.studentId?._id || record.studentId;

            return (
              recordStudentId === student._id &&
              getRecordDate(record.date) === date
            );
          });

          const url = existingRecord
            ? `${ATTENDANCE_URL}/${existingRecord._id}`
            : ATTENDANCE_URL;

          const response = await fetch(url, {
            method: existingRecord ? "PUT" : "POST",
            headers: getHeaders(true),
            body: JSON.stringify({
              studentId: student._id,
              date,
              status,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              `${student.name}: ${
                data.message || "Unable to save attendance."
              }`
            );
          }

          return data;
        })
      );

      setMessage(
        `Attendance saved successfully for ${results.length} students!`
      );
      setMessageType("success");

      await loadData(date);
    } catch (error) {
      setMessage(error.message || "Unable to save attendance.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="attendance-page">
      <h2>Attendance Management</h2>
      <p>Mark daily attendance for your entire class.</p>

      <div className="attendance-date">
        <label htmlFor="attendance-date">
          <strong>Attendance Date: </strong>
        </label>

        <input
          id="attendance-date"
          type="date"
          value={date}
          max={getToday()}
          onChange={handleDateChange}
          required
        />
      </div>

      <div className="cards attendance-summary">
        <div className="card">
          <h3>Total Students</h3>
          <h2>{totalStudents}</h2>
        </div>

        <div className="card">
          <h3>Present</h3>
          <h2>{presentStudents}</h2>
        </div>

        <div className="card">
          <h3>Absent</h3>
          <h2>{absentStudents}</h2>
        </div>

        <div className="card">
          <h3>Attendance Percentage</h3>
          <h2>{percentage}%</h2>
        </div>
      </div>

      {message && (
        <p
          role="status"
          className="attendance-message"
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

      <div className="student-table-container">
        <table className="student-table">
          <thead>
            <tr>
              <th>S.No.</th>
              <th>Student Name</th>
              <th>Roll Number</th>
              <th>Attendance</th>
              <th>Absent?</th>
            </tr>
          </thead>

          <tbody>
            {students.map((student, index) => {
              const isAbsent =
                statusByStudent[student._id] === "Absent";

              return (
                <tr key={student._id}>
                  <td>{index + 1}</td>
                  <td>{student.name}</td>
                  <td>{student.rollNumber}</td>
                  <td>
                    <span
                      className={
                        isAbsent
                          ? "attendance-absent"
                          : "attendance-present"
                      }
                    >
                      {isAbsent ? "Absent" : "Present"}
                    </span>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={isAbsent}
                      onChange={(event) =>
                        toggleAbsent(
                          student._id,
                          event.target.checked
                        )
                      }
                      aria-label={`Mark ${student.name} absent`}
                    />
                  </td>
                </tr>
              );
            })}

            {!loading && students.length === 0 && (
              <tr>
                <td colSpan="5">No students found. Add students first.</td>
              </tr>
            )}

            {loading && (
              <tr>
                <td colSpan="5">Loading students...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={saveAttendance}
        disabled={loading || saving || students.length === 0}
      >
        {saving ? "Saving..." : "Save Attendance"}
      </button>

      <h2>Individual Student Attendance Report</h2>
      <p>
        Attendance statistics for each student across all recorded dates.
      </p>

      <div className="student-table-container">
        <table className="student-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Roll Number</th>
              <th>Total Classes</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Attendance Percentage</th>
            </tr>
          </thead>

          <tbody>
            {studentStatistics.map((student) => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.rollNumber}</td>
                <td>{student.totalClasses}</td>
                <td>{student.present}</td>
                <td>{student.absent}</td>
                <td>{student.attendancePercentage}%</td>
              </tr>
            ))}

            {studentStatistics.length === 0 && (
              <tr>
                <td colSpan="6">No students found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Attendance;
