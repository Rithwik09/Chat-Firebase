import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ✅ Import Firestore

// 🔹 Replace with your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyAMcQF7IrsCfFjiT5857F5KSu6sfBMqIe0",
  authDomain: "real-time-chat-fcb60.firebaseapp.com",
  projectId: "real-time-chat-fcb60",
  storageBucket: "real-time-chat-fcb60.firebasestorage.app",
  messagingSenderId: "1073476845674",
  appId: "1:1073476845674:web:76199f9b8bea4819d0ca13",
  measurementId: "G-Y328EGDFRT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // ✅ Initialize Firestore

export { auth, db }; // ✅ Export Firestore
