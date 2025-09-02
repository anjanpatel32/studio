
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "zyreel-app",
  "appId": "1:1057582139502:web:aa29d81b2c4c818b7b2503",
  "storageBucket": "zyreel-app.appspot.com",
  "apiKey": "AIzaSyDFfGvA_l2bCi061JbsoXp_82r529z5YxM",
  "authDomain": "zyreel-app.firebaseapp.com",
  "messagingSenderId": "1057582139502",
  "databaseURL": "https://zyreel-app.firebaseio.com"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const firestore = getFirestore(app);

function getFirebaseConfig() {
    return firebaseConfig;
}

export { app, auth, firestore, getFirebaseConfig };
