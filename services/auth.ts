// Replaced Firebase Auth with Local Simulation

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

const STORAGE_KEY = 'ia_rpg_user';
const LISTENERS: ((user: User | null) => void)[] = [];

const notifyListeners = (user: User | null) => {
  LISTENERS.forEach(listener => listener(user));
};

export const authService = {
  signup: async (email: string, pass: string): Promise<User> => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const user: User = {
          uid: 'local-' + Date.now(),
          email,
          displayName: email.split('@')[0]
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      notifyListeners(user);
      return user;
  },

  login: async (email: string, pass: string): Promise<User> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For local dev, we generate a stable UID based on email to allow persistence
      const user: User = {
          uid: 'local-' + btoa(email).replace(/=/g, ''), 
          email,
          displayName: email.split('@')[0]
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      notifyListeners(user);
      return user;
  },

  logout: async () => {
      localStorage.removeItem(STORAGE_KEY);
      notifyListeners(null);
  },

  onAuthStateChange: (callback: (user: User | null) => void) => {
      LISTENERS.push(callback);
      
      // Check initial state
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
          try {
              const user = JSON.parse(stored);
              callback(user);
          } catch (e) {
              console.error("Failed to parse local user", e);
              callback(null);
          }
      } else {
          callback(null);
      }

      return () => {
          const idx = LISTENERS.indexOf(callback);
          if (idx > -1) LISTENERS.splice(idx, 1);
      };
  },

  getCurrentUser: (): User | null => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
          try {
              return JSON.parse(stored);
          } catch (e) {
              return null;
          }
      }
      return null;
  }
};