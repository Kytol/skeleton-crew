import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecruitmentService } from '../../services/recruitment.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-wrapper">
      <button class="bell-btn" (click)="toggleDropdown()">
        🔔
        @if (recruitmentService.unreadCount() > 0) {
          <span class="badge">{{ recruitmentService.unreadCount() }}</span>
        }
      </button>

      @if (isOpen()) {
        <div class="dropdown">
          <div class="dropdown-header">
            <span>Notifications</span>
            @if (recruitmentService.unreadCount() > 0) {
              <button class="mark-read" (click)="markAllRead()">Mark all read</button>
            }
          </div>
          <div class="notification-list">
            @if (recruitmentService.allNotifications().length === 0) {
              <div class="empty">No notifications yet</div>
            } @else {
              @for (notif of recruitmentService.allNotifications(); track notif.id) {
                <div class="notification-item" [class.unread]="!notif.read" (click)="markRead(notif.id)">
                  <span class="icon">{{ getIcon(notif.type) }}</span>
                  <div class="content">
                    <span class="title">{{ notif.title }}</span>
                    <span class="message">{{ notif.message }}</span>
                    <span class="time">{{ getTimeAgo(notif.createdAt) }}</span>
                  </div>
                </div>
              }
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .notification-wrapper { position: relative; }
    .bell-btn {
      background: transparent; border: 2px solid var(--border-primary);
      border-radius: 50%; width: 44px; height: 44px;
      font-size: 1.25rem; cursor: pointer; position: relative;
      transition: all 0.2s;
      display: flex; align-items: center; justify-content: center;
      line-height: 1;
    }
    .bell-btn:hover { border-color: var(--accent-gold); }
    .badge {
      position: absolute; top: -4px; right: -4px;
      background: #c45a5a; color: #fff;
      font-size: 0.7rem; font-weight: bold;
      min-width: 18px; height: 18px;
      border-radius: 9px; display: flex;
      align-items: center; justify-content: center;
    }
    .dropdown {
      position: absolute; top: 100%; right: 0; margin-top: 8px;
      background: var(--bg-secondary); border: 2px solid var(--border-primary);
      border-radius: 12px; width: 320px; max-height: 400px;
      overflow: hidden; z-index: 100;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    .dropdown-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 16px; border-bottom: 1px solid var(--border-secondary);
      color: var(--text-primary); font-weight: bold;
    }
    .mark-read {
      background: transparent; border: none;
      color: var(--accent-gold); font-size: 0.8rem; cursor: pointer;
    }
    .notification-list { max-height: 340px; overflow-y: auto; }
    .empty { padding: 40px 20px; text-align: center; color: var(--text-muted); }
    .notification-item {
      display: flex; gap: 12px; padding: 12px 16px;
      border-bottom: 1px solid var(--border-secondary);
      cursor: pointer; transition: background 0.2s;
    }
    .notification-item:hover { background: var(--card-overlay); }
    .notification-item.unread { background: rgba(255,215,0,0.05); }
    .icon { font-size: 1.5rem; }
    .content { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .title { color: var(--text-primary); font-weight: bold; font-size: 0.85rem; }
    .message { color: var(--text-secondary); font-size: 0.8rem; }
    .time { color: var(--text-muted); font-size: 0.7rem; }
  `]
})
export class NotificationBellComponent {
  recruitmentService = inject(RecruitmentService);
  isOpen = signal(false);

  toggleDropdown(): void {
    this.isOpen.update(v => !v);
  }

  markRead(id: string): void {
    this.recruitmentService.markAsRead(id);
  }

  markAllRead(): void {
    this.recruitmentService.markAllAsRead();
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      'response': '💬',
      'accepted': '✅',
      'rejected': '❌',
      'new-match': '🎯',
    };
    return icons[type] || '📢';
  }

  getTimeAgo(date: Date): string {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }
}
