
import * as admin from 'firebase-admin';
import { getFirebaseConfig } from './firebase';

if (!admin.apps.length) {
  admin.initializeApp(getFirebaseConfig());
}

const firestoreAdmin = admin.firestore();

export function getFirestoreAdmin() {
  return firestoreAdmin;
}
