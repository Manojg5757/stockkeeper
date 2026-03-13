import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
   apiKey: "AIzaSyDesaNZdtnHyRfPJy4vfNaOaUfJ21cVOEo",
  authDomain: "stockkeeper-a02a7.firebaseapp.com",
  projectId: "stockkeeper-a02a7",
  storageBucket: "stockkeeper-a02a7.firebasestorage.app",
  messagingSenderId: "27264752036",
  appId: "1:27264752036:web:c9526b3b53fbd4b1290931"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

