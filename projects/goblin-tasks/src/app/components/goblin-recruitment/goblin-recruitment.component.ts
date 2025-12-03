import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from 'ui-lib';
import { GameService } from '../../services/game.service';
import { CATEGORY_CONFIG } from '../../models/task.model';

@Component({
  selector: 'app-goblin-recruitment',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    @if (isOpen()) {
      <div class="modal-overlay" (click)="close()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="close()">✕</button>
          <h2>🧌 Goblin Recruitment</h2>
          <div class="gold-display">💰 {{ gameService.playerGold() }} Gold</div>

          <div class="goblins-grid">
            @for (goblin of goblins(); track goblin.id) {
              <div class="goblin-card" [class.unlocked]="goblin.unlocked">
                <div class="goblin-avatar">{{ goblin.avatar }}</div>
                <div class="goblin-info">
                  <span class="goblin-name">{{ goblin.name }}</span>
                  <span class="goblin-specialty">
                    {{ getCategoryIcon(goblin.specialty) }} {{ goblin.specialty | titlecase }} Specialist
                  </span>
                  <span class="goblin-desc">{{ goblin.description }}</span>
                  <span class="goblin-bonus">✨ {{ goblin.bonusAbility }}</span>
                </div>
                <div class="goblin-action">
                  @if (goblin.unlocked) {
                    <span class="recruited">✅ Recruited</span>
                  } @else {
                    <span class="cost">💰 {{ goblin.cost }}</span>
                    <ui-button
                      [variant]="gameService.playerGold() >= goblin.cost ? 'primary' : 'outline'"
                      size="sm"
                      [disabled]="gameService.playerGold() < goblin.cost"
                      (clicked)="recruit(goblin.id)">
                      Recruit
                    </ui-button>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: var(--bg-secondary); border: 2px solid var(--accent-gold); border-radius: 16px; padding: 24px; max-width: 600px; width: 95%; max-height: 85vh; overflow-y: auto; position: relative; }
    .close-btn { position: absolute; top: 12px; right: 12px; background: transparent; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer; }
    h2 { color: var(--accent-gold); margin: 0 0 8px; text-align: center; }
    .gold-display { text-align: center; font-size: 1.25rem; color: var(--accent-gold); margin-bottom: 20px; }
    .goblins-grid { display: flex; flex-direction: column; gap: 12px; }
    .goblin-card {
      display: flex; align-items: center; gap: 16px;
      padding: 16px; background: var(--card-overlay);
      border: 2px solid var(--border-primary);
      border-radius: 12px; transition: all 0.3s;
    }
    .goblin-card:hover { border-color: var(--accent-gold); }
    .goblin-card.unlocked { opacity: 0.7; border-color: #5ac47a; }
    .goblin-avatar { font-size: 3rem; }
    .goblin-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .goblin-name { color: var(--text-primary); font-weight: bold; font-size: 1.1rem; }
    .goblin-specialty { color: var(--text-secondary); font-size: 0.85rem; }
    .goblin-desc { color: var(--text-muted); font-size: 0.8rem; font-style: italic; }
    .goblin-bonus { color: #a78bfa; font-size: 0.8rem; }
    .goblin-action { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .cost { color: var(--accent-gold); font-weight: bold; font-size: 1rem; }
    .recruited { color: #5ac47a; font-weight: bold; }
  `]
})
export class GoblinRecruitmentComponent {
  gameService = inject(GameService);
  goblins = this.gameService.goblinsForHire;
  isOpen = signal(false);

  open(): void { this.isOpen.set(true); }
  close(): void { this.isOpen.set(false); }

  getCategoryIcon(cat: string): string {
    return CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG]?.icon || '📋';
  }

  recruit(goblinId: string): void {
    this.gameService.recruitGoblin(goblinId);
  }
}
