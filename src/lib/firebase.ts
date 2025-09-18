// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore"; // <-- 1. ADD THIS IMPORT

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC2ExmcXKphbnXW5tDs3P-g63EfPCPTgzw",
  authDomain: "balang-connect-app.firebaseapp.com",
  projectId: "balang-connect-app",
  storageBucket: "balang-connect-app.appspot.com", // Note: I corrected this from .firebasestorage.app
  messagingSenderId: "870709421113",
  appId: "1:870709421113:web:bd8b78a28fc336434c19e8",
  measurementId: "G-DNWDBRV5HP"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : undefined;
const storage = getStorage(app);
const db = getFirestore(app); // <-- 2. ADD THIS LINE TO INITIALIZE FIRESTORE

export { app, analytics, storage, db }; // <-- 3. ADD 'db' TO THE EXPORT LIST