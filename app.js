// Firebase config - REPLACE with your project's config
const firebaseConfig = {
    apiKey: "AIzaSyArh9Lqdyio6QZ276L2ciMwEgU8BgigrFs",
  authDomain: "user-atten.firebaseapp.com",
  databaseURL: "https://user-atten-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "user-atten",
  storageBucket: "user-atten.firebasestorage.app",
  messagingSenderId: "13092297593",
  appId: "1:13092297593:web:dd99a876e5dec1714fada8"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();

const emailEl = document.getElementById('email');
const passEl = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const authMsg = document.getElementById('authMsg');

const appEl = document.getElementById('app');
const authBox = document.getElementById('authBox');
const userEmail = document.getElementById('userEmail');
const signoutBtn = document.getElementById('signoutBtn');

const studentIdEl = document.getElementById('studentId');
const statusEl = document.getElementById('status');
const markBtn = document.getElementById('markBtn');
const markMsg = document.getElementById('markMsg');

const attTableBody = document.querySelector('#attTable tbody');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const clearTodayBtn = document.getElementById('clearTodayBtn');
const adminCard = document.getElementById('adminCard');
const downloadAllBtn = document.getElementById('downloadAllBtn');

loginBtn.onclick = () => {
  const email = emailEl.value.trim();
  const pass = passEl.value;
  auth.signInWithEmailAndPassword(email, pass)
    .then(()=> authMsg.textContent = '')
    .catch(e => authMsg.textContent = e.message);
};

signupBtn.onclick = () => {
  const email = emailEl.value.trim();
  const pass = passEl.value;
  auth.createUserWithEmailAndPassword(email, pass)
    .then(()=> authMsg.textContent = 'Account created. You can login now.')
    .catch(e => authMsg.textContent = e.message);
};

signoutBtn.onclick = () => auth.signOut();

auth.onAuthStateChanged(user => {
  if (user) {
    authBox.style.display = 'none';
    appEl.style.display = 'block';
    userEmail.textContent = user.email;
    // simple admin check: first user or specific email
    if (user.email && user.email.endsWith('@admin.com')) {
      adminCard.style.display = 'block';
    } else {
      adminCard.style.display = 'none';
    }
    loadTodaysAttendance();
  } else {
    authBox.style.display = 'block';
    appEl.style.display = 'none';
  }
});

function nowKey() {
  const d = new Date();
  return d.toISOString();
}

markBtn.onclick = () => {
  const student = studentIdEl.value.trim();
  const status = statusEl.value;
  if (!student) {
    markMsg.textContent = 'Please enter student id/name';
    return;
  }
  const timestamp = Date.now();
  const dateKey = new Date().toISOString().split('T')[0];
  const rec = {
    student,
    status,
    timestamp,
    by: auth.currentUser ? auth.currentUser.email : 'anonymous'
  };
  db.ref('attendance/' + dateKey).push(rec)
    .then(()=> {
      markMsg.textContent = 'Marked';
      studentIdEl.value = '';
      loadTodaysAttendance();
      setTimeout(()=> markMsg.textContent = '',2000);
    })
    .catch(e => markMsg.textContent = e.message);
};

function loadTodaysAttendance() {
  const dateKey = new Date().toISOString().split('T')[0];
  db.ref('attendance/' + dateKey).on('value', snap => {
    attTableBody.innerHTML = '';
    if (!snap.exists()) return;
    const rows = [];
    snap.forEach(child => {
      rows.push({id: child.key, ...child.val()});
    });
    // sort by timestamp
    rows.sort((a,b)=> a.timestamp - b.timestamp);
    for (const r of rows) {
      const tr = document.createElement('tr');
      const t = new Date(r.timestamp).toLocaleTimeString();
      tr.innerHTML = `<td>${t}</td><td>${r.student}</td><td>${r.status}</td>`;
      attTableBody.appendChild(tr);
    }
  });
}

exportCsvBtn.onclick = () => {
  const dateKey = new Date().toISOString().split('T')[0];
  db.ref('attendance/' + dateKey).once('value').then(snap => {
    if (!snap.exists()) {
      alert('No records for today');
      return;
    }
    const rows = [];
    snap.forEach(child => rows.push(child.val()));
    const csv = toCSV(rows);
    downloadFile('attendance-'+dateKey+'.csv', csv);
  });
};

downloadAllBtn.onclick = () => {
  db.ref('attendance').once('value').then(snap => {
    if (!snap.exists()) {
      alert('No records');
      return;
    }
    const rows = [];
    snap.forEach(daySnap => {
      const date = daySnap.key;
      daySnap.forEach(child => {
        const v = child.val();
        rows.push({...v, date});
      });
    });
    const csv = toCSV(rows);
    downloadFile('attendance-all.csv', csv);
  });
};

clearTodayBtn.onclick = () => {
  if (!confirm('Clear today\'s attendance?')) return;
  const dateKey = new Date().toISOString().split('T')[0];
  db.ref('attendance/' + dateKey).remove().then(()=> {
    alert('Cleared');
  }).catch(e => alert(e.message));
};

function toCSV(rows) {
  if (!rows.length) return '';
  const keys = Object.keys(rows[0]);
  const lines = [keys.join(',')];
  for (const r of rows) {
    lines.push(keys.map(k => JSON.stringify(r[k] ?? '')).join(','));
  }
  return lines.join('\n');
}

function downloadFile(name, content) {
  const blob = new Blob([content], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
}
