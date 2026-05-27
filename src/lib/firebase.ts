import { initializeApp } from 'firebase/app';
import { browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCjJSeTmZ_dVbFEWgwDYw-1b6W5cReTEhU',
  authDomain: 'guava-education.firebaseapp.com',
  projectId: 'guava-education',
  storageBucket: 'guava-education.firebasestorage.app',
  messagingSenderId: '272440386669',
  appId: '1:272440386669:web:333bb07725cecc940f0b64',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);

setPersistence(firebaseAuth, browserLocalPersistence).catch(() => {
  // ignore — fallback to session persistence is fine for SPA
});
