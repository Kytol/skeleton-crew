import { Injectable, signal, computed } from '@angular/core';
import { Task, Goblin, TaskPriority, TaskCategory, GoblinMood, ACHIEVEMENTS, MOOD_CONFIG } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasks = signal<Task[]>(this.createDummyTasks());
  private goblins = signal<Goblin[]>(this.createDummyGoblins());
  private currentStreak = signal(5);
  private unlockedAchievements = signal<string[]>(['first-task', 'task-5', 'gold-100', 'streak-3', 'level-3']);
  private dailyBonus = signal({ claimed: false, day: new Date().toDateString() });

  private createDummyGoblins(): Goblin[] {
    return [
      { id: '1', name: 'Gruk', avatar: '👺', specialty: 'mining', totalRewards: 450, tasksCompleted: 8, level: 4, xp: 65, xpToNextLevel: 150, mood: 'happy', energy: 80, maxEnergy: 100, skills: this.createSkills(3, 1, 1, 1, 1, 2), achievements: [] },
      { id: '2', name: 'Snix', avatar: '👹', specialty: 'crafting', totalRewards: 320, tasksCompleted: 5, level: 3, xp: 40, xpToNextLevel: 150, mood: 'neutral', energy: 60, maxEnergy: 100, skills: this.createSkills(1, 3, 1, 1, 1, 1), achievements: [] },
      { id: '3', name: 'Blix', avatar: '🧌', specialty: 'gathering', totalRewards: 280, tasksCompleted: 6, level: 3, xp: 80, xpToNextLevel: 150, mood: 'excited', energy: 100, maxEnergy: 100, skills: this.createSkills(1, 1, 3, 1, 2, 1), achievements: [] },
      { id: '4', name: 'Zork', avatar: '😈', specialty: 'combat', totalRewards: 520, tasksCompleted: 7, level: 5, xp: 20, xpToNextLevel: 225, mood: 'happy', energy: 40, maxEnergy: 100, skills: this.createSkills(1, 1, 1, 4, 1, 1), achievements: [] },
      { id: '5', name: 'Nix', avatar: '🧙', specialty: 'exploration', totalRewards: 180, tasksCompleted: 3, level: 2, xp: 50, xpToNextLevel: 100, mood: 'tired', energy: 30, maxEnergy: 100, skills: this.createSkills(1, 1, 1, 1, 2, 1), achievements: [] },
    ];
  }

  private createSkills(mining: number, crafting: number, gathering: number, combat: number, exploration: number, general: number) {
    return [
      { category: 'mining' as TaskCategory, level: mining, xp: mining * 50 },
      { category: 'crafting' as TaskCategory, level: crafting, xp: crafting * 50 },
      { category: 'gathering' as TaskCategory, level: gathering, xp: gathering * 50 },
      { category: 'combat' as TaskCategory, level: combat, xp: combat * 50 },
      { category: 'exploration' as TaskCategory, level: exploration, xp: exploration * 50 },
      { category: 'general' as TaskCategory, level: general, xp: general * 50 },
    ];
  }

  private createDummyTasks(): Task[] {
    const now = new Date();
    return [
      { id: '1', title: 'Mine Iron Ore', description: 'Collect 50 iron ore from the eastern mines', reward: 75, xpReward: 45, priority: 'high', category: 'mining', deadline: new Date(now.getTime() + 3600000 * 4), assignedGoblinId: null, status: 'pending', createdAt: new Date(now.getTime() - 3600000), startedAt: null, completedAt: null, streak: 0 },
      { id: '2', title: 'Craft Goblin Armor', description: 'Forge a new set of leather armor', reward: 120, xpReward: 70, priority: 'medium', category: 'crafting', deadline: new Date(now.getTime() + 3600000 * 24), assignedGoblinId: null, status: 'pending', createdAt: new Date(now.getTime() - 7200000), startedAt: null, completedAt: null, streak: 0 },
      { id: '3', title: 'Scout Enemy Camp', description: 'Gather intel on the human settlement nearby', reward: 100, xpReward: 60, priority: 'urgent', category: 'exploration', deadline: new Date(now.getTime() + 3600000 * 2), assignedGoblinId: '5', status: 'in-progress', createdAt: new Date(now.getTime() - 1800000), startedAt: new Date(now.getTime() - 900000), completedAt: null, streak: 0 },
      { id: '4', title: 'Gather Mushrooms', description: 'Collect rare glowing mushrooms from the cave', reward: 50, xpReward: 35, priority: 'low', category: 'gathering', deadline: null, assignedGoblinId: '3', status: 'in-progress', createdAt: new Date(now.getTime() - 5400000), startedAt: new Date(now.getTime() - 3600000), completedAt: null, streak: 0 },
      { id: '5', title: 'Defeat Cave Trolls', description: 'Clear the trolls blocking the mountain pass', reward: 200, xpReward: 100, priority: 'high', category: 'combat', deadline: new Date(now.getTime() - 3600000), assignedGoblinId: null, status: 'pending', createdAt: new Date(now.getTime() - 86400000), startedAt: null, completedAt: null, streak: 0 },
      { id: '6', title: 'Repair Camp Fence', description: 'Fix the broken sections of the perimeter', reward: 40, xpReward: 25, priority: 'low', category: 'general', deadline: null, assignedGoblinId: null, status: 'pending', createdAt: new Date(now.getTime() - 43200000), startedAt: null, completedAt: null, streak: 0 },
      { id: '7', title: 'Raid Supply Wagon', description: 'Successfully raided merchant supplies', reward: 150, xpReward: 80, priority: 'high', category: 'combat', deadline: null, assignedGoblinId: '4', status: 'completed', createdAt: new Date(now.getTime() - 172800000), startedAt: new Date(now.getTime() - 86400000), completedAt: new Date(now.getTime() - 43200000), streak: 1 },
      { id: '8', title: 'Brew Healing Potions', description: 'Created 10 healing potions for the tribe', reward: 80, xpReward: 50, priority: 'medium', category: 'crafting', deadline: null, assignedGoblinId: '2', status: 'completed', createdAt: new Date(now.getTime() - 259200000), startedAt: new Date(now.getTime() - 172800000), completedAt: new Date(now.getTime() - 86400000), streak: 2 },
      { id: '9', title: 'Find Hidden Treasure', description: 'Discovered ancient goblin treasure cache', reward: 300, xpReward: 120, priority: 'medium', category: 'exploration', deadline: null, assignedGoblinId: '1', status: 'completed', createdAt: new Date(now.getTime() - 345600000), startedAt: new Date(now.getTime() - 259200000), completedAt: new Date(now.getTime() - 172800000), streak: 3 },
    ];
  }

  readonly allTasks = this.tasks.asReadonly();
  readonly allGoblins = this.goblins.asReadonly();
  readonly streak = this.currentStreak.asReadonly();
  readonly achievements = this.unlockedAchievements.asReadonly();

  readonly pendingTasks = computed(() =>
    this.tasks().filter(t => t.status === 'pending').sort((a, b) => this.sortByPriorityAndDeadline(a, b))
  );

  readonly inProgressTasks = computed(() =>
    this.tasks().filter(t => t.status === 'in-progress').sort((a, b) => this.sortByPriorityAndDeadline(a, b))
  );

  readonly completedTasks = computed(() =>
    this.tasks().filter(t => t.status === 'completed').sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))
  );

  readonly overdueTasks = computed(() => this.tasks().filter(t => this.isOverdue(t)));

  readonly stats = computed(() => ({
    total: this.tasks().length,
    pending: this.pendingTasks().length,
    inProgress: this.inProgressTasks().length,
    completed: this.completedTasks().length,
    overdue: this.overdueTasks().length,
    totalRewardsEarned: this.goblins().reduce((sum, g) => sum + g.totalRewards, 0),
    totalXpEarned: this.goblins().reduce((sum, g) => sum + g.xp, 0),
    highestLevel: Math.max(...this.goblins().map(g => g.level)),
    streak: this.currentStreak(),
    achievementsUnlocked: this.unlockedAchievements().length,
  }));

  readonly canClaimDailyBonus = computed(() => {
    const bonus = this.dailyBonus();
    return !bonus.claimed || bonus.day !== new Date().toDateString();
  });

  private createGoblin(id: string, name: string, avatar: string, specialty: TaskCategory): Goblin {
    return {
      id, name, avatar, specialty,
      totalRewards: 0, tasksCompleted: 0,
      level: 1, xp: 0, xpToNextLevel: 100,
      mood: 'neutral', energy: 100, maxEnergy: 100,
      skills: [
        { category: 'mining', level: 1, xp: 0 },
        { category: 'crafting', level: 1, xp: 0 },
        { category: 'gathering', level: 1, xp: 0 },
        { category: 'combat', level: 1, xp: 0 },
        { category: 'exploration', level: 1, xp: 0 },
        { category: 'general', level: 1, xp: 0 },
      ],
      achievements: [],
    };
  }

  private sortByPriorityAndDeadline(a: Task, b: Task): number {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    if (a.deadline && b.deadline) return a.deadline.getTime() - b.deadline.getTime();
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    return 0;
  }

  isOverdue(task: Task): boolean {
    if (!task.deadline || task.status === 'completed') return false;
    return new Date() > task.deadline;
  }

  getTimeRemaining(deadline: Date | null): string {
    if (!deadline) return 'No deadline';
    const diff = deadline.getTime() - Date.now();
    if (diff < 0) return 'Overdue!';
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h`;
    const minutes = Math.floor((diff % 3600000) / 60000);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  createTask(title: string, description: string, reward: number, priority: TaskPriority, category: TaskCategory, deadline: Date | null): void {
    const xpReward = Math.floor(reward / 2) + ({ urgent: 50, high: 30, medium: 20, low: 10 }[priority]);
    const task: Task = {
      id: crypto.randomUUID(), title, description, reward, xpReward, priority, category, deadline,
      assignedGoblinId: null, status: 'pending', createdAt: new Date(),
      startedAt: null, completedAt: null, streak: 0,
    };
    this.tasks.update(tasks => [...tasks, task]);
  }

  assignTask(taskId: string, goblinId: string): void {
    const goblin = this.goblins().find(g => g.id === goblinId);
    if (!goblin || goblin.energy < 20) return;

    this.tasks.update(tasks =>
      tasks.map(t => t.id === taskId ? { ...t, assignedGoblinId: goblinId, status: 'in-progress' as const, startedAt: new Date() } : t)
    );
    this.goblins.update(goblins =>
      goblins.map(g => g.id === goblinId ? { ...g, energy: Math.max(0, g.energy - 20) } : g)
    );
  }

  completeTask(taskId: string): void {
    const task = this.tasks().find(t => t.id === taskId);
    if (!task || !task.assignedGoblinId) return;

    const goblin = this.goblins().find(g => g.id === task.assignedGoblinId);
    if (!goblin) return;

    const isOnTime = !task.deadline || new Date() <= task.deadline;
    const isSpecialty = goblin.specialty === task.category;
    const moodBonus = MOOD_CONFIG[goblin.mood].bonus;
    const specialtyBonus = isSpecialty ? 1.25 : 1;
    const timeBonus = isOnTime ? 1 : 0.5;

    const finalReward = Math.floor(task.reward * moodBonus * specialtyBonus * timeBonus);
    const finalXp = Math.floor(task.xpReward * moodBonus * specialtyBonus);

    this.tasks.update(tasks =>
      tasks.map(t => t.id === taskId ? { ...t, status: 'completed' as const, completedAt: new Date() } : t)
    );

    this.currentStreak.update(s => s + 1);
    this.updateGoblinStats(goblin.id, finalReward, finalXp, task.category);
    this.checkAchievements(goblin.id);
  }

  private updateGoblinStats(goblinId: string, reward: number, xp: number, category: TaskCategory): void {
    this.goblins.update(goblins =>
      goblins.map(g => {
        if (g.id !== goblinId) return g;
        let newXp = g.xp + xp;
        let newLevel = g.level;
        let newXpToNext = g.xpToNextLevel;

        while (newXp >= newXpToNext) {
          newXp -= newXpToNext;
          newLevel++;
          newXpToNext = Math.floor(newXpToNext * 1.5);
        }

        const newMood: GoblinMood = newLevel > g.level ? 'excited' : g.tasksCompleted % 5 === 4 ? 'happy' : g.mood;
        const skills = g.skills.map(s => s.category === category ? { ...s, xp: s.xp + xp, level: Math.floor((s.xp + xp) / 100) + 1 } : s);

        return {
          ...g, totalRewards: g.totalRewards + reward, tasksCompleted: g.tasksCompleted + 1,
          xp: newXp, level: newLevel, xpToNextLevel: newXpToNext, mood: newMood, skills,
        };
      })
    );
  }

  private checkAchievements(goblinId: string): void {
    const goblin = this.goblins().find(g => g.id === goblinId);
    if (!goblin) return;

    ACHIEVEMENTS.forEach(ach => {
      if (this.unlockedAchievements().includes(ach.id)) return;
      let unlocked = false;
      if (ach.type === 'tasks' && goblin.tasksCompleted >= ach.requirement) unlocked = true;
      if (ach.type === 'gold' && goblin.totalRewards >= ach.requirement) unlocked = true;
      if (ach.type === 'streak' && this.currentStreak() >= ach.requirement) unlocked = true;
      if (ach.type === 'level' && goblin.level >= ach.requirement) unlocked = true;
      if (unlocked) this.unlockedAchievements.update(list => [...list, ach.id]);
    });
  }

  claimDailyBonus(): number {
    if (!this.canClaimDailyBonus()) return 0;
    const bonus = 100 + Math.floor(Math.random() * 100);
    this.dailyBonus.set({ claimed: true, day: new Date().toDateString() });
    this.goblins.update(goblins => goblins.map((g, i) => i === 0 ? { ...g, totalRewards: g.totalRewards + bonus } : g));
    return bonus;
  }

  restGoblin(goblinId: string): void {
    this.goblins.update(goblins =>
      goblins.map(g => g.id === goblinId ? { ...g, energy: Math.min(g.maxEnergy, g.energy + 30), mood: 'neutral' as GoblinMood } : g)
    );
  }

  deleteTask(taskId: string): void {
    this.tasks.update(tasks => tasks.filter(t => t.id !== taskId));
  }

  getGoblinById(id: string): Goblin | undefined {
    return this.goblins().find(g => g.id === id);
  }

  addGoblin(id: string, name: string, avatar: string, specialty: TaskCategory): void {
    const newGoblin = this.createGoblin(id, name, avatar, specialty);
    this.goblins.update(goblins => [...goblins, newGoblin]);
  }

  boostGoblinEnergy(goblinId: string, amount: number): void {
    this.goblins.update(goblins =>
      goblins.map(g => g.id === goblinId ? { ...g, energy: Math.min(g.maxEnergy, g.energy + amount) } : g)
    );
  }

  addXpToGoblin(goblinId: string, xp: number): void {
    this.goblins.update(goblins =>
      goblins.map(g => {
        if (g.id !== goblinId) return g;
        let newXp = g.xp + xp;
        let newLevel = g.level;
        let newXpToNext = g.xpToNextLevel;

        while (newXp >= newXpToNext) {
          newXp -= newXpToNext;
          newLevel++;
          newXpToNext = Math.floor(newXpToNext * 1.5);
        }

        return { ...g, xp: newXp, level: newLevel, xpToNextLevel: newXpToNext };
      })
    );
  }
}
