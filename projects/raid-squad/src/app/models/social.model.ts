export type PlayerStatus = 'online' | 'offline' | 'in-mission' | 'away';
export type FriendStatus = 'pending' | 'accepted' | 'blocked';
export type AllianceRole = 'leader' | 'officer' | 'member';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  level: number;
  status: PlayerStatus;
  squadPower: number;
  missionsCompleted: number;
  gold: number;
  allianceId: string | null;
  joinedAt: Date;
  lastSeen: Date;
}

export interface Friend {
  id: string;
  playerId: string;
  status: FriendStatus;
  addedAt: Date;
}

export interface Alliance {
  id: string;
  name: string;
  tag: string;
  description: string;
  leaderId: string;
  memberIds: string[];
  maxMembers: number;
  level: number;
  totalPower: number;
  createdAt: Date;
  isRecruiting: boolean;
}

export interface AllianceMember {
  playerId: string;
  role: AllianceRole;
  joinedAt: Date;
  contribution: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  channel: 'global' | 'alliance' | 'private';
  recipientId?: string;
  timestamp: Date;
}

export interface ChatChannel {
  id: string;
  name: string;
  type: 'global' | 'alliance' | 'private';
  participantIds?: string[];
  unreadCount: number;
}
