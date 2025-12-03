import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from 'ui-lib';
import { Mercenary, RACE_CONFIG, CLASS_CONFIG } from '../../models/mercenary.model';

@Component({
  selector: 'app-mercenary-detail-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    @if (mercenary) {
      <div class="modal-overlay" (click)="close.emit()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="close.emit()">✕</button>
          
          <div class="modal-header">
            <span class="avatar">{{ mercenary.avatar }}</span>
            <div class="header-info">
              <h2>{{ mercenary.name }}</h2>
              <div class="tags">
                <span class="tag" [style.background]="getRaceColor(mercenary.race)">
                  {{ mercenary.race }}
                </span>
                <span class="tag" [style.background]="getClassColor(mercenary.class)">
                  {{ getClassIcon(mercenary.class) }} {{ mercenary.class }}
                </span>
                <span class="level">Level {{ mercenary.level }}</span>
              </div>
              <p class="specialty">{{ mercenary.specialty }}</p>
            </div>
          </div>

          <div class="stats-section">
            <h3>📊 Stats</h3>
            <div class="stats-grid">
              <div class="stat-bar">
                <span class="stat-label">⚔️ Strength</span>
                <div class="bar"><div class="fill" [style.width.%]="mercenary.stats.strength"></div></div>
                <span class="stat-value">{{ mercenary.stats.strength }}</span>
              </div>
              <div class="stat-bar">
                <span class="stat-label">🏃 Agility</span>
                <div class="bar"><div class="fill agility" [style.width.%]="mercenary.stats.agility"></div></div>
                <span class="stat-value">{{ mercenary.stats.agility }}</span>
              </div>
              <div class="stat-bar">
                <span class="stat-label">✨ Magic</span>
                <div class="bar"><div class="fill magic" [style.width.%]="mercenary.stats.magic"></div></div>
                <span class="stat-value">{{ mercenary.stats.magic }}</span>
              </div>
              <div class="stat-bar">
                <span class="stat-label">🛡️ Defense</span>
                <div class="bar"><div class="fill defense" [style.width.%]="mercenary.stats.defense"></div></div>
                <span class="stat-value">{{ mercenary.stats.defense }}</span>
              </div>
              <div class="stat-bar">
                <span class="stat-label">❤️ Health</span>
                <div class="bar"><div class="fill health" [style.width.%]="mercenary.stats.health / 10"></div></div>
                <span class="stat-value">{{ mercenary.stats.health }}</span>
              </div>
            </div>
          </div>

          <div class="skills-section">
            <h3>⚡ Skills</h3>
            <div class="skills-list">
              @for (skill of mercenary.skills; track skill.id) {
                <div class="skill-item">
                  <div class="skill-header">
                    <span class="skill-name">{{ skill.name }}</span>
                    <span class="cooldown">{{ skill.cooldown }}s CD</span>
                  </div>
                  <p class="skill-desc">{{ skill.description }}</p>
                  @if (skill.damage) {
                    <span class="damage">💥 {{ skill.damage }} damage</span>
                  }
                </div>
              }
            </div>
          </div>

          <div class="equipment-section">
            <h3>🎒 Equipment</h3>
            <div class="equipment-list">
              @for (item of mercenary.equipment; track item.id) {
                <div class="equipment-item">
                  <span class="slot">{{ getSlotIcon(item.slot) }}</span>
                  <span class="item-name">{{ item.name }}</span>
                  <span class="bonus">{{ formatBonus(item.bonus) }}</span>
                </div>
              }
            </div>
          </div>

          <div class="modal-footer">
            <div class="cost-info">
              <div class="cost-item">
                <span class="label">Hire Cost</span>
                <span class="value">💰 {{ mercenary.hireCost }}</span>
              </div>
              <div class="cost-item">
                <span class="label">Daily Upkeep</span>
                <span class="value">📅 {{ mercenary.dailyUpkeep }}</span>
              </div>
              <div class="cost-item">
                <span class="label">Missions</span>
                <span class="value">🎯 {{ mercenary.missionsCompleted }}</span>
              </div>
            </div>
            @if (mercenary.status === 'available') {
              <ui-button variant="primary" (clicked)="hire.emit(mercenary)">💰 Hire Now</ui-button>
            } @else if (mercenary.status === 'hired') {
              <ui-button variant="outline" (clicked)="release.emit(mercenary)">Release</ui-button>
            } @else {
              <span class="on-mission-label">🚀 Currently on mission</span>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.8);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 20px;
    }
    .modal-content {
      background: var(--bg-secondary); border: 2px solid var(--border-primary);
      border-radius: 16px; padding: 24px; max-width: 600px; width: 100%;
      max-height: 90vh; overflow-y: auto; position: relative;
    }
    .close-btn {
      position: absolute; top: 16px; right: 16px;
      background: transparent; border: none; color: var(--text-muted);
      font-size: 1.5rem; cursor: pointer;
    }
    .close-btn:hover { color: var(--text-primary); }
    .modal-header { display: flex; gap: 20px; margin-bottom: 24px; }
    .avatar { font-size: 4rem; }
    .header-info h2 { color: var(--text-white); margin: 0 0 8px; }
    .tags { display: flex; gap: 8px; margin-bottom: 8px; }
    .tag { padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; color: #fff; }
    .level { background: var(--accent-gold); color: #000; padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; }
    .specialty { color: var(--text-secondary); margin: 0; }
    h3 { color: var(--accent-gold); margin: 0 0 16px; font-size: 1rem; }
    .stats-grid { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
    .stat-bar { display: flex; align-items: center; gap: 12px; }
    .stat-label { width: 100px; color: var(--text-secondary); font-size: 0.85rem; }
    .bar { flex: 1; height: 8px; background: var(--border-secondary); border-radius: 4px; overflow: hidden; }
    .fill { height: 100%; background: #c45a5a; border-radius: 4px; transition: width 0.3s; }
    .fill.agility { background: #5ac47a; }
    .fill.magic { background: #7a5ac4; }
    .fill.defense { background: #5a8ac4; }
    .fill.health { background: #c45a8a; }
    .stat-value { width: 40px; text-align: right; color: var(--text-primary); font-weight: bold; }
    .skills-section, .equipment-section { margin-bottom: 24px; }
    .skills-list { display: flex; flex-direction: column; gap: 12px; }
    .skill-item { background: var(--card-overlay); padding: 12px; border-radius: 8px; }
    .skill-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .skill-name { color: var(--text-white); font-weight: bold; }
    .cooldown { color: var(--text-muted); font-size: 0.8rem; }
    .skill-desc { color: var(--text-secondary); margin: 0 0 4px; font-size: 0.85rem; }
    .damage { color: #c45a5a; font-size: 0.8rem; }
    .equipment-list { display: flex; flex-direction: column; gap: 8px; }
    .equipment-item { display: flex; align-items: center; gap: 12px; background: var(--card-overlay); padding: 10px; border-radius: 6px; }
    .slot { font-size: 1.2rem; }
    .item-name { flex: 1; color: var(--text-primary); }
    .bonus { color: var(--accent-gold); font-size: 0.85rem; }
    .modal-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid var(--border-secondary); }
    .cost-info { display: flex; gap: 24px; }
    .cost-item { display: flex; flex-direction: column; }
    .cost-item .label { color: var(--text-muted); font-size: 0.75rem; }
    .cost-item .value { color: var(--accent-gold); font-weight: bold; }
    .on-mission-label { color: var(--border-progress); font-weight: bold; }
  `]
})
export class MercenaryDetailModalComponent {
  @Input() mercenary: Mercenary | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() hire = new EventEmitter<Mercenary>();
  @Output() release = new EventEmitter<Mercenary>();

  getRaceColor(race: string): string { return RACE_CONFIG[race as keyof typeof RACE_CONFIG]?.color || '#666'; }
  getClassIcon(cls: string): string { return CLASS_CONFIG[cls as keyof typeof CLASS_CONFIG]?.icon || ''; }
  getClassColor(cls: string): string { return CLASS_CONFIG[cls as keyof typeof CLASS_CONFIG]?.color || '#666'; }

  getSlotIcon(slot: string): string {
    return { weapon: '⚔️', armor: '🛡️', accessory: '💍' }[slot] || '📦';
  }

  formatBonus(bonus: Record<string, number>): string {
    return Object.entries(bonus).map(([k, v]) => `+${v} ${k}`).join(', ');
  }
}
