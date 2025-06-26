// frontend/src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB7Ejaeyve6NrTHwc3kxivPJHFMWkwblZE",
  authDomain: "apple-allocations.firebaseapp.com",
  projectId: "apple-allocations",
  storageBucket: "apple-allocations.firebasestorage.app",
  messagingSenderId: "202039961909",
  appId: "1:202039961909:web:74f017498005b2591c447c",
  measurementId: "G-SNQ5JJ827J"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Connexion à Firestore