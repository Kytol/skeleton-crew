export type MercenaryRace = 'Orc' | 'Goblin' | 'Warlock' | 'Troll' | 'Undead' | 'Demon' | 'Dark Elf';
export type MercenaryClass = 'Warrior' | 'Assassin' | 'Mage' | 'Tank' | 'Healer' | 'Berserker' | 'Necromancer';
export type MercenaryStatus = 'available' | 'hired' | 'on-mission';

export interface MercenaryStats {
  strength: number;
  agility: number;
  magic: number;
  defense: number;
  health: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  damage?: number;
}

export interface Equipment {
  id: string;
  name: string;
  slot: 'weapon' | 'armor' | 'accessory';
  bonus: Partial<MercenaryStats>;
}

export interface Mercenary {
  id: string;
  name: string;
  race: MercenaryRace;
  class: MercenaryClass;
  level: number;
  specialty: string;
  stats: MercenaryStats;
  hireCost: number;
  dailyUpkeep: number;
  status: MercenaryStatus;
  skills: Skill[];
  equipment: Equipment[];
  avatar: string;
  rating: number;
  missionsCompleted: number;
}

export interface FilterOptions {
  races: MercenaryRace[];
  classes: MercenaryClass[];
  levelRange: [number, number];
  costRange: [number, number];
  status: MercenaryStatus | 'all';
}

export type SortOption = 'level-asc' | 'level-desc' | 'cost-asc' | 'cost-desc' | 'rating-desc' | 'name-asc';

export const RACE_CONFIG: Record<MercenaryRace, { emoji: string; color: string }> = {
  'Orc': { emoji: '👹', color: '#4a7c4e' },
  'Goblin': { emoji: '👺', color: '#6b9a4c' },
  'Warlock': { emoji: '🧙', color: '#6b4c9a' },
  'Troll': { emoji: '🧌', color: '#4c6b9a' },
  'Undead': { emoji: '💀', color: '#5a5a6a' },
  'Demon': { emoji: '😈', color: '#9a4c4c' },
  'Dark Elf': { emoji: '🧝', color: '#4c4c9a' },
};

export const CLASS_CONFIG: Record<MercenaryClass, { icon: string; color: string }> = {
  'Warrior': { icon: '⚔️', color: '#c4a35a' },
  'Assassin': { icon: '🗡️', color: '#5a5a5a' },
  'Mage': { icon: '🔮', color: '#7a5ac4' },
  'Tank': { icon: '🛡️', color: '#5a8ac4' },
  'Healer': { icon: '💚', color: '#5ac47a' },
  'Berserker': { icon: '🪓', color: '#c45a5a' },
  'Necromancer': { icon: '☠️', color: '#8a5a8a' },
};
