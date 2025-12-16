
import React, { useMemo } from 'react';
import { GameState } from '../types';
import { Sword, Shield, Wind, Sparkles, FlaskConical, Eye, Search, MessageSquare, CircleHelp, Gift, Tent, Moon } from 'lucide-react';

interface Suggestion {
    label: string;
    text: string;
    icon: React.ElementType;
    isSystem?: boolean;
    color?: string;
    autoSend?: boolean;
}

export const useActionSuggestions = (gameState: GameState): Suggestion[] => {
    return useMemo(() => {
        const s: Suggestion[] = [];

        // 1. COMBAT CONTEXT
        if (gameState.combat.isActive) {
            const weapon = gameState.equipment.mainHand?.name || "Unarmed Strike";
            s.push({
                label: "Attack",
                text: `Player attacks with ${weapon}!`,
                icon: Sword,
                color: "text-red-300 border-red-900/50 bg-red-950/30 hover:bg-red-900/50",
                isSystem: true,
                autoSend: false
            });

            s.push({
                label: "Dodge",
                text: "Player takes the Dodge action.",
                icon: Shield,
                color: "text-amber-300 border-amber-900/50 bg-amber-950/30 hover:bg-amber-900/50",
                isSystem: true,
                autoSend: false
            });

            s.push({
                label: "Flee",
                text: "Player attempts to flee!",
                icon: Wind,
                color: "text-stone-400 border-stone-700/50 bg-stone-900/50 hover:bg-stone-800",
                isSystem: true,
                autoSend: false
            });

            if (gameState.player.activeSpells.length > 0 && gameState.player.resources.spellSlots.current > 0) {
                const spell = gameState.player.activeSpells[0];
                s.push({ label: "Cast Spell", text: `I cast ${spell}!`, icon: Sparkles, color: "text-violet-300 border-violet-900/50 bg-violet-950/30 hover:bg-violet-900/50" });
            }

            const isInjured = gameState.player.hp.current < gameState.player.hp.max;
            const hasPotion = gameState.inventory.some(i => i.name.toLowerCase().includes('potion'));
            if (isInjured && hasPotion) {
                s.push({ label: "Drink Potion", text: "I drink a potion of healing.", icon: FlaskConical, color: "text-emerald-300 border-emerald-900/50 bg-emerald-950/30 hover:bg-emerald-900/50" });
            }
        }
        // 2. EXPLORATION CONTEXT
        else {
            s.push({ label: "Look", text: "Look around carefully.", icon: Eye, color: "text-stone-300 border-stone-700/50 bg-stone-900/50 hover:bg-stone-800" });
            s.push({ label: "Investigate", text: "I investigate the area closely for secrets or loot.", icon: Search, color: "text-blue-300 border-blue-900/50 bg-blue-950/30 hover:bg-blue-900/50" });

            s.push({ 
                label: "Talk", 
                text: "I talk to ", 
                icon: MessageSquare, 
                color: "text-teal-300 border-teal-900/50 bg-teal-950/30 hover:bg-teal-900/50", 
                autoSend: false 
            });
            
            s.push({ 
                label: "Ask", 
                text: "I ask about ", 
                icon: CircleHelp, 
                color: "text-sky-300 border-sky-900/50 bg-sky-950/30 hover:bg-sky-900/50", 
                autoSend: false 
            });

            if (gameState.inventory.length > 0) {
                s.push({ 
                    label: "Give", 
                    text: "I give ", 
                    icon: Gift, 
                    color: "text-fuchsia-300 border-fuchsia-900/50 bg-fuchsia-950/30 hover:bg-fuchsia-900/50", 
                    autoSend: false 
                });
            }

            const loc = gameState.worldState.location.toLowerCase();
            if (loc.match(/(town|village|city|tavern|camp|outpost)/)) {
                s.push({ label: "Rumors", text: "I listen for rumors and news.", icon: MessageSquare, color: "text-amber-300 border-amber-900/50 bg-amber-950/30 hover:bg-amber-900/50" });
            }

            if (gameState.player.hp.current < gameState.player.hp.max) {
                s.push({ label: "Short Rest", text: "Player takes a Short Rest.", icon: Tent, isSystem: true, color: "text-stone-400 border-stone-700/50 bg-stone-900/30 hover:bg-stone-800" });
            }
            s.push({ label: "Long Rest", text: "Player takes a Long Rest.", icon: Moon, isSystem: true, color: "text-stone-400 border-stone-700/50 bg-stone-900/30 hover:bg-stone-800" });
        }
        return s;
    }, [gameState]);
};
