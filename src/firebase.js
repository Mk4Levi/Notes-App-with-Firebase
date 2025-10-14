import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCz1vI32TWBxaeQ2d_bgvCKPycKHDlYtKo",
  authDomain: "notes-app-6296.firebaseapp.com",
  projectId: "notes-app-6296",
  storageBucket: "notes-app-6296.appspot.com",
  messagingSenderId: "567493297182",
  appId: "1:567493297182:web:f318cb6be268fac3fcda0f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore DB
export const db = getFirestore(app);

// Firebase Auth → Issue-1: No authentication previously
export const auth = getAuth(app);

// Notes collection
export const notesCollection = collection(db, "notes");
