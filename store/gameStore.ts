
import { create } from 'zustand';
import { 
    GameState, 
    ChatMessage, 
    BaseStats, 
    CharacterCreationData,
    DieType,
    RollData,
    Item
} from '../types';
import { User } from '../services/auth';
import { INITIAL_GAME_STATE } from '../constants';
import { GameService } from '../services/gameService';
import { liveService } from '../services/live';
import { audioService } from '../services/audio';
import { saveGame, loadGame, clearSave } from '../services/storage';
import { rollDice } from '../utils/dice';
import { useUIStore } from './uiStore';
import { useSettingsStore } from './settingsStore';
import { generateSceneImage, generateNarration } from '../services/gemini';
import { calculateMaxHp, calculateDerivedStats, generateInitialSkills } from '../utils/engine';
import { GameDataService } from '../services/gameData';

interface GameStoreState {
    user?: User;
    isGameLoaded: boolean;
    isCharacterCreated: boolean;
    gameState: GameState;
    messages: ChatMessage[];
    
    // Actions
    setUser: (user: User | undefined) => Promise<void>;
    createCharacter: (data: CharacterCreationData) => Promise<void>;
    processTurn: (input: string) => Promise<void>;
    toggleLiveMode: () => Promise<void>; 
    toggleMicMute: () => void;
    
    equipItem: (item: Item) => Promise<void>;
    dropItem: (item: Item) => Promise<void>;
    manualRoll: (count: number, type: DieType) => void;
    recordRolls: (rolls: RollData[]) => Promise<void>;
    
    manualSave: () => Promise<void>;
    resetCampaign: () => void;
    respawn: () => void;
    levelUp: (stats: BaseStats, newProficiency?: string) => Promise<void>;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
    user: undefined,
    isGameLoaded: false,
    isCharacterCreated: false,
    gameState: INITIAL_GAME_STATE,
    messages: [],

    setUser: async (user) => {
        set({ user });
        if (user) {
            const savedData = await loadGame(user.uid);
            if (savedData) {
                set({
                    gameState: savedData.gameState,
                    messages: savedData.messages,
                    isCharacterCreated: true, 
                    isGameLoaded: true,
                });
            } else {
                set({ isGameLoaded: true, isCharacterCreated: false });
            }
        }
    },

    equipItem: async (item) => {
        await get().processTurn(`[System]: Player equips ${item.name}. Recalculate stats.`);
    },

    dropItem: async (item) => {
        await get().processTurn(`[System]: Player drops ${item.name}. Remove from inventory.`);
    },

