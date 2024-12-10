import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyChHh4VkYKDMJIzxl99XJet1kp_0qg1xbc",
  authDomain: "gigtracker-c5b92.firebaseapp.com",
  projectId: "gigtracker-c5b92",
  storageBucket: "gigtracker-c5b92.firebasestorage.app",
  messagingSenderId: "717418645568",
  appId: "1:717418645568:web:f6a639f1cc70c3f85337a5",
  measurementId: "G-RWC0WYTN4Z"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };