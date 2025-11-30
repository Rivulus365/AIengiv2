import { BackgroundDefinition } from '../types';

export const BACKGROUND_DEFINITIONS: Record<string, BackgroundDefinition> = {
    "Acolyte": {
        name: "Acolyte",
        description: "You have spent your life in the service of a temple.",
        skillProficiencies: ["Insight", "Religion"],
        feature: {
            name: "Shelter of the Faithful",
            description: "You can receive free healing and care at temples of your faith."
        }
    },
    "Criminal": {
        name: "Criminal",
        description: "You have a history of breaking the law.",
        skillProficiencies: ["Deception", "Stealth"],
        feature: {
            name: "Criminal Contact",
            description: "You have a reliable contact in the criminal network."
        }
    },
    "Folk Hero": {
        name: "Folk Hero",
        description: "You are a champion of the common people.",
        skillProficiencies: ["Animal Handling", "Survival"],
        feature: {
            name: "Rustic Hospitality",
            description: "Commoners will hide you and shield you from the law."
        }
    },
    "Noble": {
        name: "Noble",
        description: "You were born into a family of wealth and power.",
        skillProficiencies: ["History", "Persuasion"],
        feature: {
            name: "Position of Privilege",
            description: "You are welcome in high society and can secure audiences with nobles."
        }
    },
    "Sage": {
        name: "Sage",
        description: "You spent years learning the lore of the multiverse.",
        skillProficiencies: ["Arcana", "History"],
        feature: {
            name: "Researcher",
            description: "You often know where and from whom you can obtain information."
        }
    },
    "Soldier": {
        name: "Soldier",
        description: "War has been your life for as long as you care to remember.",
        skillProficiencies: ["Athletics", "Intimidation"],
        feature: {
            name: "Military Rank",
            description: "Soldiers loyal to your former military organization recognize your authority."
        }
    },
    "Charlatan": {
        name: "Charlatan",
        description: "You know how to put on a face and manipulate people.",
        skillProficiencies: ["Deception", "Sleight of Hand"],
        feature: {
            name: "False Identity",
            description: "You have a created a second identity with documentation."
        }
    },
    "Entertainer": {
        name: "Entertainer",
        description: "You thrive in front of an audience.",
        skillProficiencies: ["Acrobatics", "Performance"],
        feature: {
            name: "By Popular Demand",
            description: "You can always find a place to perform for food and lodging."
        }
    },
    "Hermit": {
        name: "Hermit",
        description: "You lived in seclusion for a formative part of your life.",
        skillProficiencies: ["Medicine", "Religion"],
        feature: {
            name: "Discovery",
            description: "You have made a unique and powerful discovery."
        }
    },
    "Outlander": {
        name: "Outlander",
        description: "You grew up in the wilds, far from civilization.",
        skillProficiencies: ["Athletics", "Survival"],
        feature: {
            name: "Wanderer",
            description: "You can recall terrain and find food/water for your party."
        }
    },
    "Urchin": {
        name: "Urchin",
        description: "You grew up alone on the streets.",
        skillProficiencies: ["Sleight of Hand", "Stealth"],
        feature: {
            name: "City Secrets",
            description: "You know the secret patterns of city streets and can move twice as fast."
        }
    },
    "Guild Artisan": {
        name: "Guild Artisan",
        description: "You are a member of an artisan's guild.",
        skillProficiencies: ["Insight", "Persuasion"],
        feature: {
            name: "Guild Membership",
            description: "You can rely on guild connections for lodging and assistance."
        }
    },
    "Sailor": {
        name: "Sailor",
        description: "You sailed on a seagoing vessel for years.",
        skillProficiencies: ["Athletics", "Perception"],
        feature: {
            name: "Ship's Passage",
            description: "You can secure free passage on ships for yourself and companions."
        }
    },
    "Haunted One": {
        name: "Haunted One",
        description: "You are haunted by something so terrible you dare not speak of it.",
        skillProficiencies: ["Arcana", "Investigation"],
        feature: {
            name: "Heart of Darkness",
            description: "Common folk recognize your haunted nature and offer comfort."
        }
    },
    "Far Traveler": {
        name: "Far Traveler",
        description: "You come from a distant land unknown to most.",
        skillProficiencies: ["Insight", "Perception"],
        feature: {
            name: "All Eyes on You",
            description: "Your accent and mannerisms draw attention, making it easy to find lodging."
        }
    },
    "City Watch": {
        name: "City Watch",
        description: "You have served the community as a guard or investigator.",
        skillProficiencies: ["Athletics", "Insight"],
        feature: {
            name: "Watcher's Eye",
            description: "You can spot criminals and know the layout of settlements."
        }
    },
    "Courtier": {
        name: "Courtier",
        description: "You understand wealth, power, and privilege in noble courts.",
        skillProficiencies: ["Insight", "Persuasion"],
        feature: {
            name: "Court Functionary",
            description: "You know how to navigate bureaucracy and gain audiences with nobles."
        }
    },
    "Pirate": {
        name: "Pirate",
        description: "You spent your youth under the sway of a dread pirate.",
        skillProficiencies: ["Athletics", "Perception"],
        feature: {
            name: "Bad Reputation",
            description: "Your fearsome reputation can intimidate others into cooperation."
        }
    }
};
