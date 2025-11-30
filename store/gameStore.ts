
import { create } from 'zustand';
import { GameState, ChatMessage, ImageSize, BaseStats, Feat, MessageRole } from '../types';
import { INITIAL_GAME_STATE, GAME_CONFIG } from '../constants';
import { generateAdventureResponse, generateSceneImage, summarizeHistory } from '../services/gemini';
import { extractGameState } from '../utils/parser';
import { validateGameState, repairGameState, normalizeGameState } from '../utils/validator';
import { calculateDerivedStats, calculateMaxHp, generateInitialSkills } from '../utils/engine';
import { GameDataService } from '../services/gameData';
import { saveGame, loadGame, clearSave } from '../services/storage';
import { User } from '../services/auth';

interface GameStoreState {
  // State
  user: User | null;
  gameState: GameState;
  messages: ChatMessage[];
  isCharacterCreated: boolean;
  isLoading: boolean;
  isGameLoaded: boolean;
  imageSize: ImageSize;
  imageGenEnabled: boolean;
  soundEnabled: boolean;
  textSpeed: 'normal' | 'fast' | 'instant';

  // Actions
  setUser: (user: User | null) => Promise<void>;
  processTurn: (userInput: string) => Promise<void>;
  createCharacter: (name: string, gender: string, age: number, race: string, charClass: string, stats: BaseStats, feat: Feat, subclass?: string) => Promise<void>;
  respawn: () => Promise<void>;
  levelUp: (newStats: BaseStats) => void;
  resetCampaign: () => Promise<void>;
  manualSave: () => Promise<void>;
  
  // Settings Actions
  setImageSize: (size: ImageSize) => void;
  setImageGenEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setTextSpeed: (speed: 'normal' | 'fast' | 'instant') => void;
  addMessage: (role: MessageRole, text: string, image?: string) => void;
}

// Helper to prepare history context
const prepareHistoryForContext = async (
    currentHistory: ChatMessage[],
    limit: number = GAME_CONFIG.HISTORY_LIMIT
): Promise<{ role: "user" | "model"; parts: { text: string }[] }[]> => {
    // Filter out system messages that shouldn't be part of the narrative context if necessary
    // For now, we treat them as user messages to drive the logic
    let historyForApi: { role: "user" | "model"; parts: { text: string }[] }[] = currentHistory.map(m => ({
        role: (m.role === 'system' ? 'user' : m.role) as "user" | "model",
        parts: [{ text: m.text }]
    }));

    if (historyForApi.length <= limit) return historyForApi;

    try {
        const startKeep = GAME_CONFIG.SUMMARY_START_KEEP;
        const endKeep = GAME_CONFIG.SUMMARY_END_KEEP;
        
        if (historyForApi.length > (startKeep + endKeep + GAME_CONFIG.SUMMARY_THRESHOLD)) {
            const chunkToSummarize = historyForApi.slice(startKeep, historyForApi.length - endKeep);
            const summary = await summarizeHistory(chunkToSummarize);
            const summaryMessage: { role: "user" | "model"; parts: { text: string }[] } = {
                role: 'user',
                parts: [{ text: `[Previous Story Summary]: ${summary}` }]
            };
            return [
                ...historyForApi.slice(0, startKeep),
                summaryMessage,
                ...historyForApi.slice(historyForApi.length - endKeep)
            ];
        }
    } catch (e) {
        console.warn("Summarization failed, falling back to full history", e);
    }

    return historyForApi;
};

