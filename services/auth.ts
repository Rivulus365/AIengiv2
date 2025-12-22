
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  signInAnonymously,
  type User as FirebaseUser,
  type AuthError
} from 'firebase/auth';
import { auth } from './firebase';

export interface User {
  uid: string;
  email: string | undefined;
  displayName: string | undefined;
  photoURL?: string | undefined;
  isAnonymous?: boolean;
}

// Map Firebase user to our internal User interface
const mapUser = (firebaseUser: FirebaseUser | null): User | undefined => {
  if (!firebaseUser) return undefined;
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || undefined,
    displayName: firebaseUser.displayName || (firebaseUser.isAnonymous ? 'Guest Traveler' : firebaseUser.email?.split('@')[0]) || 'Unknown Hero',
    photoURL: firebaseUser.photoURL || undefined,
    isAnonymous: firebaseUser.isAnonymous
  };
};

export const authService = {
  signup: async (email: string, pass: string): Promise<User> => {
    if (!auth) throw new Error("Firebase Auth not configured.");
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      if (!result.user) throw new Error("Signup failed - no user returned");
      return mapUser(result.user)!;
    } catch (error) {
      console.error("Signup Error:", error);
      throw error;
    }
  },

  login: async (email: string, pass: string): Promise<User> => {
    if (!auth) throw new Error("Firebase Auth not configured.");
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      if (!result.user) throw new Error("Login failed - no user returned");
      return mapUser(result.user)!;
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  },

  loginWithGoogle: async (): Promise<User> => {
    if (!auth) throw new Error("Firebase Auth not configured.");
    try {
      const provider = new GoogleAuthProvider();
      // Configure to force account selection if needed, or simple login
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      if (!result.user) throw new Error("Google Login failed - no user returned");
      
      return mapUser(result.user)!;
    } catch (error) {
      const authError = error as any;
      console.error("Google Auth Error:", authError.code, authError.message);
      throw error;
    }
  },

  loginAnonymously: async (): Promise<User> => {
    if (!auth) throw new Error("Firebase Auth not configured.");
    try {
      const result = await signInAnonymously(auth);
      if (!result.user) throw new Error("Anonymous Login failed - no user returned");
      return mapUser(result.user)!;
    } catch (error) {
      console.error("Anonymous Login Error:", error);
      throw error;
    }
  },

  resetPassword: async (email: string): Promise<void> => {
    if (!auth) throw new Error("Firebase Auth not configured.");
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Reset Password Error:", error);
      throw error;
    }
  },

  logout: async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  },

  onAuthStateChange: (callback: (user: User | undefined) => void) => {
    if (!auth) {
        // If auth is not configured, we just return a dummy unsubscribe function
        // and call callback(undefined) immediately so the app treats it as logged out
        callback(undefined);
        return () => {};
    }
    return onAuthStateChanged(auth, (firebaseUser) => {
      callback(mapUser(firebaseUser));
    });
  },

  getCurrentUser: (): User | undefined => {
    if (!auth) return undefined;
    return mapUser(auth.currentUser);
  }
};
