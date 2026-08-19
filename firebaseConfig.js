import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// From Firebase Console → Project settings → General → Your apps → Web app
// config. These are public client identifiers, not secrets — Firestore
// security rules (see firestore.rules setup in the console) are what
// actually protect user data, not this file.
const firebaseConfig = {
  apiKey: 'AIzaSyCvszxQFbztYIwJmwHaO04f8hNO3mfcZ_w',
  authDomain: 'fanstamp-f9d9a.firebaseapp.com',
  projectId: 'fanstamp-f9d9a',
  storageBucket: 'fanstamp-f9d9a.firebasestorage.app',
  messagingSenderId: '1057507301971',
  appId: '1:1057507301971:web:11d0434371dbeb1e4284a6',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// initializeAuth() throws "auth/already-initialized" if this module is
// re-evaluated (Fast Refresh) after the first call — fall back to the
// already-initialized instance instead of crashing.
let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  authInstance = getAuth(app);
}

export const auth = authInstance;
export const db = getFirestore(app);