    manualRoll: (count, type) => {
        const rolls = rollDice(count, type, 'player');
        const systemMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'system',
            text: `[System]: Rolled ${count}${type}...`,
            gameStateSnapshot: { ...get().gameState, lastRolls: rolls }
        };
        set(state => ({ messages: [...state.messages, systemMsg] }));
        get().recordRolls(rolls);
    },

    recordRolls: async (rolls) => {
        const { user, gameState, messages } = get();
        const newState = { ...gameState, lastRolls: rolls };
        set({ gameState: newState });
        if (user) await saveGame(user.uid, newState, messages);
    },

    createCharacter: async (data) => {
        const newGameState = await GameService.generateCharacter(data);
        const startPrompt = `I am ${data.name}, a ${data.age}-year-old ${data.gender} ${data.race} ${data.charClass}. My background is ${data.background}. My stats are STR:${data.stats.str} DEX:${data.stats.dex} CON:${data.stats.con} INT:${data.stats.int} WIS:${data.stats.wis} CHA:${data.stats.cha}. I have the feat ${data.feat.name}. Generate my starting inventory and start the adventure.`;
        
        set({ 
            gameState: newGameState, 
            isCharacterCreated: true, 
            messages: [{ id: crypto.randomUUID(), role: 'user', text: startPrompt }] 
        });
        await get().processTurn(startPrompt);
    },

    processTurn: async (input) => {
        const { user, messages, gameState } = get();
        const { imageGenEnabled, imageSize, narratorEnabled } = useSettingsStore.getState();
        const { setIsLoading, addToast } = useUIStore.getState();
        
        if (!user) return;
        setIsLoading(true);

        // UI consistency: Ensure the user message is visible immediately
        let currentMessages = [...messages];
        if (currentMessages.length === 0 || currentMessages[currentMessages.length - 1].text !== input) {
            currentMessages.push({ id: crypto.randomUUID(), role: 'user', text: input });
            set({ messages: currentMessages });
        }

        try {
            const { nextState, nextMessages } = await GameService.handleProcessTurn(
                input, 
                gameState, 
                currentMessages, 
                { imageGenEnabled, imageSize, narratorEnabled }
            );

            const modelMsg = nextMessages[nextMessages.length - 1];
            set({ gameState: nextState, messages: nextMessages });

            // Concurrent side effects
            if (imageGenEnabled) {
                const locChanged = nextState.worldState.location !== gameState.worldState.location;
                if (locChanged || nextMessages.length < 3) {
                    generateSceneImage(modelMsg.text, `${nextState.player.race} ${nextState.player.class}`, nextState.worldState.location, imageSize)
                        .then(url => {
                            set(s => ({ messages: s.messages.map(m => m.id === modelMsg.id ? { ...m, image: url, isImageLoading: false } : m) }));
                            saveGame(user.uid, get().gameState, get().messages);
                        });
                } else {
                    set(s => ({ messages: s.messages.map(m => m.id === modelMsg.id ? { ...m, isImageLoading: false } : m) }));
                }
            }
            
            await saveGame(user.uid, nextState, nextMessages);
        } catch (error) {
            console.error("Turn Error:", error);
            addToast("The weave fails", "The mists obscure your path. Try again.", "error");
        } finally {
            setIsLoading(false);
        }
    },

    toggleLiveMode: async () => {
        const { isLiveActive, setIsLiveActive, addToast } = useUIStore.getState();
        if (isLiveActive) {
            liveService.disconnect();
            setIsLiveActive(false);
        } else {
            try {
                await liveService.connect();
                setIsLiveActive(true);
                addToast("Voice Mode", "Speak to the Dungeon Master.", "success");
            } catch (e) {
                addToast("Mic Required", "Enable microphone to use voice mode.", "error");
            }
        }
    },

    toggleMicMute: () => {
        const { isMicMuted, setIsMicMuted } = useUIStore.getState();
        const muted = !isMicMuted;
        liveService.setMuted(muted);
        setIsMicMuted(muted);
    },

    manualSave: async () => {
        const { user, gameState, messages } = get();
        const { addToast } = useUIStore.getState();
        if (user) {
            await saveGame(user.uid, gameState, messages);
            addToast("Progress Saved", "Your legend is recorded.", "success");
        }
    },

    resetCampaign: () => {
        const { user } = get();
        const { addToast } = useUIStore.getState();
        if (user) {
            clearSave(user.uid);
            set({ gameState: INITIAL_GAME_STATE, messages: [], isCharacterCreated: false });
            addToast("Realm Purged", "The cycle begins anew.", "warning");
        }
    },

    respawn: () => {
        const { gameState, user, messages } = get();
        const newState = { ...gameState, player: { ...gameState.player, hp: { ...gameState.player.hp, current: Math.floor(gameState.player.hp.max / 2) } } };
        const msg: ChatMessage = { id: crypto.randomUUID(), role: 'model', text: "Fate has spared you. You awaken, battered but alive." };
        set({ gameState: newState, messages: [...messages, msg] });
        if (user) saveGame(user.uid, newState, get().messages);
    },

    levelUp: async (newStats, newProf) => {
        const { gameState, user, messages } = get();
        const { addToast } = useUIStore.getState();
        const newLevel = gameState.player.level + 1;
        const conMod = Math.floor((newStats.con - 10) / 2);
        const classDef = (await GameDataService.getClasses())[gameState.player.class];
        const hpInc = Math.floor(classDef.hitDie / 2) + 1 + conMod;
        
        const profs = [...gameState.player.proficiencies];
        if (newProf && !profs.includes(newProf)) profs.push(newProf);
        
        const derived = calculateDerivedStats(newStats, gameState.player.class, newLevel, profs);
        const skills = generateInitialSkills(newStats, profs, derived.proficiencyBonus);

        const newState = {
            ...gameState,
            player: { 
                ...gameState.player, 
                level: newLevel, 
                stats: newStats, 
                proficiencies: profs, 
                derivedStats: derived, 
                skills, 
                hp: { current: gameState.player.hp.max + hpInc, max: gameState.player.hp.max + hpInc }, 
                unspentStatPoints: 0 
            }
        };
        
        const msg: ChatMessage = { id: crypto.randomUUID(), role: 'system', text: `[System]: Level Up! You are now Level ${newLevel}.` };
        set({ gameState: newState, messages: [...messages, msg] });
        if (user) saveGame(user.uid, newState, get().messages);
        addToast("Ascended!", `You have reached level ${newLevel}.`, "success");
    }
}));
