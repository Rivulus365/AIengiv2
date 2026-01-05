
import { z } from 'zod';
import { GameState, Item } from '../types';
import { ITEM_LIBRARY } from '../data/items';

// --- Zod Schemas ---

const HpSchema = z.object({
    current: z.number(),
    max: z.number()
});

const PlayerSchema = z.object({
    hp: HpSchema,
}).passthrough();

const WorldStateSchema = z.object({
    location: z.string(),
}).passthrough();

const CombatSchema = z.object({
    isActive: z.boolean(),
}).passthrough();

// Main GameState Schema - loosely valid to allow for AI flexibility, but enforces critical structure
export const GameStateSchema = z.object({
    player: PlayerSchema,
    worldState: WorldStateSchema,
    combat: CombatSchema,
    // Optional arrays that default to empty if missing in Zod parsing logic below or handled by repair
    inventory: z.array(z.any()).optional(),
    equipment: z.any().optional(),
    combatLog: z.array(z.any()).optional(),
    lastRolls: z.array(z.any()).optional()
}).passthrough();

export const validateGameState = (data: any) => {
    return GameStateSchema.safeParse(data);
};

// --- Heuristic Repair & Normalization ---

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

const hydrateInventory = (inventory: any[]): Item[] => {
    if (!Array.isArray(inventory)) return [];
    return inventory.map((item: any) => {
        if (typeof item === 'string') return { name: item, qty: 1 };
        const libItem = ITEM_LIBRARY[item.name];
        if (libItem) {
            return { ...libItem, ...item };
        }
        return item;
    });
};

export const repairGameState = (brokenState: any, lastValidState: GameState): GameState => {
    const normalizedBroken = normalizeGameState(brokenState);
    const incomingInventory = normalizedBroken?.inventory;
    const hydratedInventory = Array.isArray(incomingInventory) 
        ? hydrateInventory(incomingInventory) 
        : lastValidState.inventory;

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
        lastRolls: normalizedBroken?.lastRolls
    };
};
