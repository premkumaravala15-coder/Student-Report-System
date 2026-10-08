import { useState, useEffect } from "react";

function Parents() {

const [students, setStudents] = useState([]);

// ==================== GET STUDENTS ====================

const getStudents = async () => {

try {

  const response = await fetch(
    "http://localhost:5000/students"
  );

  const data = await response.json();

  setStudents(data);

} catch (error) {

  console.log(
    "Error fetching students:",
    error
  );

}

};

// ==================== LOAD STUDENTS ====================

useEffect(() => {

getStudents();

}, []);

// ==================== PAGE ====================

return (


<div className="page">

  <h1>
    Parents
  </h1>

  <p>
    View student and parent information
  </p>


  {/* ==================== STUDENT INFORMATION ==================== */}

  <div className="students-section">

    <h2>
      Student Information
    </h2>


    {students.length === 0 ? (

      <p>
        No students available.
      </p>

    ) : (

      <table>

        <thead>

          <tr>

            <th>
              Student Name
            </th>

            <th>
              Roll Number
            </th>

            <th>
              Class
            </th>

            <th>
              Email
            </th>

            <th>
              Report
            </th>

          </tr>

        </thead>


        <tbody>

          {students.map((student) => (

            <tr key={student._id}>

              <td>
                {student.name}
              </td>

              <td>
                {student.rollNumber}
              </td>

              <td>
                {student.className}
              </td>

              <td>
                {student.email}
              </td>

              <td>

                <button
                  onClick={() =>
                    alert(
                      `Report for ${student.name}`
                    )
                  }
                >
                  View Report
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    )}

  </div>

</div>

);

}

export default Parents;
