import { Injectable, signal, computed, inject } from '@angular/core';
import {
  Mission, ActiveMission, MissionResult, MissionDifficulty, MissionType,
  DIFFICULTY_CONFIG
} from '../models/mission.model';
import { SquadService } from './squad.service';
import { MercenaryService } from './mercenary.service';

@Injectable({ providedIn: 'root' })
export class MissionService {
  private squadService = inject(SquadService);
  private mercenaryService = inject(MercenaryService);

  private missions = signal<Mission[]>(this.generateMissions());
  private activeMissions = signal<ActiveMission[]>([]);
  private missionResults = signal<MissionResult[]>([]);
  private totalGoldEarned = signal(0);

  readonly allMissions = this.missions.asReadonly();
  readonly allActiveMissions = this.activeMissions.asReadonly();
  readonly allResults = this.missionResults.asReadonly();
  readonly goldEarned = this.totalGoldEarned.asReadonly();

  readonly availableMissions = computed(() =>
    this.missions().filter(m => m.status === 'available')
  );

  readonly inProgressMissions = computed(() =>
    this.activeMissions().map(am => ({
      ...am,
      mission: this.missions().find(m => m.id === am.missionId)!,
      timeRemaining: this.getTimeRemaining(am.endsAt),
      progress: this.getProgress(am),
    }))
  );

  readonly completedMissionsCount = computed(() =>
    this.missionResults().filter(r => r.success).length
  );

  calculateSuccessProbability(missionId: string): number {
    const mission = this.missions().find(m => m.id === missionId);
    if (!mission) return 0;

    const squadMembers = this.squadService.squadMembers();
    if (squadMembers.length < mission.requirements.minSquadSize) return 0;

    let probability = 50; // Base probability

    // Squad size bonus
    const sizeBonus = Math.min((squadMembers.length - mission.requirements.minSquadSize) * 5, 20);
    probability += sizeBonus;

    // Total level check
    const totalLevel = squadMembers.reduce((sum, m) => sum + (m.mercenary?.level || 0), 0);
    if (totalLevel >= mission.requirements.minTotalLevel) {
      probability += 15;
    } else {
      probability -= 20;
    }

    // Recommended race/class bonus
    const { recommendedRaces, recommendedClasses } = mission.requirements;
    if (recommendedRaces?.length) {
      const matchingRaces = squadMembers.filter(m =>
        recommendedRaces.includes(m.mercenary?.race as any)
      ).length;
      probability += matchingRaces * 3;
    }
    if (recommendedClasses?.length) {
      const matchingClasses = squadMembers.filter(m =>
        recommendedClasses.includes(m.mercenary?.class as any)
      ).length;
      probability += matchingClasses * 3;
    }

    // Stats bonus
    if (mission.requirements.minStats) {
      const avgStats = this.calculateAverageStats(squadMembers);
      const { strength, agility, magic, defense } = mission.requirements.minStats;
      if (strength && avgStats.strength >= strength) probability += 5;
      if (agility && avgStats.agility >= agility) probability += 5;
      if (magic && avgStats.magic >= magic) probability += 5;
      if (defense && avgStats.defense >= defense) probability += 5;
    }

    // Difficulty penalty
    const difficultyPenalty = { easy: 0, medium: 10, hard: 25, legendary: 40 };
    probability -= difficultyPenalty[mission.difficulty];

    return Math.max(5, Math.min(95, probability));
  }

  private calculateAverageStats(squadMembers: any[]): any {
    if (squadMembers.length === 0) return { strength: 0, agility: 0, magic: 0, defense: 0 };
    const totals = squadMembers.reduce((acc, m) => ({
      strength: acc.strength + (m.mercenary?.stats.strength || 0),
      agility: acc.agility + (m.mercenary?.stats.agility || 0),
      magic: acc.magic + (m.mercenary?.stats.magic || 0),
      defense: acc.defense + (m.mercenary?.stats.defense || 0),
    }), { strength: 0, agility: 0, magic: 0, defense: 0 });

    return {
      strength: Math.round(totals.strength / squadMembers.length),
      agility: Math.round(totals.agility / squadMembers.length),
      magic: Math.round(totals.magic / squadMembers.length),
      defense: Math.round(totals.defense / squadMembers.length),
    };
  }

  startMission(missionId: string): boolean {
    const mission = this.missions().find(m => m.id === missionId);
    if (!mission || mission.status !== 'available') return false;

    const squadMembers = this.squadService.squadMembers();
    if (squadMembers.length < mission.requirements.minSquadSize) return false;

    const probability = this.calculateSuccessProbability(missionId);
    const now = new Date();
    const endsAt = new Date(now.getTime() + mission.duration * 60000);

    const activeMission: ActiveMission = {
      id: crypto.randomUUID(),
      missionId,
      squadMemberIds: squadMembers.map(m => m.mercenary!.id),
      startedAt: now,
      endsAt,
      successProbability: probability,
    };

    this.activeMissions.update(list => [...list, activeMission]);
    this.missions.update(list =>
      list.map(m => m.id === missionId ? { ...m, status: 'in-progress' as const } : m)
    );

    // Set mercenaries to on-mission status
    squadMembers.forEach(m => {
      if (m.mercenary) {
        this.mercenaryService.setOnMission(m.mercenary.id);
      }
    });

    // Schedule completion
    setTimeout(() => this.completeMission(activeMission.id), mission.duration * 60000);

    return true;
  }

