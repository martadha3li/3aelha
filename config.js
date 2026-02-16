import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBUwWf2f5hNX6HsandPrbem2o4I3cfj1As",
  authDomain: "aelha-f940b.firebaseapp.com",
  projectId: "aelha-f940b",
  storageBucket: "aelha-f940b.firebasestorage.app",
  messagingSenderId: "1082290967333",
  appId: "1:1082290967333:web:4440c797e1f85d12c700cc"
};

// تشغيل Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);