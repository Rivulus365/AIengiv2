
import { create } from 'zustand';
import { 
    GameState, 
    ChatMessage, 
    ImageSize, 
    FontSize, 
    BaseStats, 
    ToastMessage,
    CharacterCreationData
} from '../types';
import { User } from '../services/auth';
import { 
    INITIAL_GAME_STATE, 
    GAME_CONFIG,
    DEFAULT_IMAGE_SIZE
} from '../constants';
import { 
    generateAdventureResponse, 
    generateSceneImage,
    generateNarration
} from '../services/gemini';
import { liveService } from '../services/live';
import { audioService } from '../services/audio';
import { 
    calculateDerivedStats, 
    calculateMaxHp, 
    generateInitialSkills 
} from '../utils/engine';
import { GameDataService } from '../services/gameData';
import { saveGame, loadGame, clearSave } from '../services/storage';
import { extractGameState } from '../utils/parser';
import { repairGameState } from '../utils/validator';

// --- HELPER FUNCTIONS ---

const buildStartPrompt = (data: CharacterCreationData): string => {
    const { name, age, gender, race, charClass, subclass, background, stats, feat } = data;
    const subclassText = subclass ? ` I specialize as a ${subclass}.` : '';
    const bgText = background ? ` My background is ${background}.` : '';
    return `I am ${name}, a ${age}-year-old ${gender} ${race} ${charClass} (Level 1).${subclassText}${bgText} My stats are STR:${stats.str} DEX:${stats.dex} CON:${stats.con} INT:${stats.int} WIS:${stats.wis} CHA:${stats.cha}. I have the feat ${feat.name}. Generate my starting inventory and drop me into the world.`;
};

const handleImageGeneration = async (
    text: string, 
    newState: GameState, 
    oldState: GameState, 
    msgId: string, 
    size: ImageSize
): Promise<string | null> => {
    const locationChanged = newState.worldState.location !== oldState.worldState.location;
    const combatChanged = newState.combat.isActive !== oldState.combat.isActive;
    // We only generate if scene context shifted
    if (locationChanged || combatChanged) {
        const sceneDesc = text.slice(0, 300);
        const characterDesc = `${newState.player.race} ${newState.player.class}, ${newState.player.gender}`;
        const envDesc = newState.worldState.location;
        return await generateSceneImage(sceneDesc, characterDesc, envDesc, size);
    }
    return null;
};

// --- STORE INTERFACE ---

interface GameStoreState {
    user: User | null;
    isGameLoaded: boolean;
    isLoading: boolean;
    isCharacterCreated: boolean;
    isLiveActive: boolean;
    isMicMuted: boolean; // New state for mic mute
    gameState: GameState;
    messages: ChatMessage[];
    
    // Settings
    soundEnabled: boolean;
    narratorEnabled: boolean;
    imageGenEnabled: boolean;
    imageSize: ImageSize;
    fontSize: FontSize;
    textSpeed: 'normal' | 'fast' | 'instant';
    
    toasts: ToastMessage[];

    // Actions
    setUser: (user: User | null) => Promise<void>;
    setSoundEnabled: (enabled: boolean) => void;
    setNarratorEnabled: (enabled: boolean) => void;
    setImageGenEnabled: (enabled: boolean) => void;
    setImageSize: (size: ImageSize) => void;
    setFontSize: (size: FontSize) => void;
    setTextSpeed: (speed: 'normal' | 'fast' | 'instant') => void;
    
    createCharacter: (data: CharacterCreationData) => Promise<void>;
    processTurn: (input: string) => Promise<void>;
    toggleLiveMode: () => Promise<void>; 
    toggleMicMute: () => void; // New action
    
    manualSave: () => Promise<void>;
    resetCampaign: () => void;
    respawn: () => void;
    levelUp: (stats: BaseStats) => Promise<void>;
    
