
import { auth } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

// Convert Firebase User to our User interface
const mapUser = (user: FirebaseUser | null): User | null => {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName
  };
};

export const authService = {
  signup: async (email: string, pass: string): Promise<User> => {
    const credential = await createUserWithEmailAndPassword(auth, email, pass);
    return mapUser(credential.user)!;
  },

  login: async (email: string, pass: string): Promise<User> => {
    const credential = await signInWithEmailAndPassword(auth, email, pass);
    return mapUser(credential.user)!;
  },
  
  loginWithGoogle: async (): Promise<User> => {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    return mapUser(credential.user)!;
  },

  logout: async () => {
    await signOut(auth);
  },

  onAuthStateChange: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, (user) => {
      callback(mapUser(user));
    });
  },

  getCurrentUser: (): User | null => {
    return mapUser(auth.currentUser);
  },
  
  updateProfileName: async (name: string) => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: name
      });
    }
  }
};
