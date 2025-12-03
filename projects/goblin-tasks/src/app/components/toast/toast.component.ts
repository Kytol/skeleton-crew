import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';

interface Toast {
  id: string;
  icon: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'achievement';
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toasts(); track toast.id) {
        <div class="toast" [class]="toast.type" (click)="removeToast(toast.id)">
          <span class="toast-icon">{{ toast.icon }}</span>
          <div class="toast-content">
            <span class="toast-title">{{ toast.title }}</span>
            <span class="toast-message">{{ toast.message }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 2000;
      pointer-events: none;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      background: var(--bg-secondary);
      border: 2px solid var(--border-primary);
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
      pointer-events: auto;
      cursor: pointer;
      max-width: 350px;
    }
    .toast.success { border-color: #5ac47a; background: linear-gradient(135deg, rgba(90,196,122,0.15), var(--bg-secondary)); }
    .toast.achievement { border-color: var(--accent-gold); background: linear-gradient(135deg, rgba(255,215,0,0.15), var(--bg-secondary)); animation: slideIn 0.3s ease, glow 1s ease-in-out infinite, fadeOut 0.3s ease 3.7s forwards; }
    .toast.info { border-color: #4a90d9; background: linear-gradient(135deg, rgba(74,144,217,0.15), var(--bg-secondary)); }
    .toast.warning { border-color: #f59e0b; background: linear-gradient(135deg, rgba(245,158,11,0.15), var(--bg-secondary)); }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; transform: translateX(50px); } }
    @keyframes glow { 0%, 100% { box-shadow: 0 0 10px rgba(255,215,0,0.3); } 50% { box-shadow: 0 0 25px rgba(255,215,0,0.6); } }
    .toast-icon { font-size: 1.75rem; }
    .toast-content { display: flex; flex-direction: column; }
    .toast-title { color: var(--text-primary); font-weight: bold; font-size: 0.95rem; }
    .toast-message { color: var(--text-muted); font-size: 0.8rem; }
  `]
})
export class ToastComponent {
  private gameService = inject(GameService);
  toasts = signal<Toast[]>([]);
  private lastNotificationCount = 0;

  constructor() {
    effect(() => {
      const notifications = this.gameService.alerts();
      if (notifications.length > this.lastNotificationCount && notifications.length > 0) {
        const latest = notifications[0];
        this.showToast({
          id: latest.id,
          icon: latest.icon,
          title: latest.title,
          message: latest.message,
          type: latest.type === 'achievement' || latest.type === 'level-up' ? 'achievement' :
                latest.type === 'quest-complete' ? 'success' : 'info'
        });
      }
      this.lastNotificationCount = notifications.length;
    });
  }

  showToast(toast: Toast): void {
    this.toasts.update(t => [...t, toast]);
    setTimeout(() => this.removeToast(toast.id), 3000);
  }

  removeToast(id: string): void {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }
}