    addToast: (title: string, message?: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
    removeToast: (id: string) => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
    user: null,
    isGameLoaded: false,
    isLoading: false,
    isCharacterCreated: false,
    isLiveActive: false,
    isMicMuted: false, // Default unmuted
    gameState: INITIAL_GAME_STATE,
    messages: [],
    
    soundEnabled: true,
    narratorEnabled: true,
    imageGenEnabled: true,
    imageSize: DEFAULT_IMAGE_SIZE,
    fontSize: 'medium',
    textSpeed: 'normal',
    
    toasts: [],

    setUser: async (user) => {
        set({ user });
        if (user) {
            const savedData = await loadGame(user.uid);
            if (savedData) {
                set({
                    gameState: savedData.gameState,
                    messages: savedData.messages,
                    isCharacterCreated: true, 
                    isGameLoaded: true
                });
            } else {
                set({ isGameLoaded: true, isCharacterCreated: false });
            }
        } else {
            set({ 
                gameState: INITIAL_GAME_STATE, 
                messages: [], 
                isCharacterCreated: false, 
                isGameLoaded: false 
            });
        }
    },

    setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
    setNarratorEnabled: (enabled) => set({ narratorEnabled: enabled }),
    setImageGenEnabled: (enabled) => set({ imageGenEnabled: enabled }),
    setImageSize: (size) => set({ imageSize: size }),
    setFontSize: (size) => set({ fontSize: size }),
    setTextSpeed: (speed) => set({ textSpeed: speed }),

    addToast: (title, message, type = 'info') => {
        const id = crypto.randomUUID();
        set(state => ({
            toasts: [...state.toasts, { id, title, message, type }]
        }));
        setTimeout(() => get().removeToast(id), 5000);
    },

    removeToast: (id) => {
        set(state => ({
            toasts: state.toasts.filter(t => t.id !== id)
        }));
    },

    createCharacter: async (data) => {
        const { charClass, stats, feat, subclass, background } = data;
        const level = 1;
        const proficiencyBonus = 2;
        const derivedStats = calculateDerivedStats(stats, charClass, level, proficiencyBonus);
        
        const classDefinitions = await GameDataService.getClasses();
        const classDef = classDefinitions[charClass];
        const backgroundDefinitions = await GameDataService.getBackgrounds();
        const bgDef = backgroundDefinitions[background];

        const resources = classDef?.resources || {
            spellSlots: { current: 0, max: 0 },
            classFeats: { name: "Feature", current: 0, max: 0 }
        };

        const maxHp = calculateMaxHp(charClass, stats.con, level);
        
        const initialProficiencies: string[] = ["Simple Weapons"];
        if (bgDef?.skillProficiencies) initialProficiencies.push(...bgDef.skillProficiencies);

        const initialSkills = generateInitialSkills(stats, initialProficiencies, proficiencyBonus);

        const baseFeatures = classDef?.features || [];
        const subclassFeatures = (subclass && classDef?.subclasses?.[subclass]?.features) || [];
        const bgFeature = bgDef?.feature ? [bgDef.feature.name] : [];
        
        const newGameState: GameState = {
            ...INITIAL_GAME_STATE,
            player: {
                ...INITIAL_GAME_STATE.player,
                name: data.name,
                gender: data.gender,
                age: data.age,
                race: data.race,
                class: charClass,
                subclass: subclass || '',
                level,
                hp: { current: maxHp, max: maxHp },
                stats,
                derivedStats,
                resources,
                skills: initialSkills,
                proficiencies: initialProficiencies,
                activeFeats: [feat.name],
                activeSpells: [],
                features: [...baseFeatures, ...subclassFeatures, ...bgFeature],
                xp: 0,
                nextLevelXp: 300,
                gold: 50
            }
        };

        const startPrompt = buildStartPrompt(data);
        
        set({
            gameState: newGameState,
            isCharacterCreated: true,
            messages: [{ id: crypto.randomUUID(), role: 'user', text: startPrompt }]
        });

        await get().processTurn(startPrompt);
    },

    processTurn: async (input) => {
        const state = get();
        const { user, messages, gameState, imageGenEnabled, imageSize, narratorEnabled } = state;
        if (!user) return;

        set({ isLoading: true });

        // Optimistic UI Update
        const lastMsg = messages[messages.length - 1];
        let currentMessages = [...messages];
        if (!lastMsg || lastMsg.text !== input || lastMsg.role !== 'user') {
            currentMessages.push({ id: crypto.randomUUID(), role: 'user', text: input });
            set({ messages: currentMessages });
        }

        try {
            // Context Management
            const historyLimit = GAME_CONFIG.HISTORY_LIMIT || 10;
            const contextMessages = currentMessages.slice(-historyLimit).map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            // Gemini Interaction
            const rawResponse = await generateAdventureResponse(contextMessages, input, gameState);
            const { cleanedText, gameState: parsedState } = extractGameState(rawResponse);
            
            // State Reconciliation
            let finalState = gameState;
            if (parsedState) {
                try {
                    finalState = repairGameState(parsedState, gameState);
                } catch (e) {
                    console.warn("State repair fallback used", e);
                }
            }

            const modelMsgId = crypto.randomUUID();
            let modelMessage: ChatMessage = {
                id: modelMsgId,
                role: 'model',
                text: cleanedText,
                gameStateSnapshot: finalState,
                isImageLoading: imageGenEnabled // Optimistically show loading
            };

            // Intermediate Update
            set({ 
                gameState: finalState, 
                messages: [...currentMessages, modelMessage] 
            });

            // Audio Narration Side-Effect
            if (narratorEnabled && cleanedText) {
                // We don't await this, it plays when ready
                generateNarration(cleanedText).then(audioData => {
                    if (audioData) {
                        audioService.playPCM(audioData);
                    }
                });
            }

            // Async Image Generation Side-Effect
            if (imageGenEnabled) {
                // Determine if we actually need an image
                const shouldGenerate = (finalState.worldState.location !== gameState.worldState.location) 
                                    || (finalState.combat.isActive !== gameState.combat.isActive)
                                    || (messages.length <= 1);

                if (shouldGenerate) {
                    handleImageGeneration(cleanedText, finalState, gameState, modelMsgId, imageSize)
                        .then(url => {
                            set(s => ({
                                messages: s.messages.map(m => 
                                    m.id === modelMsgId ? { ...m, image: url || undefined, isImageLoading: false } : m
                                ),
                                isLoading: false
                            }));
                            // Save after image is ready (or failed)
                            if (user) saveGame(user.uid, finalState, get().messages);
                        });
                } else {
                    set(s => ({
                        messages: s.messages.map(m => m.id === modelMsgId ? { ...m, isImageLoading: false } : m),
                        isLoading: false
                    }));
                    if (user) await saveGame(user.uid, finalState, [...currentMessages, { ...modelMessage, isImageLoading: false }]);
                }
            } else {
                set({ isLoading: false });
                if (user) await saveGame(user.uid, finalState, [...currentMessages, { ...modelMessage, isImageLoading: false }]);
            }

        } catch (error) {
            console.error("Turn Processing Error:", error);
            get().addToast("Error", "The fates are silent. Try again.", "error");
            set({ isLoading: false });
        }
    },

    toggleLiveMode: async () => {
        const { isLiveActive } = get();
        
        if (isLiveActive) {
            // Disconnect
            liveService.disconnect();
            set({ isLiveActive: false, isMicMuted: false });
            get().addToast("Voice Mode Ended", "Returned to text adventure.", "info");
        } else {
            // Connect
            try {
                // Setup callbacks before connecting
                liveService.onStatusChange = (isActive) => set({ isLiveActive: isActive });
                liveService.onMessage = (text) => {
                    // Transcript handling logic could go here
                };

                // Ensure we start unmuted
                set({ isMicMuted: false });
                liveService.setMuted(false);

                await liveService.connect();
                // State is updated by onStatusChange callback
                get().addToast("Voice Mode Active", "Speak to the Dungeon Master.", "success");
            } catch (e) {
                get().addToast("Connection Failed", "Could not start voice mode.", "error");
            }
        }
    },

    toggleMicMute: () => {
        const { isMicMuted } = get();
        const newMuted = !isMicMuted;
        liveService.setMuted(newMuted);
        set({ isMicMuted: newMuted });
    },

    manualSave: async () => {
        const { user, gameState, messages } = get();
        if (user) {
            await saveGame(user.uid, gameState, messages);
            get().addToast("Game Saved", "Your progress has been recorded.", "success");
        }
    },

    resetCampaign: () => {
        const { user } = get();
        if (user) {
            clearSave(user.uid);
            set({
                gameState: INITIAL_GAME_STATE,
                messages: [],
                isCharacterCreated: false,
                isGameLoaded: true 
            });
            get().addToast("Campaign Reset", "The world has been wiped clean.", "warning");
        }
    },

    respawn: () => {
        const { gameState, user, messages } = get();
        const maxHp = gameState.player.hp.max;
        const newHp = Math.floor(maxHp / 2);
        
        const newState = {
            ...gameState,
            player: {
                ...gameState.player,
                hp: { ...gameState.player.hp, current: newHp }
            }
        };

        const respawnMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'model',
            text: "You gasp for air, awakening with a jolt. Death has rejected you... for now. You feel weak, but alive."
        };

        set({ gameState: newState, messages: [...messages, respawnMsg] });
        if (user) saveGame(user.uid, newState, [...messages, respawnMsg]);
    },

