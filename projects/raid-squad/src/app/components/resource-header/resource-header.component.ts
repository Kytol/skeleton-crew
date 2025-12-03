import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EconomyService } from '../../services/economy.service';
import { CURRENCY_CONFIG } from '../../models/economy.model';

@Component({
  selector: 'app-resource-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="resource-header">
      <div class="resource gold">
        <span class="icon">💰</span>
        <span class="amount">{{ economyService.goldBalance() | number }}</span>
        <span class="label">Gold</span>
      </div>
      <div class="resource gems">
        <span class="icon">💎</span>
        <span class="amount">{{ economyService.gemsBalance() }}</span>
        <span class="label">Gems</span>
      </div>
      <div class="resource souls">
        <span class="icon">👻</span>
        <span class="amount">{{ economyService.soulsBalance() }}</span>
        <span class="label">Souls</span>
      </div>
    </div>
  `,
  styles: [`
    .resource-header {
      display: flex;
      gap: 16px;
      background: var(--bg-card);
      border: 2px solid var(--border-primary);
      border-radius: 30px;
      padding: 8px 20px;
    }
    .resource {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 20px;
      background: var(--card-overlay);
    }
    .icon { font-size: 1.1rem; }
    .amount { font-weight: bold; font-size: 0.95rem; }
    .label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; }
    .resource.gold .amount { color: #ffd700; }
    .resource.gems .amount { color: #5ac4c4; }
    .resource.souls .amount { color: #a35ac4; }
  `]
})
export class ResourceHeaderComponent {
  economyService = inject(EconomyService);
}
