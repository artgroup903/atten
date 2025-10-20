# Attendance Firebase App (Converted from PHP)
This is a simple single-page Attendance app using Firebase Realtime Database and Firebase Authentication.

## Setup
1. Create a Firebase project at https://console.firebase.google.com/
2. Enable **Email/Password** sign-in under Authentication.
3. Create a **Realtime Database** and set rules:
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
(Or adjust rules for your needs)

4. Replace the placeholder `firebaseConfig` object in `app.js` with your project's config (from Firebase console -> Project settings -> SDK).
5. Upload these files to a static host (GitHub Pages, Netlify) or open `index.html` locally.
   - Note: Firebase Auth will require hosting, or use `localhost` with proper settings.

## Features
- Sign up / Login
- Mark attendance (Present / Absent / Late)
- View today's attendance
- Export CSV for today or all days
- Simple admin download for all records (email ending with @admin.com is considered admin)

## Files
- index.html
- styles.css
- app.js

Converted from uploaded PHP files: admin.php, db.php, export_attendance.php, index.php, login.php
