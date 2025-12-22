
import { z } from 'zod';
import { GameState, Item } from '../types';
import { ITEM_LIBRARY } from '../data/items';

const PlayerSchema = z.object({
    hp: z.object({
        current: z.number().int(),
        max: z.number().int().min(1)
    }),
}).passthrough();

const LocationSchema = z.object({
    name: z.string().min(1, "Location name cannot be empty")
}).passthrough();

const InnerGameStateSchema = z.object({
    player: PlayerSchema,
    worldState: LocationSchema.optional(),
    lastRolls: z.array(z.object({
        value: z.number(),
        isCrit: z.boolean(),
        isFail: z.boolean(),
        source: z.enum(['player', 'enemy']).optional().default('player'),
        label: z.string().optional()
    })).optional()
}).passthrough(); 

export const GameStateSchema = z.object({
    text: z.string().min(1, "Narrative text is missing"),
    gameState: InnerGameStateSchema,
    actions: z.array(z.string()).min(1, "At least one action is required")
});

export type ValidatedAIResponse = z.infer<typeof GameStateSchema>;

export const validateGameResponse = (jsonString: string): ValidatedAIResponse => {
    let rawObj;
    try {
        rawObj = JSON.parse(jsonString);
    } catch (e) {
        throw new Error("Invalid JSON Syntax");
    }
    return GameStateSchema.parse(rawObj);
};

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
        lastRolls: normalizedBroken?.lastRolls // Update to plural
    };
};
