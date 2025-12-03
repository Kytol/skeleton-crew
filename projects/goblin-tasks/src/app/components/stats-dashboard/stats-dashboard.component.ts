import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-stats-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="stats-dashboard">
      <div class="current-time">
        <span class="time">🕐 {{ currentTime | date:'mediumTime' }}</span>
        <span class="date">{{ currentTime | date:'fullDate' }}</span>
      </div>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value">{{ stats().total }}</span>
          <span class="stat-label">Total Tasks</span>
        </div>
        <div class="stat-card pending">
          <span class="stat-value">{{ stats().pending }}</span>
          <span class="stat-label">Pending</span>
        </div>
        <div class="stat-card progress">
          <span class="stat-value">{{ stats().inProgress }}</span>
          <span class="stat-label">In Progress</span>
        </div>
        <div class="stat-card completed">
          <span class="stat-value">{{ stats().completed }}</span>
          <span class="stat-label">Completed</span>
        </div>
        @if (stats().overdue > 0) {
          <div class="stat-card overdue">
            <span class="stat-value">{{ stats().overdue }}</span>
            <span class="stat-label">⚠️ Overdue</span>
          </div>
        }
        <div class="stat-card gold">
          <span class="stat-value">{{ stats().totalRewardsEarned }}</span>
          <span class="stat-label">💰 Gold Earned</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-dashboard {
      background: var(--bg-stats);
      border: 2px solid var(--border-stats);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
      transition: all 0.3s;
    }
    .current-time {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-secondary);
    }
    .time { color: var(--accent-gold); font-size: 1.25rem; font-weight: bold; }
    .date { color: var(--text-secondary); font-size: 0.9rem; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 12px;
    }
    .stat-card {
      background: var(--card-overlay);
      border-radius: 8px;
      padding: 12px;
      text-align: center;
      transition: all 0.3s;
    }
    .stat-value { display: block; font-size: 1.5rem; font-weight: bold; color: var(--text-white); }
    .stat-label { display: block; font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; }
    .stat-card.pending { border-left: 3px solid var(--border-primary); }
    .stat-card.progress { border-left: 3px solid var(--border-progress); }
    .stat-card.completed { border-left: 3px solid var(--border-completed); }
    .stat-card.overdue { border-left: 3px solid var(--border-overdue); background: rgba(154,76,76,0.2); }
    .stat-card.gold { border-left: 3px solid var(--accent-gold); }
  `]
})
export class StatsDashboardComponent {
  private taskService = inject(TaskService);
  stats = this.taskService.stats;
  currentTime = new Date();

  constructor() {
    setInterval(() => this.currentTime = new Date(), 1000);
  }
}
