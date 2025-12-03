import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { ACHIEVEMENTS } from '../../models/task.model';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div class="modal-overlay" (click)="close()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="close()">✕</button>
          <h2>🏆 Trophies</h2>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="(taskService.achievements().length / allAchievements.length) * 100"></div>
          </div>
          <p class="progress-text">{{ taskService.achievements().length }} / {{ allAchievements.length }} Unlocked</p>

          <div class="achievements-grid">
            @for (ach of allAchievements; track ach.id) {
              <div class="achievement" [class.unlocked]="isUnlocked(ach.id)">
                <span class="icon">{{ ach.icon }}</span>
                <div class="info">
                  <span class="name">{{ ach.name }}</span>
                  <span class="desc">{{ ach.description }}</span>
                  <span class="requirement">{{ getRequirementText(ach) }}</span>
                </div>
                @if (isUnlocked(ach.id)) {
                  <span class="check">✅</span>
                } @else {
                  <span class="locked">🔒</span>
                }
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 12px;
      padding: 20px;
      max-width: 500px;
      width: 95%;
      max-height: 80vh;
      overflow-y: auto;
      position: relative;
      scrollbar-width: thin;
      scrollbar-color: #444 #1a1a1a;
    }
    .modal-content::-webkit-scrollbar { width: 6px; }
    .modal-content::-webkit-scrollbar-track { background: #1a1a1a; }
    .modal-content::-webkit-scrollbar-thumb { background: #444; border-radius: 3px; }
    .modal-content::-webkit-scrollbar-thumb:hover { background: #555; }
    .close-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      background: transparent;
      border: none;
      color: #666;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 4px;
      line-height: 1;
    }
    .close-btn:hover { color: #999; }
    h2 {
      color: var(--accent-gold);
      margin: 0 0 12px;
      text-align: center;
      font-size: 1.25rem;
      font-weight: 600;
    }
    .progress-bar {
      height: 4px;
      background: #333;
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 6px;
    }
    .progress-fill {
      height: 100%;
      background: var(--accent-gold);
      transition: width 0.3s ease;
    }
    .progress-text {
      text-align: center;
      color: #888;
      font-size: 0.8rem;
      margin: 0 0 16px;
    }
    .achievements-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .achievement {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      background: #222;
      border-radius: 8px;
      opacity: 0.4;
      border: 1px solid transparent;
      transition: opacity 0.2s;
    }
    .achievement.unlocked {
      opacity: 1;
      border-color: #444;
      background: #252525;
    }
    .icon { font-size: 1.5rem; }
    .info { flex: 1; display: flex; flex-direction: column; }
    .name { color: #eee; font-weight: 500; font-size: 0.9rem; }
    .desc { color: #777; font-size: 0.75rem; margin-top: 2px; }
    .requirement { display: none; }
    .check { font-size: 1rem; }
    .locked { font-size: 1rem; opacity: 0.3; }
  `]
})
export class AchievementsComponent {
  taskService = inject(TaskService);
  allAchievements = ACHIEVEMENTS;
  isOpen = signal(false);

  open(): void { this.isOpen.set(true); }
  close(): void { this.isOpen.set(false); }

  isUnlocked(id: string): boolean {
    return this.taskService.achievements().includes(id);
  }

  getRequirementText(ach: typeof ACHIEVEMENTS[0]): string {
    const typeLabels = {
      tasks: 'tasks completed',
      gold: 'gold earned',
      streak: 'task streak',
      level: 'level reached'
    };
    return `Requires: ${ach.requirement} ${typeLabels[ach.type]}`;
  }
}
