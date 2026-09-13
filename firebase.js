import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// 1. Go to https://console.firebase.google.com, create a project (free "Spark" plan is fine).
// 2. In your project, click the </> (web app) icon to register a web app.
// 3. Firebase shows you a config object — paste those values in below.
// 4. In the Firebase console, go to Build > Firestore Database > Create database (start in test mode).
const firebaseConfig = {  
  apiKey: "AIzaSyBZkQd5e5iYg9hMCLnkAOD2YiDizJxzt0U",
  authDomain: "xcel-online-pt.firebaseapp.com",
  projectId: "xcel-online-pt",
  storageBucket: "xcel-online-pt.firebasestorage.app",
  messagingSenderId: "284464804484",
  appId: "1:284464804484:web:f6c4e075b73abed83788d1",
  measurementId: "G-BY7131KY4K"};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Same get/set shape the app already uses, now backed by Firestore
// instead of the Claude artifact's window.storage.
export async function sGet(key, fallback) {
  try {
    const ref = doc(db, "appdata", key);
    const snap = await getDoc(ref);
    if (!snap.exists()) return fallback;
    return JSON.parse(snap.data().value);
  } catch (e) {
    console.error("Firestore get error:", e);
    return fallback;
  }
}

export async function sSet(key, value) {
  try {
    const ref = doc(db, "appdata", key);
    await setDoc(ref, { value: JSON.stringify(value) });
    return true;
  } catch (e) {
    console.error("Firestore set error:", e);
    return false;
  }
}
