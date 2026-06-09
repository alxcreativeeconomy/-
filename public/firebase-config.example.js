/**
 * Copy this file to firebase-config.js and paste values from:
 * Firebase Console → Project settings → Your apps → Web app → firebaseConfig
 *
 * The web API key is safe to expose in the browser. Security comes from
 * Firestore rules + Firebase Auth authorized domains — not hiding this file.
 */
window.FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};