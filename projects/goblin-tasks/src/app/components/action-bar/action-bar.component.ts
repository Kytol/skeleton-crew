import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-action-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="action-bar">
      <button class="action-btn" (click)="openShop.emit()" title="Shop">
        🏪
        <span class="label">Shop</span>
      </button>
      <button class="action-btn" (click)="openQuests.emit()" title="Quest Chains">
        📜
        <span class="label">Quests</span>
      </button>
      <button class="action-btn" (click)="openRecruit.emit()" title="Recruit Goblins">
        🧌
        <span class="label">Recruit</span>
      </button>
      <button class="action-btn" (click)="openDice.emit()" title="Goblin Dice">
        🎲
        <span class="label">Dice</span>
      </button>
      <button class="action-btn" (click)="openAchievements.emit()" title="Achievements">
        🏆
        <span class="label">Trophies</span>
      </button>
    </div>
  `,
  styles: [`
    .action-bar {
      display: flex;
      justify-content: center;
      gap: 12px;
      padding: 12px;
      background: var(--card-overlay);
      border-radius: 12px;
      border: 2px solid var(--border-primary);
    }
    .action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 12px 20px;
      background: var(--bg-secondary);
      border: 2px solid var(--border-secondary);
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 1.5rem;
    }
    .action-btn:hover {
      border-color: var(--accent-gold);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255,215,0,0.2);
    }
    .label {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
    .action-btn:hover .label {
      color: var(--accent-gold);
    }
  `]
})
export class ActionBarComponent {
  openShop = output<void>();
  openQuests = output<void>();
  openRecruit = output<void>();
  openDice = output<void>();
  openAchievements = output<void>();
}
