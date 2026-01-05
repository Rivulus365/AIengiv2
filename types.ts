
export interface BaseStats {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface DerivedStats {
  ac: number;
  attackBonus: number;
  damageDie: string;
  proficiencyBonus: number;
  initiative: number;
  spellSaveDc: number;
  passivePerception: number;
}

export interface ClassResources {
  spellSlots: { current: number; max: number };
  classFeats: { name: string; current: number; max: number };
}

// Subclass definition used in ClassDefinition
export interface SubclassDefinition {
  name: string;
  description: string;
  features: string[];
  statBonuses: Partial<BaseStats>;
}

// Definition for character classes
export interface ClassDefinition {
  name: string;
  description: string;
  statBonuses: Partial<BaseStats>;
  resources: ClassResources;
  features: string[];
  hitDie: number;
  subclasses?: Record<string, SubclassDefinition>;
}

// Definition for character backgrounds
export interface BackgroundDefinition {
  name: string;
  description: string;
  skillProficiencies: string[];
  feature: {
    name: string;
    description: string;
  };
}

// Definition for character races
export interface RaceDefinition {
  name: string;
  description: string;
  statBonuses: Partial<BaseStats>;
  traits: string[];
  speed: number;
}

// Definition for skills
export interface SkillDefinition {
  name: string;
  ability: keyof BaseStats;
  description: string;
}

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Item {
  // Made optional to accommodate library items that may not have explicit IDs
  id?: string;
  name: string;
  description?: string;
  effect?: string;
  dmg?: string;
  ac?: number;
  prop?: string;
  type?: string;
  value?: number;
  weight?: number;
  rarity?: ItemRarity;
  qty?: number;
}

export interface Equipment {
  mainHand?: Item;
  offHand?: Item;
  body?: Item;
  accessory?: Item;
}

export type AIBehavior = 'Mindless' | 'Cowardly' | 'Tactical' | 'Aggressive';

export interface Enemy {
  name: string;
  hp: number;
  maxHp?: number;
  ac: number;
  state?: string;
  description?: string;
  traits?: string[];
  archetype?: string;
  cr?: number;
  xp?: number;
  attacks?: { name: string; bonus: number; dmg: string }[];
  ai?: AIBehavior;
}

export interface CombatLogEntry {
  turn: number;
  source: 'player' | 'enemy';
  action: string;
  roll: number;
  isHit: boolean;
  damage?: number;
  description: string;
}

export interface CombatState {
  isActive: boolean;
  distance: 'Melee' | 'Near' | 'Far';
  enemies: Enemy[];
  playerInitiative?: number;
  enemiesInitiative?: number;
}

export interface WorldState {
  location: string;
  time: string;
  activeQuest: string;
  questsCompleted: string[];
}

export interface Feat {
  name: string;
  description: string;
  type: 'passive' | 'active';
  effect?: string;
}

export interface Spell {
  name: string;
  level: number;
  school: string;
  description: string;
  cost?: string;
}

export interface Skill {
  name: string;
  modifier: number;
  isProficient: boolean;
}

export interface PlayerState {
  name: string;
  gender: string;
  age: number;
  race: string;
  class: string;
  subclass?: string;
  background?: string; // Added background field
  level: number;
  xp: number;
  nextLevelXp: number;
  gold: number;
  hp: {
    current: number;
    max: number;
  };
  stats: BaseStats;
  derivedStats: DerivedStats;
  resources: ClassResources;
  skills: Skill[];
  proficiencies: string[];
  activeFeats: string[];
  activeSpells: string[];
  unspentStatPoints: number;
  features: string[];
}

export type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

export interface RollData {
  value: number;
  sides?: number;
  type?: DieType;
  isCrit: boolean;
  isFail: boolean;
  source: 'player' | 'enemy';
  label?: string;
}

export interface GameState {
  summary?: string;
  player: PlayerState;
  equipment: Equipment;
  inventory: Item[];
  worldState: WorldState;
  combat: CombatState;
  combatLog: CombatLogEntry[];
  lastRolls?: RollData[];
}

export type MessageRole = 'user' | 'model' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  image?: string;
  isImageLoading?: boolean;
  gameStateSnapshot?: GameState;
  isLoading?: boolean;
}

export enum ImageSize {
  Size_1K = '1K',
  Size_2K = '2K',
  Size_4K = '4K',
}

export type FontSize = 'small' | 'medium' | 'large';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface CharacterCreationData {
    name: string;
    gender: string;
    age: number;
    race: string;
    charClass: string;
    stats: BaseStats;
    feat: Feat;
    subclass: string;
    background: string;
}
