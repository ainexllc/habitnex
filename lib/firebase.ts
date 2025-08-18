import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDojt2j9hrgI8_lXcfzUvVcn64RUuvrZ14",
  authDomain: "habittracker-eb6bd.firebaseapp.com",
  projectId: "habittracker-eb6bd",
  storageBucket: "habittracker-eb6bd.firebasestorage.app",
  messagingSenderId: "324797617648",
  appId: "1:324797617648:web:f412c1ba7f2c770201f935",
  measurementId: "G-TL3TYRC6GX"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics - only initialize in browser
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;