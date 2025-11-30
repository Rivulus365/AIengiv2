
import { GameState } from '../types';

/**
 * Validates the structure of the incoming JSON from the AI
 * to ensure it matches the expected GameState interface.
 * Returns true if valid, false otherwise.
 */
export const validateGameState = (state: any): state is GameState => {
  if (!state || typeof state !== 'object') return false;

  // 1. Validate Player
  if (!state.player || typeof state.player !== 'object') {
      console.error("Validation Failed: Missing player object");
      return false;
  }
  
  // Check critical player stats
  if (typeof state.player.hp?.current !== 'number' || typeof state.player.hp?.max !== 'number') {
      console.error("Validation Failed: Invalid HP structure");
      return false;
  }

  // Check critical resources
  if (!state.player.resources || typeof state.player.resources !== 'object') {
      console.error("Validation Failed: Missing player resources");
      return false;
  }
  
  // Optional but recommended checks for resources to prevent UI crashes
  if (!state.player.resources.spellSlots || typeof state.player.resources.spellSlots.max !== 'number') {
      console.warn("Validation Warning: Missing or invalid spellSlots");
      // Not a hard fail, but worth noting
  }

  // 2. Validate Inventory (Must be array)
  if (!Array.isArray(state.inventory)) {
      console.error("Validation Failed: Inventory is not an array");
      return false;
  }

  // 3. Validate Combat (Must exist)
  if (!state.combat || typeof state.combat !== 'object') {
      console.error("Validation Failed: Missing combat object");
      return false;
  }

  // 4. Validate World State
  if (!state.worldState || typeof state.worldState.location !== 'string') {
      console.error("Validation Failed: Invalid world state");
      return false;
  }

  return true;
};

/**
 * Sanitizes the game state to ensure arrays contain the correct primitive types.
 * This fixes issues where the AI returns objects (e.g. { name: "Fireball", level: 3 })
 * instead of strings in arrays like activeSpells.
 */
export const normalizeGameState = (state: any): any => {
    if (!state || typeof state !== 'object') return state;
    
    const newState = { ...state };
    
    if (newState.player) {
        // Fix Spells: Ensure string[]
        if (Array.isArray(newState.player.activeSpells)) {
            newState.player.activeSpells = newState.player.activeSpells.map((s: any) => {
                if (typeof s === 'string') return s;
                if (typeof s === 'object' && s !== null && s.name) return String(s.name);
                return "Unknown Spell";
            });
        } else {
            newState.player.activeSpells = [];
        }
        
        // Fix Feats: Ensure string[]
        if (Array.isArray(newState.player.activeFeats)) {
            newState.player.activeFeats = newState.player.activeFeats.map((f: any) => {
                if (typeof f === 'string') return f;
                if (typeof f === 'object' && f !== null && f.name) return String(f.name);
                return "Unknown Feat";
            });
        } else {
            newState.player.activeFeats = [];
        }
        
        // Fix Proficiencies: Ensure string[]
        if (Array.isArray(newState.player.proficiencies)) {
             newState.player.proficiencies = newState.player.proficiencies.map((p: any) => {
                if (typeof p === 'string') return p;
                if (typeof p === 'object' && p !== null && p.name) return String(p.name);
                return String(p);
            });
        }
    }
    
    // Fix Inventory: Ensure Item[]
    if (Array.isArray(newState.inventory)) {
        newState.inventory = newState.inventory.map((item: any) => {
            if (typeof item === 'string') return { name: item, qty: 1, rarity: 'common' };
            if (typeof item === 'object' && item !== null) {
                 // Ensure name is string
                 if (typeof item.name !== 'string') {
                     // If name is missing or weird, try to salvage or default
                     item.name = "Unknown Item";
                 }
                 return item;
            }
            return { name: "Unknown Item", rarity: 'common' };
        });
    } else {
        newState.inventory = [];
    }

    return newState;
};

/**
 * Repairs a broken state object if possible, or returns a safe fallback.
 */
export const repairGameState = (brokenState: any, lastValidState: GameState): GameState => {
    console.warn("Attempting to repair game state...");
    
    // Normalize first to fix types
    const normalizedBroken = normalizeGameState(brokenState);

    // Deep merge attempt or fallback to last valid
    return {
        ...lastValidState,
        player: {
            ...lastValidState.player,
            ...normalizedBroken?.player,
            hp: normalizedBroken?.player?.hp || lastValidState.player.hp,
            resources: {
                ...lastValidState.player.resources,
                ...(normalizedBroken?.player?.resources || {})
            }
        },
        // Inventory is already normalized to array, so it's safe to use if present
        inventory: Array.isArray(normalizedBroken?.inventory) ? normalizedBroken.inventory : lastValidState.inventory,
        combat: normalizedBroken?.combat || lastValidState.combat,
        combatLog: Array.isArray(normalizedBroken?.combatLog) ? normalizedBroken.combatLog : lastValidState.combatLog,
        worldState: normalizedBroken?.worldState || lastValidState.worldState
    };
};
