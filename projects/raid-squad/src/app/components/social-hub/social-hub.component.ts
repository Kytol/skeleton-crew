import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, InputComponent } from 'ui-lib';
import { SocialService } from '../../services/social.service';
import { Player, Alliance } from '../../models/social.model';

type SocialTab = 'leaderboard' | 'friends' | 'alliances' | 'chat';

@Component({
  selector: 'app-social-hub',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="social-hub">
      <div class="hub-tabs">
        <button class="tab" [class.active]="activeTab() === 'leaderboard'" (click)="activeTab.set('leaderboard')">🏆 Leaderboard</button>
        <button class="tab" [class.active]="activeTab() === 'friends'" (click)="activeTab.set('friends')">👥 Friends</button>
        <button class="tab" [class.active]="activeTab() === 'alliances'" (click)="activeTab.set('alliances')">⚔️ Alliances</button>
        <button class="tab" [class.active]="activeTab() === 'chat'" (click)="activeTab.set('chat')">💬 Chat</button>
      </div>

      @if (activeTab() === 'leaderboard') {
        <div class="leaderboard-section">
          <h3>🏆 Top Players</h3>
          <div class="leaderboard-list">
            @for (player of socialService.leaderboard(); track player.id; let i = $index) {
              <div class="leaderboard-item" [class.current]="player.id === 'user-1'" (click)="viewPlayer(player)">
                <span class="rank">{{ getRankBadge(i) }}</span>
                <span class="avatar">{{ player.avatar }}</span>
                <div class="player-info">
                  <span class="name">{{ player.name }}</span>
                  <span class="level">Lv.{{ player.level }}</span>
                </div>
                <div class="power">
                  <span class="value">{{ player.squadPower | number }}</span>
                  <span class="label">Power</span>
                </div>
                <span class="status-dot" [class]="player.status"></span>
              </div>
            }
          </div>
        </div>
      }

      @if (activeTab() === 'friends') {
        <div class="friends-section">
          <div class="search-bar">
            <input type="text" [(ngModel)]="searchQuery" placeholder="Search players..." (input)="onSearch()" />
          </div>
          @if (searchResults().length > 0) {
            <div class="search-results">
              <h4>Search Results</h4>
              @for (player of searchResults(); track player.id) {
                <div class="player-row">
                  <span class="avatar">{{ player.avatar }}</span>
                  <span class="name">{{ player.name }}</span>
                  <ui-button variant="primary" size="sm" (clicked)="addFriend(player.id)">Add</ui-button>
                </div>
              }
            </div>
          }
          <h3>👥 Friends ({{ socialService.friendsList().length }})</h3>
          <div class="friends-list">
            @for (friend of socialService.friendsList(); track friend.id) {
              <div class="friend-item" (click)="viewPlayer(friend)">
                <span class="avatar">{{ friend.avatar }}</span>
                <div class="friend-info">
                  <span class="name">{{ friend.name }}</span>
                  <span class="status">{{ friend.status }}</span>
                </div>
                <ui-button variant="outline" size="sm" (clicked)="openChat(friend); $event.stopPropagation()">💬</ui-button>
              </div>
            }
            @if (socialService.friendsList().length === 0) {
              <p class="empty">No friends yet. Search for players above!</p>
            }
          </div>
        </div>
      }

      @if (activeTab() === 'alliances') {
        <div class="alliances-section">
          @if (socialService.myAlliance()) {
            <div class="my-alliance">
              <h3>⚔️ My Alliance</h3>
              <div class="alliance-card current">
                <div class="alliance-header">
                  <span class="tag">[{{ socialService.myAlliance()!.tag }}]</span>
                  <span class="name">{{ socialService.myAlliance()!.name }}</span>
                  <span class="level">Lv.{{ socialService.myAlliance()!.level }}</span>
                </div>
                <p class="desc">{{ socialService.myAlliance()!.description }}</p>
                <div class="alliance-stats">
                  <span>👥 {{ socialService.myAlliance()!.memberIds.length }}/{{ socialService.myAlliance()!.maxMembers }}</span>
                  <span>⚡ {{ socialService.myAlliance()!.totalPower | number }} Power</span>
                </div>
                <ui-button variant="outline" (clicked)="leaveAlliance()">Leave Alliance</ui-button>
              </div>
            </div>
          } @else {
            <div class="create-alliance">
              <h4>Create Alliance</h4>
              <div class="form-row">
                <input type="text" [(ngModel)]="newAlliance.name" placeholder="Alliance Name" />
                <input type="text" [(ngModel)]="newAlliance.tag" placeholder="TAG" maxlength="4" />
              </div>
              <textarea [(ngModel)]="newAlliance.description" placeholder="Description..." rows="2"></textarea>
              <ui-button variant="primary" (clicked)="createAlliance()">Create Alliance</ui-button>
            </div>
          }
          <h3>🏰 Available Alliances</h3>
          <div class="alliances-list">
            @for (alliance of socialService.allAlliances(); track alliance.id) {
              @if (alliance.isRecruiting && alliance.id !== socialService.myAlliance()?.id) {
                <div class="alliance-card">
                  <div class="alliance-header">
                    <span class="tag">[{{ alliance.tag }}]</span>
                    <span class="name">{{ alliance.name }}</span>
                    <span class="level">Lv.{{ alliance.level }}</span>
                  </div>
                  <p class="desc">{{ alliance.description }}</p>
                  <div class="alliance-stats">
                    <span>👥 {{ alliance.memberIds.length }}/{{ alliance.maxMembers }}</span>
                    <span>⚡ {{ alliance.totalPower | number }}</span>
                  </div>
                  @if (!socialService.myAlliance()) {
                    <ui-button variant="primary" size="sm" (clicked)="joinAlliance(alliance.id)">Join</ui-button>
                  }
                </div>
              }
            }
          </div>
        </div>
      }

      @if (activeTab() === 'chat') {
        <div class="chat-section">
          <div class="chat-channels">
            <button class="channel" [class.active]="chatChannel() === 'global'" (click)="chatChannel.set('global')">🌍 Global</button>
            <button class="channel" [class.active]="chatChannel() === 'alliance'" (click)="chatChannel.set('alliance')" [disabled]="!socialService.myAlliance()">⚔️ Alliance</button>
          </div>
          <div class="chat-messages">
            @for (msg of getMessages(); track msg.id) {
              <div class="message" [class.own]="msg.senderId === 'user-1'">
                <span class="msg-avatar">{{ msg.senderAvatar }}</span>
                <div class="msg-content">
                  <span class="msg-sender">{{ msg.senderName }}</span>
                  <span class="msg-text">{{ msg.content }}</span>
                  <span class="msg-time">{{ getTimeAgo(msg.timestamp) }}</span>
                </div>
              </div>
            }
          </div>
          <div class="chat-input">
            <input type="text" [(ngModel)]="messageText" placeholder="Type a message..." (keyup.enter)="sendMessage()" />
            <ui-button variant="primary" (clicked)="sendMessage()">Send</ui-button>
          </div>
        </div>
      }

      @if (selectedPlayer()) {
        <div class="modal-overlay" (click)="selectedPlayer.set(null)">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <button class="close-btn" (click)="selectedPlayer.set(null)">✕</button>
            <div class="profile-header">
              <span class="avatar">{{ selectedPlayer()!.avatar }}</span>
              <div class="profile-info">
                <h3>{{ selectedPlayer()!.name }}</h3>
                <span class="level">Level {{ selectedPlayer()!.level }}</span>
                <span class="status" [class]="selectedPlayer()!.status">{{ selectedPlayer()!.status }}</span>
              </div>
            </div>
            <div class="profile-stats">
              <div class="stat"><span class="label">Squad Power</span><span class="value">{{ selectedPlayer()!.squadPower | number }}</span></div>
              <div class="stat"><span class="label">Missions</span><span class="value">{{ selectedPlayer()!.missionsCompleted }}</span></div>
              <div class="stat"><span class="label">Gold</span><span class="value">{{ selectedPlayer()!.gold | number }}</span></div>
            </div>
            @if (selectedPlayer()!.id !== 'user-1') {
              <div class="profile-actions">
                <ui-button variant="primary" (clicked)="addFriend(selectedPlayer()!.id)">Add Friend</ui-button>
                <ui-button variant="outline" (clicked)="openChat(selectedPlayer()!)">Message</ui-button>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .social-hub { padding: 20px 0; }
    .hub-tabs { display: flex; gap: 8px; margin-bottom: 24px; }
    .tab {
      flex: 1; padding: 12px; background: var(--bg-card); border: 2px solid var(--border-primary);
      border-radius: 8px; color: var(--text-secondary); font-weight: 600; cursor: pointer; transition: all 0.2s;
    }
    .tab:hover { border-color: var(--accent-gold); }
    .tab.active { background: var(--accent-gold); color: #000; border-color: var(--accent-gold); }
    h3 { color: var(--accent-gold); margin: 0 0 16px; }
    h4 { color: var(--text-primary); margin: 0 0 12px; font-size: 0.95rem; }
    .leaderboard-list { display: flex; flex-direction: column; gap: 8px; }
    .leaderboard-item {
      display: flex; align-items: center; gap: 12px; padding: 12px 16px;
      background: var(--bg-card); border: 2px solid var(--border-primary); border-radius: 8px; cursor: pointer;
    }
    .leaderboard-item:hover { border-color: var(--accent-gold); }
    .leaderboard-item.current { border-color: var(--accent-gold); background: rgba(255,215,0,0.1); }
    .rank { font-size: 1.25rem; width: 30px; text-align: center; }
    .avatar { font-size: 1.5rem; }
    .player-info { flex: 1; display: flex; flex-direction: column; }
    .name { color: var(--text-white); font-weight: bold; }
    .level { color: var(--text-muted); font-size: 0.8rem; }
    .power { text-align: right; }
    .power .value { display: block; color: var(--accent-gold); font-weight: bold; }
    .power .label { font-size: 0.7rem; color: var(--text-muted); }
    .status-dot { width: 10px; height: 10px; border-radius: 50%; }
    .status-dot.online { background: #5ac47a; }
    .status-dot.offline { background: #5a5a5a; }
    .status-dot.in-mission { background: #c4a35a; }
    .status-dot.away { background: #c45a5a; }
    .search-bar { margin-bottom: 16px; }
    .search-bar input { width: 100%; padding: 12px; background: var(--input-bg); color: var(--text-primary); border: 1px solid var(--border-primary); border-radius: 8px; }
    .search-results { background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: 8px; padding: 12px; margin-bottom: 16px; }
    .player-row { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
    .player-row .name { flex: 1; color: var(--text-primary); }
    .friends-list { display: flex; flex-direction: column; gap: 8px; }
    .friend-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-card); border-radius: 8px; cursor: pointer; }
    .friend-info { flex: 1; display: flex; flex-direction: column; }
    .friend-info .status { font-size: 0.8rem; color: var(--text-muted); text-transform: capitalize; }
    .empty { color: var(--text-muted); text-align: center; padding: 20px; }
    .create-alliance { background: var(--bg-card); padding: 16px; border-radius: 8px; margin-bottom: 24px; }
    .form-row { display: flex; gap: 8px; margin-bottom: 8px; }
    .form-row input:first-child { flex: 1; }
    .form-row input:last-child { width: 80px; text-transform: uppercase; }
    input, textarea { padding: 10px; background: var(--input-bg); color: var(--text-primary); border: 1px solid var(--border-primary); border-radius: 6px; width: 100%; margin-bottom: 8px; }
    .alliances-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .alliance-card { background: var(--bg-card); border: 2px solid var(--border-primary); border-radius: 12px; padding: 16px; }
    .alliance-card.current { border-color: var(--accent-gold); }
    .alliance-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .tag { color: var(--accent-gold); font-weight: bold; }
    .alliance-header .name { color: var(--text-white); font-weight: bold; flex: 1; }
    .alliance-header .level { color: var(--text-muted); font-size: 0.85rem; }
    .desc { color: var(--text-secondary); font-size: 0.85rem; margin: 0 0 12px; }
    .alliance-stats { display: flex; gap: 16px; margin-bottom: 12px; color: var(--text-muted); font-size: 0.85rem; }
    .chat-section { display: flex; flex-direction: column; height: 500px; background: var(--bg-card); border: 2px solid var(--border-primary); border-radius: 12px; overflow: hidden; }
    .chat-channels { display: flex; border-bottom: 1px solid var(--border-secondary); }
    .channel { flex: 1; padding: 12px; background: transparent; border: none; color: var(--text-secondary); cursor: pointer; }
    .channel:hover { background: var(--card-overlay); }
    .channel.active { background: var(--card-overlay); color: var(--accent-gold); border-bottom: 2px solid var(--accent-gold); }
    .channel:disabled { opacity: 0.5; cursor: not-allowed; }
    .chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .message { display: flex; gap: 10px; }
    .message.own { flex-direction: row-reverse; }
    .msg-avatar { font-size: 1.5rem; }
    .msg-content { max-width: 70%; background: var(--card-overlay); padding: 10px 14px; border-radius: 12px; }
    .message.own .msg-content { background: rgba(255,215,0,0.15); }
    .msg-sender { display: block; color: var(--accent-gold); font-size: 0.8rem; font-weight: bold; margin-bottom: 4px; }
    .msg-text { color: var(--text-primary); font-size: 0.9rem; }
    .msg-time { display: block; color: var(--text-muted); font-size: 0.7rem; margin-top: 4px; }
    .chat-input { display: flex; gap: 8px; padding: 12px; border-top: 1px solid var(--border-secondary); }
    .chat-input input { flex: 1; margin: 0; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: var(--bg-secondary); border: 2px solid var(--border-primary); border-radius: 16px; padding: 24px; max-width: 400px; width: 90%; position: relative; }
    .close-btn { position: absolute; top: 12px; right: 12px; background: transparent; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer; }
    .profile-header { display: flex; gap: 16px; align-items: center; margin-bottom: 20px; }
    .profile-header .avatar { font-size: 3rem; }
    .profile-info h3 { color: var(--text-white); margin: 0 0 4px; }
    .profile-info .level { color: var(--text-secondary); display: block; }
    .profile-info .status { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; text-transform: capitalize; margin-top: 4px; }
    .profile-info .status.online { background: rgba(90,196,122,0.2); color: #5ac47a; }
    .profile-info .status.offline { background: rgba(90,90,90,0.2); color: #888; }
    .profile-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
    .stat { text-align: center; padding: 12px; background: var(--card-overlay); border-radius: 8px; }
    .stat .label { display: block; color: var(--text-muted); font-size: 0.75rem; margin-bottom: 4px; }
    .stat .value { color: var(--accent-gold); font-weight: bold; font-size: 1.1rem; }
    .profile-actions { display: flex; gap: 12px; }
  `]
})
export class SocialHubComponent {
  socialService = inject(SocialService);

  activeTab = signal<SocialTab>('leaderboard');
  chatChannel = signal<'global' | 'alliance'>('global');
  selectedPlayer = signal<Player | null>(null);
  searchQuery = '';
  searchResults = signal<Player[]>([]);
  messageText = '';

  newAlliance = { name: '', tag: '', description: '' };

  getRankBadge(index: number): string {
    return ['🥇', '🥈', '🥉'][index] || `${index + 1}`;
  }

  onSearch(): void {
    this.searchResults.set(this.socialService.searchPlayers(this.searchQuery));
  }

  viewPlayer(player: Player): void {
    this.selectedPlayer.set(player);
  }

  addFriend(playerId: string): void {
    this.socialService.sendFriendRequest(playerId);
  }

  openChat(player: Player): void {
    this.activeTab.set('chat');
  }

  createAlliance(): void {
    if (this.newAlliance.name && this.newAlliance.tag) {
      this.socialService.createAlliance(this.newAlliance.name, this.newAlliance.tag, this.newAlliance.description);
      this.newAlliance = { name: '', tag: '', description: '' };
    }
  }

  joinAlliance(allianceId: string): void {
    this.socialService.joinAlliance(allianceId);
  }

  leaveAlliance(): void {
    this.socialService.leaveAlliance();
  }

  getMessages() {
    return this.socialService.getChannelMessages(this.chatChannel());
  }

  sendMessage(): void {
    if (this.messageText.trim()) {
      this.socialService.sendMessage(this.messageText, this.chatChannel());
      this.messageText = '';
    }
  }

  getTimeAgo(date: Date): string {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h`;
  }
}
