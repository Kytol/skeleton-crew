import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { CATEGORY_CONFIG } from '../../models/task.model';

@Component({
  selector: 'app-daily-quests',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="daily-quests">
      <div class="header">
        <h3>📋 Daily Quests</h3>
        <span class="reset-timer">Resets at midnight</span>
      </div>
      <div class="quests-list">
        @for (quest of quests(); track quest.id) {
          <div class="quest-item" [class.completed]="quest.completed">
            <span class="quest-icon">{{ quest.icon }}</span>
            <div class="quest-info">
              <span class="quest-title">{{ quest.title }}</span>
              <span class="quest-desc">
                {{ quest.description }}
                @if (quest.category) {
                  <span class="category-tag">{{ getCategoryIcon(quest.category) }}</span>
                }
              </span>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="(quest.progress / quest.target) * 100"></div>
              </div>
              <span class="progress-text">{{ quest.progress }}/{{ quest.target }}</span>
            </div>
            <div class="quest-rewards">
              <span class="reward gold">💰 {{ quest.reward }}</span>
              <span class="reward xp">✨ {{ quest.xpReward }} XP</span>
            </div>
            @if (quest.completed) {
              <span class="completed-badge">✅</span>
            }
          </div>
        }
        @if (quests().length === 0) {
          <div class="no-quests">Loading daily quests...</div>
        }
      </div>
    </div>
  `,
  styles: [`
    .daily-quests {
      background: var(--bg-card);
      border: 2px solid var(--border-primary);
      border-radius: 12px;
      padding: 16px;
    }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    h3 { color: var(--accent-gold); margin: 0; font-size: 1.1rem; }
    .reset-timer { color: var(--text-muted); font-size: 0.75rem; }
    .quests-list { display: flex; flex-direction: column; gap: 12px; }
    .quest-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px; background: var(--card-overlay);
      border-radius: 8px; border: 1px solid transparent;
      transition: all 0.3s;
    }
    .quest-item:hover { border-color: var(--border-primary); }
    .quest-item.completed { opacity: 0.7; background: rgba(76,154,107,0.1); }
    .quest-icon { font-size: 1.5rem; }
    .quest-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .quest-title { color: var(--text-primary); font-weight: bold; font-size: 0.9rem; }
    .quest-desc { color: var(--text-muted); font-size: 0.8rem; display: flex; align-items: center; gap: 6px; }
    .category-tag { font-size: 1rem; }
    .progress-bar { height: 6px; background: var(--border-secondary); border-radius: 3px; overflow: hidden; margin-top: 4px; }
    .progress-fill { height: 100%; background: var(--accent-gold); transition: width 0.3s; }
    .progress-text { color: var(--text-muted); font-size: 0.7rem; }
    .quest-rewards { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
    .reward { font-size: 0.8rem; padding: 2px 6px; border-radius: 4px; }
    .reward.gold { color: var(--accent-gold); }
    .reward.xp { color: #a78bfa; }
    .completed-badge { font-size: 1.2rem; }
    .no-quests { color: var(--text-muted); text-align: center; padding: 20px; }
  `]
})
export class DailyQuestsComponent {
  private gameService = inject(GameService);
  quests = this.gameService.quests;

  getCategoryIcon(cat: string): string {
    return CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG]?.icon || '📋';
  }
}
