
import { Item, ClassDefinition, Spell, RaceDefinition, Feat, BackgroundDefinition, Enemy, SkillDefinition } from '../types';
import { ITEM_LIBRARY } from '../data/items';
import { CLASS_DEFINITIONS } from '../data/classes';
import { SPELL_LIBRARY } from '../data/spells';
import { RACE_DEFINITIONS } from '../data/races';
import { FEAT_LIBRARY, FEAT_OPTIONS } from '../data/feats';
import { BACKGROUND_DEFINITIONS } from '../data/backgrounds';
import { BESTIARY } from '../data/enemies';
import { SKILL_DEFINITIONS } from '../data/skills';

export const GameDataService = {
    getItems: async (): Promise<Record<string, Item>> => ITEM_LIBRARY,
    getClasses: async (): Promise<Record<string, ClassDefinition>> => CLASS_DEFINITIONS,
    getSpells: async (): Promise<Record<string, Spell>> => SPELL_LIBRARY,
    getRaces: async (): Promise<Record<string, RaceDefinition>> => RACE_DEFINITIONS,
    getFeats: async (): Promise<Record<string, Feat>> => FEAT_LIBRARY,
    getBackgrounds: async (): Promise<Record<string, BackgroundDefinition>> => BACKGROUND_DEFINITIONS,
    getEnemies: async (): Promise<Record<string, Enemy>> => BESTIARY,
    getSkills: async (): Promise<Record<string, SkillDefinition>> => SKILL_DEFINITIONS,

    // Helper to get array versions for UI lists
    getClassOptions: async () => Object.values(CLASS_DEFINITIONS),
    getFeatOptions: async () => FEAT_OPTIONS,
    getRaceOptions: async () => Object.values(RACE_DEFINITIONS),
};
