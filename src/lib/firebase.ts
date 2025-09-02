
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDvWu67Stbw2O6Onpy1aFv5Nd7Flg7U9mQ",
  authDomain: "student-toolkit-s36f8.firebaseapp.com",
  databaseURL: "https://student-toolkit-s36f8-default-rtdb.firebaseio.com",
  projectId: "student-toolkit-s36f8",
  storageBucket: "student-toolkit-s36f8.appspot.com",
  messagingSenderId: "1057582139502",
  appId: "1:1057582139502:web:c1f49ad958f79dc83a3e7f",
  measurementId: "G-7LV967H81T"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const firestore = getFirestore(app);
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}


function getFirebaseConfig() {
    if (!firebaseConfig.apiKey) {
        throw new Error('Missing Firebase API Key');
    }
    return firebaseConfig;
}

export { app, auth, firestore, analytics, getFirebaseConfig };
