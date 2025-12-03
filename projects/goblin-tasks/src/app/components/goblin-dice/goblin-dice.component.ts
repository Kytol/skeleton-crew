import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from 'ui-lib';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-goblin-dice',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    @if (isOpen()) {
      <div class="modal-overlay" (click)="close()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="close()">✕</button>
          <h2>🎲 Goblin Dice</h2>
          <p class="subtitle">Test your luck! Roll the dice to win gold!</p>

          <div class="gold-display">💰 {{ gameService.playerGold() }} Gold</div>

          <div class="bet-section">
            <span class="label">Bet Amount:</span>
            <div class="bet-buttons">
              @for (amount of betAmounts; track amount) {
                <button
                  class="bet-btn"
                  [class.selected]="currentBet() === amount"
                  [disabled]="gameService.playerGold() < amount || isRolling()"
                  (click)="currentBet.set(amount)">
                  {{ amount }}
                </button>
              }
            </div>
          </div>

          <div class="dice-area">
            <div class="dice" [class.rolling]="isRolling()">
              {{ isRolling() ? '🎲' : getDiceEmoji(diceResult()) }}
            </div>
            @if (lastResult()) {
              <div class="result" [class.win]="lastResult() === 'win'" [class.lose]="lastResult() === 'lose'">
                @if (lastResult() === 'win') {
                  <span>🎉 You won {{ winAmount() }} gold!</span>
                } @else if (lastResult() === 'jackpot') {
                  <span>🌟 JACKPOT! You won {{ winAmount() }} gold!</span>
                } @else {
                  <span>😢 Better luck next time!</span>
                }
              </div>
            }
          </div>

          <div class="rules">
            <h4>Rules:</h4>
            <ul>
              <li>🎯 Roll 4-6: Win 1.5x your bet</li>
              <li>⭐ Roll 6: Win 3x your bet (Jackpot!)</li>
              <li>💔 Roll 1-3: Lose your bet</li>
            </ul>
          </div>

          <ui-button
            variant="primary"
            [disabled]="gameService.playerGold() < currentBet() || isRolling()"
            (clicked)="rollDice()">
            {{ isRolling() ? 'Rolling...' : 'Roll Dice! 🎲' }}
          </ui-button>

          <div class="stats">
            <span>Wins: {{ wins() }}</span>
            <span>Losses: {{ losses() }}</span>
            <span>Net: {{ netGold() >= 0 ? '+' : '' }}{{ netGold() }}</span>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: var(--bg-secondary); border: 2px solid var(--accent-gold); border-radius: 16px; padding: 24px; max-width: 400px; width: 95%; text-align: center; position: relative; }
    .close-btn { position: absolute; top: 12px; right: 12px; background: transparent; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer; }
    h2 { color: var(--accent-gold); margin: 0 0 4px; }
    .subtitle { color: var(--text-muted); margin: 0 0 16px; font-size: 0.9rem; }
    .gold-display { font-size: 1.5rem; color: var(--accent-gold); margin-bottom: 20px; }
    .bet-section { margin-bottom: 24px; }
    .label { display: block; color: var(--text-secondary); margin-bottom: 8px; font-size: 0.9rem; }
    .bet-buttons { display: flex; justify-content: center; gap: 8px; }
    .bet-btn { padding: 8px 16px; border: 2px solid var(--border-primary); background: var(--card-overlay); color: var(--text-primary); border-radius: 8px; cursor: pointer; transition: all 0.2s; font-weight: bold; }
    .bet-btn:hover:not(:disabled) { border-color: var(--accent-gold); }
    .bet-btn.selected { background: var(--accent-gold); color: #000; border-color: var(--accent-gold); }
    .bet-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .dice-area { margin: 24px 0; }
    .dice { font-size: 5rem; transition: transform 0.1s; }
    .dice.rolling { animation: roll 0.1s linear infinite; }
    @keyframes roll { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .result { margin-top: 16px; padding: 12px; border-radius: 8px; font-weight: bold; font-size: 1.1rem; }
    .result.win { background: rgba(90,196,122,0.2); color: #5ac47a; }
    .result.lose { background: rgba(220,38,38,0.2); color: #ef4444; }
    .rules { text-align: left; background: var(--card-overlay); padding: 12px 16px; border-radius: 8px; margin: 20px 0; }
    .rules h4 { color: var(--text-primary); margin: 0 0 8px; font-size: 0.9rem; }
    .rules ul { margin: 0; padding-left: 20px; color: var(--text-muted); font-size: 0.8rem; }
    .rules li { margin: 4px 0; }
    .stats { display: flex; justify-content: center; gap: 20px; margin-top: 16px; color: var(--text-muted); font-size: 0.85rem; }
  `]
})
export class GoblinDiceComponent {
  gameService = inject(GameService);
  isOpen = signal(false);
  isRolling = signal(false);
  diceResult = signal(1);
  lastResult = signal<'win' | 'lose' | 'jackpot' | null>(null);
  winAmount = signal(0);
  currentBet = signal(10);
  wins = signal(0);
  losses = signal(0);
  netGold = signal(0);

  betAmounts = [10, 25, 50, 100];

  open(): void { this.isOpen.set(true); }
  close(): void { this.isOpen.set(false); }

  getDiceEmoji(num: number): string {
    const dice = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return dice[num - 1] || '🎲';
  }

  rollDice(): void {
    if (this.isRolling() || this.gameService.playerGold() < this.currentBet()) return;

    this.gameService.spendGold(this.currentBet());
    this.isRolling.set(true);
    this.lastResult.set(null);

    let rollCount = 0;
    const rollInterval = setInterval(() => {
      this.diceResult.set(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount >= 15) {
        clearInterval(rollInterval);
        this.finishRoll();
      }
    }, 100);
  }

  private finishRoll(): void {
    const result = Math.floor(Math.random() * 6) + 1;
    this.diceResult.set(result);
    this.isRolling.set(false);

    if (result === 6) {
      const win = this.currentBet() * 3;
      this.gameService.addGold(win);
      this.winAmount.set(win);
      this.lastResult.set('jackpot');
      this.wins.update(w => w + 1);
      this.netGold.update(n => n + win - this.currentBet());
    } else if (result >= 4) {
      const win = Math.floor(this.currentBet() * 1.5);
      this.gameService.addGold(win);
      this.winAmount.set(win);
      this.lastResult.set('win');
      this.wins.update(w => w + 1);
      this.netGold.update(n => n + win - this.currentBet());
    } else {
      this.lastResult.set('lose');
      this.losses.update(l => l + 1);
      this.netGold.update(n => n - this.currentBet());
    }
  }
}
