import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-wrapper">
      <button class="bell-btn" (click)="togglePanel()">
        🔔
        @if (unreadCount() > 0) {
          <span class="badge">{{ unreadCount() > 9 ? '9+' : unreadCount() }}</span>
        }
      </button>

      @if (isPanelOpen()) {
        <div class="notification-panel">
          <div class="panel-header">
            <h4>Notifications</h4>
            <div class="actions">
              <button (click)="markAllRead()">Mark all read</button>
              <button (click)="clearAll()">Clear</button>
            </div>
          </div>
          <div class="notifications-list">
            @for (notif of notifications(); track notif.id) {
              <div class="notification-item" [class.unread]="!notif.read" (click)="markRead(notif.id)">
                <span class="notif-icon">{{ notif.icon }}</span>
                <div class="notif-content">
                  <span class="notif-title">{{ notif.title }}</span>
                  <span class="notif-message">{{ notif.message }}</span>
                  <span class="notif-time">{{ getTimeAgo(notif.timestamp) }}</span>
                </div>
              </div>
            }
            @if (notifications().length === 0) {
              <div class="empty">No notifications yet</div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .notification-wrapper { position: relative; }
    .bell-btn {
      background: var(--card-overlay);
      border: 2px solid var(--border-primary);
      border-radius: 50%;
      width: 44px; height: 44px;
      font-size: 1.25rem;
      cursor: pointer;
      position: relative;
      transition: all 0.2s;
    }
    .bell-btn:hover { border-color: var(--accent-gold); }
    .badge {
      position: absolute; top: -4px; right: -4px;
      background: #dc2626; color: white;
      font-size: 0.7rem; font-weight: bold;
      min-width: 18px; height: 18px;
      border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
    }
    .notification-panel {
      position: absolute; top: 100%; right: 0;
      margin-top: 8px;
      width: 320px; max-height: 400px;
      background: var(--bg-secondary);
      border: 2px solid var(--border-primary);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      z-index: 100;
    }
    .panel-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-secondary);
    }
    .panel-header h4 { margin: 0; color: var(--text-primary); font-size: 0.95rem; }
    .actions { display: flex; gap: 8px; }
    .actions button {
      background: transparent; border: none;
      color: var(--text-muted); font-size: 0.75rem;
      cursor: pointer;
    }
    .actions button:hover { color: var(--accent-gold); }
    .notifications-list { max-height: 340px; overflow-y: auto; }
    .notification-item {
      display: flex; gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-secondary);
      cursor: pointer;
      transition: background 0.2s;
    }
    .notification-item:hover { background: var(--card-overlay); }
    .notification-item.unread { background: rgba(255,215,0,0.05); }
    .notif-icon { font-size: 1.5rem; }
    .notif-content { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .notif-title { color: var(--text-primary); font-weight: bold; font-size: 0.85rem; }
    .notif-message { color: var(--text-muted); font-size: 0.8rem; }
    .notif-time { color: var(--text-muted); font-size: 0.7rem; opacity: 0.7; }
    .empty { padding: 40px; text-align: center; color: var(--text-muted); }
  `]
})
export class NotificationCenterComponent {
  private gameService = inject(GameService);
  notifications = this.gameService.alerts;
  unreadCount = this.gameService.unread;
  isPanelOpen = signal(false);

  togglePanel(): void { this.isPanelOpen.update(v => !v); }
  markRead(id: string): void { this.gameService.markAsRead(id); }
  markAllRead(): void { this.gameService.markAllAsRead(); }
  clearAll(): void { this.gameService.clearNotifications(); this.isPanelOpen.set(false); }

  getTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }
}
