import { Injectable, signal, computed, inject } from '@angular/core';
import {
  DailyQuest, Item, Weather, QuestChain, GameNotification, GoblinTemplate,
  WEATHER_CONFIG, SHOP_ITEMS, RECRUITABLE_GOBLINS, QUEST_CHAINS,
  WeatherType, NotificationType, TaskCategory, GoblinEquipment, ItemSlot
} from '../models/task.model';
import { TaskService } from './task.service';

@Injectable({ providedIn: 'root' })
export class GameService {
  private taskService = inject(TaskService);

  // Weather System
  private currentWeather = signal<Weather>(WEATHER_CONFIG.sunny);
  private weatherTimer: ReturnType<typeof setInterval> | null = null;

  // Daily Quests
  private dailyQuests = signal<DailyQuest[]>([]);
  private lastQuestRefresh = signal<string>('');

  // Inventory & Shop
  private inventory = signal<Item[]>([]);
  private goblinEquipment = signal<Map<string, GoblinEquipment>>(new Map());

  // Quest Chains
  private questChains = signal<QuestChain[]>(JSON.parse(JSON.stringify(QUEST_CHAINS)));

  // Notifications
  private notifications = signal<GameNotification[]>([]);
  private unreadCount = signal(0);

  // Recruitable Goblins
  private recruitableGoblins = signal<GoblinTemplate[]>(JSON.parse(JSON.stringify(RECRUITABLE_GOBLINS)));

  // Gold (shared with task service)
  private gold = signal(500);

  // Readonly signals
  readonly weather = this.currentWeather.asReadonly();
  readonly quests = this.dailyQuests.asReadonly();
  readonly items = this.inventory.asReadonly();
  readonly chains = this.questChains.asReadonly();
  readonly alerts = this.notifications.asReadonly();
  readonly unread = this.unreadCount.asReadonly();
  readonly goblinsForHire = this.recruitableGoblins.asReadonly();
  readonly playerGold = this.gold.asReadonly();
  readonly shopItems = SHOP_ITEMS;

  constructor() {
    this.initWeatherSystem();
    this.refreshDailyQuests();
  }

  // Weather System
  private initWeatherSystem(): void {
    this.changeWeather();
    this.weatherTimer = setInterval(() => this.changeWeather(), 5 * 60 * 1000); // Change every 5 mins
  }

  private changeWeather(): void {
    const weathers: WeatherType[] = ['sunny', 'rainy', 'stormy', 'foggy', 'magical'];
    const weights = [40, 25, 15, 15, 5]; // Magical is rare
    const random = Math.random() * 100;
    let cumulative = 0;
    let selected: WeatherType = 'sunny';

    for (let i = 0; i < weathers.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        selected = weathers[i];
        break;
      }
    }