    levelUp: async (newStats) => {
        const { gameState, user, messages } = get();
        const oldLevel = gameState.player.level;
        const newLevel = oldLevel + 1;
        
        const conMod = Math.floor((newStats.con - 10) / 2);
        const classDef = await GameDataService.getClasses().then(c => c[gameState.player.class]);
        const hitDie = classDef?.hitDie || 8;
        const hpIncrease = Math.floor(hitDie / 2) + 1 + conMod;
        const newMaxHp = gameState.player.hp.max + hpIncrease;
        
        const newState = {
            ...gameState,
            player: {
                ...gameState.player,
                level: newLevel,
                stats: newStats,
                hp: { current: newMaxHp, max: newMaxHp },
                unspentStatPoints: 0,
                resources: {
                     ...gameState.player.resources,
                     spellSlots: { ...gameState.player.resources.spellSlots, current: gameState.player.resources.spellSlots.max } 
                }
            }
        };

        const levelUpMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'system', 
            text: `[System]: Level Up! You are now Level ${newLevel}. Max HP increased by ${hpIncrease}. Stats updated.`
        };

        set({ gameState: newState, messages: [...messages, levelUpMsg] });
        if (user) saveGame(user.uid, newState, [...messages, levelUpMsg]);
        get().addToast("Level Up!", `Welcome to level ${newLevel}.`, "success");
    }
}));
