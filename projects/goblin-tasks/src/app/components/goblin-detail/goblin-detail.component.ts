import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from 'ui-lib';
import { TaskService } from '../../services/task.service';
import { Goblin, CATEGORY_CONFIG, MOOD_CONFIG } from '../../models/task.model';

@Component({
  selector: 'app-goblin-detail',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    @if (selectedGoblin()) {
      <div class="modal-overlay" (click)="close()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="close()">✕</button>
          
          <div class="goblin-header">
            <div class="avatar-section">
              <span class="avatar">{{ selectedGoblin()!.avatar }}</span>
              <span class="mood">{{ getMoodIcon(selectedGoblin()!.mood) }}</span>
            </div>
            <div class="info">
              <h2>{{ selectedGoblin()!.name }}</h2>
              <div class="level-badge">Level {{ selectedGoblin()!.level }}</div>
              <div class="specialty">{{ getCategoryIcon(selectedGoblin()!.specialty) }} {{ selectedGoblin()!.specialty | titlecase }} Specialist</div>
            </div>
          </div>

          <div class="xp-bar">
            <div class="xp-fill" [style.width.%]="(selectedGoblin()!.xp / selectedGoblin()!.xpToNextLevel) * 100"></div>
            <span class="xp-text">{{ selectedGoblin()!.xp }} / {{ selectedGoblin()!.xpToNextLevel }} XP</span>
          </div>

          <div class="energy-section">
            <span class="label">⚡ Energy</span>
            <div class="energy-bar">
              <div class="energy-fill" [style.width.%]="(selectedGoblin()!.energy / selectedGoblin()!.maxEnergy) * 100"></div>
            </div>
            <span class="energy-text">{{ selectedGoblin()!.energy }}/{{ selectedGoblin()!.maxEnergy }}</span>
            <ui-button variant="outline" size="sm" (clicked)="restGoblin()">😴 Rest</ui-button>
          </div>

          <div class="stats-grid">
            <div class="stat">
              <span class="value">{{ selectedGoblin()!.tasksCompleted }}</span>
              <span class="label">Tasks Done</span>
            </div>
            <div class="stat">
              <span class="value">{{ selectedGoblin()!.totalRewards | number }}</span>
              <span class="label">Gold Earned</span>
            </div>
            <div class="stat">
              <span class="value">{{ getMoodBonus(selectedGoblin()!.mood) }}x</span>
              <span class="label">Mood Bonus</span>
            </div>
          </div>

          <div class="skills-section">
            <h3>🎯 Skills</h3>
            <div class="skills-list">
              @for (skill of selectedGoblin()!.skills; track skill.category) {
                <div class="skill-item" [class.specialty]="skill.category === selectedGoblin()!.specialty">
                  <span class="skill-icon">{{ getCategoryIcon(skill.category) }}</span>
                  <span class="skill-name">{{ skill.category | titlecase }}</span>
                  <span class="skill-level">Lv.{{ skill.level }}</span>
                  <div class="skill-bar">
                    <div class="skill-fill" [style.width.%]="(skill.xp % 100)"></div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: var(--bg-secondary); border: 2px solid var(--accent-gold); border-radius: 16px; padding: 24px; max-width: 450px; width: 90%; position: relative; }
    .close-btn { position: absolute; top: 12px; right: 12px; background: transparent; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer; }
    .goblin-header { display: flex; gap: 20px; margin-bottom: 20px; }
    .avatar-section { position: relative; }
    .avatar { font-size: 4rem; }
    .mood { position: absolute; bottom: 0; right: -5px; font-size: 1.5rem; }
    .info h2 { color: var(--accent-gold); margin: 0 0 8px; }
    .level-badge { display: inline-block; background: var(--accent-gold); color: #000; padding: 4px 12px; border-radius: 12px; font-weight: bold; font-size: 0.85rem; margin-bottom: 8px; }
    .specialty { color: var(--text-secondary); font-size: 0.9rem; }
    .xp-bar { position: relative; height: 24px; background: var(--border-secondary); border-radius: 12px; overflow: hidden; margin-bottom: 16px; }
    .xp-fill { height: 100%; background: linear-gradient(90deg, var(--accent-gold), #ffa500); transition: width 0.3s; }
    .xp-text { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; color: var(--text-white); font-weight: bold; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
    .energy-section { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding: 12px; background: var(--card-overlay); border-radius: 8px; }
    .energy-section .label { color: var(--text-secondary); font-size: 0.85rem; }
    .energy-bar { flex: 1; height: 8px; background: var(--border-secondary); border-radius: 4px; overflow: hidden; }
    .energy-fill { height: 100%; background: #5ac47a; transition: width 0.3s; }
    .energy-text { color: var(--text-muted); font-size: 0.8rem; min-width: 50px; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
    .stat { text-align: center; padding: 12px; background: var(--card-overlay); border-radius: 8px; }
    .stat .value { display: block; font-size: 1.25rem; font-weight: bold; color: var(--accent-gold); }
    .stat .label { font-size: 0.75rem; color: var(--text-muted); }
    .skills-section h3 { color: var(--text-primary); margin: 0 0 12px; font-size: 1rem; }
    .skills-list { display: flex; flex-direction: column; gap: 8px; }
    .skill-item { display: flex; align-items: center; gap: 8px; padding: 8px; background: var(--card-overlay); border-radius: 6px; }
    .skill-item.specialty { border: 1px solid var(--accent-gold); }
    .skill-icon { font-size: 1.2rem; }
    .skill-name { flex: 1; color: var(--text-secondary); font-size: 0.85rem; }
    .skill-level { color: var(--accent-gold); font-weight: bold; font-size: 0.85rem; }
    .skill-bar { width: 60px; height: 4px; background: var(--border-secondary); border-radius: 2px; overflow: hidden; }
    .skill-fill { height: 100%; background: var(--accent-gold); }
  `]
})
export class GoblinDetailComponent {
  private taskService = inject(TaskService);
  selectedGoblin = signal<Goblin | null>(null);

  open(goblin: Goblin): void { this.selectedGoblin.set(goblin); }
  close(): void { this.selectedGoblin.set(null); }

  getCategoryIcon(cat: string): string { return CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG]?.icon || '📋'; }
  getMoodIcon(mood: string): string { return MOOD_CONFIG[mood as keyof typeof MOOD_CONFIG]?.icon || '😐'; }
  getMoodBonus(mood: string): string { return MOOD_CONFIG[mood as keyof typeof MOOD_CONFIG]?.bonus.toFixed(1) || '1.0'; }

  restGoblin(): void {
    if (this.selectedGoblin()) {
      this.taskService.restGoblin(this.selectedGoblin()!.id);
      this.selectedGoblin.set(this.taskService.getGoblinById(this.selectedGoblin()!.id) || null);
    }
  }
}
