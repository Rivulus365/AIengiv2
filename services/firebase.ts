
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyAPtvvsJferOFX7H4ArW1lkVxA2dj6SvNM",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "iaengine-7b3d0.firebaseapp.com",
  databaseURL: "https://iaengine-7b3d0-default-rtdb.firebaseio.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "iaengine-7b3d0",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "iaengine-7b3d0.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "21775763118",
  appId: process.env.FIREBASE_APP_ID || "1:21775763118:web:6d7d7fa44566124c90cf3f",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-F76DT9E1VM"
};

// Check if keys are actually present and not just placeholders
const isValidConfig = !!firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('your_');
export const isFirebaseConfigured = isValidConfig;

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let analytics: any;

if (isValidConfig) {
  try {
    app = initializeApp(firebaseConfig);
    // Initialize Auth with the specific app instance to prevent conflicts
    auth = getAuth(app);
    
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app);
    }
  } catch (error) {
    console.error("Firebase Initialization Error:", error);
  }
}

export { app, auth, analytics };
export default app;
