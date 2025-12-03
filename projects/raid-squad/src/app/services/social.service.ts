import { Injectable, signal, computed } from '@angular/core';
import {
  Player, Friend, Alliance, AllianceMember, ChatMessage, ChatChannel,
  PlayerStatus, FriendStatus, AllianceRole
} from '../models/social.model';

@Injectable({ providedIn: 'root' })
export class SocialService {
  private currentPlayer = signal<Player>({
    id: 'user-1', name: 'Commander', avatar: '👑', level: 25,
    status: 'online', squadPower: 1500, missionsCompleted: 42,
    gold: 5000, allianceId: null, joinedAt: new Date(), lastSeen: new Date()
  });

  private players = signal<Player[]>(this.generatePlayers());
  private friends = signal<Friend[]>([]);
  private alliances = signal<Alliance[]>(this.generateAlliances());
  private messages = signal<ChatMessage[]>(this.generateMessages());
  private channels = signal<ChatChannel[]>([
    { id: 'global', name: '🌍 Global Chat', type: 'global', unreadCount: 0 },
    { id: 'alliance', name: '⚔️ Alliance Chat', type: 'alliance', unreadCount: 0 },
  ]);

  readonly currentUser = this.currentPlayer.asReadonly();
  readonly allPlayers = this.players.asReadonly();
  readonly allFriends = this.friends.asReadonly();
  readonly allAlliances = this.alliances.asReadonly();
  readonly allMessages = this.messages.asReadonly();
  readonly allChannels = this.channels.asReadonly();

  readonly leaderboard = computed(() =>
    [...this.players(), this.currentPlayer()]
      .sort((a, b) => b.squadPower - a.squadPower)
      .slice(0, 20)
  );

  readonly onlinePlayers = computed(() =>
    this.players().filter(p => p.status === 'online' || p.status === 'in-mission')
  );

  readonly friendsList = computed(() => {
    const friendIds = this.friends()
      .filter(f => f.status === 'accepted')
      .map(f => f.playerId);
    return this.players().filter(p => friendIds.includes(p.id));
  });

  readonly pendingRequests = computed(() =>
    this.friends().filter(f => f.status === 'pending')
  );

  readonly myAlliance = computed(() => {
    const allianceId = this.currentPlayer().allianceId;
    return allianceId ? this.alliances().find(a => a.id === allianceId) : null;
  });

  // Player actions
  searchPlayers(query: string): Player[] {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return this.players().filter(p =>
      p.name.toLowerCase().includes(q) || p.id.includes(q)
    );
  }

  getPlayerById(id: string): Player | undefined {
    if (id === 'user-1') return this.currentPlayer();
    return this.players().find(p => p.id === id);
  }

  // Friend actions
  sendFriendRequest(playerId: string): void {
    if (this.friends().some(f => f.playerId === playerId)) return;
    const friend: Friend = {
      id: crypto.randomUUID(),
      playerId,
      status: 'pending',
      addedAt: new Date(),
    };
    this.friends.update(list => [...list, friend]);
    // Simulate auto-accept after 2 seconds
    setTimeout(() => this.acceptFriendRequest(friend.id), 2000);
  }

  acceptFriendRequest(friendId: string): void {
    this.friends.update(list =>
      list.map(f => f.id === friendId ? { ...f, status: 'accepted' as FriendStatus } : f)
    );
  }

  removeFriend(playerId: string): void {
    this.friends.update(list => list.filter(f => f.playerId !== playerId));
  }

  // Alliance actions
  createAlliance(name: string, tag: string, description: string): boolean {
    if (this.currentPlayer().allianceId) return false;
    const alliance: Alliance = {
      id: crypto.randomUUID(),
      name, tag, description,
      leaderId: 'user-1',
      memberIds: ['user-1'],
      maxMembers: 20,
      level: 1,
      totalPower: this.currentPlayer().squadPower,
      createdAt: new Date(),
      isRecruiting: true,
    };
    this.alliances.update(list => [...list, alliance]);
    this.currentPlayer.update(p => ({ ...p, allianceId: alliance.id }));
    return true;
  }

  joinAlliance(allianceId: string): boolean {
    if (this.currentPlayer().allianceId) return false;
    const alliance = this.alliances().find(a => a.id === allianceId);
    if (!alliance || !alliance.isRecruiting) return false;
    if (alliance.memberIds.length >= alliance.maxMembers) return false;

    this.alliances.update(list =>
      list.map(a => a.id === allianceId ? {
        ...a,
        memberIds: [...a.memberIds, 'user-1'],
        totalPower: a.totalPower + this.currentPlayer().squadPower
      } : a)
    );
    this.currentPlayer.update(p => ({ ...p, allianceId }));
    return true;
  }

