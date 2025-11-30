import { Spell } from '../types';

export const SPELL_LIBRARY: Record<string, Spell> = {
    // Cantrips
    "Fire Bolt": { name: "Fire Bolt", level: 0, school: "Evocation", description: "Hurl a mote of fire (1d10).", cost: "Action" },
    "Mage Hand": { name: "Mage Hand", level: 0, school: "Conjuration", description: "Spectral hand manipulates objects.", cost: "Action" },
    "Prestidigitation": { name: "Prestidigitation", level: 0, school: "Transmutation", description: "Minor magical tricks.", cost: "Action" },
    "Eldritch Blast": { name: "Eldritch Blast", level: 0, school: "Evocation", description: "Beam of crackling energy (1d10 force).", cost: "Action" },
    "Vicious Mockery": { name: "Vicious Mockery", level: 0, school: "Enchantment", description: "Insults dealing 1d4 psychic dmg.", cost: "Action" },

    // Level 1
    "Magic Missile": { name: "Magic Missile", level: 1, school: "Evocation", description: "Creates three glowing darts of magical force.", cost: "1 Slot" },
    "Cure Wounds": { name: "Cure Wounds", level: 1, school: "Evocation", description: "Heals 1d8 + modifier.", cost: "1 Slot" },
    "Healing Word": { name: "Healing Word", level: 1, school: "Evocation", description: "Heals 1d4 + modifier (Bonus Action).", cost: "1 Slot" },
    "Burning Hands": { name: "Burning Hands", level: 1, school: "Evocation", description: "Cone of fire (3d6).", cost: "1 Slot" },
    "Shield": { name: "Shield", level: 1, school: "Abjuration", description: "+5 AC vs triggering attack.", cost: "1 Slot" },
    "Sleep": { name: "Sleep", level: 1, school: "Enchantment", description: "Puts creatures to sleep (5d8 HP).", cost: "1 Slot" },

    // Level 2
    "Invisibility": { name: "Invisibility", level: 2, school: "Illusion", description: "Touch becomes invisible.", cost: "1 Slot" },
    "Misty Step": { name: "Misty Step", level: 2, school: "Conjuration", description: "Teleport 30ft (Bonus Action).", cost: "1 Slot" },
    "Hold Person": { name: "Hold Person", level: 2, school: "Enchantment", description: "Paralyzes a humanoid.", cost: "1 Slot" },

    // Level 3
    "Fireball": { name: "Fireball", level: 3, school: "Evocation", description: "Explosion of flame (8d6 fire).", cost: "1 Slot" },
    "Fly": { name: "Fly", level: 3, school: "Transmutation", description: "Target gains flying speed.", cost: "1 Slot" },
    "Revivify": { name: "Revivify", level: 3, school: "Necromancy", description: "Revive creature died within 1 min.", cost: "1 Slot" },
    "Counterspell": { name: "Counterspell", level: 3, school: "Abjuration", description: "Interrupt a creature casting a spell.", cost: "1 Slot" },
    "Dispel Magic": { name: "Dispel Magic", level: 3, school: "Abjuration", description: "End spells on creature or object.", cost: "1 Slot" },
    "Haste": { name: "Haste", level: 3, school: "Transmutation", description: "Double speed, +2 AC, advantage on Dex saves.", cost: "1 Slot" },
    "Lightning Bolt": { name: "Lightning Bolt", level: 3, school: "Evocation", description: "100ft line of lightning (8d6).", cost: "1 Slot" },
    "Spirit Guardians": { name: "Spirit Guardians", level: 3, school: "Conjuration", description: "Spectral guardians slow and damage foes.", cost: "1 Slot" },
    "Hypnotic Pattern": { name: "Hypnotic Pattern", level: 3, school: "Illusion", description: "Charm creatures in 30ft cube.", cost: "1 Slot" },

    // More Cantrips
    "Sacred Flame": { name: "Sacred Flame", level: 0, school: "Evocation", description: "Radiant flame (1d8).", cost: "Action" },
    "Guidance": { name: "Guidance", level: 0, school: "Divination", description: "+1d4 to one ability check.", cost: "Action" },
    "Light": { name: "Light", level: 0, school: "Evocation", description: "Object sheds bright light.", cost: "Action" },
    "Minor Illusion": { name: "Minor Illusion", level: 0, school: "Illusion", description: "Create sound or image.", cost: "Action" },
    "Shocking Grasp": { name: "Shocking Grasp", level: 0, school: "Evocation", description: "Lightning touch (1d8), adv vs metal armor.", cost: "Action" },
    "Thorn Whip": { name: "Thorn Whip", level: 0, school: "Transmutation", description: "Vine strike (1d6), pull 10ft.", cost: "Action" },
    "Toll the Dead": { name: "Toll the Dead", level: 0, school: "Necromancy", description: "Dolorous bell (1d8 or 1d12).", cost: "Action" },
    "Ray of Frost": { name: "Ray of Frost", level: 0, school: "Evocation", description: "Icy beam (1d8), reduce speed.", cost: "Action" },
    "Poison Spray": { name: "Poison Spray", level: 0, school: "Conjuration", description: "Poison cloud (1d12).", cost: "Action" },

    // More Level 1
    "Bless": { name: "Bless", level: 1, school: "Enchantment", description: "3 creatures get +1d4 to attacks and saves.", cost: "1 Slot" },
    "Thunderwave": { name: "Thunderwave", level: 1, school: "Evocation", description: "15ft cube thunder wave (2d8), push.", cost: "1 Slot" },
    "Detect Magic": { name: "Detect Magic", level: 1, school: "Divination", description: "Sense magic within 30ft.", cost: "1 Slot" },
    "Mage Armor": { name: "Mage Armor", level: 1, school: "Abjuration", description: "AC = 13 + Dex mod.", cost: "1 Slot" },
    "Chromatic Orb": { name: "Chromatic Orb", level: 1, school: "Evocation", description: "Elemental sphere (3d8).", cost: "1 Slot" },
    "Guiding Bolt": { name: "Guiding Bolt", level: 1, school: "Evocation", description: "Radiant attack (4d6), next attack has adv.", cost: "1 Slot" },
    "Inflict Wounds": { name: "Inflict Wounds", level: 1, school: "Necromancy", description: "Melee spell attack (3d10 necrotic).", cost: "1 Slot" },
    "Faerie Fire": { name: "Faerie Fire", level: 1, school: "Evocation", description: "Outline creatures, attacks have adv.", cost: "1 Slot" },
    "Entangle": { name: "Entangle", level: 1, school: "Conjuration", description: "Grasping weeds restrain creatures.", cost: "1 Slot" },
    "Hex": { name: "Hex", level: 1, school: "Enchantment", description: "+1d6 necrotic, disadv on ability checks.", cost: "1 Slot" },
    "Hunter's Mark": { name: "Hunter's Mark", level: 1, school: "Divination", description: "+1d6 damage, track target.", cost: "1 Slot" },

    // More Level 2
    "Spiritual Weapon": { name: "Spiritual Weapon", level: 2, school: "Evocation", description: "Floating weapon attacks (1d8+mod).", cost: "1 Slot" },
    "Scorching Ray": { name: "Scorching Ray", level: 2, school: "Evocation", description: "3 fire rays (2d6 each).", cost: "1 Slot" },
    "Shatter": { name: "Shatter", level: 2, school: "Evocation", description: "Thunder explosion (3d8).", cost: "1 Slot" },
    "Suggestion": { name: "Suggestion", level: 2, school: "Enchantment", description: "Suggest course of action.", cost: "1 Slot" },
    "Darkness": { name: "Darkness", level: 2, school: "Evocation", description: "15ft radius magical darkness.", cost: "1 Slot" },
    "Pass Without Trace": { name: "Pass Without Trace", level: 2, school: "Abjuration", description: "+10 Stealth, no tracks.", cost: "1 Slot" },
    "Heat Metal": { name: "Heat Metal", level: 2, school: "Transmutation", description: "Metal glows red hot (2d8 fire).", cost: "1 Slot" },
    "Mirror Image": { name: "Mirror Image", level: 2, school: "Illusion", description: "3 illusory duplicates.", cost: "1 Slot" },
    "Web": { name: "Web", level: 2, school: "Conjuration", description: "Sticky webs restrain creatures.", cost: "1 Slot" },
    "Lesser Restoration": { name: "Lesser Restoration", level: 2, school: "Abjuration", description: "End disease or condition.", cost: "1 Slot" },

    // Level 4
    "Polymorph": { name: "Polymorph", level: 4, school: "Transmutation", description: "Transform creature into beast.", cost: "1 Slot" },
    "Greater Invisibility": { name: "Greater Invisibility", level: 4, school: "Illusion", description: "Invisible even when attacking.", cost: "1 Slot" },
    "Banishment": { name: "Banishment", level: 4, school: "Abjuration", description: "Send creature to another plane.", cost: "1 Slot" },
    "Wall of Fire": { name: "Wall of Fire", level: 4, school: "Evocation", description: "Wall of flames (5d8 fire).", cost: "1 Slot" },
    "Ice Storm": { name: "Ice Storm", level: 4, school: "Evocation", description: "Hail storm (2d8 bludgeon + 4d6 cold).", cost: "1 Slot" },
    "Dimension Door": { name: "Dimension Door", level: 4, school: "Conjuration", description: "Teleport 500ft.", cost: "1 Slot" },
    "Guardian of Faith": { name: "Guardian of Faith", level: 4, school: "Conjuration", description: "Spectral guardian (20 dmg/hit).", cost: "1 Slot" },
    "Death Ward": { name: "Death Ward", level: 4, school: "Abjuration", description: "Drop to 1 HP instead of 0.", cost: "1 Slot" },
    "Confusion": { name: "Confusion", level: 4, school: "Enchantment", description: "Creatures act randomly.", cost: "1 Slot" },

    // Level 5
    "Cone of Cold": { name: "Cone of Cold", level: 5, school: "Evocation", description: "60ft cone of cold (8d8).", cost: "1 Slot" },
    "Cloudkill": { name: "Cloudkill", level: 5, school: "Conjuration", description: "Poisonous fog (5d8 poison).", cost: "1 Slot" },
    "Animate Objects": { name: "Animate Objects", level: 5, school: "Transmutation", description: "Bring objects to life.", cost: "1 Slot" },
    "Mass Cure Wounds": { name: "Mass Cure Wounds", level: 5, school: "Evocation", description: "Heal 6 creatures (3d8+mod).", cost: "1 Slot" },
    "Hold Monster": { name: "Hold Monster", level: 5, school: "Enchantment", description: "Paralyze a creature.", cost: "1 Slot" },
    "Teleportation Circle": { name: "Teleportation Circle", level: 5, school: "Conjuration", description: "Create portal to known circle.", cost: "1 Slot" },
    "Wall of Stone": { name: "Wall of Stone", level: 5, school: "Evocation", description: "Create stone wall.", cost: "1 Slot" },
    "Scrying": { name: "Scrying", level: 5, school: "Divination", description: "See and hear distant creature.", cost: "1 Slot" },
    "Dominate Person": { name: "Dominate Person", level: 5, school: "Enchantment", description: "Control a humanoid.", cost: "1 Slot" },

    // Level 6
    "Chain Lightning": { name: "Chain Lightning", level: 6, school: "Evocation", description: "Lightning arcs to 4 targets (10d8).", cost: "1 Slot" },
    "Disintegrate": { name: "Disintegrate", level: 6, school: "Transmutation", description: "Ray turns target to dust (10d6+40).", cost: "1 Slot" },
    "Sunbeam": { name: "Sunbeam", level: 6, school: "Evocation", description: "Radiant beam (6d8), blind.", cost: "1 Slot" },
    "Mass Suggestion": { name: "Mass Suggestion", level: 6, school: "Enchantment", description: "Suggest action to 12 creatures.", cost: "1 Slot" },
    "True Seeing": { name: "True Seeing", level: 6, school: "Divination", description: "See through illusions and darkness.", cost: "1 Slot" },
    "Heal": { name: "Heal", level: 6, school: "Evocation", description: "Restore 70 HP, end conditions.", cost: "1 Slot" },
    "Blade Barrier": { name: "Blade Barrier", level: 6, school: "Evocation", description: "Wall of whirling blades (6d10).", cost: "1 Slot" },
    "Circle of Death": { name: "Circle of Death", level: 6, school: "Necromancy", description: "60ft sphere necrotic blast (8d6).", cost: "1 Slot" },

    // Level 7
    "Finger of Death": { name: "Finger of Death", level: 7, school: "Necromancy", description: "Necrotic energy (7d8+30).", cost: "1 Slot" },
    "Plane Shift": { name: "Plane Shift", level: 7, school: "Conjuration", description: "Transport to another plane.", cost: "1 Slot" },
    "Teleport": { name: "Teleport", level: 7, school: "Conjuration", description: "Instantly transport to familiar location.", cost: "1 Slot" },
    "Etherealness": { name: "Etherealness", level: 7, school: "Transmutation", description: "Step into Ethereal Plane.", cost: "1 Slot" },
    "Resurrection": { name: "Resurrection", level: 7, school: "Necromancy", description: "Return dead to life (100 years).", cost: "1 Slot" },
    "Fire Storm": { name: "Fire Storm", level: 7, school: "Evocation", description: "Roaring flames (7d10 fire).", cost: "1 Slot" },
    "Reverse Gravity": { name: "Reverse Gravity", level: 7, school: "Transmutation", description: "Reverse gravity in 50ft cylinder.", cost: "1 Slot" },
    "Forcecage": { name: "Forcecage", level: 7, school: "Evocation", description: "Immobile invisible prison.", cost: "1 Slot" },

    // Level 8
    "Power Word Stun": { name: "Power Word Stun", level: 8, school: "Enchantment", description: "Stun creature with 150 HP or less.", cost: "1 Slot" },
    "Earthquake": { name: "Earthquake", level: 8, school: "Evocation", description: "100ft radius tremor.", cost: "1 Slot" },
    "Sunburst": { name: "Sunburst", level: 8, school: "Evocation", description: "Brilliant light (12d6 radiant), blind.", cost: "1 Slot" },
    "Dominate Monster": { name: "Dominate Monster", level: 8, school: "Enchantment", description: "Control any creature.", cost: "1 Slot" },
    "Feeblemind": { name: "Feeblemind", level: 8, school: "Enchantment", description: "Shatter creature's intellect.", cost: "1 Slot" },
    "Maze": { name: "Maze", level: 8, school: "Conjuration", description: "Banish to extradimensional labyrinth.", cost: "1 Slot" },
    "Mind Blank": { name: "Mind Blank", level: 8, school: "Abjuration", description: "Immune to psychic, divination, charm.", cost: "1 Slot" },
    "Incendiary Cloud": { name: "Incendiary Cloud", level: 8, school: "Conjuration", description: "Smoke cloud (10d8 fire).", cost: "1 Slot" },

    // Level 9
    "Wish": { name: "Wish", level: 9, school: "Conjuration", description: "The mightiest spell. Alter reality.", cost: "1 Slot" },
    "Meteor Swarm": { name: "Meteor Swarm", level: 9, school: "Evocation", description: "4 meteors explode (20d6 fire + 20d6 bludgeon).", cost: "1 Slot" },
    "Power Word Kill": { name: "Power Word Kill", level: 9, school: "Enchantment", description: "Kill creature with 100 HP or less.", cost: "1 Slot" },
    "True Polymorph": { name: "True Polymorph", level: 9, school: "Transmutation", description: "Transform into anything permanently.", cost: "1 Slot" },
    "Gate": { name: "Gate", level: 9, school: "Conjuration", description: "Open portal to another plane.", cost: "1 Slot" },
    "Time Stop": { name: "Time Stop", level: 9, school: "Transmutation", description: "Stop time for 1d4+1 turns.", cost: "1 Slot" },
    "Mass Heal": { name: "Mass Heal", level: 9, school: "Evocation", description: "Restore 700 HP divided among creatures.", cost: "1 Slot" },
    "Prismatic Wall": { name: "Prismatic Wall", level: 9, school: "Abjuration", description: "Wall of seven colored light layers.", cost: "1 Slot" },
    "Foresight": { name: "Foresight", level: 9, school: "Divination", description: "Adv on everything, enemies have disadv.", cost: "1 Slot" }
};
