// firebaseConfig.js
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBB-V07ZNzrw6RY7BGjlXutv5WpF9rCvUM',
  authDomain: 'pokemon-2baeb.firebaseapp.com',
  projectId: 'pokemon-2baeb',
  storageBucket: 'pokemon-2baeb.appspot.com',
  messagingSenderId: '146065904492',
  appId: '1:146065904492:web:1eff4f6b21ffa82af11949',
  measurementId: 'G-9DQLHH20HB',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Export Firebase services
export const db = getFirestore(app)
export const auth = getAuth(app)
