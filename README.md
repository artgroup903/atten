# Attendance App — Dynamic Branches (Firebase)

This small project contains:
- `index.html` — Mobile-first attendance app that loads branch locations from Firestore and allows authenticated users to mark attendance only when within the branch radius.
- `admin.html` — Simple admin page to add / edit / delete branch documents in the `branches` collection.
- `firebase-config.js` — Placeholder for your Firebase config (replace with your project values).
- `styles.css` — Basic styling.

## Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable **Firestore** and **Authentication** (Email/Password).
3. In Project Settings, add a Web app and copy the config -> paste into `firebase-config.js`.
4. Deploy files to any static host, or open `index.html` & `admin.html` locally (best to serve via a static server).
   - For local testing, you can use: `npx http-server` or `python -m http.server 8000` in the project folder.
5. Use `admin.html` to sign in (create an admin user in Firebase Console or sign up) and add branches.
   - Each branch document (id = your chosen key) should have:
     - `name` (string)
     - `latitude` (number)
     - `longitude` (number)
     - `radius_m` (number)
6. Users sign up / sign in via `index.html`. When they click **Mark Attendance**, the app checks device geolocation and, if within radius, writes to `attendance` collection.

## Security Notes
- Firestore security rules in production should prevent unauthorized writes. Example (basic):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /attendance/{docId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && request.auth.uid == resource.data.user_id;
      allow update, delete: if false;
    }
    match /branches/{b} {
      allow read: if request.auth != null;
      allow write: if false; // manage branches via admin / server-side
    }
  }
}
```
- For stronger protection, implement a server-side Cloud Function to validate geofence and write attendance.

## Licence
MIT — modify as needed.

