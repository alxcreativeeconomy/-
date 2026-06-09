/**
 * Local development:
 *   Copy this file to firebase-config.js and paste values from:
 *   Firebase Console → Project settings → Your apps → Web app → firebaseConfig
 *
 * Production (GitHub Pages):
 *   Do not commit firebase-config.js. Add these repository secrets instead:
 *   FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID,
 *   FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID
 *
 * After any leak, rotate the API key in Google Cloud Console and update secrets.
 */
window.FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};