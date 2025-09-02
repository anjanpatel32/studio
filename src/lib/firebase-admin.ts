
import * as admin from 'firebase-admin';
import { getFirebaseConfig } from './firebase';

if (!admin.apps.length) {
  const firebaseConfig = getFirebaseConfig();
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: firebaseConfig.databaseURL,
  });
}

const firestoreAdmin = admin.firestore();

export function getFirestoreAdmin() {
  return firestoreAdmin;
}
