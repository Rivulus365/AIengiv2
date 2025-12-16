
import { BaseStats, DerivedStats, ClassDefinition, Skill } from '../types';
import { CLASS_DEFINITIONS, SKILL_LIST } from '../constants';

// --- Point Buy Logic ---
export const POINT_BUY_COSTS: Record<number, number> = {
    8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
};

export const calculateStatCost = (score: number): number => {
    return POINT_BUY_COSTS[score] ?? 0;
};

// --- Core Math ---

export const getModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

export const calculateMaxHp = (charClass: string, conScore: number, level: number): number => {
  const classDef = CLASS_DEFINITIONS[charClass];
  const hitDie = classDef ? classDef.hitDie : 8;
  const conMod = getModifier(conScore);
  
  if (level === 1) {
      return Math.max(1, hitDie + conMod);
  }
  
  const hpPerLevel = Math.floor(hitDie / 2) + 1 + conMod;
  return Math.max(1, (hitDie + conMod) + (hpPerLevel * (level - 1)));
};

export const calculateDerivedStats = (
    stats: BaseStats, 
    charClass: string, 
    level: number, 
    proficiencyBonus: number = 2
): DerivedStats => {
    const strMod = getModifier(stats.str);
    const dexMod = getModifier(stats.dex);
    const intMod = getModifier(stats.int);
    const wisMod = getModifier(stats.wis);
    const chaMod = getModifier(stats.cha);

    const ac = 10 + dexMod; // Base Unarmored AC
    const initiative = dexMod;
    
    let spellMod = 0;
    if (['Mage', 'Wizard'].includes(charClass)) spellMod = intMod;
    else if (['Cleric', 'Druid', 'Ranger'].includes(charClass)) spellMod = wisMod;
    else if (['Bard', 'Paladin', 'Sorcerer', 'Warlock'].includes(charClass)) spellMod = chaMod;
    
    const spellSaveDc = 8 + proficiencyBonus + spellMod;

    return {
        ac,
        attackBonus: strMod + proficiencyBonus,
        damageDie: '1d8',
        proficiencyBonus,
        initiative,
        spellSaveDc
    };
};

export const generateInitialSkills = (stats: BaseStats, proficiencies: string[], proficiencyBonus: number): Skill[] => {
    const strMod = getModifier(stats.str);
    const dexMod = getModifier(stats.dex);
    const intMod = getModifier(stats.int);
    const wisMod = getModifier(stats.wis);
    const chaMod = getModifier(stats.cha);

    return SKILL_LIST.map(skillName => {
        let statMod = 0;
        if (['Athletics'].includes(skillName)) statMod = strMod;
        else if (['Arcana', 'History', 'Investigation', 'Nature', 'Religion'].includes(skillName)) statMod = intMod;
        else if (['Animal Handling', 'Insight', 'Medicine', 'Perception', 'Survival'].includes(skillName)) statMod = wisMod;
        else if (['Deception', 'Intimidation', 'Performance', 'Persuasion'].includes(skillName)) statMod = chaMod;
        else statMod = dexMod;

        const isProficient = proficiencies.includes(skillName);
        return {
            name: skillName,
            modifier: statMod + (isProficient ? proficiencyBonus : 0),
            isProficient
        };
    });
};
