import { GameState, ChatMessage } from '../types';

const DB_NAME = 'InfiniteAdventureDB';
const STORE_NAME = 'saves';
const DB_VERSION = 1;
const LOCAL_STORAGE_PREFIX = 'ia_rpg_save_';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject("Failed to open database");
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

export const saveGame = async (userId: string, gameState: GameState, messages: ChatMessage[]) => {
  try {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const data = {
        gameState,
        messages,
        lastSaved: Date.now(),
      };
      
      const request = store.put(data, userId);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      
      tx.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Failed to save game to IndexedDB:', error);
  }
};

export const loadGame = async (userId: string): Promise<{ gameState: GameState; messages: ChatMessage[] } | null> => {
  try {
    // 1. Try IndexedDB first
    const db = await openDB();
    const idbData = await new Promise<any>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(userId);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      
      tx.oncomplete = () => db.close();
    });

    if (idbData) {
      return { gameState: idbData.gameState, messages: idbData.messages };
    }

    // 2. Fallback/Migration: Check LocalStorage
    // This handles users migrating from the old version to the new version transparently
    const localKey = `${LOCAL_STORAGE_PREFIX}${userId}`;
    const localJson = localStorage.getItem(localKey);
    
    if (localJson) {
      console.log('Migrating save from LocalStorage to IndexedDB...');
      try {
        const data = JSON.parse(localJson);
        
        // Save to IDB
        await saveGame(userId, data.gameState, data.messages);
        
        // Clear LocalStorage to free up space
        localStorage.removeItem(localKey);
        
        return { gameState: data.gameState, messages: data.messages };
      } catch (e) {
        console.error("Migration failed:", e);
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
    // Clear IDB
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(userId);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => db.close();
    });

    // Clear LocalStorage (just in case)
    localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}${userId}`);
    
  } catch (error) {
    console.error('Failed to clear save data:', error);
  }
};