    const newWeather = WEATHER_CONFIG[selected];
    if (newWeather.type !== this.currentWeather().type) {
      this.currentWeather.set(newWeather);
      this.addNotification('weather-change', 'Weather Changed!', `${newWeather.icon} ${newWeather.name}: ${newWeather.description}`, newWeather.icon);
    }
  }

  forceWeatherChange(): void {
    this.changeWeather();
  }


  // Daily Quests
  refreshDailyQuests(): void {
    const today = new Date().toDateString();
    if (this.lastQuestRefresh() === today) return;

    const quests: DailyQuest[] = [
      { id: 'dq-1', title: 'Task Crusher', description: 'Complete 3 tasks today', type: 'complete-tasks', target: 3, progress: 0, reward: 100, xpReward: 50, completed: false, icon: '✅' },
      { id: 'dq-2', title: 'Gold Rush', description: 'Earn 200 gold', type: 'earn-gold', target: 200, progress: 0, reward: 75, xpReward: 40, completed: false, icon: '💰' },
      { id: 'dq-3', title: 'Specialist', description: `Complete 2 ${this.getRandomCategory()} tasks`, type: 'category-focus', target: 2, progress: 0, reward: 150, xpReward: 75, completed: false, icon: '🎯', category: this.getRandomCategory() },
    ];

    this.dailyQuests.set(quests);
    this.lastQuestRefresh.set(today);
    this.addNotification('daily-bonus', 'New Daily Quests!', 'Fresh challenges await you today!', '📋');
  }

  private getRandomCategory(): TaskCategory {
    const categories: TaskCategory[] = ['mining', 'crafting', 'gathering', 'combat', 'exploration'];
    return categories[Math.floor(Math.random() * categories.length)];
  }

  updateQuestProgress(type: 'task' | 'gold' | 'category', amount: number, category?: TaskCategory): void {
    this.dailyQuests.update(quests => quests.map(q => {
      if (q.completed) return q;
      let newProgress = q.progress;

      if (type === 'task' && (q.type === 'complete-tasks' || q.type === 'speed-run')) {
        newProgress = q.progress + amount;
      } else if (type === 'gold' && q.type === 'earn-gold') {
        newProgress = q.progress + amount;
      } else if (type === 'category' && q.type === 'category-focus' && q.category === category) {
        newProgress = q.progress + amount;
      }

      const completed = newProgress >= q.target;
      if (completed && !q.completed) {
        this.gold.update(g => g + q.reward);
        this.addNotification('quest-complete', 'Quest Complete!', `${q.title} - Earned ${q.reward} gold!`, q.icon);
      }

      return { ...q, progress: Math.min(newProgress, q.target), completed };
    }));
  }

  // Inventory & Equipment
  buyItem(itemId: string): boolean {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item || this.gold() < item.price) return false;

    this.gold.update(g => g - item.price);
    this.inventory.update(inv => {
      const existing = inv.find(i => i.id === itemId);
      if (existing && item.type === 'consumable') {
        return inv.map(i => i.id === itemId ? { ...i, quantity: (i.quantity || 1) + 1 } : i);
      }
      return [...inv, { ...item, quantity: 1 }];
    });
    this.addNotification('item-found', 'Item Purchased!', `You bought ${item.name}!`, item.icon);
    return true;
  }

  equipItem(goblinId: string, item: Item): void {
    if (!item.slot) return;
    this.goblinEquipment.update(map => {
      const current = map.get(goblinId) || {};
      const updated = { ...current, [item.slot as ItemSlot]: item };
      const newMap = new Map(map);
      newMap.set(goblinId, updated);
      return newMap;
    });
  }

  unequipItem(goblinId: string, slot: ItemSlot): void {
    this.goblinEquipment.update(map => {
      const current = map.get(goblinId);
      if (!current) return map;
      const updated = { ...current };
      delete updated[slot];
      const newMap = new Map(map);
      newMap.set(goblinId, updated);
      return newMap;
    });
  }

  getGoblinEquipment(goblinId: string): GoblinEquipment {
    return this.goblinEquipment().get(goblinId) || {};
  }

  useConsumable(itemId: string, goblinId: string): boolean {
    const item = this.inventory().find(i => i.id === itemId && i.type === 'consumable');
    if (!item || !item.quantity) return false;

    if (item.stats.energyBonus) {
      this.taskService.restGoblin(goblinId);
    }

    this.inventory.update(inv => inv.map(i => {
      if (i.id !== itemId) return i;
      const newQty = (i.quantity || 1) - 1;
      return newQty > 0 ? { ...i, quantity: newQty } : i;
    }).filter(i => i.type !== 'consumable' || (i.quantity && i.quantity > 0)));

    return true;
  }


  // Quest Chains
  updateChainProgress(type: 'complete-task' | 'earn-gold' | 'reach-level' | 'category-tasks', amount: number, category?: TaskCategory): void {
    this.questChains.update(chains => chains.map(chain => {
      if (chain.completed) return chain;
      const steps = chain.steps.map((step, idx) => {
        if (step.completed || idx !== chain.currentStep) return step;
        if (step.requirement.type !== type) return step;
        if (type === 'category-tasks' && step.requirement.category !== category) return step;

        const newProgress = step.progress + amount;
        const completed = newProgress >= step.requirement.target;

        if (completed && !step.completed) {
          this.gold.update(g => g + step.reward.gold);
          this.addNotification('quest-complete', 'Quest Step Complete!', `${step.title} - ${chain.name}`, '📜');
        }

        return { ...step, progress: Math.min(newProgress, step.requirement.target), completed };
      });

      const currentStep = steps.findIndex(s => !s.completed);
      const chainCompleted = currentStep === -1;

      if (chainCompleted && !chain.completed) {
        this.gold.update(g => g + chain.finalReward.gold);
        this.addNotification('quest-complete', 'Quest Chain Complete!', `${chain.name} - Earned ${chain.finalReward.gold} gold!`, '🏆');
      }

      return { ...chain, steps, currentStep: currentStep === -1 ? steps.length : currentStep, completed: chainCompleted };
    }));
  }

  // Notifications
  addNotification(type: NotificationType, title: string, message: string, icon: string): void {
    const notification: GameNotification = {
      id: crypto.randomUUID(),
      type, title, message, icon,
      timestamp: new Date(),
      read: false
    };
    this.notifications.update(n => [notification, ...n].slice(0, 50));
    this.unreadCount.update(c => c + 1);
  }

  markAsRead(id: string): void {
    this.notifications.update(n => n.map(notif =>
      notif.id === id && !notif.read ? { ...notif, read: true } : notif
    ));
    this.unreadCount.update(c => Math.max(0, c - 1));
  }

  markAllAsRead(): void {
    this.notifications.update(n => n.map(notif => ({ ...notif, read: true })));
    this.unreadCount.set(0);
  }

  clearNotifications(): void {
    this.notifications.set([]);
    this.unreadCount.set(0);
  }

  // Goblin Recruitment
  recruitGoblin(templateId: string): boolean {
    const template = this.recruitableGoblins().find(g => g.id === templateId);
    if (!template || template.unlocked || this.gold() < template.cost) return false;

    this.gold.update(g => g - template.cost);
    this.recruitableGoblins.update(goblins =>
      goblins.map(g => g.id === templateId ? { ...g, unlocked: true } : g)
    );

    // Add to task service goblins
    this.taskService.addGoblin(template.id, template.name, template.avatar, template.specialty);
    this.addNotification('achievement', 'New Goblin Recruited!', `${template.name} has joined your team!`, template.avatar);
    return true;
  }

  // Gold Management
  addGold(amount: number): void {
    this.gold.update(g => g + amount);
    this.updateQuestProgress('gold', amount);
    this.updateChainProgress('earn-gold', amount);
  }

  spendGold(amount: number): boolean {
    if (this.gold() < amount) return false;
    this.gold.update(g => g - amount);
    return true;
  }

  // Calculate bonuses from equipment
  getEquipmentBonuses(goblinId: string, category: TaskCategory): { xp: number; gold: number; energy: number } {
    const equipment = this.getGoblinEquipment(goblinId);
    let xpBonus = 0, goldBonus = 0, energyBonus = 0;

    Object.values(equipment).forEach(item => {
      if (!item) return;
      xpBonus += item.stats.xpBonus || 0;
      goldBonus += item.stats.goldBonus || 0;
      energyBonus += item.stats.energyBonus || 0;
      if (item.stats.categoryBonus?.category === category) {
        xpBonus += item.stats.categoryBonus.bonus;
        goldBonus += item.stats.categoryBonus.bonus;
      }
    });

    return { xp: xpBonus, gold: goldBonus, energy: energyBonus };
  }

  // Get total multipliers including weather
  getTotalMultipliers(goblinId: string, category: TaskCategory): { xp: number; gold: number; energyCost: number } {
    const weather = this.currentWeather().effects;
    const equipment = this.getEquipmentBonuses(goblinId, category);
    const weatherCategoryBonus = weather.categoryBonus === category ? 0.25 : 0;

    return {
      xp: weather.xpMultiplier * (1 + equipment.xp + weatherCategoryBonus),
      gold: weather.goldMultiplier * (1 + equipment.gold + weatherCategoryBonus),
      energyCost: weather.energyCost
    };
  }
}
