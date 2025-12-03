import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from 'ui-lib';
import { Mercenary, RACE_CONFIG, CLASS_CONFIG } from '../../models/mercenary.model';

@Component({
  selector: 'app-mercenary-card',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="mercenary-card" [class]="mercenary.status" (click)="viewDetails.emit(mercenary)">
      <div class="card-header">
        <span class="avatar">{{ mercenary.avatar }}</span>
        <div class="level-badge">Lv.{{ mercenary.level }}</div>
        <div class="status-badge" [class]="mercenary.status">
          {{ getStatusLabel(mercenary.status) }}
        </div>
      </div>
      
      <div class="card-body">
        <h3>{{ mercenary.name }}</h3>
        <div class="tags">
          <span class="tag race" [style.background]="getRaceColor(mercenary.race)">
            {{ getRaceEmoji(mercenary.race) }} {{ mercenary.race }}
          </span>
          <span class="tag class" [style.background]="getClassColor(mercenary.class)">
            {{ getClassIcon(mercenary.class) }} {{ mercenary.class }}
          </span>
        </div>
        <p class="specialty">{{ mercenary.specialty }}</p>
        
        <div class="stats-preview">
          <div class="stat"><span>⚔️</span> {{ mercenary.stats.strength }}</div>
          <div class="stat"><span>🏃</span> {{ mercenary.stats.agility }}</div>
          <div class="stat"><span>✨</span> {{ mercenary.stats.magic }}</div>
          <div class="stat"><span>🛡️</span> {{ mercenary.stats.defense }}</div>
        </div>

        <div class="rating">
          @for (star of getStars(mercenary.rating); track $index) {
            <span>{{ star }}</span>
          }
          <span class="rating-value">{{ mercenary.rating }}</span>
        </div>
      </div>

      <div class="card-footer">
        <div class="cost">
          <span class="hire-cost">💰 {{ mercenary.hireCost }}</span>
          <span class="upkeep">📅 {{ mercenary.dailyUpkeep }}/day</span>
        </div>
        @if (mercenary.status === 'available') {
          <ui-button variant="primary" size="sm" (clicked)="hire($event)">Hire</ui-button>
        } @else if (mercenary.status === 'hired') {
          <ui-button variant="outline" size="sm" (clicked)="release($event)">Release</ui-button>
        }
      </div>
    </div>
  `,
  styles: [`
    .mercenary-card {
      background: var(--bg-card);
      border: 2px solid var(--border-primary);
      border-radius: 12px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .mercenary-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
    .mercenary-card.hired { border-color: var(--border-completed); }
    .mercenary-card.on-mission { border-color: var(--border-progress); opacity: 0.7; }
    .card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .avatar { font-size: 2.5rem; }
    .level-badge {
      background: var(--accent-gold); color: #000;
      padding: 4px 8px; border-radius: 4px;
      font-size: 0.75rem; font-weight: bold;
    }
    .status-badge {
      margin-left: auto; padding: 4px 8px; border-radius: 4px;
      font-size: 0.7rem; text-transform: uppercase;
    }
    .status-badge.available { background: #4c9a6b; color: #fff; }
    .status-badge.hired { background: #6b4c9a; color: #fff; }
    .status-badge.on-mission { background: #9a6b4c; color: #fff; }
    .card-body h3 { color: var(--text-white); margin: 0 0 8px; font-size: 1.1rem; }
    .tags { display: flex; gap: 8px; margin-bottom: 8px; }
    .tag {
      padding: 4px 8px; border-radius: 4px;
      font-size: 0.7rem; color: #fff;
    }
    .specialty { color: var(--text-muted); font-size: 0.8rem; margin: 0 0 12px; }
    .stats-preview { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 12px; }
    .stat {
      text-align: center; font-size: 0.8rem; color: var(--text-secondary);
      background: var(--card-overlay); padding: 6px; border-radius: 4px;
    }
    .stat span { display: block; font-size: 0.9rem; }
    .rating { display: flex; align-items: center; gap: 2px; margin-bottom: 12px; }
    .rating span { font-size: 0.9rem; }
    .rating-value { color: var(--accent-gold); margin-left: 8px; font-weight: bold; }
    .card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--border-secondary); }
    .cost { display: flex; flex-direction: column; gap: 4px; }
    .hire-cost { color: var(--accent-gold); font-weight: bold; font-size: 0.9rem; }
    .upkeep { color: var(--text-muted); font-size: 0.75rem; }
  `]
})
export class MercenaryCardComponent {
  @Input({ required: true }) mercenary!: Mercenary;
  @Output() viewDetails = new EventEmitter<Mercenary>();
  @Output() hireClick = new EventEmitter<Mercenary>();
  @Output() releaseClick = new EventEmitter<Mercenary>();

  getRaceEmoji(race: string): string { return RACE_CONFIG[race as keyof typeof RACE_CONFIG]?.emoji || ''; }
  getRaceColor(race: string): string { return RACE_CONFIG[race as keyof typeof RACE_CONFIG]?.color || '#666'; }
  getClassIcon(cls: string): string { return CLASS_CONFIG[cls as keyof typeof CLASS_CONFIG]?.icon || ''; }
  getClassColor(cls: string): string { return CLASS_CONFIG[cls as keyof typeof CLASS_CONFIG]?.color || '#666'; }

  getStatusLabel(status: string): string {
    return { available: 'Available', hired: 'Hired', 'on-mission': 'On Mission' }[status] || status;
  }

  getStars(rating: number): string[] {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    return [...Array(full).fill('⭐'), ...Array(half).fill('✨'), ...Array(5 - full - half).fill('☆')];
  }

  hire(e: Event): void {
    e.stopPropagation();
    this.hireClick.emit(this.mercenary);
  }

  release(e: Event): void {
    e.stopPropagation();
    this.releaseClick.emit(this.mercenary);
  }
}
