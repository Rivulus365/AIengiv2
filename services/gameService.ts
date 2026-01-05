
import { GameState, ChatMessage, CharacterCreationData, ImageSize, RollData, DieType, Item } from '../types';
import { generateAdventureResponse, generateSceneImage, generateNarration, repairMalformedJson, summarizeHistory } from './gemini';
import { extractGameState } from '../utils/parser';
import { repairGameState, validateGameState } from '../utils/validator';
import { calculateMaxHp, calculateDerivedStats, generateInitialSkills } from '../utils/engine';
import { INITIAL_GAME_STATE } from '../constants';
import { GameDataService } from './gameData';
import { saveGame } from './storage';
import { audioService } from './audio';

export const GameService = {
    async handleProcessTurn(
        input: string,
        currentState: GameState,
        messages: ChatMessage[],
        config: { imageGenEnabled: boolean, imageSize: ImageSize, narratorEnabled: boolean }
    ): Promise<{ nextState: GameState, nextMessages: ChatMessage[] }> {
        let workingGameState = { ...currentState };
        let currentMessages = [...messages];

        // Context Management: Summarization
        const HISTORY_LIMIT = 20;
        if (currentMessages.length > HISTORY_LIMIT) {
            const toSummarize = currentMessages.slice(0, -5).map(m => ({ role: m.role, parts: [{ text: m.text }] }));
            const newSummary = await summarizeHistory(toSummarize as any, workingGameState.summary);
            workingGameState.summary = newSummary;
            currentMessages = currentMessages.slice(-5);
        }

        const history = currentMessages.map(m => ({ role: m.role as any, parts: [{ text: m.text }] }));
        const rawResponse = await generateAdventureResponse(history, input, workingGameState);
        const { cleanedText, gameState: parsedState } = extractGameState(rawResponse);

        let finalState = workingGameState;
        if (parsedState) {
            const validation = validateGameState(parsedState);
            if (validation.success) {
                finalState = repairGameState(parsedState, workingGameState);
            } else {
                const repaired = await repairMalformedJson(JSON.stringify(parsedState), validation.error.toString());
                finalState = repairGameState(repaired || parsedState, workingGameState);
            }
        }

        const modelMsgId = crypto.randomUUID();
        const nextMessages: ChatMessage[] = [
            ...currentMessages,
            { 
                id: modelMsgId, 
                role: 'model', 
                text: cleanedText, 
                gameStateSnapshot: finalState, 
                isImageLoading: config.imageGenEnabled 
            }
        ];

        // Side effects (Audio/Visual) are handled by the store calling this service or async in background
        if (config.narratorEnabled && cleanedText) {
            generateNarration(cleanedText).then(audio => audio && audioService.playPCM(audio));
        }

        return { nextState: finalState, nextMessages };
    },

    async generateCharacter(data: CharacterCreationData): Promise<GameState> {
        const { charClass, stats, feat, subclass, background } = data;
        const level = 1;
        const classDef = (await GameDataService.getClasses())[charClass];
        const bgDef = (await GameDataService.getBackgrounds())[background];
        const maxHp = calculateMaxHp(charClass, stats.con, level);
        const proficiencies = ["Simple Weapons", ...(bgDef?.skillProficiencies || [])];
        const derivedStats = calculateDerivedStats(stats, charClass, level, proficiencies);
        const initialSkills = generateInitialSkills(stats, proficiencies, derivedStats.proficiencyBonus);

        return {
            ...INITIAL_GAME_STATE,
            player: {
                ...INITIAL_GAME_STATE.player,
                name: data.name, gender: data.gender, age: data.age,
                race: data.race, class: charClass, subclass: subclass || '', background,
                level, hp: { current: maxHp, max: maxHp }, stats,
                derivedStats, resources: classDef.resources, skills: initialSkills,
                proficiencies, activeFeats: [feat.name], 
                features: [...classDef.features, (bgDef?.feature?.name || '')].filter(Boolean)
            }
        };
    }
};