export const useGameStore = create<GameStoreState>((set, get) => ({
  // Initial State
  user: null,
  gameState: INITIAL_GAME_STATE,
  messages: [],
  isCharacterCreated: false,
  isLoading: false,
  isGameLoaded: false,
  imageSize: ImageSize.Size_1K,
  imageGenEnabled: true,
  soundEnabled: true,
  textSpeed: 'normal',

  // Actions
  setUser: async (user) => {
    set({ user, isGameLoaded: false, isLoading: true });
    
    if (user) {
      try {
        const savedData = await loadGame(user.uid);
        if (savedData) {
          // Normalize the saved state to fix any existing corruptions from previous versions
          const normalizedState = normalizeGameState(savedData.gameState);
          
          if (validateGameState(normalizedState)) {
            set({
              gameState: normalizedState,
              messages: savedData.messages,
              isCharacterCreated: !!normalizedState.player.name,
              isGameLoaded: true,
              isLoading: false
            });
            return;
          } else {
            console.warn("Saved game state invalid, resetting...");
          }
        }
      } catch (e) {
        console.error("Error loading game:", e);
      }
      
      // No save found or invalid
      set({
        gameState: INITIAL_GAME_STATE,
        messages: [],
        isCharacterCreated: false,
        isGameLoaded: true,
        isLoading: false
      });
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

  addMessage: (role, text, image) => {
    set(state => ({
      messages: [...state.messages, { id: crypto.randomUUID(), role, text, image }]
    }));
  },

  createCharacter: async (name, gender, age, race, charClass, stats, feat, subclass) => {
    const level = 1;
    const proficiencyBonus = 2;
    const derivedStats = calculateDerivedStats(stats, charClass, level, proficiencyBonus);

    const classDefinitions = await GameDataService.getClasses();
    const classDef = classDefinitions[charClass];

    const resources = classDef?.resources || {
        spellSlots: { current: 0, max: 0 },
        classFeats: { name: "Feature", current: 0, max: 0 }
    };

    const maxHp = calculateMaxHp(charClass, stats.con, level);
    const initialProficiencies: string[] = ["Simple Weapons"];
    const initialSkills = generateInitialSkills(stats, initialProficiencies, proficiencyBonus);

    const baseFeatures = classDef?.features || [];
    const subclassFeatures = (subclass && classDef?.subclasses?.[subclass]?.features) || [];
    const allFeatures = [...baseFeatures, ...subclassFeatures];

    const newGameState: GameState = {
        ...INITIAL_GAME_STATE,
        player: {
            ...INITIAL_GAME_STATE.player,
            name,
            gender,
            age,
            race,
            class: charClass,
            subclass: subclass || '',
            level,
            hp: { current: maxHp, max: maxHp },
            stats: stats,
            derivedStats: derivedStats,
            resources,
            skills: initialSkills,
            proficiencies: initialProficiencies,
            activeFeats: [feat.name],
            activeSpells: [],
            features: allFeatures
        }
    };

    const subclassText = subclass ? ` I specialize as a ${subclass}.` : '';
    const startPrompt = `I am ${name}, a ${age}-year-old ${gender} ${race} ${charClass} (Level 1).${subclassText} My stats are STR:${stats.str} DEX:${stats.dex} CON:${stats.con} INT:${stats.int} WIS:${stats.wis} CHA:${stats.cha}. I have the feat ${feat.name}. Generate my starting inventory and drop me into the world.`;
    
    // Reset messages for new game
    set({
        gameState: newGameState,
        isCharacterCreated: true,
        messages: [{ id: crypto.randomUUID(), role: 'user', text: startPrompt }]
    });

    // Trigger initial turn
    await get().processTurn(startPrompt);
  },

  processTurn: async (userInput) => {
    const state = get();
    
    // Optimistic message update
    const lastMsg = state.messages[state.messages.length - 1];
    if (lastMsg?.text !== userInput) {
        const role = userInput.startsWith('[System]:') ? 'system' : 'user';
        set(state => ({
            messages: [...state.messages, { id: crypto.randomUUID(), role: role as MessageRole, text: userInput }]
        }));
    }

    set({ isLoading: true });

    try {
        const currentGameState = get().gameState;
        const currentHistory = get().messages;
        
        const historyForApi = await prepareHistoryForContext(currentHistory);
        const rawResponse = await generateAdventureResponse(historyForApi, userInput, currentGameState);
        
        // Extract and validate
        const { cleanedText, gameState: rawNewState } = extractGameState(rawResponse);

        let newState = rawNewState;
        if (newState) {
            // CRITICAL: Normalize data types before use. AI can sometimes return objects in string[] arrays.
            newState = normalizeGameState(newState);

            if (!validateGameState(newState)) {
                console.warn("Invalid State returned from AI. Attempting repair.");
                newState = repairGameState(newState, currentGameState);
            }
            set({ gameState: newState });
        }

        const messageId = crypto.randomUUID();
        set(state => ({
            isLoading: false,
            messages: [...state.messages, { id: messageId, role: 'model', text: cleanedText }]
        }));

        // Image Generation
        if (get().imageGenEnabled) {
            const cleanText = cleanedText
                .replace(/\(Rolled .*?\)/gi, '')
                .replace(/Rolled \d+/gi, '')
                .replace(/\[.*?\]/g, '')
                .trim();

            const visualDescription = cleanText.slice(0, 300);
            const player = get().gameState.player;
            const equipmentVisuals = get().gameState.equipment.mainHand?.name ? `wielding ${get().gameState.equipment.mainHand?.name}` : '';
            const characterVisuals = `${player.age} year old ${player.gender} ${player.race} ${player.class}, ${equipmentVisuals}`;

            generateSceneImage(visualDescription, characterVisuals, get().imageSize).then(imageUrl => {
                if (imageUrl) {
                    set(state => ({
                        messages: state.messages.map(msg => 
                            msg.id === messageId ? { ...msg, image: imageUrl } : msg
                        )
                    }));
                }
            });
        }

        // Auto Save
        const user = get().user;
        if (user) {
            saveGame(user.uid, get().gameState, get().messages);
        }

    } catch (error) {
        console.error("Turn processing failed:", error);
        set({ isLoading: false });
        get().addMessage('model', "The world flickers... something went wrong. Try again.");
    }
  },

  respawn: async () => {
    const state = get();
    const maxHp = state.gameState.player.hp.max;
    const revivedHp = Math.floor(maxHp / 2);
    
    // Reset HP in local state immediately
    const revivedState = {
        ...state.gameState,
        player: { 
            ...state.gameState.player, 
            hp: { ...state.gameState.player.hp, current: revivedHp } 
        }
    };
    
    set({ gameState: revivedState });
    
    const prompt = "[System]: The player has died. They respawn at the nearest safe location (Town or Camp) with 50% HP. Describe their awakening and the penalty.";
    await get().processTurn(prompt);
  },

  levelUp: (newStats) => {
    set(state => ({
        gameState: {
            ...state.gameState,
            player: { ...state.gameState.player, stats: newStats, unspentStatPoints: 0 }
        }
    }));
  },

  resetCampaign: async () => {
    const user = get().user;
    if (user) {
        await clearSave(user.uid);
        window.location.reload();
    }
  },

  manualSave: async () => {
    const user = get().user;
    if (user) {
        await saveGame(user.uid, get().gameState, get().messages);
    }
  },

  setImageSize: (size) => set({ imageSize: size }),
  setImageGenEnabled: (enabled) => set({ imageGenEnabled: enabled }),
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  setTextSpeed: (speed) => set({ textSpeed: speed }),

}));
