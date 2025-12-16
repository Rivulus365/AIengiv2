
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig: any = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Check if config is present and valid (not default placeholders)
const isValidConfig = firebaseConfig.apiKey && 
                      !firebaseConfig.apiKey.includes('your_') && 
                      firebaseConfig.projectId && 
                      !firebaseConfig.projectId.includes('your_');

export const isFirebaseConfigured = !!isValidConfig;

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch (error) {
    console.error("Firebase Initialization Error:", error);
    // Even if config looked valid, if it fails (e.g. bad format), mark as unconfigured to prevent crashes downstream
  }
} else {
  console.warn("Firebase configuration missing or invalid. Check .env variables.");
}

export { app, auth };
export default app;