  leaveAlliance(): void {
    const allianceId = this.currentPlayer().allianceId;
    if (!allianceId) return;

    this.alliances.update(list =>
      list.map(a => a.id === allianceId ? {
        ...a,
        memberIds: a.memberIds.filter(id => id !== 'user-1'),
        totalPower: a.totalPower - this.currentPlayer().squadPower
      } : a).filter(a => a.memberIds.length > 0)
    );
    this.currentPlayer.update(p => ({ ...p, allianceId: null }));
  }

  // Chat actions
  sendMessage(content: string, channel: 'global' | 'alliance' | 'private', recipientId?: string): void {
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: 'user-1',
      senderName: this.currentPlayer().name,
      senderAvatar: this.currentPlayer().avatar,
      content,
      channel,
      recipientId,
      timestamp: new Date(),
    };
    this.messages.update(list => [...list, msg]);
  }

  getChannelMessages(channelType: 'global' | 'alliance' | 'private', recipientId?: string): ChatMessage[] {
    return this.messages().filter(m => {
      if (m.channel !== channelType) return false;
      if (channelType === 'private') {
        return (m.senderId === 'user-1' && m.recipientId === recipientId) ||
               (m.senderId === recipientId && m.recipientId === 'user-1');
      }
      return true;
    });
  }

  private generatePlayers(): Player[] {
    const names = ['WarChief Grom', 'Shadow Master', 'Necro Lord', 'Blood Queen', 'Iron Fist',
      'Dark Blade', 'Storm Caller', 'Bone Crusher', 'Fire Mage', 'Ice Queen',
      'Thunder God', 'Death Knight', 'Soul Reaper', 'Dragon Slayer', 'Demon Hunter'];
    const avatars = ['👹', '🧙', '💀', '👸', '💪', '🗡️', '⚡', '💀', '🔥', '❄️', '⛈️', '⚔️', '👻', '🐉', '😈'];
    const statuses: PlayerStatus[] = ['online', 'offline', 'in-mission', 'away'];

    return names.map((name, i) => ({
      id: `player-${i + 1}`,
      name,
      avatar: avatars[i],
      level: Math.floor(Math.random() * 50) + 10,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      squadPower: Math.floor(Math.random() * 3000) + 500,
      missionsCompleted: Math.floor(Math.random() * 100),
      gold: Math.floor(Math.random() * 50000),
      allianceId: i < 5 ? 'alliance-1' : i < 8 ? 'alliance-2' : null,
      joinedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      lastSeen: new Date(Date.now() - Math.random() * 60 * 60 * 1000),
    }));
  }

  private generateAlliances(): Alliance[] {
    return [
      {
        id: 'alliance-1', name: 'Dark Legion', tag: 'DRK', description: 'Elite raiders seeking glory',
        leaderId: 'player-1', memberIds: ['player-1', 'player-2', 'player-3', 'player-4', 'player-5'],
        maxMembers: 20, level: 5, totalPower: 8500, createdAt: new Date(), isRecruiting: true
      },
      {
        id: 'alliance-2', name: 'Shadow Clan', tag: 'SHD', description: 'Masters of stealth and assassination',
        leaderId: 'player-6', memberIds: ['player-6', 'player-7', 'player-8'],
        maxMembers: 15, level: 3, totalPower: 4200, createdAt: new Date(), isRecruiting: true
      },
      {
        id: 'alliance-3', name: 'Blood Pact', tag: 'BLD', description: 'United by blood, bound by honor',
        leaderId: 'player-9', memberIds: ['player-9'],
        maxMembers: 10, level: 1, totalPower: 1800, createdAt: new Date(), isRecruiting: false
      },
    ];
  }

  private generateMessages(): ChatMessage[] {
    const msgs: ChatMessage[] = [];
    const senders = this.generatePlayers().slice(0, 5);
    const contents = [
      'Anyone up for a raid?', 'Just completed Dragon\'s Lair!', 'Looking for healers',
      'GG everyone!', 'Need help with the demon gate', 'Trading gems for gold'
    ];
    senders.forEach((s, i) => {
      msgs.push({
        id: `msg-${i}`, senderId: s.id, senderName: s.name, senderAvatar: s.avatar,
        content: contents[i % contents.length], channel: 'global',
        timestamp: new Date(Date.now() - (i + 1) * 300000)
      });
    });
    return msgs;
  }
}
