import { RaceDefinition } from '../types';

export const RACE_DEFINITIONS: Record<string, RaceDefinition> = {
    Human: {
        name: "Human",
        description: "Versatile and ambitious.",
        statBonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
        traits: ["Versatile"],
        speed: 30
    },
    Elf: {
        name: "Elf",
        description: "Graceful and long-lived.",
        statBonuses: { dex: 2 },
        traits: ["Darkvision", "Keen Senses"],
        speed: 30
    },
    Dwarf: {
        name: "Dwarf",
        description: "Bold and hardy.",
        statBonuses: { con: 2 },
        traits: ["Darkvision", "Dwarven Resilience"],
        speed: 25
    },
    Halfling: {
        name: "Halfling",
        description: "Small and practical.",
        statBonuses: { dex: 2 },
        traits: ["Lucky", "Brave"],
        speed: 25
    },
    Dragonborn: {
        name: "Dragonborn",
        description: "Proud draconic kin.",
        statBonuses: { str: 2, cha: 1 },
        traits: ["Draconic Ancestry", "Breath Weapon"],
        speed: 30
    },
    Gnome: {
        name: "Gnome",
        description: "Inventive and energetic.",
        statBonuses: { int: 2 },
        traits: ["Darkvision", "Gnome Cunning"],
        speed: 25
    },
    "Half-Elf": {
        name: "Half-Elf",
        description: "Diplomatic and versatile.",
        statBonuses: { cha: 2, dex: 1, con: 1 },
        traits: ["Darkvision", "Fey Ancestry"],
        speed: 30
    },
    "Half-Orc": {
        name: "Half-Orc",
        description: "Fierce and enduring.",
        statBonuses: { str: 2, con: 1 },
        traits: ["Darkvision", "Relentless Endurance"],
        speed: 30
    },
    Tiefling: {
        name: "Tiefling",
        description: "Infernal heritage.",
        statBonuses: { cha: 2, int: 1 },
        traits: ["Darkvision", "Hellish Resistance"],
        speed: 30
    },
    Aarakocra: {
        name: "Aarakocra",
        description: "Bird-like humanoids from the Elemental Plane of Air.",
        statBonuses: { dex: 2, wis: 1 },
        traits: ["Flight", "Talons"],
        speed: 25
    },
    Aasimar: {
        name: "Aasimar",
        description: "Celestial-touched beings with divine heritage.",
        statBonuses: { cha: 2, wis: 1 },
        traits: ["Darkvision", "Healing Hands", "Light Bearer"],
        speed: 30
    },
    Firbolg: {
        name: "Firbolg",
        description: "Gentle forest giants with druidic magic.",
        statBonuses: { wis: 2, str: 1 },
        traits: ["Firbolg Magic", "Hidden Step", "Speech of Beast and Leaf"],
        speed: 30
    },
    "Genasi (Fire)": {
        name: "Genasi (Fire)",
        description: "Touched by elemental fire.",
        statBonuses: { con: 2, int: 1 },
        traits: ["Darkvision", "Fire Resistance", "Reach to the Blaze"],
        speed: 30
    },
    "Genasi (Water)": {
        name: "Genasi (Water)",
        description: "Touched by elemental water.",
        statBonuses: { con: 2, wis: 1 },
        traits: ["Acid Resistance", "Amphibious", "Swim Speed", "Call to the Wave"],
        speed: 30
    },
    "Genasi (Air)": {
        name: "Genasi (Air)",
        description: "Touched by elemental air.",
        statBonuses: { con: 2, dex: 1 },
        traits: ["Unending Breath", "Mingle with the Wind"],
        speed: 30
    },
    "Genasi (Earth)": {
        name: "Genasi (Earth)",
        description: "Touched by elemental earth.",
        statBonuses: { con: 2, str: 1 },
        traits: ["Earth Walk", "Merge with Stone"],
        speed: 30
    },
    Goliath: {
        name: "Goliath",
        description: "Towering mountain dwellers built for endurance.",
        statBonuses: { str: 2, con: 1 },
        traits: ["Natural Athlete", "Stone's Endurance", "Mountain Born"],
        speed: 30
    },
    Kenku: {
        name: "Kenku",
        description: "Flightless bird-folk cursed to mimic sounds.",
        statBonuses: { dex: 2, wis: 1 },
        traits: ["Expert Forgery", "Mimicry"],
        speed: 30
    },
    Lizardfolk: {
        name: "Lizardfolk",
        description: "Reptilian survivors from swamps and marshes.",
        statBonuses: { con: 2, wis: 1 },
        traits: ["Bite", "Cunning Artisan", "Hold Breath", "Natural Armor"],
        speed: 30
    },
    Tabaxi: {
        name: "Tabaxi",
        description: "Feline wanderers driven by curiosity.",
        statBonuses: { dex: 2, cha: 1 },
        traits: ["Feline Agility", "Cat's Claws", "Cat's Talent", "Darkvision"],
        speed: 30
    },
    Triton: {
        name: "Triton",
        description: "Noble guardians of the ocean depths.",
        statBonuses: { str: 1, con: 1, cha: 1 },
        traits: ["Amphibious", "Control Air and Water", "Emissary of the Sea", "Guardians of the Depths"],
        speed: 30
    },
    Tortle: {
        name: "Tortle",
        description: "Turtle-like humanoids with natural armor.",
        statBonuses: { str: 2, wis: 1 },
        traits: ["Claws", "Hold Breath", "Natural Armor", "Shell Defense"],
        speed: 30
    },
    "Yuan-ti Pureblood": {
        name: "Yuan-ti Pureblood",
        description: "Snake-blooded humans with innate magic.",
        statBonuses: { cha: 2, int: 1 },
        traits: ["Darkvision", "Innate Spellcasting", "Magic Resistance", "Poison Immunity"],
        speed: 30
    },
    Bugbear: {
        name: "Bugbear",
        description: "Hairy goblinoids with long limbs and stealth.",
        statBonuses: { str: 2, dex: 1 },
        traits: ["Darkvision", "Long-Limbed", "Powerful Build", "Sneaky", "Surprise Attack"],
        speed: 30
    }
};
