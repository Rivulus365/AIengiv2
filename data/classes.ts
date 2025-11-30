import { ClassDefinition } from '../types';

export const CLASS_DEFINITIONS: Record<string, ClassDefinition> = {
    Warrior: {
        name: "Warrior",
        description: "A master of martial combat.",
        statBonuses: { str: 2, con: 1 },
        resources: {
            spellSlots: { current: 0, max: 0 },
            classFeats: { name: "Second Wind", current: 1, max: 1 }
        },
        features: ["Second Wind"],
        hitDie: 10,
        subclasses: {
            Champion: {
                name: "Champion",
                description: "Focuses on raw physical power and critical hits.",
                features: ["Improved Critical"],
                statBonuses: { str: 1 }
            },
            BattleMaster: {
                name: "Battle Master",
                description: "Uses maneuvers to control the battlefield.",
                features: ["Combat Superiority"],
                statBonuses: { dex: 1 }
            }
        }
    },
    Rogue: {
        name: "Rogue",
        description: "A scoundrel who uses stealth and trickery.",
        statBonuses: { dex: 2, int: 1 },
        resources: {
            spellSlots: { current: 0, max: 0 },
            classFeats: { name: "Sneak Attack", current: 0, max: 0 }
        },
        features: ["Sneak Attack"],
        hitDie: 8,
        subclasses: {
            Thief: {
                name: "Thief",
                description: "Expert in burglary and agility.",
                features: ["Fast Hands"],
                statBonuses: { dex: 1 }
            },
            Assassin: {
                name: "Assassin",
                description: "Master of poisons and sudden death.",
                features: ["Assassinate"],
                statBonuses: { int: 1 }
            }
        }
    },
    Mage: {
        name: "Mage",
        description: "A scholarly magic-user.",
        statBonuses: { int: 2, wis: 1 },
        resources: {
            spellSlots: { current: 2, max: 2 },
            classFeats: { name: "Arcane Recovery", current: 1, max: 1 }
        },
        features: ["Spellcasting"],
        hitDie: 6,
        subclasses: {
            Evocation: {
                name: "Evocation",
                description: "Specializes in destructive elemental magic.",
                features: ["Sculpt Spells"],
                statBonuses: { int: 1 }
            },
            Abjuration: {
                name: "Abjuration",
                description: "Focuses on protective wards and banishing.",
                features: ["Arcane Ward"],
                statBonuses: { con: 1 }
            }
        }
    },
    Cleric: {
        name: "Cleric",
        description: "A priestly champion.",
        statBonuses: { wis: 2, str: 1 },
        resources: {
            spellSlots: { current: 2, max: 2 },
            classFeats: { name: "Channel Divinity", current: 1, max: 1 }
        },
        features: ["Divine Domain", "Spellcasting"],
        hitDie: 8,
        subclasses: {
            Life: {
                name: "Life Domain",
                description: "Dedicated to healing and vitality.",
                features: ["Disciple of Life"],
                statBonuses: { wis: 1 }
            },
            War: {
                name: "War Domain",
                description: "Combines divine magic with martial prowess.",
                features: ["War Priest"],
                statBonuses: { str: 1 }
            }
        }
    },
    Ranger: {
        name: "Ranger",
        description: "A warrior of the wilderness.",
        statBonuses: { dex: 2, wis: 1 },
        resources: {
            spellSlots: { current: 0, max: 0 },
            classFeats: { name: "Favored Enemy", current: 0, max: 0 }
        },
        features: ["Favored Enemy"],
        hitDie: 10,
        subclasses: {
            Hunter: {
                name: "Hunter",
                description: "Master of tracking and slaying specific prey.",
                features: ["Hunter's Prey"],
                statBonuses: { wis: 1 }
            },
            "Beast Master": {
                name: "Beast Master",
                description: "Forms a bond with an animal companion.",
                features: ["Ranger's Companion"],
                statBonuses: { wis: 1 }
            }
        }
    },
    Paladin: {
        name: "Paladin",
        description: "A holy warrior bound to a sacred oath.",
        statBonuses: { str: 2, cha: 1 },
        resources: {
            spellSlots: { current: 0, max: 0 },
            classFeats: { name: "Lay on Hands", current: 5, max: 5 }
        },
        features: ["Divine Sense", "Lay on Hands"],
        hitDie: 10,
        subclasses: {
            Devotion: {
                name: "Oath of Devotion",
                description: "Upholds the loftiest ideals of justice and virtue.",
                features: ["Sacred Weapon"],
                statBonuses: { cha: 1 }
            },
            Vengeance: {
                name: "Oath of Vengeance",
                description: "Punishes those who commit grievous sins.",
                features: ["Abjure Enemy"],
                statBonuses: { str: 1 }
            }
        }
    },
    Bard: {
        name: "Bard",
        description: "An inspiring magician.",
        statBonuses: { cha: 2, dex: 1 },
        resources: {
            spellSlots: { current: 2, max: 2 },
            classFeats: { name: "Bardic Inspiration", current: 2, max: 2 }
        },
        features: ["Bardic Inspiration"],
        hitDie: 8,
        subclasses: {
            Lore: {
                name: "College of Lore",
                description: "Masters of knowledge and magical secrets.",
                features: ["Cutting Words"],
                statBonuses: { int: 1 }
            },
            Valor: {
                name: "College of Valor",
                description: "Daring warriors who inspire courage in battle.",
                features: ["Combat Inspiration"],
                statBonuses: { str: 1 }
            }
        }
    },
    Druid: {
        name: "Druid",
        description: "A priest of the Old Faith.",
        statBonuses: { wis: 2, con: 1 },
        resources: {
            spellSlots: { current: 2, max: 2 },
            classFeats: { name: "Wild Shape", current: 2, max: 2 }
        },
        features: ["Wild Shape"],
        hitDie: 8,
        subclasses: {
            Land: {
                name: "Circle of the Land",
                description: "Draws power from the land itself.",
                features: ["Natural Recovery"],
                statBonuses: { wis: 1 }
            },
            Moon: {
                name: "Circle of the Moon",
                description: "Fierce guardians who transform into powerful beasts.",
                features: ["Combat Wild Shape"],
                statBonuses: { con: 1 }
            }
        }
    },
    Barbarian: {
        name: "Barbarian",
        description: "A fierce warrior of primitive background.",
        statBonuses: { str: 2, con: 1 },
        resources: {
            spellSlots: { current: 0, max: 0 },
            classFeats: { name: "Rage", current: 2, max: 2 }
        },
        features: ["Rage", "Unarmored Defense"],
        hitDie: 12,
        subclasses: {
            Berserker: {
                name: "Path of the Berserker",
                description: "Channels rage into violent fury.",
                features: ["Frenzy"],
                statBonuses: { str: 1 }
            },
            "Totem Warrior": {
                name: "Path of the Totem Warrior",
                description: "Draws spiritual power from animal totems.",
                features: ["Totem Spirit"],
                statBonuses: { con: 1 }
            }
        }
    },
    Monk: {
        name: "Monk",
        description: "A master of martial arts.",
        statBonuses: { dex: 2, wis: 1 },
        resources: {
            spellSlots: { current: 0, max: 0 },
            classFeats: { name: "Ki Points", current: 2, max: 2 }
        },
        features: ["Unarmored Defense", "Martial Arts"],
        hitDie: 8,
        subclasses: {
            "Open Hand": {
                name: "Way of the Open Hand",
                description: "Masters of unarmed combat techniques.",
                features: ["Open Hand Technique"],
                statBonuses: { dex: 1 }
            },
            Shadow: {
                name: "Way of Shadow",
                description: "Ninja-like warriors who use stealth and shadow magic.",
                features: ["Shadow Arts"],
                statBonuses: { wis: 1 }
            }
        }
    },
    Sorcerer: {
        name: "Sorcerer",
        description: "A spellcaster with innate magic.",
        statBonuses: { cha: 2, con: 1 },
        resources: {
            spellSlots: { current: 2, max: 2 },
            classFeats: { name: "Sorcery Points", current: 2, max: 2 }
        },
        features: ["Spellcasting", "Sorcerous Origin"],
        hitDie: 6,
        subclasses: {
            Draconic: {
                name: "Draconic Bloodline",
                description: "Magic flows from ancient dragon ancestors.",
                features: ["Dragon Ancestor"],
                statBonuses: { cha: 1 }
            },
            "Wild Magic": {
                name: "Wild Magic",
                description: "Raw, chaotic magic surges unpredictably.",
                features: ["Wild Magic Surge"],
                statBonuses: { con: 1 }
            }
        }
    },
    Warlock: {
        name: "Warlock",
        description: "A wielder of magic derived from a pact.",
        statBonuses: { cha: 2, con: 1 },
        resources: {
            spellSlots: { current: 1, max: 1 },
            classFeats: { name: "Eldritch Invocations", current: 2, max: 2 }
        },
        features: ["Pact Magic", "Eldritch Invocations"],
        hitDie: 8,
        subclasses: {
            Fiend: {
                name: "The Fiend",
                description: "Pact with a powerful demon or devil.",
                features: ["Dark One's Blessing"],
                statBonuses: { cha: 1 }
            },
            "Great Old One": {
                name: "The Great Old One",
                description: "Pact with an alien entity from beyond reality.",
                features: ["Awakened Mind"],
                statBonuses: { int: 1 }
            }
        }
    }
};
