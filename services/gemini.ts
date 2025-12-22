
import { GoogleGenAI, Modality } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';
import { GameState, ImageSize } from '../types';

// Optimized for speed and capability
const GM_TEXT_MODEL = 'gemini-3-pro-preview';
const GM_SUMMARY_MODEL = 'gemini-3-flash-preview';

interface GeminiConfig {
    temperature?: number;
    topP?: number;
    topK?: number;
    candidateCount?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
    imageConfig?: {
        aspectRatio?: string;
        imageSize?: string;
    }
}

export const generateAdventureResponse = async (
  history: { role: "user" | "model"; parts: { text: string }[] }[],
  userInput: string,
  currentGameState: GameState
): Promise<string> => {
  try {
    // Initialize right before call to ensure up-to-date API key from selection dialog
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // We prepend the current game state to the user input to ensure the model "remembers" it strictly
    const stateContext = `
    CURRENT STATE:
    ${JSON.stringify(currentGameState)}
    
    USER ACTION:
    ${userInput}
    `;

    const chat = ai.chats.create({
      model: GM_TEXT_MODEL,
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
      history: history.map(h => ({
        role: h.role,
        parts: h.parts
      }))
    });

    const response = await chat.sendMessage({
        message: stateContext
    });

    return response.text || "The mists of time obscure the result... (Error: Empty response)";
  } catch (error) {
    console.error("Narrative Generation Error:", error);
    return `The Dungeon Master stumbled. Error: ${(error as Error).message}`;
  }
};

export const generateSceneImage = async (
  sceneDescription: string,
  characterVisuals: string,
  environmentContext: string,
  size: ImageSize = ImageSize.Size_1K
): Promise<string | undefined> => {
  try {
    // Initialize right before call to ensure up-to-date API key from selection dialog
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `Fantasy RPG Art, Digital Painting, Masterpiece, High Detail, Anatomically Correct, Perfect Proportions. 
    Environment/Setting: ${environmentContext}.
    Action/Scene: ${sceneDescription}. 
    Character details: ${characterVisuals}. 
    STRICT DIRECTIVE: The background and atmosphere MUST match the '${environmentContext}'. Ensure the character is consistent with the details provided.`;
    
    // Select model based on size/quality needs. 
    const modelName = (size === ImageSize.Size_1K) ? 'gemini-2.5-flash-image' : 'gemini-3-pro-image-preview';

    // Build configuration
    const config: GeminiConfig = {
        imageConfig: {
            aspectRatio: "16:9" // Cinematic for RPG
        }
    };
    
    // Add imageSize only for the pro model
    if (modelName === 'gemini-3-pro-image-preview') {
        if (config.imageConfig) {
            config.imageConfig.imageSize = size;
        }
    }

    // Config for image generation
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [{ text: prompt }]
      },
      config: config as any // Cast needed for imageConfig support in SDK
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return undefined;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return undefined;
  }
};

export const summarizeHistory = async (
  history: { role: string; parts: { text: string }[] }[]
): Promise<string> => {
  try {
    // Initialize right before call to ensure up-to-date API key from selection dialog
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const historyText = history.map(h => `${h.role}: ${h.parts[0].text}`).join('\n');
    const prompt = `
    Summarize the following RPG session history into a concise paragraph that captures the key narrative beats, important decisions, and current situation. 
    Keep it under 200 words.
    
    HISTORY:
    ${historyText}
    `;

    const response = await ai.models.generateContent({
      model: GM_SUMMARY_MODEL,
      contents: prompt,
    });

    return response.text || "History fades into legend...";
  } catch (error) {
    console.error("Summarization Error:", error);
    return "The past is forgotten.";
  }
};

export const generateNarration = async (text: string): Promise<string | undefined> => {
    try {
        // Initialize right before call to ensure up-to-date API key from selection dialog
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: { parts: [{ text: text }] },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || undefined;
    } catch (error) {
        console.error("TTS Generation Error:", error);
        return undefined;
    }
};
