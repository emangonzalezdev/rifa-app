// src/services/firebase.ts

// Importa las funciones necesarias de los SDK que necesitas
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // O getDatabase si usas Realtime Database

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Inicializa Firebase solo si aún no está inicializado
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inicializa los servicios de autenticación y base de datos
export const auth = getAuth(app);
export const db = getFirestore(app); // O getDatabase(app) si usas Realtime Database

export default app;