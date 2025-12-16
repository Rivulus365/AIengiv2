
import { z } from 'zod';
import { GameState, Item } from '../types';
import { ITEM_LIBRARY } from '../data/items';

// --- Zod Schemas ---

// 1. Define the Nested Game State pieces
const PlayerSchema = z.object({
    hp: z.object({
        current: z.number().int(),
        max: z.number().int().min(1)
    }),
    // Allow loose matching for other player properties to prevent crashing on minor omissions
    // but strictly enforce HP as requested.
}).passthrough();

const LocationSchema = z.object({
    name: z.string().min(1, "Location name cannot be empty")
}).passthrough();

// 2. Define the main GameState object constraint
const InnerGameStateSchema = z.object({
    player: PlayerSchema,
    location: z.object({ name: z.string() }).optional(), // Allow mapping from worldState
    worldState: LocationSchema.optional(), // Handle either location structure
    lastRoll: z.object({
        value: z.number(),
        isCrit: z.boolean(),
        isFail: z.boolean(),
        source: z.enum(['player', 'enemy']).optional().default('player')
    }).optional()
}).passthrough(); 

// 3. Define the AI Response Schema (The Root)
export const GameStateSchema = z.object({
    text: z.string().min(1, "Narrative text is missing"),
    gameState: InnerGameStateSchema,
    actions: z.array(z.string()).min(1, "At least one action is required")
});

export type ValidatedAIResponse = z.infer<typeof GameStateSchema>;

/**
 * Validates the structure of the incoming JSON from the AI
 * using Zod. Returns the parsed data or throws a ZodError.
 */
export const validateGameResponse = (jsonString: string): ValidatedAIResponse => {
    // 1. Parse JSON syntax
    let rawObj;
    try {
        rawObj = JSON.parse(jsonString);
    } catch (e) {
        throw new Error("Invalid JSON Syntax");
    }

    // 2. Validate against Schema
    return GameStateSchema.parse(rawObj);
};

/**
 * Sanitizes the game state to ensure arrays contain the correct primitive types.
 * (Legacy support for non-Zod flows)
 */
export const normalizeGameState = (state: any): any => {
    if (!state || typeof state !== 'object') return state;
    
    const newState = { ...state };
    
    if (newState.player) {
        if (Array.isArray(newState.player.activeSpells)) {
            newState.player.activeSpells = newState.player.activeSpells.map((s: any) => {
                if (typeof s === 'string') return s;
                if (typeof s === 'object' && s !== null && s.name) return String(s.name);
                return "Unknown Spell";
            });
        }
    }
    return newState;
};

/**
 * Merges item instance with library definition if available.
 */
const hydrateInventory = (inventory: any[]): Item[] => {
    if (!Array.isArray(inventory)) return [];
    
    return inventory.map((item: any) => {
        // If it's just a string (legacy/error), try to wrap it
        if (typeof item === 'string') return { name: item, qty: 1 };
        
        // Check library
        const libItem = ITEM_LIBRARY[item.name];
        if (libItem) {
            // Library is base, item from AI overrides (e.g. qty, or custom variation)
            return { ...libItem, ...item };
        }
        // Unique item or not in library
        return item;
    });
};

/**
 * Repairs a broken state object if possible, or returns a safe fallback.
 */
export const repairGameState = (brokenState: any, lastValidState: GameState): GameState => {
    console.warn("Attempting to repair/hydrate game state...");
    
    // Normalize first to fix types
    const normalizedBroken = normalizeGameState(brokenState);

    // Hydrate Inventory
    const incomingInventory = normalizedBroken?.inventory;
    const hydratedInventory = Array.isArray(incomingInventory) 
        ? hydrateInventory(incomingInventory) 
        : lastValidState.inventory;

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
        inventory: hydratedInventory,
        equipment: {
            ...lastValidState.equipment,
            ...normalizedBroken?.equipment
        },
        combat: normalizedBroken?.combat || lastValidState.combat,
        combatLog: Array.isArray(normalizedBroken?.combatLog) ? normalizedBroken.combatLog : lastValidState.combatLog,
        worldState: normalizedBroken?.worldState || lastValidState.worldState,
        // CRITICAL: Explicitly set lastRoll. If absent in brokenState, it becomes undefined (clearing previous roll).
        lastRoll: normalizedBroken?.lastRoll
    };
};
