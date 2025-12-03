export type CurrencyType = 'gold' | 'gems' | 'souls';
export type TransactionType = 'earn' | 'spend' | 'trade' | 'reward';

export interface Currency {
  type: CurrencyType;
  amount: number;
  cap: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  currency: CurrencyType;
  amount: number;
  description: string;
  timestamp: Date;
  balanceAfter: number;
}

export interface TradeOffer {
  id: string;
  sellerId: string;
  sellerName: string;
  offerType: 'currency' | 'mercenary' | 'item';
  offerCurrency?: CurrencyType;
  offerAmount?: number;
  offerItemName?: string;
  askingCurrency: CurrencyType;
  askingAmount: number;
  status: 'open' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface Treasury {
  gold: Currency;
  gems: Currency;
  souls: Currency;
  totalEarned: number;
  totalSpent: number;
}

export const CURRENCY_CONFIG: Record<CurrencyType, { icon: string; color: string; label: string }> = {
  gold: { icon: '💰', color: '#ffd700', label: 'Gold' },
  gems: { icon: '💎', color: '#5ac4c4', label: 'Gems' },
  souls: { icon: '👻', color: '#a35ac4', label: 'Souls' },
};

export const DEFAULT_CAPS: Record<CurrencyType, number> = {
  gold: 100000,
  gems: 1000,
  souls: 500,
};
