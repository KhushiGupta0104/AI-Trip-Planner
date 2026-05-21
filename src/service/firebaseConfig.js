// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCnTuxfGRlRwlHCHVfaSYAzwYyEhWYwj2g",
  authDomain: "ai-trip-planner-480009.firebaseapp.com",
  projectId: "ai-trip-planner-480009",
  storageBucket: "ai-trip-planner-480009.firebasestorage.app",
  messagingSenderId: "1077217618032",
  appId: "1:1077217618032:web:7f6d8bf1cac2f059b36cb5"
};
// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

 
