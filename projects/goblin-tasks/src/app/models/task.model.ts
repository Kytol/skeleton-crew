export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';
export type TaskCategory = 'mining' | 'crafting' | 'gathering' | 'combat' | 'exploration' | 'general';
export type GoblinMood = 'happy' | 'neutral' | 'tired' | 'excited';

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  xpReward: number;
  priority: TaskPriority;
  category: TaskCategory;
  deadline: Date | null;
  assignedGoblinId: string | null;
  status: TaskStatus;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  streak: number;
}

export interface Goblin {
  id: string;
  name: string;
  totalRewards: number;
  tasksCompleted: number;
  avatar: string;
  specialty: TaskCategory;
  level: number;
  xp: number;
  xpToNextLevel: number;
  mood: GoblinMood;
  energy: number;
  maxEnergy: number;
  skills: GoblinSkill[];
  achievements: string[];
}

export interface GoblinSkill {
  category: TaskCategory;
  level: number;
  xp: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'tasks' | 'gold' | 'streak' | 'level';
}

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; icon: string }> = {
  low: { label: 'Low', color: '#4c9a6b', icon: '🟢' },
  medium: { label: 'Medium', color: '#9a9a4c', icon: '🟡' },
  high: { label: 'High', color: '#9a6b4c', icon: '🟠' },
  urgent: { label: 'Urgent', color: '#9a4c4c', icon: '🔴' },
};

export const CATEGORY_CONFIG: Record<TaskCategory, { label: string; icon: string; color: string }> = {
  mining: { label: 'Mining', icon: '⛏️', color: '#8b7355' },
  crafting: { label: 'Crafting', icon: '🔨', color: '#cd853f' },
  gathering: { label: 'Gathering', icon: '🌿', color: '#228b22' },
  combat: { label: 'Combat', icon: '⚔️', color: '#dc143c' },
  exploration: { label: 'Exploration', icon: '🗺️', color: '#4169e1' },
  general: { label: 'General', icon: '📋', color: '#708090' },
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-task', name: 'First Steps', description: 'Complete your first task', icon: '🎯', requirement: 1, type: 'tasks' },
  { id: 'task-5', name: 'Getting Started', description: 'Complete 5 tasks', icon: '📝', requirement: 5, type: 'tasks' },
  { id: 'task-master', name: 'Task Master', description: 'Complete 10 tasks', icon: '⭐', requirement: 10, type: 'tasks' },
  { id: 'task-legend', name: 'Task Legend', description: 'Complete 50 tasks', icon: '🏅', requirement: 50, type: 'tasks' },
  { id: 'gold-100', name: 'Pocket Change', description: 'Earn 100 gold', icon: '🪙', requirement: 100, type: 'gold' },
  { id: 'gold-500', name: 'Coin Collector', description: 'Earn 500 gold', icon: '💵', requirement: 500, type: 'gold' },
  { id: 'gold-hoarder', name: 'Gold Hoarder', description: 'Earn 1000 gold', icon: '💰', requirement: 1000, type: 'gold' },
  { id: 'gold-dragon', name: 'Dragon\'s Hoard', description: 'Earn 5000 gold', icon: '🐉', requirement: 5000, type: 'gold' },
  { id: 'streak-3', name: 'On Fire', description: 'Complete 3 tasks in a row', icon: '🔥', requirement: 3, type: 'streak' },
  { id: 'streak-7', name: 'Unstoppable', description: 'Complete 7 tasks in a row', icon: '💪', requirement: 7, type: 'streak' },
  { id: 'streak-15', name: 'Legendary Streak', description: 'Complete 15 tasks in a row', icon: '⚡', requirement: 15, type: 'streak' },
  { id: 'level-3', name: 'Apprentice', description: 'Reach level 3', icon: '📚', requirement: 3, type: 'level' },
  { id: 'level-5', name: 'Rising Star', description: 'Reach level 5', icon: '🌟', requirement: 5, type: 'level' },
  { id: 'level-10', name: 'Goblin Elite', description: 'Reach level 10', icon: '👑', requirement: 10, type: 'level' },
  { id: 'level-20', name: 'Goblin King', description: 'Reach level 20', icon: '🏰', requirement: 20, type: 'level' },
];

export const MOOD_CONFIG: Record<GoblinMood, { icon: string; bonus: number }> = {
  happy: { icon: '😊', bonus: 1.2 },
  neutral: { icon: '😐', bonus: 1.0 },
  tired: { icon: '😴', bonus: 0.8 },
  excited: { icon: '🤩', bonus: 1.5 },
};

// Daily Quest System
export type DailyQuestType = 'complete-tasks' | 'earn-gold' | 'category-focus' | 'speed-run' | 'streak';

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  type: DailyQuestType;
  target: number;
  progress: number;
  reward: number;
  xpReward: number;
  category?: TaskCategory;
  completed: boolean;
  icon: string;
}

