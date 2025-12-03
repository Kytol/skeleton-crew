import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { QuestChain, CATEGORY_CONFIG } from '../../models/task.model';

@Component({
  selector: 'app-quest-chains',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div class="modal-overlay" (click)="close()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="close()">✕</button>
          <h2>📜 Quest Chains</h2>

          <div class="chains-list">
            @for (chain of chains(); track chain.id) {
              <div class="chain-card" [class.completed]="chain.completed" (click)="selectChain(chain)">
                <div class="chain-header">
                  <span class="chain-icon">{{ chain.icon }}</span>
                  <div class="chain-info">
                    <span class="chain-name">{{ chain.name }}</span>
                    <span class="chain-desc">{{ chain.description }}</span>
                  </div>
                  <div class="chain-progress">
                    <span class="step-count">{{ chain.currentStep }}/{{ chain.steps.length }}</span>
                    @if (chain.completed) {
                      <span class="completed-badge">✅</span>
                    }
                  </div>
                </div>

                @if (selectedChain()?.id === chain.id) {
                  <div class="chain-steps">
                    @for (step of chain.steps; track step.id; let i = $index) {
                      <div class="step" [class.active]="i === chain.currentStep" [class.completed]="step.completed" [class.locked]="i > chain.currentStep">
                        <div class="step-marker">
                          @if (step.completed) { ✅ }
                          @else if (i === chain.currentStep) { 🎯 }
                          @else { 🔒 }
                        </div>
                        <div class="step-content">
                          <span class="step-title">{{ step.title }}</span>
                          <span class="step-desc">{{ step.description }}</span>
                          @if (i === chain.currentStep && !step.completed) {
                            <div class="step-progress">
                              <div class="progress-bar">
                                <div class="progress-fill" [style.width.%]="(step.progress / step.requirement.target) * 100"></div>
                              </div>
                              <span class="progress-text">{{ step.progress }}/{{ step.requirement.target }}</span>
                            </div>
                          }
                          <div class="step-reward">
                            <span>💰 {{ step.reward.gold }}</span>
                            <span>✨ {{ step.reward.xp }} XP</span>
                          </div>
                        </div>
                      </div>
                    }
                    <div class="final-reward">
                      <span class="label">🏆 Final Reward:</span>
                      <span class="rewards">💰 {{ chain.finalReward.gold }} | ✨ {{ chain.finalReward.xp }} XP</span>
                    </div>
                  </div>
                }
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
    h2 { color: var(--accent-gold); margin: 0 0 20px; text-align: center; }
    .chains-list { display: flex; flex-direction: column; gap: 16px; }
    .chain-card { background: var(--card-overlay); border: 2px solid var(--border-primary); border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.3s; }
    .chain-card:hover { border-color: var(--accent-gold); }
    .chain-card.completed { opacity: 0.7; border-color: #5ac47a; }
    .chain-header { display: flex; align-items: center; gap: 12px; }
    .chain-icon { font-size: 2rem; }
    .chain-info { flex: 1; }
    .chain-name { display: block; color: var(--text-primary); font-weight: bold; font-size: 1.1rem; }
    .chain-desc { color: var(--text-muted); font-size: 0.85rem; }
    .chain-progress { text-align: right; }
    .step-count { color: var(--accent-gold); font-weight: bold; }
    .completed-badge { font-size: 1.5rem; display: block; }
    .chain-steps { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-secondary); }
    .step { display: flex; gap: 12px; padding: 12px; margin-bottom: 8px; border-radius: 8px; background: var(--bg-secondary); }
    .step.active { border: 1px solid var(--accent-gold); }
    .step.completed { opacity: 0.6; }
    .step.locked { opacity: 0.4; }
    .step-marker { font-size: 1.2rem; width: 30px; text-align: center; }
    .step-content { flex: 1; }
    .step-title { display: block; color: var(--text-primary); font-weight: bold; font-size: 0.9rem; }
    .step-desc { color: var(--text-muted); font-size: 0.8rem; }
    .step-progress { margin: 8px 0; }
    .progress-bar { height: 6px; background: var(--border-secondary); border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; background: var(--accent-gold); transition: width 0.3s; }
    .progress-text { color: var(--text-muted); font-size: 0.7rem; }
    .step-reward { display: flex; gap: 12px; margin-top: 6px; font-size: 0.8rem; color: var(--text-secondary); }
    .final-reward { display: flex; justify-content: space-between; padding: 12px; background: rgba(255,215,0,0.1); border-radius: 8px; margin-top: 12px; }
    .final-reward .label { color: var(--accent-gold); font-weight: bold; }
    .final-reward .rewards { color: var(--text-primary); }
  `]
})
export class QuestChainsComponent {
  private gameService = inject(GameService);
  chains = this.gameService.chains;
  isOpen = signal(false);
  selectedChain = signal<QuestChain | null>(null);

  open(): void { this.isOpen.set(true); }
  close(): void { this.isOpen.set(false); this.selectedChain.set(null); }

  selectChain(chain: QuestChain): void {
    this.selectedChain.set(this.selectedChain()?.id === chain.id ? null : chain);
  }
}
