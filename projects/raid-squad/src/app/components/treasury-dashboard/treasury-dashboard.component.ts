import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from 'ui-lib';
import { EconomyService } from '../../services/economy.service';
import { CurrencyType, CURRENCY_CONFIG } from '../../models/economy.model';

@Component({
  selector: 'app-treasury-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <div class="treasury-dashboard">
      <div class="dashboard-header">
        <h2>🏦 Treasury</h2>
        <div class="summary">
          <span class="earned">📈 Total Earned: {{ economyService.currentTreasury().totalEarned | number }}</span>
          <span class="spent">📉 Total Spent: {{ economyService.currentTreasury().totalSpent | number }}</span>
        </div>
      </div>

      <div class="currency-cards">
        @for (currency of currencies; track currency.type) {
          <div class="currency-card" [class]="currency.type">
            <div class="currency-icon">{{ currency.icon }}</div>
            <div class="currency-info">
              <span class="currency-name">{{ currency.label }}</span>
              <span class="currency-amount">{{ getBalance(currency.type) | number }}</span>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="getPercentage(currency.type)"></div>
              </div>
              <span class="currency-cap">/ {{ getCap(currency.type) | number }} cap</span>
            </div>
          </div>
        }
      </div>

      <div class="sections-grid">
        <div class="section transactions">
          <h3>📜 Transaction History</h3>
          <div class="transaction-list">
            @for (tx of economyService.recentTransactions(); track tx.id) {
              <div class="transaction-item" [class]="tx.type">
                <div class="tx-info">
                  <span class="tx-desc">{{ tx.description }}</span>
                  <span class="tx-time">{{ getTimeAgo(tx.timestamp) }}</span>
                </div>
                <span class="tx-amount" [class.positive]="tx.amount > 0" [class.negative]="tx.amount < 0">
                  {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount | number }} {{ getCurrencyIcon(tx.currency) }}
                </span>
              </div>
            }
          </div>
        </div>

        <div class="section trading">
          <h3>🔄 Trading Marketplace</h3>
          
          <div class="create-trade">
            <h4>Create Trade Offer</h4>
            <div class="trade-form">
              <div class="form-row">
                <label>Offer</label>
                <input type="number" [(ngModel)]="newTrade.offerAmount" min="1" />
                <select [(ngModel)]="newTrade.offerCurrency">
                  <option value="gold">💰 Gold</option>
                  <option value="gems">💎 Gems</option>
                  <option value="souls">👻 Souls</option>
                </select>
              </div>
              <div class="form-row">
                <label>For</label>
                <input type="number" [(ngModel)]="newTrade.askingAmount" min="1" />
                <select [(ngModel)]="newTrade.askingCurrency">
                  <option value="gold">💰 Gold</option>
                  <option value="gems">💎 Gems</option>
                  <option value="souls">👻 Souls</option>
                </select>
              </div>
              <ui-button variant="primary" size="sm" (clicked)="createTrade()">Post Trade</ui-button>
            </div>
          </div>

          <div class="trade-list">
            @for (trade of economyService.openTrades(); track trade.id) {
              <div class="trade-item">
                <div class="trade-offer">
                  <span class="seller">{{ trade.sellerName }}</span>
                  <div class="trade-details">
                    <span class="offering">
                      {{ getCurrencyIcon(trade.offerCurrency!) }} {{ trade.offerAmount }}
                    </span>
                    <span class="arrow">→</span>
                    <span class="asking">
                      {{ getCurrencyIcon(trade.askingCurrency) }} {{ trade.askingAmount }}
                    </span>
                  </div>
                </div>
                @if (trade.sellerId === 'user-1') {
                  <ui-button variant="outline" size="sm" (clicked)="cancelTrade(trade.id)">Cancel</ui-button>
                } @else {
                  <ui-button 
                    variant="primary" 
                    size="sm" 
                    [disabled]="!canAffordTrade(trade)"
                    (clicked)="acceptTrade(trade.id)"
                  >Accept</ui-button>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .treasury-dashboard { padding: 20px 0; }
    .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .dashboard-header h2 { color: var(--accent-gold); margin: 0; }
    .summary { display: flex; gap: 20px; }
    .earned { color: #5ac47a; }
    .spent { color: #c45a5a; }
    .currency-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .currency-card {
      background: var(--bg-card); border: 2px solid var(--border-primary);
      border-radius: 12px; padding: 20px; display: flex; gap: 16px; align-items: center;
    }
    .currency-card.gold { border-color: #ffd700; }
    .currency-card.gems { border-color: #5ac4c4; }
    .currency-card.souls { border-color: #a35ac4; }
    .currency-icon { font-size: 2.5rem; }
    .currency-info { flex: 1; }
    .currency-name { display: block; color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase; }
    .currency-amount { display: block; font-size: 1.5rem; font-weight: bold; color: var(--text-white); }
    .progress-bar { height: 4px; background: var(--border-secondary); border-radius: 2px; margin: 8px 0 4px; }
    .progress-fill { height: 100%; border-radius: 2px; transition: width 0.3s; }
    .currency-card.gold .progress-fill { background: #ffd700; }
    .currency-card.gems .progress-fill { background: #5ac4c4; }
    .currency-card.souls .progress-fill { background: #a35ac4; }
    .currency-cap { font-size: 0.75rem; color: var(--text-muted); }
    .sections-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    @media (max-width: 900px) { .sections-grid { grid-template-columns: 1fr; } }
    .section { background: var(--bg-card); border: 2px solid var(--border-primary); border-radius: 12px; padding: 20px; }
    .section h3 { color: var(--accent-gold); margin: 0 0 16px; font-size: 1rem; }
    .transaction-list { max-height: 400px; overflow-y: auto; }
    .transaction-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px; border-bottom: 1px solid var(--border-secondary);
    }
    .tx-info { display: flex; flex-direction: column; gap: 2px; }
    .tx-desc { color: var(--text-primary); font-size: 0.9rem; }
    .tx-time { color: var(--text-muted); font-size: 0.75rem; }
    .tx-amount { font-weight: bold; }
    .tx-amount.positive { color: #5ac47a; }
    .tx-amount.negative { color: #c45a5a; }
    .create-trade { background: var(--card-overlay); padding: 16px; border-radius: 8px; margin-bottom: 16px; }
    .create-trade h4 { color: var(--text-primary); margin: 0 0 12px; font-size: 0.9rem; }
    .trade-form { display: flex; flex-direction: column; gap: 12px; }
    .form-row { display: flex; align-items: center; gap: 8px; }
    .form-row label { width: 40px; color: var(--text-secondary); font-size: 0.85rem; }
    .form-row input { width: 80px; padding: 8px; background: var(--input-bg); color: var(--text-primary); border: 1px solid var(--border-primary); border-radius: 4px; }
    .form-row select { flex: 1; padding: 8px; background: var(--input-bg); color: var(--text-primary); border: 1px solid var(--border-primary); border-radius: 4px; }
    .trade-list { display: flex; flex-direction: column; gap: 8px; }
    .trade-item {
      display: flex; justify-content: space-between; align-items: center;
      background: var(--card-overlay); padding: 12px; border-radius: 8px;
    }
    .seller { display: block; color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 4px; }
    .trade-details { display: flex; align-items: center; gap: 8px; }
    .offering { color: #5ac47a; font-weight: bold; }
    .arrow { color: var(--text-muted); }
    .asking { color: #c45a5a; font-weight: bold; }
  `]
})
export class TreasuryDashboardComponent {
  economyService = inject(EconomyService);

  currencies = [
    { type: 'gold' as CurrencyType, ...CURRENCY_CONFIG.gold },
    { type: 'gems' as CurrencyType, ...CURRENCY_CONFIG.gems },
    { type: 'souls' as CurrencyType, ...CURRENCY_CONFIG.souls },
  ];

  newTrade = {
    offerCurrency: 'gold' as CurrencyType,
    offerAmount: 100,
    askingCurrency: 'gems' as CurrencyType,
    askingAmount: 5,
  };

  getBalance(type: CurrencyType): number {
    return this.economyService.currentTreasury()[type].amount;
  }

  getCap(type: CurrencyType): number {
    return this.economyService.currentTreasury()[type].cap;
  }

  getPercentage(type: CurrencyType): number {
    const t = this.economyService.currentTreasury()[type];
    return (t.amount / t.cap) * 100;
  }

  getCurrencyIcon(type: CurrencyType | undefined): string {
    if (!type) return '';
    return CURRENCY_CONFIG[type]?.icon || '';
  }

  getTimeAgo(date: Date): string {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  createTrade(): void {
    if (this.newTrade.offerAmount > 0 && this.newTrade.askingAmount > 0) {
      this.economyService.createTradeOffer(this.newTrade);
    }
  }

  acceptTrade(tradeId: string): void {
    this.economyService.acceptTrade(tradeId);
  }

  cancelTrade(tradeId: string): void {
    this.economyService.cancelTrade(tradeId);
  }

  canAffordTrade(trade: any): boolean {
    return this.economyService.canAfford(trade.askingCurrency, trade.askingAmount);
  }
}
