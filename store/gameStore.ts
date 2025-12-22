
import { create } from 'zustand';
import { 
    GameState, 
    ChatMessage, 
    ImageSize, 
    FontSize, 
    BaseStats, 
    ToastMessage,
    CharacterCreationData,
    DieType,
    RollData
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
): Promise<string | undefined> => {
    const locationChanged = newState.worldState.location !== oldState.worldState.location;
    const combatChanged = newState.combat.isActive !== oldState.combat.isActive;
    if (locationChanged || combatChanged) {
        const sceneDesc = text.slice(0, 300);
        const characterDesc = `${newState.player.race} ${newState.player.class}, ${newState.player.gender}`;
        const envDesc = newState.worldState.location;
        const result = await generateSceneImage(sceneDesc, characterDesc, envDesc, size);
        return result || undefined;
    }
    return undefined;
};

// --- STORE INTERFACE ---

interface GameStoreState {
    user?: User;
    isGameLoaded: boolean;
    isLoading: boolean;
    isCharacterCreated: boolean;
    isLiveActive: boolean;
    isMicMuted: boolean;
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
    setUser: (user: User | undefined) => Promise<void>;
    setSoundEnabled: (enabled: boolean) => void;
    setNarratorEnabled: (enabled: boolean) => void;
    setImageGenEnabled: (enabled: boolean) => void;
    setImageSize: (size: ImageSize) => void;
    setFontSize: (size: FontSize) => void;
    setTextSpeed: (speed: 'normal' | 'fast' | 'instant') => void;
    
    createCharacter: (data: CharacterCreationData) => Promise<void>;
    processTurn: (input: string) => Promise<void>;
    toggleLiveMode: () => Promise<void>; 
    toggleMicMute: () => void;
    
    manualRoll: (count: number, type: DieType) => void;
    recordRolls: (rolls: RollData[]) => Promise<void>;
    
    manualSave: () => Promise<void>;
    resetCampaign: () => void;
    respawn: () => void;
    levelUp: (stats: BaseStats, newProficiency?: string) => Promise<void>;
    
