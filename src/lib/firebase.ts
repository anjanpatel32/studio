
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "student-toolkit-s36f8",
  "appId": "1:1057582139502:web:c1f49ad958f79dc83a3e7f",
  "storageBucket": "student-toolkit-s36f8.firebasestorage.app",
  "apiKey": "AIzaSyDvWu67Stbw2O6Onpy1aFv5Nd7Flg7U9mQ",
  "authDomain": "student-toolkit-s36f8.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1057582139502",
  "databaseURL": "https://student-toolkit-s36f8.firebaseio.com"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const firestore = getFirestore(app);

function getFirebaseConfig() {
    return firebaseConfig;
}

export { app, auth, firestore, getFirebaseConfig };
