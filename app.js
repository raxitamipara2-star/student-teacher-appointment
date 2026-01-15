/*******************************
 🔥 FIREBASE CONFIG (FIXED)
*******************************/
const firebaseConfig = {
  apiKey: "AIzaSyB9LUIjgUiyQY-eBDxYUC3Wu1aUcqhv8OI",
  authDomain: "student-teacher-app-d7260.firebaseapp.com",
  projectId: "student-teacher-app-d7260",
  storageBucket: "student-teacher-app-d7260.firebasestorage.app",
  messagingSenderId: "977279380361",
  appId: "1:977279380361:web:d79851eb0494d81b0f8f58",
  measurementId: "G-QYZ1MDKX16"
};
/*******************************
  INIT FIREBASE
*******************************/
firebase.initializeApp(firebaseConfig);

/*******************************
  INIT SERVICES
*******************************/
const auth = firebase.auth();
const db = firebase.firestore();

/*******************************
  LOGGER
*******************************/
function log(msg) {
  console.log(new Date().toISOString() + " → " + msg);
}

/*******************************
  REGISTER
*******************************/
function register() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("pass").value;
  const role = document.getElementById("role").value;

  if (!email || !pass) {
    alert("All fields required");
    return;
  }

  auth.createUserWithEmailAndPassword(email, pass)
    .then(user => {
      return db.collection("users").doc(user.user.uid).set({
        email: email,
        role: role,
        approved: false,
        createdAt: new Date()
      });
    })
    .then(() => {
      log("User Registered");
      alert("Registration successful");
      window.location = "index.html";
    })
    .catch(err => alert(err.message));
}

/*******************************
  LOGIN
*******************************/
function login() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("pass").value;

  auth.signInWithEmailAndPassword(email, pass)
    .then(() => {
      log("User Logged In");
      window.location = "dashboard.html";
    })
    .catch(err => alert(err.message));
}

/*******************************
  LOGOUT
*******************************/
function logout() {
  auth.signOut().then(() => {
    log("User Logged Out");
    window.location = "index.html";
  });
}

/*******************************
  BOOK APPOINTMENT
*******************************/
function book() {
  const purpose = document.getElementById("purpose").value;
  const time = document.getElementById("time").value;

  if (!purpose || !time) {
    alert("Fill all fields");
    return;
  }
  // ADD TEACHER
function addTeacher() {
  const name = document.getElementById("tname").value;
  const dept = document.getElementById("tdept").value;
  const subject = document.getElementById("tsubject").value;

  db.collection("teachers").add({
    name: name,
    department: dept,
    subject: subject
  }).then(() => {
    alert("Teacher added");
    loadTeachers();
  });
}

// LOAD TEACHERS
function loadTeachers() {
  db.collection("teachers").onSnapshot(snapshot => {
    const div = document.getElementById("teacherList");
    div.innerHTML = "";
    snapshot.forEach(doc => {
      const t = doc.data();
      div.innerHTML += `
        <p>${t.name} - ${t.subject} 
        <button onclick="deleteTeacher('${doc.id}')">Delete</button></p>
      `;
    });
  });
}

// DELETE TEACHER
function deleteTeacher(id) {
  db.collection("teachers").doc(id).delete();
}

// LOAD STUDENTS
function loadStudents() {
  db.collection("users").onSnapshot(snapshot => {
    const div = document.getElementById("studentList");
    div.innerHTML = "";
    snapshot.forEach(doc => {
      const u = doc.data();
      div.innerHTML += `
        <p>${u.email} (${u.role})</p>
      `;
    });
  });
}

// Auto load when admin page opens
window.onload = function() {
  if (document.getElementById("teacherList")) {
    loadTeachers();
    loadStudents();
  }
};
// LOAD APPOINTMENTS FOR TEACHER
function loadAppointments() {
  db.collection("appointments").onSnapshot(snapshot => {
    const div = document.getElementById("appointmentList");
    div.innerHTML = "";

    snapshot.forEach(doc => {
      const a = doc.data();
      div.innerHTML += `
        <p>
        Purpose: ${a.purpose} <br>
        Time: ${a.time} <br>
        Status: ${a.status}
        <br>
        <button onclick="updateStatus('${doc.id}','Approved')">Approve</button>
        <button onclick="updateStatus('${doc.id}','Cancelled')">Cancel</button>
        </p><hr>
      `;
    });
  });
}

// UPDATE APPOINTMENT STATUS
function updateStatus(id, status) {
  db.collection("appointments").doc(id).update({
    status: status
  });
}

// Auto load when teacher page opens
window.onload = function() {
  if (document.getElementById("appointmentList")) {
    loadAppointments();
  }
};
// LOAD TEACHERS FOR STUDENT
function loadStudentTeachers() {
  db.collection("teachers").onSnapshot(snapshot => {
    const list = document.getElementById("teachers");
    const select = document.getElementById("teacherSelect");
    list.innerHTML = "";
    select.innerHTML = "";

    snapshot.forEach(doc => {
      const t = doc.data();
      list.innerHTML += `<p>${t.name} - ${t.subject}</p>`;
      select.innerHTML += `<option value="${t.name}">${t.name}</option>`;
    });
  });
}

// STUDENT BOOK APPOINTMENT
function book() {
  const teacher = document.getElementById("teacherSelect").value;
  const purpose = document.getElementById("purpose").value;
  const time = document.getElementById("time").value;

  db.collection("appointments").add({
    teacher: teacher,
    purpose: purpose,
    time: time,
    status: "Pending"
  }).then(() => alert("Appointment Requested"));
}

// LOAD STUDENT APPOINTMENTS
function loadMyAppointments() {
  db.collection("appointments").onSnapshot(snapshot => {
    const div = document.getElementById("myAppointments");
    div.innerHTML = "";
    snapshot.forEach(doc => {
      const a = doc.data();
      div.innerHTML += `<p>${a.teacher} - ${a.time} - ${a.status}</p>`;
    });
  });
}

// Auto load for student page
window.onload = function() {
  if (document.getElementById("teacherSelect")) {
    loadStudentTeachers();
    loadMyAppointments();
  }
};


  auth.onAuthStateChanged(user => {
    if (user) {
      db.collection("appointments").add({
        studentId: user.uid,
        purpose: purpose,
        time: time,
        status: "Pending",
        createdAt: new Date()
      }).then(() => {
        log("Appointment Booked");
        alert("Appointment request sent");
      });
    }
  });
}
