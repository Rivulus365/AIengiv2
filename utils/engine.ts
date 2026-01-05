
import { BaseStats, DerivedStats, Equipment } from '../types';
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

export const calculateCarryCapacity = (strScore: number): number => {
    return strScore * 15;
};

export const calculateDerivedStats = (
    stats: BaseStats, 
    charClass: string, 
    level: number,
    proficiencies: string[],
    equipment?: Equipment
): DerivedStats => {
    const strMod = getModifier(stats.str);
    const dexMod = getModifier(stats.dex);
    const intMod = getModifier(stats.int);
    const wisMod = getModifier(stats.wis);
    const chaMod = getModifier(stats.cha);
    
    // Proficiency Bonus: +2 at lvl 1, +3 at lvl 5, +4 at lvl 9...
    const proficiencyBonus = Math.ceil(level / 4) + 1;

    // AC Calculation
    let ac = 10 + dexMod; 
    
    if (equipment?.body) {
        const armor = equipment.body;
        const baseAc = armor.ac || 10;
        // Armor Types
        if (armor.type === 'light') {
            ac = baseAc + dexMod;
        } else if (armor.type === 'medium') {
            ac = baseAc + Math.min(dexMod, 2);
        } else if (armor.type === 'heavy') {
            ac = baseAc;
        }
    } else {
        // Unarmored Defense Check
        if (charClass === 'Barbarian') {
             // 10 + Dex + Con
             ac = Math.max(ac, 10 + dexMod + getModifier(stats.con));
        } else if (charClass === 'Monk' && !equipment?.offHand) { 
             // 10 + Dex + Wis (Assuming no shield for Monk)
             ac = Math.max(ac, 10 + dexMod + wisMod);
        }
    }

    // Shield Bonus
    if (equipment?.offHand?.type === 'shield') {
        ac += (equipment.offHand.ac || 2);
    }
    
    // Accessory Bonus
    if (equipment?.accessory?.ac) {
        ac += equipment.accessory.ac;
    }

    const initiative = dexMod;
    
    let spellMod = 0;
    if (['Mage', 'Wizard'].includes(charClass)) spellMod = intMod;
    else if (['Cleric', 'Druid', 'Ranger'].includes(charClass)) spellMod = wisMod;
    else if (['Bard', 'Paladin', 'Sorcerer', 'Warlock'].includes(charClass)) spellMod = chaMod;
    
    const spellSaveDc = 8 + proficiencyBonus + spellMod;

    // Passive Perception
    const hasPerceptionProf = proficiencies.includes("Perception");
    const passivePerception = 10 + wisMod + (hasPerceptionProf ? proficiencyBonus : 0);

    return {
        ac,
        attackBonus: strMod + proficiencyBonus,
        damageDie: '1d8',
        proficiencyBonus,
        initiative,
        spellSaveDc,
        passivePerception
    };
};

export const generateInitialSkills = (stats: BaseStats, proficiencies: string[], proficiencyBonus: number): any[] => {
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
