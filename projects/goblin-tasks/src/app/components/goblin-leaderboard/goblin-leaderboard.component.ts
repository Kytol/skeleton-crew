import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-goblin-leaderboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="leaderboard">
      <h2>🏅 Goblin Leaderboard</h2>
      <div class="goblin-cards">
        @for (goblin of sortedGoblins(); track goblin.id; let i = $index) {
          <div class="goblin-card" [class.top]="i === 0 && goblin.totalRewards > 0">
            <span class="rank">{{ getRankBadge(i) }}</span>
            <span class="avatar">{{ goblin.avatar }}</span>
            <div class="goblin-info">
              <span class="name">{{ goblin.name }}</span>
              <span class="specialty">{{ goblin.specialty }}</span>
              <div class="stats">
                <span class="gold">💰 {{ goblin.totalRewards }}</span>
                <span class="tasks">✅ {{ goblin.tasksCompleted }}</span>
              </div>
            </div>
            @if (goblin.tasksCompleted > 0) {
              <div class="efficiency">
                <span class="avg">{{ getAvgReward(goblin) }}</span>
                <span class="label">avg/task</span>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .leaderboard {
      background: var(--bg-leaderboard);
      border: 2px solid var(--border-leaderboard);
      border-radius: 12px;
      padding: 24px;
      transition: all 0.3s;
    }
    h2 { color: var(--text-heading); margin: 0 0 20px; }
    .goblin-cards { display: flex; flex-direction: column; gap: 12px; }
    .goblin-card {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--card-overlay);
      border-radius: 8px;
      padding: 12px 16px;
      transition: all 0.3s;
    }
    .goblin-card.top {
      background: linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(255,215,0,0.05) 100%);
      border: 1px solid var(--accent-gold);
    }
    .rank { font-size: 1.25rem; width: 30px; text-align: center; }
    .avatar { font-size: 2rem; }
    .goblin-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .name { color: var(--text-white); font-weight: bold; font-size: 1rem; }
    .specialty { color: var(--text-muted); font-size: 0.75rem; }
    .stats { display: flex; gap: 12px; margin-top: 4px; }
    .gold { color: var(--accent-gold); font-size: 0.85rem; }
    .tasks { color: #a8c8b8; font-size: 0.85rem; }
    .efficiency {
      text-align: center;
      background: rgba(255,215,0,0.1);
      padding: 6px 10px;
      border-radius: 6px;
    }
    .efficiency .avg { display: block; color: var(--accent-gold); font-weight: bold; font-size: 0.9rem; }
    .efficiency .label { display: block; color: var(--text-muted); font-size: 0.65rem; }
  `]
})
export class GoblinLeaderboardComponent {
  private taskService = inject(TaskService);

  sortedGoblins = computed(() =>
    [...this.taskService.allGoblins()].sort((a, b) => b.totalRewards - a.totalRewards)
  );

  getRankBadge(index: number): string {
    const badges = ['🥇', '🥈', '🥉'];
    return badges[index] || `${index + 1}`;
  }

  getAvgReward(goblin: { totalRewards: number; tasksCompleted: number }): string {
    if (goblin.tasksCompleted === 0) return '0';
    return Math.round(goblin.totalRewards / goblin.tasksCompleted).toString();
  }
}
