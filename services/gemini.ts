
import { GameState, ImageSize } from '../types';
import { SYSTEM_PROMPT } from '../constants';

const PROXY_URL = '/api/gemini';
const GM_MODEL = 'gemini-1.5-pro-preview-0409';

interface GeminiConfig {
    temperature?: number;
    topP?: number;
    topK?: number;
    candidateCount?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
}

// Helper to call our proxy
const callProxy = async (model: string, contents: any, config?: GeminiConfig) => {
    const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model, contents, config }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Proxy Error: ${error.error}`);
    }

    return response.json();
};

export const generateAdventureResponse = async (
    history: { role: "user" | "model"; parts: { text: string }[] }[],
    userInput: string,
    currentGameState: GameState
): Promise<string> => {
    try {
        const stateContext = `
    CURRENT STATE:
    ${JSON.stringify(currentGameState)}
    
    USER ACTION:
    ${userInput}
    `;

        const contents = [
            ...history.map(h => ({ role: h.role, parts: h.parts })),
            { role: 'user', parts: [{ text: stateContext }] }
        ];

        const config = {
            systemInstruction: SYSTEM_PROMPT,
        };

        // Note: The structure for multi-turn chat might differ slightly depending on the proxy implementation.
        // This assumes the proxy can handle the history directly.
        const data = await callProxy(GM_MODEL, contents, config as any);

        return data.candidates?.[0]?.content?.parts?.[0]?.text || "The mists of time obscure the result... (Error: Empty response)";
    } catch (error) {
        console.error("Narrative Generation Error:", error);
        return `The Dungeon Master stumbled. Error: ${(error as Error).message}`;
    }
};


export const generateSceneImage = async (
    sceneDescription: string,
    characterVisuals: string,
    size: ImageSize = ImageSize.Size_1K
): Promise<string | null> => {
    try {
        const prompt = `Fantasy RPG Art, Digital Painting, Masterpiece, High Detail, Anatomically Correct, Perfect Proportions. Scene: ${sceneDescription}. Character details: ${characterVisuals}. Ensure character consistency.`;
        const modelName = 'gemini-1.0-pro-vision-001'; // A model suitable for image generation

        const contents = [{ parts: [{ text: prompt }] }];

        const data = await callProxy(modelName, contents);

        // Assuming the proxy returns the same structure
        for (const part of data.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (error) {
        console.error("Image Generation Error:", error);
        return null;
    }
};

export const summarizeHistory = async (
    history: { role: string; parts: { text: string }[] }[]
): Promise<string> => {
    try {
        const historyText = history.map(h => `${h.role}: ${h.parts[0].text}`).join('\n');
        const prompt = `
    Summarize the following RPG session history into a concise paragraph that captures the key narrative beats, important decisions, and current situation. 
    Keep it under 200 words.
    
    HISTORY:
    ${historyText}
    `;

        const contents = [{ parts: [{ text: prompt }] }];

        const data = await callProxy(GM_MODEL, contents);

        return data.candidates?.[0]?.content?.parts?.[0]?.text || "History fades into legend...";
    } catch (error) {
        console.error("Summarization Error:", error);
        return "The past is forgotten.";
    }
};
