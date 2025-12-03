import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, InputComponent, CalendarComponent } from 'ui-lib';
import { TaskService } from '../../services/task.service';
import { TaskPriority, TaskCategory, PRIORITY_CONFIG, CATEGORY_CONFIG } from '../../models/task.model';

type TabType = 'create' | 'available' | 'progress' | 'completed';

@Component({
  selector: 'app-task-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, InputComponent, CalendarComponent, DatePipe],
  template: `
    <div class="task-panel">
      <div class="tabs">
        <button class="tab" [class.active]="activeTab() === 'create'" (click)="activeTab.set('create')">
          ✏️ Create Task
        </button>
        <button class="tab" [class.active]="activeTab() === 'available'" (click)="activeTab.set('available')">
          📋 Available
          <span class="badge">{{ taskService.pendingTasks().length }}</span>
        </button>
        <button class="tab" [class.active]="activeTab() === 'progress'" (click)="activeTab.set('progress')">
          ⚔️ In Progress
          <span class="badge">{{ taskService.inProgressTasks().length }}</span>
        </button>
        <button class="tab" [class.active]="activeTab() === 'completed'" (click)="activeTab.set('completed')">
          🏆 Completed
          <span class="badge">{{ taskService.completedTasks().length }}</span>
        </button>
      </div>

      <div class="tab-content">
        @switch (activeTab()) {
          @case ('create') {
            <div class="create-view">
              <h3>📜 Create New Task</h3>
              <div class="form-fields">
                <ui-input label="Task Title" placeholder="Enter task title..." [(ngModel)]="title" />
                <ui-input label="Description" placeholder="What needs to be done..." [(ngModel)]="description" />
                
                <div class="form-row">
                  <ui-input label="Reward (Gold)" type="number" placeholder="10" [(ngModel)]="reward" />
                  <div class="select-group">
                    <label>Category</label>
                    <select [(ngModel)]="category">
                      @for (c of categories; track c.value) {
                        <option [value]="c.value">{{ c.icon }} {{ c.label }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div class="form-row">
                  <div class="select-group">
                    <label>Priority</label>
                    <select [(ngModel)]="priority">
                      @for (p of priorities; track p.value) {
                        <option [value]="p.value">{{ p.icon }} {{ p.label }}</option>
                      }
                    </select>
                  </div>
                  <div class="xp-preview">
                    <label>XP Reward</label>
                    <span class="xp-value">⭐ {{ calculateXp() }}</span>
                  </div>
                </div>

                <div class="deadline-section">
                  <label>
                    <input type="checkbox" [(ngModel)]="hasDeadline" />
                    Set Deadline
                  </label>
                  @if (hasDeadline) {
                    <div class="calendar-wrapper">
                      <ui-calendar mode="single" [showTime]="true" [minDate]="minDate" [value]="deadline" (valueChange)="onDeadlineChange($event)" />
                    </div>
                  }
                </div>
              </div>
              <ui-button variant="primary" (clicked)="createTask()">✨ Create Task</ui-button>
            </div>
          }

          @case ('available') {
            <div class="list-view">
              <h3>📋 Available Tasks</h3>
              @if (taskService.pendingTasks().length === 0) {
                <div class="empty-state">
                  <span class="empty-icon">📭</span>
                  <p>No tasks available</p>
                  <ui-button variant="outline" size="sm" (clicked)="activeTab.set('create')">Create a Task</ui-button>
                </div>
              } @else {
                <div class="tasks-grid">
                  @for (task of taskService.pendingTasks(); track task.id) {
                    <div class="task-card" [class.overdue]="taskService.isOverdue(task)">
                      <div class="task-header">
                        <span class="category-icon">{{ getCategoryIcon(task.category) }}</span>
                        <span class="priority" [style.color]="getPriorityColor(task.priority)">
                          {{ getPriorityIcon(task.priority) }} {{ task.priority | uppercase }}
                        </span>
                        @if (task.deadline) {
                          <span class="deadline" [class.urgent]="taskService.isOverdue(task)">
                            ⏰ {{ taskService.getTimeRemaining(task.deadline) }}
                          </span>
                        }
                      </div>
                      <div class="task-body">
                        <h4>{{ task.title }}</h4>
                        <p>{{ task.description }}</p>
                        <div class="rewards">
                          <span class="gold">💰 {{ task.reward }}</span>
                          <span class="xp">⭐ {{ task.xpReward }} XP</span>
                        </div>
                      </div>
                      <div class="task-footer">
                        <div class="goblin-select">
                          <select #goblinSelect>
                            @for (goblin of taskService.allGoblins(); track goblin.id) {
                              <option [value]="goblin.id">{{ goblin.avatar }} {{ goblin.name }} (⚡{{ goblin.energy }})</option>
                            }
                          </select>
                        </div>
                        <div class="actions">
                          <ui-button variant="primary" size="sm" (clicked)="assignTask(task.id, goblinSelect.value)">
                            Assign
                          </ui-button>
                          <ui-button variant="outline" size="sm" (clicked)="deleteTask(task.id)">
                            🗑️
                          </ui-button>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }

          @case ('progress') {
            <div class="list-view">
              <h3>⚔️ Tasks In Progress</h3>
              @if (taskService.inProgressTasks().length === 0) {
                <div class="empty-state">
                  <span class="empty-icon">😴</span>
                  <p>No tasks in progress</p>
                  <span class="hint">Assign a task to a goblin to get started!</span>
                </div>
              } @else {
                <div class="tasks-grid">
                  @for (task of taskService.inProgressTasks(); track task.id) {
                    <div class="task-card in-progress" [class.overdue]="taskService.isOverdue(task)">
                      <div class="task-header">
                        <span class="category-icon">{{ getCategoryIcon(task.category) }}</span>
                        <span class="priority" [style.color]="getPriorityColor(task.priority)">
                          {{ getPriorityIcon(task.priority) }}
                        </span>
                        @if (task.deadline) {
                          <span class="deadline" [class.urgent]="taskService.isOverdue(task)">
                            ⏰ {{ taskService.getTimeRemaining(task.deadline) }}
                          </span>
                        }
                      </div>
                      <div class="task-body">
                        <h4>{{ task.title }}</h4>
                        <p>{{ task.description }}</p>
                        <div class="worker-info">
                          <span class="worker">{{ getGoblinAvatar(task.assignedGoblinId) }} {{ getGoblinName(task.assignedGoblinId) }} is working...</span>
                          <span class="started">Started {{ task.startedAt | date:'shortTime' }}</span>
                        </div>
                        <div class="rewards">
                          <span class="gold">💰 {{ task.reward }}</span>
                          <span class="xp">⭐ {{ task.xpReward }} XP</span>
                        </div>
                      </div>
                      <div class="task-footer">
                        <ui-button variant="primary" (clicked)="completeTask(task.id)">
                          ✅ Mark Complete
                        </ui-button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }

          @case ('completed') {
            <div class="list-view">
              <h3>🏆 Completed Tasks</h3>
              @if (taskService.completedTasks().length === 0) {
                <div class="empty-state">
                  <span class="empty-icon">🎯</span>
                  <p>No completed tasks yet</p>
                  <span class="hint">Complete tasks to see them here!</span>
                </div>
              } @else {
                <div class="tasks-grid completed-grid">
                  @for (task of taskService.completedTasks(); track task.id) {
                    <div class="task-card completed">
                      <div class="task-header">
                        <span class="category-icon">{{ getCategoryIcon(task.category) }}</span>
                        <span class="completed-badge">✅ Done</span>
                      </div>
                      <div class="task-body">
                        <h4>{{ task.title }}</h4>
                        <div class="completion-info">
                          <span class="worker">{{ getGoblinAvatar(task.assignedGoblinId) }} {{ getGoblinName(task.assignedGoblinId) }}</span>
                          <span class="completed-at">{{ task.completedAt | date:'short' }}</span>
                        </div>
                        <div class="rewards earned">
                          <span class="gold">💰 {{ task.reward }} earned</span>
                          <span class="xp">⭐ {{ task.xpReward }} XP</span>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .task-panel {
      background: var(--bg-card);
      border: 2px solid var(--border-primary);
      border-radius: 12px;
      overflow: hidden;
    }
    .tabs {
      display: flex;
      background: var(--bg-secondary);
      border-bottom: 2px solid var(--border-primary);
    }
    .tab {
      flex: 1;
      padding: 14px 12px;
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border-bottom: 3px solid transparent;
    }
    .tab:hover { background: var(--card-overlay); color: var(--text-primary); }
    .tab.active {
      color: var(--accent-gold);
      background: var(--card-overlay);
      border-bottom-color: var(--accent-gold);
    }
    .badge {
      background: var(--accent-gold);
      color: #000;
      font-size: 0.75rem;
      font-weight: bold;
      padding: 2px 8px;
      border-radius: 10px;
      min-width: 20px;
    }
    .tab-content { padding: 20px; }
    h3 { color: var(--accent-gold); margin: 0 0 20px; font-size: 1.25rem; }

    /* Create View */
    .create-view .form-fields { display: flex; flex-direction: column; gap: 16px; margin-bottom: 20px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .select-group { display: flex; flex-direction: column; gap: 6px; }
    .select-group label { color: var(--text-secondary); font-size: 0.875rem; }
    .select-group select {
      background: var(--input-bg); color: var(--text-primary);
      border: 1px solid var(--border-primary); border-radius: 6px;
      padding: 10px 12px; font-size: 1rem;
    }
    .xp-preview { display: flex; flex-direction: column; gap: 6px; }
    .xp-preview label { color: var(--text-secondary); font-size: 0.875rem; }
    .xp-value {
      background: var(--card-overlay); padding: 10px 12px; border-radius: 6px;
      color: var(--accent-gold); font-weight: bold; font-size: 1rem;
    }
    .deadline-section { display: flex; flex-direction: column; gap: 12px; }
    .deadline-section > label { color: var(--text-primary); display: flex; align-items: center; gap: 8px; cursor: pointer; }
    .deadline-section input[type="checkbox"] { width: 18px; height: 18px; accent-color: var(--accent-purple); }
    .calendar-wrapper { background: var(--input-bg); border-radius: 8px; padding: 12px; border: 1px solid var(--border-secondary); }

    /* List Views */
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-muted);
    }
    .empty-icon { font-size: 4rem; display: block; margin-bottom: 16px; }
    .empty-state p { font-size: 1.1rem; margin: 0 0 8px; color: var(--text-secondary); }
    .hint { font-size: 0.85rem; opacity: 0.7; }
    .tasks-grid { display: flex; flex-direction: column; gap: 12px; }
    .task-card {
      background: var(--card-overlay);
      border: 2px solid var(--border-secondary);
      border-radius: 10px;
      padding: 16px;
      transition: all 0.2s;
    }
    .task-card:hover { border-color: var(--border-primary); }
    .task-card.in-progress { border-color: var(--border-progress); background: rgba(74,144,217,0.05); }
    .task-card.completed { border-color: var(--border-completed); opacity: 0.85; }
    .task-card.overdue { border-color: var(--border-overdue); background: rgba(220,38,38,0.05); }
    .task-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }
    .category-icon { font-size: 1.25rem; }
    .priority { font-size: 0.75rem; font-weight: bold; }
    .deadline { margin-left: auto; color: var(--text-muted); font-size: 0.8rem; }
    .deadline.urgent { color: #ef4444; font-weight: bold; }
    .completed-badge { margin-left: auto; color: #5ac47a; font-weight: bold; font-size: 0.85rem; }
    .task-body h4 { color: var(--text-primary); margin: 0 0 6px; font-size: 1rem; }
    .task-body p { color: var(--text-muted); margin: 0 0 12px; font-size: 0.85rem; }
    .rewards { display: flex; gap: 16px; }
    .rewards span { font-size: 0.85rem; font-weight: bold; }
    .gold { color: var(--accent-gold); }
    .xp { color: #a78bfa; }
    .rewards.earned { opacity: 0.8; }
    .worker-info { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.8rem; }
    .worker { color: #5ac47a; }
    .started { color: var(--text-muted); }
    .completion-info { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.8rem; color: var(--text-muted); }
    .task-footer {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--border-secondary);
    }
    .goblin-select { flex: 1; }
    .goblin-select select {
      width: 100%;
      background: var(--input-bg);
      color: var(--text-primary);
      border: 1px solid var(--border-primary);
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 0.9rem;
    }
    .actions { display: flex; gap: 8px; }
    .completed-grid .task-card { padding: 12px 16px; }

    @media (max-width: 600px) {
      .tabs { flex-wrap: wrap; }
      .tab { flex: 1 1 50%; font-size: 0.8rem; padding: 10px 8px; }
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class TaskPanelComponent {
  taskService = inject(TaskService);
  activeTab = signal<TabType>('create');

  // Form fields
  title = '';
  description = '';
  reward = '10';
  priority: TaskPriority = 'medium';
  category: TaskCategory = 'general';
  hasDeadline = false;
  deadline: Date | null = null;
  minDate = new Date();

  priorities = Object.entries(PRIORITY_CONFIG).map(([value, config]) => ({ value, ...config }));
  categories = Object.entries(CATEGORY_CONFIG).map(([value, config]) => ({ value, ...config }));

  calculateXp(): number {
    const base = Math.floor(Number(this.reward) / 2) || 5;
    const priorityBonus = { urgent: 50, high: 30, medium: 20, low: 10 }[this.priority];
    return base + priorityBonus;
  }

  onDeadlineChange(date: Date | [Date, Date]): void {
    if (!Array.isArray(date)) this.deadline = date;
  }

  createTask(): void {
    if (!this.title.trim()) return;
    this.taskService.createTask(this.title, this.description, Number(this.reward) || 10, this.priority, this.category, this.hasDeadline ? this.deadline : null);
    this.title = '';
    this.description = '';
    this.reward = '10';
    this.priority = 'medium';
    this.category = 'general';
    this.hasDeadline = false;
    this.deadline = null;
    this.activeTab.set('available');
  }

  assignTask(taskId: string, goblinId: string): void {
    this.taskService.assignTask(taskId, goblinId);
  }

  completeTask(taskId: string): void {
    this.taskService.completeTask(taskId);
  }

  deleteTask(taskId: string): void {
    this.taskService.deleteTask(taskId);
  }

  getGoblinName(goblinId: string | null): string {
    if (!goblinId) return 'Unknown';
    const goblin = this.taskService.getGoblinById(goblinId);
    return goblin?.name || 'Unknown';
  }

  getGoblinAvatar(goblinId: string | null): string {
    if (!goblinId) return '👤';
    const goblin = this.taskService.getGoblinById(goblinId);
    return goblin?.avatar || '👤';
  }

  getPriorityColor(priority: string): string {
    return PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG]?.color || '#fff';
  }

  getPriorityIcon(priority: string): string {
    return PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG]?.icon || '⚪';
  }

  getCategoryIcon(category: string): string {
    return CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]?.icon || '📋';
  }
}