// Equipment & Inventory System
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type ItemType = 'weapon' | 'armor' | 'accessory' | 'consumable';
export type ItemSlot = 'mainHand' | 'offHand' | 'head' | 'body' | 'accessory';

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  slot?: ItemSlot;
  rarity: ItemRarity;
  icon: string;
  stats: ItemStats;
  price: number;
  quantity?: number;
}

export interface ItemStats {
  xpBonus?: number;
  goldBonus?: number;
  energyBonus?: number;
  categoryBonus?: { category: TaskCategory; bonus: number };
}

export interface GoblinEquipment {
  mainHand?: Item;
  offHand?: Item;
  head?: Item;
  body?: Item;
  accessory?: Item;
}

// Weather System
export type WeatherType = 'sunny' | 'rainy' | 'stormy' | 'foggy' | 'magical';

export interface Weather {
  type: WeatherType;
  name: string;
  icon: string;
  description: string;
  effects: WeatherEffects;
}

export interface WeatherEffects {
  xpMultiplier: number;
  goldMultiplier: number;
  energyCost: number;
  categoryBonus?: TaskCategory;
}

// Quest Chain System
export interface QuestChain {
  id: string;
  name: string;
  description: string;
  icon: string;
  steps: QuestStep[];
  currentStep: number;
  completed: boolean;
  finalReward: { gold: number; xp: number; item?: Item };
}

export interface QuestStep {
  id: string;
  title: string;
  description: string;
  requirement: { type: 'complete-task' | 'earn-gold' | 'reach-level' | 'category-tasks'; target: number; category?: TaskCategory };
  progress: number;
  completed: boolean;
  reward: { gold: number; xp: number };
}

// Notification System
export type NotificationType = 'achievement' | 'level-up' | 'quest-complete' | 'item-found' | 'daily-bonus' | 'weather-change';

export interface GameNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon: string;
  timestamp: Date;
  read: boolean;
}

// Goblin Recruitment
export interface GoblinTemplate {
  id: string;
  name: string;
  avatar: string;
  specialty: TaskCategory;
  cost: number;
  unlocked: boolean;
  description: string;
  bonusAbility: string;
}

export const RARITY_CONFIG: Record<ItemRarity, { color: string; glow: string }> = {
  common: { color: '#9d9d9d', glow: 'none' },
  uncommon: { color: '#1eff00', glow: '0 0 8px #1eff00' },
  rare: { color: '#0070dd', glow: '0 0 8px #0070dd' },
  epic: { color: '#a335ee', glow: '0 0 10px #a335ee' },
  legendary: { color: '#ff8000', glow: '0 0 12px #ff8000' },
};

export const WEATHER_CONFIG: Record<WeatherType, Weather> = {
  sunny: { type: 'sunny', name: 'Sunny Day', icon: '☀️', description: 'Perfect working conditions!', effects: { xpMultiplier: 1.0, goldMultiplier: 1.0, energyCost: 1.0 } },
  rainy: { type: 'rainy', name: 'Rainy Weather', icon: '🌧️', description: 'Gathering tasks get a boost!', effects: { xpMultiplier: 1.0, goldMultiplier: 1.1, energyCost: 1.1, categoryBonus: 'gathering' } },
  stormy: { type: 'stormy', name: 'Thunder Storm', icon: '⛈️', description: 'Dangerous but rewarding!', effects: { xpMultiplier: 1.5, goldMultiplier: 1.5, energyCost: 1.5 } },
  foggy: { type: 'foggy', name: 'Mysterious Fog', icon: '🌫️', description: 'Exploration yields secrets!', effects: { xpMultiplier: 1.2, goldMultiplier: 1.0, energyCost: 0.9, categoryBonus: 'exploration' } },
  magical: { type: 'magical', name: 'Magical Aurora', icon: '✨', description: 'Rare magical phenomenon!', effects: { xpMultiplier: 2.0, goldMultiplier: 2.0, energyCost: 0.5 } },
};

