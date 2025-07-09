// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signOut } from "firebase/auth"; // Import signOut and connectAuthEmulator
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
};

console.log("Firebase Config:", {
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
  measurementId: firebaseConfig.measurementId,
});
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Use standard auth initialization without emulator
let db;
try {
  db = getFirestore(app,"ibad-ttc-db");
  console.log("Firestore initialized successfully");
} catch (error) {
  console.error("Error initializing Firestore:", error);
}

// Add after Firebase initialization
const clearExistingAuth = async () => {
  try {
    await signOut(auth);
    console.log("Previous authentication state cleared");
  } catch (error) {
    console.error("Error clearing auth state:", error);
  }
};

// Call this function if needed
clearExistingAuth();
console.log("Firebase initialized successfully.");
export { app, auth, db };
