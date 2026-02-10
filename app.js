/*******************************
 🔥 FIREBASE CONFIG
*******************************/
const firebaseConfig = {
  apiKey: "AIzaSyB9LUIjgUiyQY-eBDxYUC3Wu1aUcqhv8OI",
  authDomain: "student-teacher-app-d7260.firebaseapp.com",
  projectId: "student-teacher-app-d7260",
  storageBucket: "student-teacher-app-d7260.firebasestorage.app",
  messagingSenderId: "977279380361",
  appId: "1:977279380361:web:d79851eb0494d81b0f8f58"
};

/*******************************
  INIT FIREBASE
*******************************/
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

/*******************************
  AUTH PROTECTION
*******************************/
auth.onAuthStateChanged(user => {
  const isDashboard = window.location.pathname.includes("dashboard");

  if (!user && isDashboard) {
    window.location = "index.html";
  }
});

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
    .then(userCred => {
      return db.collection("users").doc(userCred.user.uid).set({
        email: email,
        role: role,
        createdAt: new Date()
      });
    })
    .then(() => {
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
      window.location = "dashboard.html";
    })
    .catch(err => alert(err.message));
}

/*******************************
  LOGOUT
*******************************/
function logout() {
  auth.signOut().then(() => {
    window.location = "index.html";
  });
}

/*******************************
  ADD TEACHER (ADMIN)
*******************************/
function addTeacher() {
  const name = document.getElementById("tname").value;
  const dept = document.getElementById("tdept").value;
  const subject = document.getElementById("tsubject").value;

  if (!name || !dept || !subject) {
    alert("Fill all fields");
    return;
  }

  db.collection("teachers").add({
    name,
    department: dept,
    subject
  }).then(() => alert("Teacher Added"));
}

/*******************************
  LOAD TEACHERS (ADMIN)
*******************************/
function loadTeachers() {
  db.collection("teachers").onSnapshot(snapshot => {
    const div = document.getElementById("teacherList");
    if (!div) return;

    div.innerHTML = "";
    snapshot.forEach(doc => {
      const t = doc.data();
      div.innerHTML += `
        <p>
          ${t.name} - ${t.subject}
          <button onclick="deleteTeacher('${doc.id}')">Delete</button>
        </p>
      `;
    });
  });
}

function deleteTeacher(id) {
  db.collection("teachers").doc(id).delete();
}

/*******************************
  LOAD STUDENTS (ADMIN)
*******************************/
function loadStudents() {
  db.collection("users").onSnapshot(snapshot => {
    const div = document.getElementById("studentList");
    if (!div) return;

    div.innerHTML = "";
    snapshot.forEach(doc => {
      const u = doc.data();
      div.innerHTML += `<p>${u.email} (${u.role})</p>`;
    });
  });
}

/*******************************
  LOAD TEACHERS (STUDENT)
*******************************/
function loadStudentTeachers() {
  db.collection("teachers").onSnapshot(snapshot => {
    const list = document.getElementById("teachers");
    const select = document.getElementById("teacherSelect");

    if (!list || !select) return;

    list.innerHTML = "";
    select.innerHTML = "";

    snapshot.forEach(doc => {
      const t = doc.data();
      list.innerHTML += `<p>${t.name} - ${t.subject}</p>`;
      select.innerHTML += `<option value="${t.name}">${t.name}</option>`;
    });
  });
}

/*******************************
  BOOK APPOINTMENT (STUDENT)
*******************************/
function book() {
  const teacher = document.getElementById("teacherSelect").value;
  const purpose = document.getElementById("purpose").value;
  const time = document.getElementById("time").value;

  const user = auth.currentUser;

  if (!teacher || !purpose || !time) {
    alert("Fill all fields");
    return;
  }

  if (!user) {
    alert("Not logged in");
    return;
  }

  db.collection("appointments").add({
    teacher,
    studentId: user.uid,
    studentEmail: user.email,
    purpose,
    time,
    status: "Pending",
    createdAt: new Date()
  }).then(() => alert("Appointment Requested"));
}

/*******************************
  LOAD MY APPOINTMENTS (STUDENT)
*******************************/
function loadMyAppointments() {
  const user = auth.currentUser;
  if (!user) return;

  db.collection("appointments")
    .where("studentId", "==", user.uid)
    .onSnapshot(snapshot => {
      const div = document.getElementById("myAppointments");
      if (!div) return;

      div.innerHTML = "";

      snapshot.forEach(doc => {
        const a = doc.data();
        div.innerHTML += `
          <p>
            ${a.teacher} - ${a.time} - ${a.status}
          </p>
        `;
      });
    });
}

/*******************************
  LOAD APPOINTMENTS (TEACHER)
*******************************/
function loadAppointments() {
  db.collection("appointments").onSnapshot(snapshot => {
    const div = document.getElementById("appointmentList");
    if (!div) return;

    div.innerHTML = "";

    snapshot.forEach(doc => {
      const a = doc.data();
      div.innerHTML += `
        <p>
          Student: ${a.studentEmail} <br>
          Purpose: ${a.purpose} <br>
          Time: ${a.time} <br>
          Status: ${a.status} <br>
          <button onclick="updateStatus('${doc.id}','Approved')">Approve</button>
          <button onclick="updateStatus('${doc.id}','Cancelled')">Cancel</button>
        </p><hr>
      `;
    });
  });
}

function updateStatus(id, status) {
  db.collection("appointments").doc(id).update({
    status: status
  });
}

/*******************************
  PAGE AUTO LOAD
*******************************/
document.addEventListener("DOMContentLoaded", function () {

  if (document.getElementById("teacherSelect")) {
    loadStudentTeachers();
    loadMyAppointments();
  }

  if (document.getElementById("appointmentList")) {
    loadAppointments();
  }

  if (document.getElementById("teacherList")) {
    loadTeachers();
    loadStudents();
  }

});
