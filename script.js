// Load saved student records

let students = JSON.parse(
    localStorage.getItem("studentHubRecords")
) || [];

let editId = null;


// Select HTML elements

const form = document.getElementById("studentForm");
const table = document.getElementById("studentTable");
const search = document.getElementById("search");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formTitle = document.getElementById("formTitle");
const message = document.getElementById("message");


// Save records in Local Storage

function saveStudents() {

    localStorage.setItem(
        "studentHubRecords",
        JSON.stringify(students)
    );

}


// Calculate student grade

function calculateGrade(marks) {

    if (marks >= 90) {
        return "A+";
    } else if (marks >= 80) {
        return "A";
    } else if (marks >= 70) {
        return "B";
    } else if (marks >= 60) {
        return "C";
    } else if (marks >= 50) {
        return "D";
    } else if (marks >= 40) {
        return "E";
    } else {
        return "F";
    }

}


// Display notification message

function showMessage(text, isError = false) {

    message.textContent = text;

    message.classList.toggle("error", isError);

}


// Add or update student

form.addEventListener("submit", function (event) {

    event.preventDefault();

    const name = document.getElementById("name").value.trim();

    const roll = document.getElementById("roll").value.trim();

    const enrollment = document.getElementById("enrollment").value.trim();

    const email = document.getElementById("email").value.trim();

    const phone = document.getElementById("phone").value.trim();

    const course = document.getElementById("course").value;

    const semester = document.getElementById("semester").value;

    const marks = Number(
        document.getElementById("marks").value
    );


    // Validate student details

    if (!name || !roll || !enrollment) {

        showMessage("Please enter valid student details.", true);

        return;

    }


    // Validate marks

    if (marks < 0 || marks > 100 || !Number.isFinite(marks)) {

        showMessage("Marks must be between 0 and 100.", true);

        return;

    }


    // Check duplicate records

    const duplicate = students.some(function (student) {

        return (
            student.roll.toLowerCase() === roll.toLowerCase() ||
            student.enrollment.toLowerCase() === enrollment.toLowerCase()
        ) && student.id !== editId;

    });

    if (duplicate) {

        showMessage(
            "Roll number or enrollment number already exists.",
            true
        );

        return;

    }


    // Create student object

    const student = {

        id: editId || (
            Date.now().toString() +
            Math.random().toString(36).slice(2)
        ),

        name: name,
        roll: roll,
        enrollment: enrollment,
        email: email,
        phone: phone,
        course: course,
        semester: semester,
        marks: marks,
        grade: calculateGrade(marks),
        status: marks >= 40 ? "Pass" : "Fail"

    };


    // Add new student

    if (editId === null) {

        students.push(student);

        showMessage("Student added successfully!");

    } else {

        // Update existing student

        const index = students.findIndex(function (item) {

            return item.id === editId;

        });

        if (index !== -1) {

            students[index] = student;

        }

        showMessage("Student updated successfully!");

    }


    saveStudents();

    resetForm();

    displayStudents();

    updateDashboard();

});


// Display student records

function displayStudents() {

    const keyword = search.value.toLowerCase().trim();

    const filteredStudents = students.filter(function (student) {

        return (
            student.name.toLowerCase().includes(keyword) ||
            student.roll.toLowerCase().includes(keyword) ||
            student.enrollment.toLowerCase().includes(keyword)
        );

    });

    table.replaceChildren();


    // Display message when no records exist

    if (filteredStudents.length === 0) {

        const row = table.insertRow();

        const cell = row.insertCell();

        cell.colSpan = 11;

        cell.className = "empty-message";

        cell.textContent = "No student records found.";

        return;

    }


    // Display each student

    filteredStudents.forEach(function (student) {

        const row = table.insertRow();

        const values = [

            student.name,
            student.roll,
            student.enrollment,
            student.email,
            student.phone,
            student.course,
            student.semester,
            student.marks + "%",
            student.grade,
            student.status

        ];

        values.forEach(function (value, index) {

            const cell = row.insertCell();

            cell.textContent = value;

            if (index === 9) {

                cell.className =
                    student.status === "Pass" ? "pass" : "fail";

            }

        });


        // Create Edit button

        const actionCell = row.insertCell();

        const editButton = document.createElement("button");

        editButton.textContent = "Edit";

        editButton.className = "edit-btn";

        editButton.addEventListener("click", function () {

            editStudent(student.id);

        });


        // Create Delete button

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";

        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", function () {

            deleteStudent(student.id);

        });

        actionCell.append(editButton, deleteButton);

    });

}


// Edit student information

function editStudent(id) {

    const student = students.find(function (item) {

        return item.id === id;

    });

    if (!student) {
        return;
    }

    editId = id;

    document.getElementById("name").value = student.name;

    document.getElementById("roll").value = student.roll;

    document.getElementById("enrollment").value = student.enrollment;

    document.getElementById("email").value = student.email;

    document.getElementById("phone").value = student.phone;

    document.getElementById("course").value = student.course;

    document.getElementById("semester").value = student.semester;

    document.getElementById("marks").value = student.marks;

    formTitle.textContent = "Edit Student";

    submitBtn.textContent = "Update Student";

    cancelBtn.hidden = false;

    showMessage("");

    document.getElementById("student-section").scrollIntoView({

        behavior: "smooth"

    });

}


// Delete student record

function deleteStudent(id) {

    const confirmation = confirm(
        "Are you sure you want to delete this student?"
    );

    if (confirmation) {

        students = students.filter(function (student) {

            return student.id !== id;

        });

        if (editId === id) {

            resetForm();

        }

        saveStudents();

        displayStudents();

        updateDashboard();

        showMessage("Student deleted successfully!");

    }

}


// Reset student form

function resetForm() {

    form.reset();

    editId = null;

    formTitle.textContent = "Add New Student";

    submitBtn.textContent = "Add Student";

    cancelBtn.hidden = true;

}


// Cancel editing

cancelBtn.addEventListener("click", function () {

    resetForm();

    showMessage("");

});


// Search student records

search.addEventListener("input", function () {

    displayStudents();

});


// Update dashboard statistics

function updateDashboard() {

    const total = students.length;

    const passed = students.filter(function (student) {

        return student.marks >= 40;

    }).length;

    const failed = total - passed;

    const totalMarks = students.reduce(function (sum, student) {

        return sum + student.marks;

    }, 0);

    const average = total > 0
        ? (totalMarks / total).toFixed(2)
        : "0";

    document.getElementById("totalStudents").textContent = total;

    document.getElementById("averageMarks").textContent = average + "%";

    document.getElementById("passedStudents").textContent = passed;

    document.getElementById("failedStudents").textContent = failed;

}


// Run when website opens

displayStudents();

updateDashboard();