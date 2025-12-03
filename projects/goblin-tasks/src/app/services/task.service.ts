import { Injectable, signal, computed } from '@angular/core';
import { Task, Goblin, TaskPriority } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasks = signal<Task[]>([]);
  private goblins = signal<Goblin[]>([
    { id: '1', name: 'Gruk', totalRewards: 0, tasksCompleted: 0, avatar: '👺', specialty: 'Mining' },
    { id: '2', name: 'Snix', totalRewards: 0, tasksCompleted: 0, avatar: '👹', specialty: 'Crafting' },
    { id: '3', name: 'Blix', totalRewards: 0, tasksCompleted: 0, avatar: '🧌', specialty: 'Gathering' },
  ]);

  readonly allTasks = this.tasks.asReadonly();
  readonly allGoblins = this.goblins.asReadonly();

  readonly pendingTasks = computed(() =>
    this.tasks()
      .filter(t => t.status === 'pending')
      .sort((a, b) => this.sortByPriorityAndDeadline(a, b))
  );

  readonly inProgressTasks = computed(() =>
    this.tasks()
      .filter(t => t.status === 'in-progress')
      .sort((a, b) => this.sortByPriorityAndDeadline(a, b))
  );

  readonly completedTasks = computed(() =>
    this.tasks()
      .filter(t => t.status === 'completed')
      .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))
  );

  readonly overdueTasks = computed(() =>
    this.tasks().filter(t => this.isOverdue(t))
  );

  readonly stats = computed(() => ({
    total: this.tasks().length,
    pending: this.pendingTasks().length,
    inProgress: this.inProgressTasks().length,
    completed: this.completedTasks().length,
    overdue: this.overdueTasks().length,
    totalRewardsEarned: this.goblins().reduce((sum, g) => sum + g.totalRewards, 0),
  }));

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
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    if (diff < 0) return 'Overdue!';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h left`;
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  }

  createTask(title: string, description: string, reward: number, priority: TaskPriority, deadline: Date | null): void {
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      reward,
      priority,
      deadline,
      assignedGoblinId: null,
      status: 'pending',
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
    };
    this.tasks.update(tasks => [...tasks, task]);
  }

  assignTask(taskId: string, goblinId: string): void {
    this.tasks.update(tasks =>
      tasks.map(t =>
        t.id === taskId
          ? { ...t, assignedGoblinId: goblinId, status: 'in-progress' as const, startedAt: new Date() }
          : t
      )
    );
  }

  completeTask(taskId: string): void {
    const task = this.tasks().find(t => t.id === taskId);
    if (!task || !task.assignedGoblinId) return;

    const isOnTime = !task.deadline || new Date() <= task.deadline;
    const bonusMultiplier = isOnTime ? 1 : 0.5; // Half reward if overdue

    this.tasks.update(tasks =>
      tasks.map(t =>
        t.id === taskId ? { ...t, status: 'completed' as const, completedAt: new Date() } : t
      )
    );

    const finalReward = Math.floor(task.reward * bonusMultiplier);
    this.goblins.update(goblins =>
      goblins.map(g =>
        g.id === task.assignedGoblinId
          ? { ...g, totalRewards: g.totalRewards + finalReward, tasksCompleted: g.tasksCompleted + 1 }
          : g
      )
    );
  }

  deleteTask(taskId: string): void {
    this.tasks.update(tasks => tasks.filter(t => t.id !== taskId));
  }

  getGoblinById(id: string): Goblin | undefined {
    return this.goblins().find(g => g.id === id);
  }
}
