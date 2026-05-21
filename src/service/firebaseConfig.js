import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCCeqRC-3NsmDwUHkEVNGua9WFjuy9_zQ0",
  authDomain: "ai-trip-planner-wanderai.firebaseapp.com",
  projectId: "ai-trip-planner-wanderai",
  storageBucket: "ai-trip-planner-wanderai.firebasestorage.app",
  messagingSenderId: "276641208497",
  appId: "1:276641208497:web:f17ee8810aa9870f54aa90",
  measurementId: "G-5001CNS745"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);