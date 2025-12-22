
import { GameState } from '../types';

const cleanJson = (jsonString: string): string => {
    // 1. Remove Single Line Comments (// ...)
    let clean = jsonString.replace(/\/\/.*$/gm, '');
    
    // 2. Remove Trailing Commas in Objects
    // This regex looks for a comma followed by whitespace and a closing brace
    clean = clean.replace(/,(\s*})/g, '$1');
    
    // 3. Remove Trailing Commas in Arrays
    // This regex looks for a comma followed by whitespace and a closing bracket
    clean = clean.replace(/,(\s*])/g, '$1');

    return clean;
};

export const extractGameState = (text: string): { cleanedText: string; gameState: GameState | undefined } => {
  // Regex to find the JSON block inside ```json ... ``` or just ``` ... ```
  // We use the 'g' flag to find ALL matches to prevent "Prompt Injection" attacks
  const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/g;
  
  const matches = [...text.matchAll(jsonBlockRegex)];

  if (matches.length > 0) {
    // SECURITY FIX: Always take the LAST match. 
    const lastMatch = matches[matches.length - 1];
    
    if (lastMatch && lastMatch[1]) {
        try {
            const rawJson = lastMatch[1];
            const cleanedJson = cleanJson(rawJson);
            const parsedState = JSON.parse(cleanedJson);
            
            // Remove the block from the text for display purposes
            const cleanedText = text.replace(lastMatch[0], '').trim();
            
            return { cleanedText, gameState: parsedState };
        } catch (e) {
            console.warn("Failed to parse Game State JSON. Attempting fallback repair.", e);
        }
    }
  }

  // Fallback: If no valid JSON block found, return original text and undefined state
  return { cleanedText: text, gameState: undefined };
};
