import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ButtonComponent } from 'ui-lib';
import { TaskService } from '../../services/task.service';
import { Task, PRIORITY_CONFIG } from '../../models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent, DatePipe],
  template: `
    <div class="task-list">
      <h2>📋 Available Tasks ({{ taskService.pendingTasks().length }})</h2>
      @if (taskService.pendingTasks().length === 0) {
        <p class="empty">No tasks available. Create one above!</p>
      } @else {
        <div class="tasks">
          @for (task of taskService.pendingTasks(); track task.id) {
            <div class="task-card" [class.overdue]="taskService.isOverdue(task)">
              <div class="task-header">
                <span class="priority" [style.color]="getPriorityColor(task.priority)">
                  {{ getPriorityIcon(task.priority) }} {{ task.priority | uppercase }}
                </span>
                @if (task.deadline) {
                  <span class="deadline" [class.urgent]="taskService.isOverdue(task)">
                    ⏰ {{ taskService.getTimeRemaining(task.deadline) }}
                  </span>
                }
              </div>
              <div class="task-info">
                <h3>{{ task.title }}</h3>
                <p>{{ task.description }}</p>
                <div class="task-meta">
                  <span class="reward">💰 {{ task.reward }} Gold</span>
                  <span class="created">Created: {{ task.createdAt | date:'short' }}</span>
                  @if (task.deadline) {
                    <span class="due">Due: {{ task.deadline | date:'medium' }}</span>
                  }
                </div>
              </div>
              <div class="task-actions">
                <div class="goblin-select">
                  <label>Assign to:</label>
                  <select #goblinSelect>
                    @for (goblin of taskService.allGoblins(); track goblin.id) {
                      <option [value]="goblin.id">{{ goblin.avatar }} {{ goblin.name }}</option>
                    }
                  </select>
                </div>
                <ui-button variant="primary" size="sm" (clicked)="assignTask(task.id, goblinSelect.value)">
                  Assign
                </ui-button>
                <ui-button variant="outline" size="sm" (clicked)="deleteTask(task.id)">
                  🗑️
                </ui-button>
              </div>
            </div>
          }
        </div>
      }

      <h2>⚔️ In Progress ({{ taskService.inProgressTasks().length }})</h2>
      @if (taskService.inProgressTasks().length === 0) {
        <p class="empty">No tasks in progress.</p>
      } @else {
        <div class="tasks">
          @for (task of taskService.inProgressTasks(); track task.id) {
            <div class="task-card in-progress" [class.overdue]="taskService.isOverdue(task)">
              <div class="task-header">
                <span class="priority" [style.color]="getPriorityColor(task.priority)">
                  {{ getPriorityIcon(task.priority) }} {{ task.priority | uppercase }}
                </span>
                @if (task.deadline) {
                  <span class="deadline" [class.urgent]="taskService.isOverdue(task)">
                    ⏰ {{ taskService.getTimeRemaining(task.deadline) }}
                  </span>
                }
              </div>
              <div class="task-info">
                <h3>{{ task.title }}</h3>
                <p>{{ task.description }}</p>
                <div class="task-meta">
                  <span class="reward">💰 {{ task.reward }} Gold</span>
                  <span class="assigned">{{ getGoblinName(task.assignedGoblinId) }} is working...</span>
                  <span class="started">Started: {{ task.startedAt | date:'short' }}</span>
                </div>
              </div>
              <div class="task-actions">
                <ui-button variant="primary" (clicked)="completeTask(task.id)">
                  ✅ Complete
                </ui-button>
              </div>
            </div>
          }
        </div>
      }

      <h2>🏆 Completed ({{ taskService.completedTasks().length }})</h2>
      @if (taskService.completedTasks().length === 0) {
        <p class="empty">No completed tasks yet.</p>
      } @else {
        <div class="tasks completed">
          @for (task of taskService.completedTasks(); track task.id) {
            <div class="task-card completed">
              <div class="task-info">
                <h3>{{ task.title }}</h3>
                <div class="task-meta">
                  <span class="reward">💰 {{ task.reward }} Gold earned</span>
                  <span class="assigned">Completed by {{ getGoblinName(task.assignedGoblinId) }}</span>
                  <span class="completed-at">{{ task.completedAt | date:'medium' }}</span>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .task-list { margin-top: 24px; }
    h2 { color: var(--text-heading); margin: 24px 0 16px; }
    .empty { color: var(--text-muted); font-style: italic; }
    .tasks { display: flex; flex-direction: column; gap: 12px; }
    .task-card {
      background: var(--bg-card-alt);
      border: 2px solid var(--border-primary);
      border-radius: 8px;
      padding: 16px;
      transition: all 0.3s;
    }
    .task-card.in-progress { border-color: var(--border-progress); }
    .task-card.completed { border-color: var(--border-completed); opacity: 0.8; }
    .task-card.overdue { border-color: var(--border-overdue); }
    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .priority { font-size: 0.75rem; font-weight: bold; text-transform: uppercase; }
    .deadline { color: var(--text-secondary); font-size: 0.85rem; }
    .deadline.urgent { color: #ff6b6b; font-weight: bold; }
    .task-info h3 { color: var(--text-white); margin: 0 0 8px; }
    .task-info p { color: var(--text-secondary); margin: 0 0 12px; font-size: 0.9rem; }
    .task-meta { display: flex; flex-wrap: wrap; gap: 12px; font-size: 0.8rem; }
    .reward { color: var(--accent-gold); font-weight: bold; }
    .created, .started, .due, .completed-at { color: var(--text-muted); }
    .assigned { color: #a8c8b8; }
    .task-actions { display: flex; gap: 8px; align-items: center; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-secondary); }
    .goblin-select { display: flex; flex-direction: column; gap: 4px; }
    .goblin-select label { color: var(--text-secondary); font-size: 0.75rem; }
    .goblin-select select {
      background: var(--input-bg);
      color: var(--text-primary);
      border: 1px solid var(--border-primary);
      border-radius: 4px;
      padding: 6px 8px;
    }
  `]
})
export class TaskListComponent {
  taskService = inject(TaskService);

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
    return goblin ? `${goblin.avatar} ${goblin.name}` : 'Unknown';
  }

  getPriorityColor(priority: string): string {
    return PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG]?.color || '#fff';
  }

  getPriorityIcon(priority: string): string {
    return PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG]?.icon || '⚪';
  }
}
