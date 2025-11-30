import { BaseStats, DerivedStats, ClassDefinition, Skill } from '../types';
import { CLASS_DEFINITIONS, SKILL_LIST } from '../constants';

// --- Core Math ---

export const getModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

export const calculateMaxHp = (charClass: string, conScore: number, level: number): number => {
  const classDef = CLASS_DEFINITIONS[charClass];
  const hitDie = classDef ? classDef.hitDie : 8;
  const conMod = getModifier(conScore);
  
  // For Level 1, D&D 5e rule is max hit die + con mod
  // For subsequent levels, it's usually avg (die/2 + 1) + con mod
  // For this engine, we will simplify to linear growth based on initial implementation
  // but centralization allows us to change this logic easily later.
  if (level === 1) {
      return Math.max(1, hitDie + conMod);
  }
  
  // Example linear scaling for the engine's current logic
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
    
    // Spell Save DC calculation
    let spellMod = 0;
    if (['Mage', 'Wizard'].includes(charClass)) spellMod = intMod;
    else if (['Cleric', 'Druid', 'Ranger'].includes(charClass)) spellMod = wisMod;
    else if (['Bard', 'Paladin', 'Sorcerer', 'Warlock'].includes(charClass)) spellMod = chaMod;
    
    const spellSaveDc = 8 + proficiencyBonus + spellMod;

    return {
        ac,
        attackBonus: strMod + proficiencyBonus, // Default assuming melee str
        damageDie: '1d8', // Placeholder, overwritten by equipment usually
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
        else statMod = dexMod; // Acrobatics, Sleight of Hand, Stealth

        const isProficient = proficiencies.includes(skillName);
        return {
            name: skillName,
            modifier: statMod + (isProficient ? proficiencyBonus : 0),
            isProficient
        };
    });
};