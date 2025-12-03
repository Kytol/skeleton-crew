import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from 'ui-lib';
import { GameService } from '../../services/game.service';
import { Item, RARITY_CONFIG } from '../../models/task.model';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    @if (isOpen()) {
      <div class="modal-overlay" (click)="close()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="close()">✕</button>
          <h2>🏪 Goblin Shop</h2>
          <div class="gold-display">💰 {{ gameService.playerGold() }} Gold</div>

          <div class="tabs">
            <button [class.active]="activeTab() === 'equipment'" (click)="activeTab.set('equipment')">⚔️ Equipment</button>
            <button [class.active]="activeTab() === 'consumables'" (click)="activeTab.set('consumables')">🧪 Consumables</button>
            <button [class.active]="activeTab() === 'inventory'" (click)="activeTab.set('inventory')">🎒 Inventory</button>
          </div>

          @if (activeTab() === 'equipment' || activeTab() === 'consumables') {
            <div class="items-grid">
              @for (item of getFilteredItems(); track item.id) {
                <div class="item-card" [style.border-color]="getRarityColor(item.rarity)" [style.box-shadow]="getRarityGlow(item.rarity)">
                  <span class="item-icon">{{ item.icon }}</span>
                  <div class="item-info">
                    <span class="item-name" [style.color]="getRarityColor(item.rarity)">{{ item.name }}</span>
                    <span class="item-desc">{{ item.description }}</span>
                    <div class="item-stats">
                      @if (item.stats.xpBonus) { <span>+{{ (item.stats.xpBonus * 100) | number:'1.0-0' }}% XP</span> }
                      @if (item.stats.goldBonus) { <span>+{{ (item.stats.goldBonus * 100) | number:'1.0-0' }}% Gold</span> }
                      @if (item.stats.energyBonus) { <span>+{{ item.stats.energyBonus }} Energy</span> }
                      @if (item.stats.categoryBonus) { <span>+{{ (item.stats.categoryBonus.bonus * 100) | number:'1.0-0' }}% {{ item.stats.categoryBonus.category | titlecase }}</span> }
                    </div>
                  </div>
                  <div class="item-price">
                    <span class="price">💰 {{ item.price }}</span>
                    <ui-button
                      [variant]="gameService.playerGold() >= item.price ? 'primary' : 'outline'"
                      size="sm"
                      [disabled]="gameService.playerGold() < item.price"
                      (clicked)="buyItem(item)">
                      Buy
                    </ui-button>
                  </div>
                </div>
              }
            </div>
          }

          @if (activeTab() === 'inventory') {
            <div class="items-grid">
              @for (item of gameService.items(); track item.id) {
                <div class="item-card owned" [style.border-color]="getRarityColor(item.rarity)">
                  <span class="item-icon">{{ item.icon }}</span>
                  <div class="item-info">
                    <span class="item-name" [style.color]="getRarityColor(item.rarity)">{{ item.name }}</span>
                    @if (item.quantity && item.quantity > 1) {
                      <span class="quantity">x{{ item.quantity }}</span>
                    }
                    <span class="item-type">{{ item.type | titlecase }}</span>
                  </div>
                </div>
              }
              @if (gameService.items().length === 0) {
                <div class="empty-inventory">Your inventory is empty. Buy some items!</div>
              }
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: var(--bg-secondary); border: 2px solid var(--accent-gold); border-radius: 16px; padding: 24px; max-width: 700px; width: 95%; max-height: 85vh; overflow-y: auto; position: relative; }
    .close-btn { position: absolute; top: 12px; right: 12px; background: transparent; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer; }
    h2 { color: var(--accent-gold); margin: 0 0 8px; text-align: center; }
    .gold-display { text-align: center; font-size: 1.25rem; color: var(--accent-gold); margin-bottom: 16px; }
    .tabs { display: flex; gap: 8px; margin-bottom: 20px; justify-content: center; }
    .tabs button { padding: 8px 16px; border: 2px solid var(--border-primary); background: transparent; color: var(--text-secondary); border-radius: 8px; cursor: pointer; transition: all 0.2s; }
    .tabs button.active { background: var(--accent-gold); color: #000; border-color: var(--accent-gold); }
    .items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
    .item-card { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--card-overlay); border-radius: 10px; border: 2px solid; transition: transform 0.2s; }
    .item-card:hover { transform: translateY(-2px); }
    .item-icon { font-size: 2rem; }
    .item-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .item-name { font-weight: bold; font-size: 0.95rem; }
    .item-desc { color: var(--text-muted); font-size: 0.75rem; }
    .item-stats { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
    .item-stats span { font-size: 0.7rem; padding: 2px 6px; background: rgba(76,154,107,0.2); color: #5ac47a; border-radius: 4px; }
    .item-price { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .price { color: var(--accent-gold); font-weight: bold; font-size: 0.9rem; }
    .quantity { color: var(--text-muted); font-size: 0.8rem; }
    .item-type { color: var(--text-muted); font-size: 0.7rem; text-transform: uppercase; }
    .empty-inventory { grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 40px; }
  `]
})
export class ShopComponent {
  gameService = inject(GameService);
  isOpen = signal(false);
  activeTab = signal<'equipment' | 'consumables' | 'inventory'>('equipment');

  open(): void { this.isOpen.set(true); }
  close(): void { this.isOpen.set(false); }

  getFilteredItems(): Item[] {
    return this.gameService.shopItems.filter(item =>
      this.activeTab() === 'consumables' ? item.type === 'consumable' : item.type !== 'consumable'
    );
  }

  getRarityColor(rarity: string): string {
    return RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG]?.color || '#9d9d9d';
  }

  getRarityGlow(rarity: string): string {
    return RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG]?.glow || 'none';
  }

  buyItem(item: Item): void {
    this.gameService.buyItem(item.id);
  }
}
