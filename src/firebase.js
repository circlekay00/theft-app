import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Replace with your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyDAs-37y8ga4ir4E0SpT4KuD2RJ8PL9wNQ",
  authDomain: "theft-reporting.firebaseapp.com",
  projectId: "theft-reporting",
  storageBucket: "theft-reporting.firebasestorage.app",
  messagingSenderId: "1024220608340",
  appId: "1:1024220608340:web:af560c979f85165a2afac1",
  measurementId: "G-TBC5F35SD1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
