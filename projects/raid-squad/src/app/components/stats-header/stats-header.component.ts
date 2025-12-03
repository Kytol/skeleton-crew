import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MercenaryService } from '../../services/mercenary.service';

@Component({
  selector: 'app-stats-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-header">
      <div class="stat-item">
        <span class="stat-value">{{ stats().total }}</span>
        <span class="stat-label">Total Mercenaries</span>
      </div>
      <div class="stat-item available">
        <span class="stat-value">{{ stats().available }}</span>
        <span class="stat-label">Available</span>
      </div>
      <div class="stat-item hired">
        <span class="stat-value">{{ stats().hired }}</span>
        <span class="stat-label">Hired</span>
      </div>
      <div class="stat-item mission">
        <span class="stat-value">{{ stats().onMission }}</span>
        <span class="stat-label">On Mission</span>
      </div>
    </div>
  `,
  styles: [`
    .stats-header {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .stat-item {
      flex: 1;
      min-width: 140px;
      background: var(--bg-card);
      border: 2px solid var(--border-primary);
      border-radius: 12px;
      padding: 16px 20px;
      text-align: center;
    }
    .stat-item.available { border-color: #4c9a6b; }
    .stat-item.hired { border-color: #6b4c9a; }
    .stat-item.mission { border-color: #9a6b4c; }
    .stat-value {
      display: block;
      font-size: 2rem;
      font-weight: bold;
      color: var(--accent-gold);
    }
    .stat-label {
      display: block;
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-top: 4px;
    }
  `]
})
export class StatsHeaderComponent {
  private mercenaryService = inject(MercenaryService);
  stats = this.mercenaryService.stats;
}