  private completeMission(activeMissionId: string): void {
    const activeMission = this.activeMissions().find(am => am.id === activeMissionId);
    if (!activeMission) return;

    const mission = this.missions().find(m => m.id === activeMission.missionId);
    if (!mission) return;

    const success = Math.random() * 100 < activeMission.successProbability;
    const multiplier = DIFFICULTY_CONFIG[mission.difficulty].multiplier;

    const result: MissionResult = {
      missionId: mission.id,
      success,
      goldEarned: success ? Math.round(mission.rewards.gold * multiplier) : Math.round(mission.rewards.gold * 0.1),
      experienceEarned: success ? mission.rewards.experience : Math.round(mission.rewards.experience * 0.2),
      casualties: success ? [] : this.calculateCasualties(activeMission.squadMemberIds),
      bonusItems: success && mission.rewards.bonusItems ? mission.rewards.bonusItems : [],
    };

    this.missionResults.update(list => [result, ...list]);
    this.totalGoldEarned.update(g => g + result.goldEarned);

    // Update mission status
    this.missions.update(list =>
      list.map(m => m.id === mission.id ? { ...m, status: 'available' as const } : m)
    );

    // Remove from active
    this.activeMissions.update(list => list.filter(am => am.id !== activeMissionId));

    // Return mercenaries from mission
    activeMission.squadMemberIds.forEach(id => {
      this.mercenaryService.returnFromMission(id);
    });
  }

  private calculateCasualties(memberIds: string[]): string[] {
    // 20% chance per member to be "injured" on failure
    return memberIds.filter(() => Math.random() < 0.2);
  }

  private getTimeRemaining(endsAt: Date): string {
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return 'Completing...';
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}m ${secs}s`;
  }

  private getProgress(am: ActiveMission): number {
    const total = new Date(am.endsAt).getTime() - new Date(am.startedAt).getTime();
    const elapsed = Date.now() - new Date(am.startedAt).getTime();
    return Math.min(100, Math.round((elapsed / total) * 100));
  }

  getMissionById(id: string): Mission | undefined {
    return this.missions().find(m => m.id === id);
  }

  private generateMissions(): Mission[] {
    return [
      {
        id: '1', name: 'Goblin Cave Raid', description: 'Clear out a goblin-infested cave and claim their treasure.',
        type: 'raid', difficulty: 'easy',
        requirements: { minSquadSize: 2, minTotalLevel: 20, recommendedClasses: ['Warrior', 'Tank'] },
        rewards: { gold: 500, experience: 100 }, duration: 1, cooldown: 5, status: 'available'
      },
      {
        id: '2', name: 'Merchant Escort', description: 'Safely escort a merchant caravan through bandit territory.',
        type: 'escort', difficulty: 'easy',
        requirements: { minSquadSize: 3, minTotalLevel: 30 },
        rewards: { gold: 750, experience: 150 }, duration: 2, cooldown: 10, status: 'available'
      },
      {
        id: '3', name: 'Assassinate the Warlord', description: 'Infiltrate the enemy camp and eliminate their leader.',
        type: 'assassination', difficulty: 'medium',
        requirements: { minSquadSize: 2, minTotalLevel: 80, recommendedClasses: ['Assassin', 'Mage'] },
        rewards: { gold: 2000, experience: 400, bonusItems: ['Shadow Dagger'] }, duration: 3, cooldown: 30, status: 'available'
      },
      {
        id: '4', name: 'Defend the Outpost', description: 'Hold the northern outpost against waves of undead.',
        type: 'defense', difficulty: 'medium',
        requirements: { minSquadSize: 4, minTotalLevel: 120, recommendedRaces: ['Orc', 'Troll'], minStats: { defense: 50 } },
        rewards: { gold: 3000, experience: 600 }, duration: 5, cooldown: 60, status: 'available'
      },
      {
        id: '5', name: 'Dragon\'s Lair', description: 'Venture into the dragon\'s lair and steal from its hoard.',
        type: 'raid', difficulty: 'hard',
        requirements: { minSquadSize: 5, minTotalLevel: 200, minStats: { strength: 60, defense: 60 } },
        rewards: { gold: 8000, experience: 1500, bonusItems: ['Dragon Scale Armor', 'Fire Ruby'] }, duration: 10, cooldown: 120, status: 'available'
      },
      {
        id: '6', name: 'The Demon Gate', description: 'Close the demon portal before the invasion begins.',
        type: 'defense', difficulty: 'legendary',
        requirements: { minSquadSize: 6, minTotalLevel: 350, recommendedClasses: ['Mage', 'Healer', 'Necromancer'], minStats: { magic: 70 } },
        rewards: { gold: 20000, experience: 5000, bonusItems: ['Demon Lord\'s Crown', 'Void Crystal', 'Legendary Weapon'] }, duration: 15, cooldown: 240, status: 'available'
      },
    ];
  }
}
