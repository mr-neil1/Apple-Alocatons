// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration obtenue dans Firebase > Paramètres du projet > Config Web
const firebaseConfig = {
  apiKey: "AIzaSyB7Ejaeyve6NrTHwc3kxivPJHFMWkwblZE",
  authDomain: "apple-allocations.firebaseapp.com",
  projectId: "apple-allocations",
  storageBucket: "apple-allocations.appspot.com",
  messagingSenderId: "202039961909",
  appId: "1:202039961909:web:74f017498005b2591c447c",
  measurementId: "G-SNQ5JJ827J"
};

// Initialisation Firebase
const firebaseApp = initializeApp(firebaseConfig);

// (optionnel, si tu veux accéder à auth ou firestore ailleurs)
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// ⬅️ Tu dois absolument exporter ceci :
export { firebaseApp, auth, db };
