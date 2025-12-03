import { Injectable, signal, computed } from '@angular/core';
import {
  Treasury, Transaction, TradeOffer, CurrencyType, TransactionType,
  DEFAULT_CAPS, CURRENCY_CONFIG
} from '../models/economy.model';

@Injectable({ providedIn: 'root' })
export class EconomyService {
  private treasury = signal<Treasury>({
    gold: { type: 'gold', amount: 5000, cap: DEFAULT_CAPS.gold },
    gems: { type: 'gems', amount: 50, cap: DEFAULT_CAPS.gems },
    souls: { type: 'souls', amount: 10, cap: DEFAULT_CAPS.souls },
    totalEarned: 5000,
    totalSpent: 0,
  });

  private transactions = signal<Transaction[]>([
    {
      id: '1', type: 'reward', currency: 'gold', amount: 5000,
      description: 'Starting funds', timestamp: new Date(), balanceAfter: 5000
    }
  ]);

  private tradeOffers = signal<TradeOffer[]>(this.generateSampleTrades());

  readonly currentTreasury = this.treasury.asReadonly();
  readonly allTransactions = this.transactions.asReadonly();
  readonly allTradeOffers = this.tradeOffers.asReadonly();

  readonly openTrades = computed(() =>
    this.tradeOffers().filter(t => t.status === 'open')
  );

  readonly recentTransactions = computed(() =>
    this.transactions().slice(0, 20)
  );

  readonly goldBalance = computed(() => this.treasury().gold.amount);
  readonly gemsBalance = computed(() => this.treasury().gems.amount);
  readonly soulsBalance = computed(() => this.treasury().souls.amount);

  getBalance(currency: CurrencyType): number {
    return this.treasury()[currency].amount;
  }

  canAfford(currency: CurrencyType, amount: number): boolean {
    return this.treasury()[currency].amount >= amount;
  }

  earn(currency: CurrencyType, amount: number, description: string): boolean {
    const current = this.treasury()[currency];
    const newAmount = Math.min(current.amount + amount, current.cap);
    const actualEarned = newAmount - current.amount;

    if (actualEarned <= 0) return false;

    this.treasury.update(t => ({
      ...t,
      [currency]: { ...t[currency], amount: newAmount },
      totalEarned: t.totalEarned + actualEarned,
    }));

    this.addTransaction('earn', currency, actualEarned, description);
    return true;
  }

  spend(currency: CurrencyType, amount: number, description: string): boolean {
    if (!this.canAfford(currency, amount)) return false;

    const newAmount = this.treasury()[currency].amount - amount;

    this.treasury.update(t => ({
      ...t,
      [currency]: { ...t[currency], amount: newAmount },
      totalSpent: t.totalSpent + amount,
    }));

    this.addTransaction('spend', currency, -amount, description);
    return true;
  }

  private addTransaction(type: TransactionType, currency: CurrencyType, amount: number, description: string): void {
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      type,
      currency,
      amount,
      description,
      timestamp: new Date(),
      balanceAfter: this.treasury()[currency].amount,
    };
    this.transactions.update(list => [transaction, ...list]);
  }

  // Trading
  createTradeOffer(data: {
    offerCurrency: CurrencyType;
    offerAmount: number;
    askingCurrency: CurrencyType;
    askingAmount: number;
  }): boolean {
    if (!this.canAfford(data.offerCurrency, data.offerAmount)) return false;

    // Reserve the offered currency
    this.spend(data.offerCurrency, data.offerAmount, 'Trade offer created');

    const offer: TradeOffer = {
      id: crypto.randomUUID(),
      sellerId: 'user-1',
      sellerName: 'You',
      offerType: 'currency',
      offerCurrency: data.offerCurrency,
      offerAmount: data.offerAmount,
      askingCurrency: data.askingCurrency,
      askingAmount: data.askingAmount,
      status: 'open',
      createdAt: new Date(),
    };

    this.tradeOffers.update(list => [offer, ...list]);
    return true;
  }

  acceptTrade(tradeId: string): boolean {
    const trade = this.tradeOffers().find(t => t.id === tradeId);
    if (!trade || trade.status !== 'open') return false;
    if (trade.sellerId === 'user-1') return false; // Can't accept own trade

    if (!this.canAfford(trade.askingCurrency, trade.askingAmount)) return false;

    // Pay the asking price
    this.spend(trade.askingCurrency, trade.askingAmount, `Trade with ${trade.sellerName}`);

    // Receive the offered currency
    if (trade.offerCurrency && trade.offerAmount) {
      this.earn(trade.offerCurrency, trade.offerAmount, `Trade with ${trade.sellerName}`);
    }

    this.tradeOffers.update(list =>
      list.map(t => t.id === tradeId ? { ...t, status: 'completed' as const } : t)
    );

    return true;
  }

  cancelTrade(tradeId: string): boolean {
    const trade = this.tradeOffers().find(t => t.id === tradeId);
    if (!trade || trade.status !== 'open' || trade.sellerId !== 'user-1') return false;

    // Refund the offered currency
    if (trade.offerCurrency && trade.offerAmount) {
      this.earn(trade.offerCurrency, trade.offerAmount, 'Trade cancelled - refund');
    }

    this.tradeOffers.update(list =>
      list.map(t => t.id === tradeId ? { ...t, status: 'cancelled' as const } : t)
    );

    return true;
  }

  private generateSampleTrades(): TradeOffer[] {
    return [
      {
        id: 't1', sellerId: 'npc-1', sellerName: 'Dark Merchant',
        offerType: 'currency', offerCurrency: 'gems', offerAmount: 10,
        askingCurrency: 'gold', askingAmount: 2000,
        status: 'open', createdAt: new Date(Date.now() - 3600000)
      },
      {
        id: 't2', sellerId: 'npc-2', sellerName: 'Soul Trader',
        offerType: 'currency', offerCurrency: 'souls', offerAmount: 5,
        askingCurrency: 'gems', askingAmount: 15,
        status: 'open', createdAt: new Date(Date.now() - 7200000)
      },
      {
        id: 't3', sellerId: 'npc-3', sellerName: 'Gold Baron',
        offerType: 'currency', offerCurrency: 'gold', offerAmount: 5000,
        askingCurrency: 'souls', askingAmount: 20,
        status: 'open', createdAt: new Date(Date.now() - 86400000)
      },
    ];
  }
}
