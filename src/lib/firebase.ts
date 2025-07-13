// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC2ExmcXKphbnXW5tDs3P-g63EfPCPTgzw",
  authDomain: "balang-connect-app.firebaseapp.com",
  projectId: "balang-connect-app",
  storageBucket: "balang-connect-app.firebasestorage.app",
  messagingSenderId: "870709421113",
  appId: "1:870709421113:web:bd8b78a28fc336434c19e8",
  measurementId: "G-DNWDBRV5HP"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : undefined;
const storage = getStorage(app);

export { app, analytics, storage };
