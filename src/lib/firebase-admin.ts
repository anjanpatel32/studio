import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const firestoreAdmin = admin.firestore();

export function getFirestoreAdmin() {
  return firestoreAdmin;
}
