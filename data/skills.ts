import { BaseStats } from '../types';

export interface SkillDefinition {
    name: string;
    ability: keyof BaseStats;
    description: string;
}

export const SKILL_DEFINITIONS: Record<string, SkillDefinition> = {
    "Acrobatics": {
        name: "Acrobatics",
        ability: "dex",
        description: "Covers your attempt to stay on your feet in a tricky situation, such as when you're trying to run across a sheet of ice, balance on a tightrope, or stay upright on a rocking ship."
    },
    "Animal Handling": {
        name: "Animal Handling",
        ability: "wis",
        description: "Measures your ability to calm down a domesticated animal, keep a mount from getting spooked, or intuit an animal's intentions."
    },
    "Arcana": {
        name: "Arcana",
        ability: "int",
        description: "Measures your ability to recall lore about spells, magic items, eldritch symbols, magical traditions, the planes of existence, and the inhabitants of those planes."
    },
    "Athletics": {
        name: "Athletics",
        ability: "str",
        description: "Covers difficult situations you encounter while climbing, jumping, or swimming."
    },
    "Deception": {
        name: "Deception",
        ability: "cha",
        description: "Determines whether you can convincingly hide the truth, either verbally or through your actions."
    },
    "History": {
        name: "History",
        ability: "int",
        description: "Measures your ability to recall lore about historical events, legendary people, ancient kingdoms, past disputes, recent wars, and lost civilizations."
    },
    "Insight": {
        name: "Insight",
        ability: "wis",
        description: "Decides whether you can determine the true intentions of a creature, such as when searching out a lie or predicting someone's next move."
    },
    "Intimidation": {
        name: "Intimidation",
        ability: "cha",
        description: "When you attempt to influence someone through overt threats, hostile actions, and physical violence."
    },
    "Investigation": {
        name: "Investigation",
        ability: "int",
        description: "When you look around for clues and make deductions based on those clues."
    },
    "Medicine": {
        name: "Medicine",
        ability: "wis",
        description: "Lets you try to stabilize a dying companion or diagnose an illness."
    },
    "Nature": {
        name: "Nature",
        ability: "int",
        description: "Measures your ability to recall lore about terrain, plants and animals, the weather, and natural cycles."
    },
    "Perception": {
        name: "Perception",
        ability: "wis",
        description: "Lets you spot, hear, or otherwise detect the presence of something. It measures your general awareness of your surroundings and the keenness of your senses."
    },
    "Performance": {
        name: "Performance",
        ability: "cha",
        description: "Determines how well you can delight an audience with music, dance, acting, storytelling, or some other form of entertainment."
    },
    "Persuasion": {
        name: "Persuasion",
        ability: "cha",
        description: "When you attempt to influence someone or a group of people with tact, social graces, or good nature."
    },
    "Religion": {
        name: "Religion",
        ability: "int",
        description: "Measures your ability to recall lore about deities, rites and prayers, religious hierarchies, holy symbols, and the practices of secret cults."
    },
    "Sleight of Hand": {
        name: "Sleight of Hand",
        ability: "dex",
        description: "Whenever you attempt an act of legerdemain or manual trickery, such as planting something on someone else or concealing an object on your person."
    },
    "Stealth": {
        name: "Stealth",
        ability: "dex",
        description: "Make a Dexterity (Stealth) check when you attempt to conceal yourself from enemies, slink past guards, slip away without being noticed, or sneak up on someone without being seen or heard."
    },
    "Survival": {
        name: "Survival",
        ability: "wis",
        description: "Follow tracks, hunt wild game, guide your group through frozen wastelands, identify signs that owlbears live nearby, predict the weather, or avoid quicksand and other natural hazards."
    }
};

export const SKILL_LIST = Object.keys(SKILL_DEFINITIONS);
