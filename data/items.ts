
import { Item } from '../types';

export const ITEM_LIBRARY: Record<string, Item> = {
    // Weapons
    "Iron Longsword": { name: "Iron Longsword", dmg: "1d8", type: "melee", weight: 3, value: 15, rarity: "common", description: "A versatile blade.", prop: "Versatile (1d10)" },
    "Shortsword": { name: "Shortsword", dmg: "1d6", type: "melee", weight: 2, value: 10, rarity: "common", description: "Light and quick." },
    "Dagger": { name: "Dagger", dmg: "1d4", type: "melee", weight: 1, value: 2, rarity: "common", description: "Easy to hide.", prop: "Finesse, Light, Thrown" },
    "Greatsword": { name: "Greatsword", dmg: "2d6", type: "melee", weight: 6, value: 50, rarity: "common", description: "A massive blade.", prop: "Heavy, Two-Handed" },
    "Greataxe": { name: "Greataxe", dmg: "1d12", type: "melee", weight: 7, value: 30, rarity: "common", description: "A heavy axe.", prop: "Heavy, Two-Handed" },
    "Shortbow": { name: "Shortbow", dmg: "1d6", type: "ranged", weight: 2, value: 25, rarity: "common", description: "Simple ranged weapon.", prop: "Two-Handed" },
    "Longbow": { name: "Longbow", dmg: "1d8", type: "ranged", weight: 2, value: 50, rarity: "common", description: "Powerful ranged weapon.", prop: "Heavy, Two-Handed" },
    "Staff": { name: "Staff", dmg: "1d6", type: "melee", weight: 4, value: 5, rarity: "common", description: "Simple wooden staff.", prop: "Versatile (1d8)" },

    // Armor
    "Leather Armor": { name: "Leather Armor", ac: 11, type: "light", weight: 10, value: 10, rarity: "common", description: "Stiffened leather pads." },
    "Studded Leather": { name: "Studded Leather", ac: 12, type: "light", weight: 13, value: 45, rarity: "common", description: "Reinforced with rivets." },
    "Chain Shirt": { name: "Chain Shirt", ac: 13, type: "medium", weight: 20, value: 50, rarity: "common", description: "Interlocking metal rings." },
    "Scale Mail": { name: "Scale Mail", ac: 14, type: "medium", weight: 45, value: 50, rarity: "common", description: "Overlapping metal scales." },
    "Chain Mail": { name: "Chain Mail", ac: 16, type: "heavy", weight: 55, value: 75, rarity: "uncommon", description: "Interlocking metal rings." },
    "Plate Armor": { name: "Plate Armor", ac: 18, type: "heavy", weight: 65, value: 1500, rarity: "rare", description: "Full metal plating." },
    "Shield": { name: "Shield", ac: 2, type: "shield", weight: 6, value: 10, rarity: "common", description: "A wooden or metal shield." },

    // Accessories
    "Ring of Protection": { name: "Ring of Protection", ac: 1, type: "accessory", weight: 0, value: 500, rarity: "rare", description: "A magical ring that deflects blows.", effect: "+1 AC" },
    "Amulet of Health": { name: "Amulet of Health", type: "accessory", weight: 1, value: 4000, rarity: "rare", description: "Sets Con to 19.", effect: "Con 19" },

    // Consumables
    "Potion of Healing": { name: "Potion of Healing", type: "consumable", weight: 0.5, value: 50, rarity: "common", description: "Restores 2d4+2 HP.", effect: "Heals 2d4+2" },
    "Greater Potion of Healing": { name: "Greater Potion of Healing", type: "consumable", weight: 0.5, value: 150, rarity: "uncommon", description: "Restores 4d4+4 HP.", effect: "Heals 4d4+4" },
    "Superior Potion of Healing": { name: "Superior Potion of Healing", type: "consumable", weight: 0.5, value: 450, rarity: "rare", description: "Restores 8d4+8 HP.", effect: "Heals 8d4+8" },
    "Supreme Potion of Healing": { name: "Supreme Potion of Healing", type: "consumable", weight: 0.5, value: 1350, rarity: "epic", description: "Restores 10d4+20 HP.", effect: "Heals 10d4+20" },
    "Potion of Invisibility": { name: "Potion of Invisibility", type: "consumable", weight: 0.5, value: 180, rarity: "uncommon", description: "Become invisible for 1 hour.", effect: "Invisibility 1hr" },
    "Potion of Speed": { name: "Potion of Speed", type: "consumable", weight: 0.5, value: 400, rarity: "rare", description: "Haste effect for 1 minute.", effect: "Haste 1min" },
    "Elixir of Health": { name: "Elixir of Health", type: "consumable", weight: 0.5, value: 120, rarity: "uncommon", description: "Cures disease and poison.", effect: "Cure Disease/Poison" },
    "Rations": { name: "Rations", type: "consumable", weight: 2, value: 0.5, rarity: "common", description: "One day of food." },
    "Torch": { name: "Torch", type: "consumable", weight: 1, value: 0.01, rarity: "common", description: "Provides light for 1 hour." },

    // Magic Weapons - Uncommon
    "Weapon +1": { name: "Weapon +1", dmg: "1d8+1", type: "melee", weight: 3, value: 500, rarity: "uncommon", description: "A weapon with a +1 bonus.", effect: "+1 Attack/Damage" },
    "Flame Tongue": { name: "Flame Tongue", dmg: "1d8", type: "melee", weight: 3, value: 5000, rarity: "rare", description: "Ignites in flames (+2d6 fire).", effect: "+2d6 Fire Damage" },
    "Frost Brand": { name: "Frost Brand", dmg: "1d8", type: "melee", weight: 3, value: 5000, rarity: "rare", description: "Icy blade (+1d6 cold, resist fire).", effect: "+1d6 Cold, Fire Resist" },
    "Vicious Weapon": { name: "Vicious Weapon", dmg: "1d8", type: "melee", weight: 3, value: 350, rarity: "uncommon", description: "Deals +7 damage on a 20.", effect: "+7 on Crit" },
    "Oathbow": { name: "Oathbow", dmg: "1d8", type: "ranged", weight: 2, value: 3500, rarity: "rare", description: "Sworn enemy takes +3d6 damage.", effect: "+3d6 vs Sworn Enemy" },
    "Dagger of Venom": { name: "Dagger of Venom", dmg: "1d4", type: "melee", weight: 1, value: 2500, rarity: "rare", description: "Coated in poison (+2d10 poison).", effect: "+2d10 Poison" },
    "Javelin of Lightning": { name: "Javelin of Lightning", dmg: "1d6", type: "ranged", weight: 2, value: 500, rarity: "uncommon", description: "Transforms into a lightning bolt (4d6) when thrown.", effect: "Lightning Bolt" },

    // Magic Weapons - Epic/Legendary
    "Weapon +2": { name: "Weapon +2", dmg: "1d8+2", type: "melee", weight: 3, value: 2000, rarity: "rare", description: "A weapon with a +2 bonus.", effect: "+2 Attack/Damage" },
    "Weapon +3": { name: "Weapon +3", dmg: "1d8+3", type: "melee", weight: 3, value: 10000, rarity: "epic", description: "A weapon with a +3 bonus.", effect: "+3 Attack/Damage" },
    "Vorpal Sword": { name: "Vorpal Sword", dmg: "1d8+3", type: "melee", weight: 3, value: 50000, rarity: "legendary", description: "Beheads on a 20.", effect: "+3, Behead on 20" },
    "Holy Avenger": { name: "Holy Avenger", dmg: "1d8+3", type: "melee", weight: 3, value: 50000, rarity: "legendary", description: "Sacred weapon (+2d10 vs fiends/undead).", effect: "+3, +2d10 vs Evil" },
    "Sword of Sharpness": { name: "Sword of Sharpness", dmg: "1d8", type: "melee", weight: 3, value: 8000, rarity: "epic", description: "Maximizes damage on 20, severs limbs.", effect: "Max dmg on 20" },
    "Defender": { name: "Defender", dmg: "1d8+3", type: "melee", weight: 3, value: 15000, rarity: "legendary", description: "Transfer bonus to AC.", effect: "+3, Bonus to AC" },
    "Sun Blade": { name: "Sun Blade", dmg: "1d8+2", type: "melee", weight: 3, value: 5000, rarity: "rare", description: "Radiant blade dealing extra damage to undead. Finesse.", effect: "Radiant Dmg" },
    "Dwarven Thrower": { name: "Dwarven Thrower", dmg: "1d8+3", type: "melee", weight: 2, value: 20000, rarity: "epic", description: "Returns to hand. Extra damage vs giants.", effect: "Return, +d8 vs Giants" },

    // Magic Armor - Uncommon to Rare
    "Armor +1": { name: "Armor +1", ac: 13, type: "light", weight: 10, value: 500, rarity: "uncommon", description: "Armor with +1 AC bonus.", effect: "+1 AC" },
    "Armor +2": { name: "Armor +2", ac: 14, type: "medium", weight: 20, value: 2000, rarity: "rare", description: "Armor with +2 AC bonus.", effect: "+2 AC" },
    "Armor +3": { name: "Armor +3", ac: 19, type: "heavy", weight: 55, value: 10000, rarity: "epic", description: "Armor with +3 AC bonus.", effect: "+3 AC" },
    "Mithral Armor": { name: "Mithral Armor", ac: 15, type: "medium", weight: 10, value: 800, rarity: "uncommon", description: "Lightweight, no stealth penalty.", effect: "No Stealth Penalty" },
    "Adamantine Armor": { name: "Adamantine Armor", ac: 16, type: "heavy", weight: 55, value: 1500, rarity: "uncommon", description: "Crits become normal hits.", effect: "Immune to Crits" },
    "Dragon Scale Mail": { name: "Dragon Scale Mail", ac: 14, type: "medium", weight: 45, value: 4000, rarity: "epic", description: "Grants advantage on saves vs dragon breath.", effect: "+1 AC, Dragon Resist" },
    "Armor of Invulnerability": { name: "Armor of Invulnerability", ac: 18, type: "heavy", weight: 65, value: 50000, rarity: "legendary", description: "Immunity to nonmagical damage (limited).", effect: "Resist Nonmagical" },
    "Arrow-Catching Shield": { name: "Arrow-Catching Shield", ac: 4, type: "shield", weight: 6, value: 4000, rarity: "rare", description: "Grants +2 AC vs ranged attacks.", effect: "+2 AC vs Ranged" },
    "Glamoured Studded Leather": { name: "Glamoured Studded Leather", ac: 13, type: "light", weight: 13, value: 4000, rarity: "rare", description: "+1 AC. Can change appearance.", effect: "+1 AC, Disguise" },
    "Elven Chain": { name: "Elven Chain", ac: 14, type: "medium", weight: 20, value: 4000, rarity: "rare", description: "+1 AC. Considered proficient even if not.", effect: "+1 AC, Auto-Proficiency" },

    // Wondrous Items - Common to Uncommon
    "Bag of Holding": { name: "Bag of Holding", type: "accessory", weight: 15, value: 500, rarity: "uncommon", description: "Holds 500 lbs in extradimensional space.", effect: "500 lb Capacity" },
    "Cloak of Protection": { name: "Cloak of Protection", ac: 1, type: "accessory", weight: 1, value: 3500, rarity: "uncommon", description: "+1 AC and saves.", effect: "+1 AC, +1 Saves" },
    "Boots of Speed": { name: "Boots of Speed", type: "accessory", weight: 1, value: 4000, rarity: "rare", description: "Double speed, Haste action.", effect: "Double Speed" },
    "Winged Boots": { name: "Winged Boots", type: "accessory", weight: 1, value: 8000, rarity: "uncommon", description: "Fly speed 30ft for 4 hours/day.", effect: "Fly 30ft" },
    "Gloves of Missile Snaring": { name: "Gloves of Missile Snaring", type: "accessory", weight: 0.5, value: 3000, rarity: "uncommon", description: "Catch missiles, reduce damage.", effect: "Catch Missiles" },
    "Bracers of Defense": { name: "Bracers of Defense", ac: 2, type: "accessory", weight: 1, value: 6000, rarity: "rare", description: "+2 AC when not wearing armor.", effect: "+2 AC Unarmored" },
    "Gauntlets of Ogre Power": { name: "Gauntlets of Ogre Power", type: "accessory", weight: 2, value: 8000, rarity: "uncommon", description: "Str becomes 19.", effect: "Str 19" },
    "Belt of Giant Strength": { name: "Belt of Giant Strength", type: "accessory", weight: 1, value: 20000, rarity: "epic", description: "Str becomes 21-29 (varies).", effect: "Str 21+" },
    "Headband of Intellect": { name: "Headband of Intellect", type: "accessory", weight: 0.5, value: 8000, rarity: "uncommon", description: "Int becomes 19.", effect: "Int 19" },
    "Cloak of Elvenkind": { name: "Cloak of Elvenkind", type: "accessory", weight: 1, value: 500, rarity: "uncommon", description: "Camouflage. Disadvantage on perception to see you.", effect: "Stealth Advantage" },
    "Boots of Elvenkind": { name: "Boots of Elvenkind", type: "accessory", weight: 1, value: 500, rarity: "uncommon", description: "Steps make no sound.", effect: "Silent Movement" },
    "Goggles of Night": { name: "Goggles of Night", type: "accessory", weight: 0.5, value: 500, rarity: "uncommon", description: "Grants 60ft Darkvision.", effect: "Darkvision" },
    "Pearl of Power": { name: "Pearl of Power", type: "accessory", weight: 0.1, value: 1000, rarity: "uncommon", description: "Regain one spell slot up to 3rd level daily.", effect: "Regain Spell Slot" },
    "Hat of Disguise": { name: "Hat of Disguise", type: "accessory", weight: 0.5, value: 800, rarity: "uncommon", description: "Cast Disguise Self at will.", effect: "Disguise Self" },
    "Slippers of Spider Climbing": { name: "Slippers of Spider Climbing", type: "accessory", weight: 0.5, value: 1500, rarity: "uncommon", description: "Walk up walls and ceilings hands-free.", effect: "Spider Climb" },
    "Stone of Good Luck": { name: "Stone of Good Luck", type: "accessory", weight: 0.1, value: 600, rarity: "uncommon", description: "+1 to ability checks and saving throws.", effect: "+1 Checks/Saves" },

    // Wondrous Items - Rare to Legendary
    "Cloak of Invisibility": { name: "Cloak of Invisibility", type: "accessory", weight: 1, value: 80000, rarity: "legendary", description: "Become invisible at will.", effect: "Invisibility at Will" },
    "Robe of the Archmagi": { name: "Robe of the Archmagi", ac: 15, type: "accessory", weight: 4, value: 50000, rarity: "legendary", description: "AC 15+Dex, spell save +2, resist spells.", effect: "AC 15+Dex, +2 Saves" },
    "Staff of Power": { name: "Staff of Power", dmg: "1d6", type: "melee", weight: 4, value: 50000, rarity: "epic", description: "+2 weapon, +2 saves, many spells.", effect: "+2 Weapon, Spells" },
    "Wand of Fireballs": { name: "Wand of Fireballs", type: "accessory", weight: 1, value: 32000, rarity: "rare", description: "Cast Fireball (7 charges).", effect: "Fireball 7/day" },
    "Deck of Many Things": { name: "Deck of Many Things", type: "accessory", weight: 0.5, value: 100000, rarity: "legendary", description: "Draw cards for powerful random effects.", effect: "Random Fate" },
    "Sphere of Annihilation": { name: "Sphere of Annihilation", type: "accessory", weight: 0, value: 100000, rarity: "legendary", description: "Destroys all matter it touches.", effect: "Destroy Matter" },
    "Portable Hole": { name: "Portable Hole", type: "accessory", weight: 0.5, value: 8000, rarity: "rare", description: "10ft deep extradimensional hole.", effect: "10ft Hole" },
    "Immovable Rod": { name: "Immovable Rod", type: "accessory", weight: 2, value: 5000, rarity: "uncommon", description: "Becomes fixed in place.", effect: "Fixed Position" },
    "Rope of Entanglement": { name: "Rope of Entanglement", type: "accessory", weight: 3, value: 4000, rarity: "rare", description: "Animates to restrain creatures.", effect: "Restrain Creature" },
    "Eversmoking Bottle": { name: "Eversmoking Bottle", type: "accessory", weight: 1, value: 1000, rarity: "uncommon", description: "Creates heavy smoke cloud.", effect: "Smoke Cloud" },
    "Carpet of Flying": { name: "Carpet of Flying", type: "accessory", weight: 10, value: 30000, rarity: "epic", description: "A magic carpet that flies (40ft).", effect: "Flight 40ft" },
    "Ring of Invisibility": { name: "Ring of Invisibility", type: "accessory", weight: 0, value: 50000, rarity: "legendary", description: "Turn invisible at will.", effect: "Invisibility" },

    // More Consumables
    "Potion of Water Breathing": { name: "Potion of Water Breathing", type: "consumable", weight: 0.5, value: 100, rarity: "uncommon", description: "Breathe underwater for 1 hour.", effect: "Water Breathing" },
    "Potion of Flying": { name: "Potion of Flying", type: "consumable", weight: 0.5, value: 500, rarity: "rare", description: "Gain flying speed for 1 hour.", effect: "Flight" },
    "Potion of Giant Strength (Hill)": { name: "Potion of Giant Strength (Hill)", type: "consumable", weight: 0.5, value: 300, rarity: "uncommon", description: "Strength becomes 21 for 1 hour.", effect: "Str 21" },
    "Dust of Disappearance": { name: "Dust of Disappearance", type: "consumable", weight: 0.1, value: 300, rarity: "uncommon", description: "Invisibility for 2d4 minutes.", effect: "Invisibility (Group)" },
    "Oil of Sharpness": { name: "Oil of Sharpness", type: "consumable", weight: 0.1, value: 2000, rarity: "rare", description: "Coat weapon for +3 bonus for 1 hour.", effect: "+3 Weapon Oil" }
};
