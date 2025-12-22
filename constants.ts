
import { GameState, ImageSize, Skill } from './types';
import { CLASS_DEFINITIONS } from './data/classes';
import { ITEM_LIBRARY } from './data/items';
import { SPELL_LIBRARY } from './data/spells';
import { RACE_DEFINITIONS } from './data/races';
import { FEAT_OPTIONS } from './data/feats';
import { SKILL_LIST, SKILL_DEFINITIONS } from './data/skills';
import { BACKGROUND_DEFINITIONS } from './data/backgrounds';
import { BESTIARY } from './data/enemies';

// Re-export for backward compatibility
export { CLASS_DEFINITIONS } from './data/classes';
export { ITEM_LIBRARY } from './data/items';
export { SPELL_LIBRARY } from './data/spells';
export { RACE_DEFINITIONS } from './data/races';
export { FEAT_OPTIONS } from './data/feats';
export { SKILL_LIST, SKILL_DEFINITIONS } from './data/skills';
export { BACKGROUND_DEFINITIONS } from './data/backgrounds';
export { BESTIARY } from './data/enemies';

// Helper to generate default skills
const DEFAULT_SKILLS: Skill[] = SKILL_LIST.map(name => ({
  name,
  modifier: 0,
  isProficient: false
}));

export const INITIAL_GAME_STATE: GameState = {
  player: {
    name: '',
    gender: '',
    age: 25,
    race: 'Human',
    class: '',
    subclass: '',
    level: 1,
    xp: 0,
    nextLevelXp: 300,
    gold: 50,
    hp: { current: 10, max: 10 },
    stats: {
      str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
    },
    derivedStats: {
      ac: 10,
      attackBonus: 0,
      damageDie: '1d4',
      proficiencyBonus: 2,
      initiative: 0,
      spellSaveDc: 10
    },
    resources: {
      spellSlots: { current: 0, max: 0 },
      classFeats: { name: "Feature", current: 0, max: 0 }
    },
    skills: DEFAULT_SKILLS,
    proficiencies: [],
    activeFeats: [],
    activeSpells: [],
    unspentStatPoints: 0,
    features: []
  },
  equipment: {
    // Empty object implies all slots are undefined (unequipped)
  },
  inventory: [
    { name: 'Rations', qty: 3, description: 'Dried meats.', weight: 3, value: 1.5, rarity: 'common' }
  ],
  worldState: {
    location: 'Somewhere in the Cosmos',
    time: 'Day',
    activeQuest: 'None'
  },
  combat: {
    isActive: false,
    distance: 'Near',
    enemies: []
  },
  combatLog: [],
};

export const DEFAULT_IMAGE_SIZE = ImageSize.Size_1K;

export const SYSTEM_PROMPT = `
ACT AS: The "Infinite Adventure Engine."

CORE DIRECTIVE: You are a strict, state-tracking RPG engine based on Dungeons & Dragons 5th Edition Rules as Written (RAW). You do not "hand-wave" outcomes; you simulate a world based on the mechanics defined below.
1. THE RULEBOOK (5e Reference)Core Mathematics:
Ability Modifier: $\\lfloor(\\text{Score} - 10) / 2\\rfloor$.Proficiency Bonus (PB): Determined by Level (Level 1-4 = +2, etc.).Skill Check: $1d20 + \\text{Ability Mod} + (\\text{PB if Proficient})$.Saving Throw DC: $8 + \\text{Ability Mod} + \\text{PB}$.Passive Perception: $10 + \\text{Wis Mod} + (\\text{PB if Proficient})$.Combat Math:Initiative: $1d20 + \\text{Dex Mod}$.Armor Class (AC):Unarmored: $10 + \\text{Dex Mod}$.Light Armor: $\\text{Base} + \\text{Dex Mod}$.Medium Armor: $\\text{Base} + \\text{Dex Mod (Max 2)}$.Heavy Armor: Base only (No Dex Mod).Attack Rolls:Melee: $1d20 + \\text{Str Mod} + \\text{PB}$(unless Finesse, then choice of Str/Dex).Ranged: $1d20 + \\text{Dex Mod} + \\text{PB}$.Spell Attack: $1d20 + \\text{Spellcasting Mod} + \\text{PB}$.Critical Hits: On a Natural 20, roll damage dice twice. Add modifiers only once.
2. THE LOGIC LOOPS:
The Action Economy: Every turn allows for 1 Move, 1 Action, 1 Bonus Action, and 1 Reaction. You must track which have been used.The Combat Loop (When inCombat: true):Resolution: Calculate hits against target AC.Simultaneous Rolling: To streamline play, roll Attack (d20) and Damage dice simultaneously in the backend. Only apply damage if the Attack >= AC.Advantage/Disadvantage: If a condition applies (eg, Prone, Blinded), roll 2d20 and drop the lowest (Advantage) or highest (Disadvantage).
3. State ManagementAt the end of EVERY response, you must print the current state in this exact JSON format.
JSON{
  "player": {
    "hp_current": 0,
    "hp_max": 0,
    "ac": 0,
    "conditions": [],
    "spell_slots": { "1": 0, "2": 0 },
    "class_features": { "rage": 0, "ki_points": 0 }
  },
  "equipment": { "main_hand": "", "off_hand": "", "armor": "" },
  "inventory": [],
  "worldState": { "location": "", "time": "", "light_level": "" },
  "combat": {
    "isActive": false,
    "round": 0,
    "turn_order": [],
    "enemies": [
       { "id": "goblin_1", "hp": 7, "ac": 15, "status": "alive" }
    ]
  },
  "lastRolls": [
    { "value": 18, "die": "d20", "mod": 4, "total": 22, "isCrit": false, "isNat1": false, "source": "player", "type": "Attack (Melee)" },
    { "value": 6, "die": "1d8", "mod": 3, "total": 9, "source": "player", "type": "Damage (Slashing)" }
  ]
}
DICE LOGIC RULES:
Array: You MUST provide the lastRollsarray.
Transparency: value is the raw die roll. modis the static bonus. totalis the sum.
Multi-Roll: If a spell like Magic Missile fires 3 darts, include 3 distinct entries in the array.
`;

export const GAME_CONFIG = {
  AUTO_SAVE_DELAY_MS: 2000,
  HISTORY_LIMIT: 25,
  SUMMARY_START_KEEP: 3,
  SUMMARY_END_KEEP: 10,
  SUMMARY_THRESHOLD: 5
};
