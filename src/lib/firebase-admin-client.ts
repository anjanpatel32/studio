// This file is safe to use on the client side.
// It uses the same configuration as the client-side Firebase SDK.

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFirebaseConfig } from './firebase'; // Reuse the client config

const initializeClientApp = () => {
    const apps = getApps();
    if (apps.length) {
        return getApp();
    }
    return initializeApp(getFirebaseConfig(), 'admin-client'); // Use a unique name
}

const app = initializeClientApp();
const firestore = getFirestore(app);

export function getFirestoreAdmin() {
    return firestore;
}
