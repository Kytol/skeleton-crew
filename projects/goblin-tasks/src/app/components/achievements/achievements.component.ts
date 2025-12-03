import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { ACHIEVEMENTS } from '../../models/task.model';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="achievements-panel">
      <h3>🏆 Achievements ({{ taskService.achievements().length }}/{{ allAchievements.length }})</h3>
      <div class="achievements-grid">
        @for (ach of allAchievements; track ach.id) {
          <div class="achievement" [class.unlocked]="isUnlocked(ach.id)">
            <span class="icon">{{ ach.icon }}</span>
            <div class="info">
              <span class="name">{{ ach.name }}</span>
              <span class="desc">{{ ach.description }}</span>
            </div>
            @if (isUnlocked(ach.id)) {
              <span class="check">✅</span>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .achievements-panel {
      background: var(--bg-card);
      border: 2px solid var(--border-primary);
      border-radius: 12px;
      padding: 20px;
      margin-top: 24px;
    }
    h3 { color: var(--accent-gold); margin: 0 0 16px; font-size: 1.1rem; }
    .achievements-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
    .achievement {
      display: flex; align-items: center; gap: 12px;
      padding: 12px; background: var(--card-overlay);
      border-radius: 8px; opacity: 0.5;
      border: 2px solid transparent;
    }
    .achievement.unlocked { opacity: 1; border-color: var(--accent-gold); background: rgba(255,215,0,0.1); }
    .icon { font-size: 1.5rem; }
    .info { flex: 1; display: flex; flex-direction: column; }
    .name { color: var(--text-primary); font-weight: bold; font-size: 0.9rem; }
    .desc { color: var(--text-muted); font-size: 0.75rem; }
    .check { font-size: 1rem; }
  `]
})
export class AchievementsComponent {
  taskService = inject(TaskService);
  allAchievements = ACHIEVEMENTS;

  isUnlocked(id: string): boolean {
    return this.taskService.achievements().includes(id);
  }
}