    addToast: (title: string, message?: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
    removeToast: (id: string) => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
    user: undefined,
    isGameLoaded: false,
    isLoading: true,
    isCharacterCreated: false,
    isLiveActive: false,
    isMicMuted: false,
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
                    isGameLoaded: true,
                    isLoading: false
                });
            } else {
                set({ isGameLoaded: true, isCharacterCreated: false, isLoading: false });
            }
        } else {
            set({ 
                gameState: INITIAL_GAME_STATE, 
                messages: [], 
                isCharacterCreated: false, 
                isGameLoaded: false,
                isLoading: false
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

    manualRoll: (count, type) => {
        const sides = parseInt(type.substring(1));
        const rolls: RollData[] = Array.from({ length: count }, () => {
            const val = Math.floor(Math.random() * sides) + 1;
            return {
                value: val,
                sides: sides,
                type: type,
                isCrit: val === sides && sides === 20,
                isFail: val === 1 && sides === 20,
                source: 'player',
                label: type.toUpperCase()
            };
        });

        // Trigger animation by setting snapshots
        const tempMsgId = crypto.randomUUID();
        const systemMsg: ChatMessage = {
            id: tempMsgId,
            role: 'system',
            text: `[System]: Rolled ${count}${type}...`,
            gameStateSnapshot: {
                ...get().gameState,
                lastRolls: rolls
            }
        };

        set(state => ({
            messages: [...state.messages, systemMsg]
        }));
        
        get().recordRolls(rolls);
    },

    recordRolls: async (rolls) => {
        const { user, gameState, messages } = get();
        const newState = { ...gameState, lastRolls: rolls };
        set({ gameState: newState });
        if (user) await saveGame(user.uid, newState, messages);
    },

    createCharacter: async (data) => {
        const { charClass, stats, feat, subclass, background } = data;
        const level = 1;
        // Proficiency Bonus is derived inside calculateDerivedStats based on level
        const derivedStats = calculateDerivedStats(stats, charClass, level);
        
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
        
        // Use derived proficiency bonus
        const initialSkills = generateInitialSkills(stats, initialProficiencies, derivedStats.proficiencyBonus);
        
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
        const lastMsg = messages[messages.length - 1];
        let currentMessages = [...messages];
        if (!lastMsg || lastMsg.text !== input || lastMsg.role !== 'user') {
            currentMessages.push({ id: crypto.randomUUID(), role: 'user', text: input });
            set({ messages: currentMessages });
        }

        try {
            const historyLimit = GAME_CONFIG.HISTORY_LIMIT || 10;
            const contextMessages = currentMessages.slice(-historyLimit).map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const rawResponse = await generateAdventureResponse(contextMessages, input, gameState);
            const { cleanedText, gameState: parsedState } = extractGameState(rawResponse);
            
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
                isImageLoading: imageGenEnabled
            };

            set({ 
                gameState: finalState, 
                messages: [...currentMessages, modelMessage] 
            });

            if (narratorEnabled && cleanedText) {
                generateNarration(cleanedText).then(audioData => {
                    if (audioData) audioService.playPCM(audioData);
                });
            }

            if (imageGenEnabled) {
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
        } catch (error: any) {
            console.error("Turn Processing Error:", error);
            
            if (error.message?.includes("Requested entity was not found.") || error.message?.includes("API key not valid")) {
                get().addToast("API Error", "The selected API key is no longer valid. Please select a paid key again.", "error");
                if (window.aistudio) window.aistudio.openSelectKey();
            } else {
                get().addToast("Error", "The fates are silent. Try again.", "error");
            }
            
            set({ isLoading: false });
        }
    },

    toggleLiveMode: async () => {
        const { isLiveActive } = get();
        if (isLiveActive) {
            liveService.disconnect();
            set({ isLiveActive: false, isMicMuted: false });
            get().addToast("Voice Mode Ended", "Returned to text adventure.", "info");
        } else {
            try {
                // Pin the current sound state to the service
                liveService.onStatusChange = (isActive) => set({ isLiveActive: isActive });
                set({ isMicMuted: false });
                liveService.setMuted(false);

                // API Key check must assume success for key selection if openSelectKey is called
                if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
                    await window.aistudio.openSelectKey();
                }
                
                // Connection attempt
                await liveService.connect();
                get().addToast("Voice Mode Active", "Speak to the Dungeon Master.", "success");
            } catch (e: any) {
                console.error("Live connection failed", e);
                const isPermissionError = e.message?.toLowerCase().includes('permission') || e.message?.toLowerCase().includes('dismissed');
                
                get().addToast(
                    isPermissionError ? "Microphone Required" : "Connection Failed", 
                    isPermissionError ? "Please enable microphone access in your browser." : "Could not start voice mode. Please try again.", 
                    "error"
                );
                
                set({ isLiveActive: false });
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
        const newState = { ...gameState, player: { ...gameState.player, hp: { ...gameState.player.hp, current: newHp } } };
        const respawnMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'model',
            text: "You gasp for air, awakening with a jolt. Death has rejected you... for now. You feel weak, but alive."
        };
        set({ gameState: newState, messages: [...messages, respawnMsg] });
        if (user) saveGame(user.uid, newState, [...messages, respawnMsg]);
    },

    levelUp: async (newStats, newProficiency) => {
        const { gameState, user, messages } = get();
        const oldLevel = gameState.player.level;
        const newLevel = oldLevel + 1;
        
        // 1. Calculate HP Increase
        const conMod = Math.floor((newStats.con - 10) / 2);
        const classDef = await GameDataService.getClasses().then(c => c[gameState.player.class]);
        const hitDie = classDef?.hitDie || 8;
        const hpIncrease = Math.floor(hitDie / 2) + 1 + conMod;
        const newMaxHp = gameState.player.hp.max + hpIncrease;

        // 2. Handle New Proficiency
        const currentProficiencies = [...gameState.player.proficiencies];
        if (newProficiency && !currentProficiencies.includes(newProficiency)) {
            currentProficiencies.push(newProficiency);
        }

        // 3. Recalculate Derived Stats (Includes new Proficiency Bonus)
        const newDerivedStats = calculateDerivedStats(newStats, gameState.player.class, newLevel);
        const newPb = newDerivedStats.proficiencyBonus;

        // 4. Recalculate Skills with new Stats and Proficiency Bonus
        const newSkills = generateInitialSkills(newStats, currentProficiencies, newPb);

        const newState = {
            ...gameState,
            player: {
                ...gameState.player,
                level: newLevel,
                stats: newStats,
                proficiencies: currentProficiencies,
                derivedStats: newDerivedStats,
                skills: newSkills,
                hp: { current: newMaxHp, max: newMaxHp },
                unspentStatPoints: 0,
                resources: {
                     ...gameState.player.resources,
                     spellSlots: { ...gameState.player.resources.spellSlots, current: gameState.player.resources.spellSlots.max } 
                }
            }
        };
        
        const profMsg = newProficiency ? ` Gained proficiency in ${newProficiency}.` : "";
        const levelUpMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'system', 
            text: `[System]: Level Up! You are now Level ${newLevel}.${profMsg} Max HP increased by ${hpIncrease}. Stats & Skills updated. Proficiency Bonus is now +${newPb}.`
        };
        
        set({ gameState: newState, messages: [...messages, levelUpMsg] });
        if (user) saveGame(user.uid, newState, [...messages, levelUpMsg]);
        get().addToast("Level Up!", `Welcome to level ${newLevel}.`, "success");
    }
}));
