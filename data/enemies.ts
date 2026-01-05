
import { Enemy } from '../types';

export const BESTIARY: Record<string, Enemy> = {
    // CR 0
    "Rat": { name: "Rat", hp: 1, ac: 10, cr: 0, xp: 10, traits: ["Keen Smell"], attacks: [{ name: "Bite", bonus: 0, dmg: "1" }], ai: "Cowardly" },
    "Spider": { name: "Spider", hp: 1, ac: 12, cr: 0, xp: 10, traits: ["Spider Climb"], attacks: [{ name: "Bite", bonus: 4, dmg: "1" }], ai: "Mindless" },

    // CR 1/8
    "Bandit": { name: "Bandit", hp: 11, ac: 12, cr: 0.125, xp: 25, description: "A ruthless thug.", attacks: [{ name: "Scimitar", bonus: 3, dmg: "1d6+1" }], ai: "Tactical" },
    "Kobold": { name: "Kobold", hp: 5, ac: 12, cr: 0.125, xp: 25, traits: ["Pack Tactics"], attacks: [{ name: "Dagger", bonus: 4, dmg: "1d4+2" }], ai: "Cowardly" },
    "Giant Rat": { name: "Giant Rat", hp: 7, ac: 12, cr: 0.125, xp: 25, traits: ["Pack Tactics"], attacks: [{ name: "Bite", bonus: 4, dmg: "1d4+2" }], ai: "Aggressive" },

    // CR 1/4
    "Goblin": { name: "Goblin", hp: 7, ac: 15, cr: 0.25, xp: 50, traits: ["Nimble Escape"], attacks: [{ name: "Scimitar", bonus: 4, dmg: "1d6+2" }, { name: "Shortbow", bonus: 4, dmg: "1d6+2" }], ai: "Cowardly" },
    "Skeleton": { name: "Skeleton", hp: 13, ac: 13, cr: 0.25, xp: 50, traits: ["Undead"], attacks: [{ name: "Shortsword", bonus: 4, dmg: "1d6+2" }], ai: "Mindless" },
    "Zombie": { name: "Zombie", hp: 22, ac: 8, cr: 0.25, xp: 50, traits: ["Undead Fortitude"], attacks: [{ name: "Slam", bonus: 3, dmg: "1d6+1" }], ai: "Mindless" },

    // CR 1/2
    "Orc": { name: "Orc", hp: 15, ac: 13, cr: 0.5, xp: 100, traits: ["Aggressive"], attacks: [{ name: "Greataxe", bonus: 5, dmg: "1d12+3" }], ai: "Aggressive" },
    "Hobgoblin": { name: "Hobgoblin", hp: 11, ac: 18, cr: 0.5, xp: 100, traits: ["Martial Advantage"], attacks: [{ name: "Longsword", bonus: 3, dmg: "1d8+1" }], ai: "Tactical" },
    "Worg": { name: "Worg", hp: 26, ac: 13, cr: 0.5, xp: 100, traits: ["Keen Hearing and Smell"], attacks: [{ name: "Bite", bonus: 5, dmg: "2d6+3" }], ai: "Aggressive" },

    // CR 1
    "Bugbear": { name: "Bugbear", hp: 27, ac: 16, cr: 1, xp: 200, traits: ["Brute", "Surprise Attack"], attacks: [{ name: "Morningstar", bonus: 4, dmg: "2d8+2" }], ai: "Tactical" },
    "Dire Wolf": { name: "Dire Wolf", hp: 37, ac: 14, cr: 1, xp: 200, traits: ["Pack Tactics"], attacks: [{ name: "Bite", bonus: 5, dmg: "2d6+3" }], ai: "Aggressive" },
    "Ghoul": { name: "Ghoul", hp: 22, ac: 12, cr: 1, xp: 200, traits: ["Undead"], attacks: [{ name: "Claws", bonus: 4, dmg: "2d4+2" }], ai: "Mindless" },

    // CR 2
    "Ogre": { name: "Ogre", hp: 59, ac: 11, cr: 2, xp: 450, description: "A large, dim-witted giant.", attacks: [{ name: "Greatclub", bonus: 6, dmg: "2d8+4" }], ai: "Aggressive" },
    "Gelatinous Cube": { name: "Gelatinous Cube", hp: 84, ac: 6, cr: 2, xp: 450, traits: ["Engulf", "Transparent"], attacks: [{ name: "Pseudopod", bonus: 4, dmg: "3d6" }], ai: "Mindless" },

    // CR 3
    "Owlbear": { name: "Owlbear", hp: 59, ac: 13, cr: 3, xp: 700, description: "A monstrous cross between giant owl and bear.", attacks: [{ name: "Beak", bonus: 7, dmg: "1d10+5" }, { name: "Claws", bonus: 7, dmg: "2d8+5" }], ai: "Aggressive" },
    "Winter Wolf": { name: "Winter Wolf", hp: 75, ac: 13, cr: 3, xp: 700, traits: ["Cold Breath"], attacks: [{ name: "Bite", bonus: 6, dmg: "2d6+4" }], ai: "Tactical" },

    // CR 5
    "Troll": { name: "Troll", hp: 84, ac: 15, cr: 5, xp: 1800, traits: ["Regeneration"], attacks: [{ name: "Bite", bonus: 7, dmg: "1d6+4" }, { name: "Claw", bonus: 7, dmg: "2d6+4" }], ai: "Aggressive" },
    "Hill Giant": { name: "Hill Giant", hp: 105, ac: 13, cr: 5, xp: 1800, description: "A selfish, gluttonous giant.", attacks: [{ name: "Greatclub", bonus: 8, dmg: "3d8+5" }], ai: "Aggressive" }
};
