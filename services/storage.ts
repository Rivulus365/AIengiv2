
import { db } from './firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { GameState, ChatMessage } from '../types';

const DB_COLLECTION = 'saves';
const LOCAL_STORAGE_PREFIX = 'ia_rpg_save_';

// Helper to sanitize data before saving to Firestore
// Firestore doesn't like undefined values, so we replace them with null
const sanitizeForFirestore = (obj: any): any => {
  if (obj === undefined) return null;
  if (obj === null) return null;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }
  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = sanitizeForFirestore(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
};

export const saveGame = async (userId: string, gameState: GameState, messages: ChatMessage[]) => {
  try {
    const data = {
      gameState: sanitizeForFirestore(gameState),
      messages: sanitizeForFirestore(messages),
      lastSaved: Date.now(),
    };
    
    await setDoc(doc(db, DB_COLLECTION, userId), data);
  } catch (error) {
    console.error('Failed to save game to Firestore:', error);
    // Fallback to local storage if network fails
    try {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${userId}`, JSON.stringify({ gameState, messages }));
    } catch (e) {
      console.error('Failed fallback save to LocalStorage:', e);
    }
  }
};

export const loadGame = async (userId: string): Promise<{ gameState: GameState; messages: ChatMessage[] } | null> => {
  try {
    // 1. Try Firestore first
    const docRef = doc(db, DB_COLLECTION, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return { gameState: data.gameState, messages: data.messages };
    }

    // 2. Fallback: Check LocalStorage (migration or offline)
    const localKey = `${LOCAL_STORAGE_PREFIX}${userId}`;
    const localJson = localStorage.getItem(localKey);
    
    if (localJson) {
      console.log('Migrating save from LocalStorage to Firestore...');
      try {
        const data = JSON.parse(localJson);
        
        // Save to Firestore
        await saveGame(userId, data.gameState, data.messages);
        
        // Clear LocalStorage to avoid confusion later, but maybe keep as backup?
        // localStorage.removeItem(localKey);
        
        return { gameState: data.gameState, messages: data.messages };
      } catch (e) {
        console.error("Migration/Local load failed:", e);
      }
    }

    return null;
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
};

export const clearSave = async (userId: string) => {
  try {
    // Clear Firestore
    await deleteDoc(doc(db, DB_COLLECTION, userId));

    // Clear LocalStorage
    localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}${userId}`);
    
  } catch (error) {
    console.error('Failed to clear save data:', error);
  }
};