export const SHOP_ITEMS: Item[] = [
  { id: 'pickaxe-1', name: 'Rusty Pickaxe', description: 'A basic mining tool', type: 'weapon', slot: 'mainHand', rarity: 'common', icon: '⛏️', stats: { categoryBonus: { category: 'mining', bonus: 0.1 } }, price: 100 },
  { id: 'hammer-1', name: 'Crafting Hammer', description: 'Improves crafting efficiency', type: 'weapon', slot: 'mainHand', rarity: 'common', icon: '🔨', stats: { categoryBonus: { category: 'crafting', bonus: 0.1 } }, price: 100 },
  { id: 'sword-1', name: 'Goblin Blade', description: 'A sharp combat weapon', type: 'weapon', slot: 'mainHand', rarity: 'uncommon', icon: '⚔️', stats: { categoryBonus: { category: 'combat', bonus: 0.15 }, xpBonus: 0.05 }, price: 250 },
  { id: 'map-1', name: 'Treasure Map', description: 'Reveals hidden rewards', type: 'accessory', slot: 'accessory', rarity: 'uncommon', icon: '🗺️', stats: { goldBonus: 0.1, categoryBonus: { category: 'exploration', bonus: 0.15 } }, price: 300 },
  { id: 'helmet-1', name: 'Iron Helmet', description: 'Protects your noggin', type: 'armor', slot: 'head', rarity: 'common', icon: '🪖', stats: { energyBonus: 10 }, price: 150 },
  { id: 'cloak-1', name: 'Shadow Cloak', description: 'Move unseen through the night', type: 'armor', slot: 'body', rarity: 'rare', icon: '🧥', stats: { xpBonus: 0.15, energyBonus: 15 }, price: 500 },
  { id: 'ring-1', name: 'Ring of Fortune', description: 'Increases gold drops', type: 'accessory', slot: 'accessory', rarity: 'rare', icon: '💍', stats: { goldBonus: 0.25 }, price: 750 },
  { id: 'crown-1', name: 'Goblin King Crown', description: 'The ultimate symbol of power', type: 'armor', slot: 'head', rarity: 'legendary', icon: '👑', stats: { xpBonus: 0.5, goldBonus: 0.5, energyBonus: 50 }, price: 5000 },
  { id: 'potion-energy', name: 'Energy Potion', description: 'Restores 50 energy', type: 'consumable', rarity: 'common', icon: '🧪', stats: { energyBonus: 50 }, price: 50, quantity: 1 },
  { id: 'potion-xp', name: 'XP Elixir', description: 'Grants 100 bonus XP', type: 'consumable', rarity: 'uncommon', icon: '✨', stats: { xpBonus: 100 }, price: 200, quantity: 1 },
];

export const RECRUITABLE_GOBLINS: GoblinTemplate[] = [
  { id: 'g6', name: 'Grimjaw', avatar: '🦷', specialty: 'combat', cost: 500, unlocked: false, description: 'A fierce warrior with sharp teeth', bonusAbility: '+20% combat XP' },
  { id: 'g7', name: 'Sparkle', avatar: '💎', specialty: 'mining', cost: 500, unlocked: false, description: 'Has an eye for precious gems', bonusAbility: '+15% mining gold' },
  { id: 'g8', name: 'Whisper', avatar: '👻', specialty: 'exploration', cost: 750, unlocked: false, description: 'Can find hidden paths', bonusAbility: '-20% exploration energy' },
  { id: 'g9', name: 'Forge', avatar: '🔥', specialty: 'crafting', cost: 750, unlocked: false, description: 'Master of the forge', bonusAbility: '+25% crafting rewards' },
  { id: 'g10', name: 'Bloom', avatar: '🌸', specialty: 'gathering', cost: 1000, unlocked: false, description: 'One with nature', bonusAbility: 'Double gathering streaks' },
];

export const QUEST_CHAINS: QuestChain[] = [
  {
    id: 'beginner-journey',
    name: 'The Goblin Way',
    description: 'Learn the basics of goblin task management',
    icon: '📜',
    currentStep: 0,
    completed: false,
    steps: [
      { id: 'bj-1', title: 'First Task', description: 'Complete your first task', requirement: { type: 'complete-task', target: 1 }, progress: 0, completed: false, reward: { gold: 50, xp: 25 } },
      { id: 'bj-2', title: 'Getting Started', description: 'Complete 5 tasks', requirement: { type: 'complete-task', target: 5 }, progress: 0, completed: false, reward: { gold: 100, xp: 50 } },
      { id: 'bj-3', title: 'Gold Collector', description: 'Earn 500 gold', requirement: { type: 'earn-gold', target: 500 }, progress: 0, completed: false, reward: { gold: 200, xp: 100 } },
    ],
    finalReward: { gold: 500, xp: 250 },
  },
  {
    id: 'mining-master',
    name: 'Mining Mastery',
    description: 'Become a master of the mines',
    icon: '⛏️',
    currentStep: 0,
    completed: false,
    steps: [
      { id: 'mm-1', title: 'Dig Deep', description: 'Complete 3 mining tasks', requirement: { type: 'category-tasks', target: 3, category: 'mining' }, progress: 0, completed: false, reward: { gold: 75, xp: 40 } },
      { id: 'mm-2', title: 'Ore Finder', description: 'Complete 10 mining tasks', requirement: { type: 'category-tasks', target: 10, category: 'mining' }, progress: 0, completed: false, reward: { gold: 200, xp: 100 } },
      { id: 'mm-3', title: 'Mine Lord', description: 'Complete 25 mining tasks', requirement: { type: 'category-tasks', target: 25, category: 'mining' }, progress: 0, completed: false, reward: { gold: 500, xp: 250 } },
    ],
    finalReward: { gold: 1000, xp: 500 },
  },
];
