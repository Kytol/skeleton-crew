import { MercenaryRace, MercenaryClass } from './mercenary.model';

export type MissionDifficulty = 'easy' | 'medium' | 'hard' | 'legendary';
export type MissionStatus = 'available' | 'in-progress' | 'completed' | 'failed';
export type MissionType = 'raid' | 'escort' | 'assassination' | 'defense' | 'exploration';

export interface MissionRequirement {
  minSquadSize: number;
  minTotalLevel: number;
  recommendedRaces?: MercenaryRace[];
  recommendedClasses?: MercenaryClass[];
  minStats?: {
    strength?: number;
    agility?: number;
    magic?: number;
    defense?: number;
  };
}

export interface MissionReward {
  gold: number;
  experience: number;
  bonusItems?: string[];
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  type: MissionType;
  difficulty: MissionDifficulty;
  requirements: MissionRequirement;
  rewards: MissionReward;
  duration: number; // minutes
  status: MissionStatus;
  cooldown: number; // minutes until available again
}

export interface ActiveMission {
  id: string;
  missionId: string;
  squadMemberIds: string[];
  startedAt: Date;
  endsAt: Date;
  successProbability: number;
}

export interface MissionResult {
  missionId: string;
  success: boolean;
  goldEarned: number;
  experienceEarned: number;
  casualties: string[]; // mercenary IDs that were injured
  bonusItems: string[];
}

export const DIFFICULTY_CONFIG: Record<MissionDifficulty, { color: string; icon: string; multiplier: number }> = {
  easy: { color: '#5ac47a', icon: '⭐', multiplier: 1 },
  medium: { color: '#c4a35a', icon: '⭐⭐', multiplier: 1.5 },
  hard: { color: '#c45a5a', icon: '⭐⭐⭐', multiplier: 2 },
  legendary: { color: '#a35ac4', icon: '👑', multiplier: 3 },
};

export const MISSION_TYPE_CONFIG: Record<MissionType, { icon: string; label: string }> = {
  raid: { icon: '⚔️', label: 'Raid' },
  escort: { icon: '🛡️', label: 'Escort' },
  assassination: { icon: '🗡️', label: 'Assassination' },
  defense: { icon: '🏰', label: 'Defense' },
  exploration: { icon: '🗺️', label: 'Exploration' },
};
