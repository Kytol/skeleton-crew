import { Injectable, signal, computed } from '@angular/core';
import {
  RecruitmentRequest, RequestResponse, Notification,
  RequestType, RequestStatus
} from '../models/recruitment.model';
import { MercenaryRace, MercenaryClass } from '../models/mercenary.model';

@Injectable({ providedIn: 'root' })
export class RecruitmentService {
  private requests = signal<RecruitmentRequest[]>(this.generateSampleRequests());
  private notifications = signal<Notification[]>([]);
  private currentUserId = 'user-1';
  private currentUserName = 'Commander';

  readonly allRequests = this.requests.asReadonly();
  readonly allNotifications = this.notifications.asReadonly();

  readonly openRequests = computed(() =>
    this.requests().filter(r => r.status === 'open')
  );

  readonly myRequests = computed(() =>
    this.requests().filter(r => r.requesterId === this.currentUserId)
  );

  readonly unreadNotifications = computed(() =>
    this.notifications().filter(n => !n.read)
  );

  readonly unreadCount = computed(() => this.unreadNotifications().length);

  createRequest(data: {
    requestType: RequestType;
    desiredRace: MercenaryRace | 'any';
    desiredClass: MercenaryClass | 'any';
    levelRange: [number, number];
    offeredCompensation: number;
    duration: number;
    description: string;
  }): void {
    const request: RecruitmentRequest = {
      id: crypto.randomUUID(),
      requesterId: this.currentUserId,
      requesterName: this.currentUserName,
      ...data,
      status: 'open',
      createdAt: new Date(),
      responses: [],
    };
    this.requests.update(list => [request, ...list]);
  }

  respondToRequest(requestId: string, message: string, counterOffer?: number): void {
    this.requests.update(list =>
      list.map(r => {
        if (r.id === requestId) {
          const response: RequestResponse = {
            id: crypto.randomUUID(),
            responderId: this.currentUserId,
            responderName: this.currentUserName,
            message,
            counterOffer,
            createdAt: new Date(),
            status: 'pending',
          };
          return { ...r, responses: [...r.responses, response] };
        }
        return r;
      })
    );

    // Add notification for request owner
    this.addNotification({
      type: 'response',
      title: 'New Response',
      message: `Someone responded to your recruitment request`,
      requestId,
    });
  }

  acceptResponse(requestId: string, responseId: string): void {
    this.requests.update(list =>
      list.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'completed' as RequestStatus,
            responses: r.responses.map(res =>
              res.id === responseId
                ? { ...res, status: 'accepted' as const }
                : { ...res, status: 'rejected' as const }
            ),
          };
        }
        return r;
      })
    );
  }

  cancelRequest(requestId: string): void {
    this.requests.update(list =>
      list.map(r => r.id === requestId ? { ...r, status: 'cancelled' as RequestStatus } : r)
    );
  }

  private addNotification(data: Omit<Notification, 'id' | 'read' | 'createdAt'>): void {
    const notification: Notification = {
      id: crypto.randomUUID(),
      ...data,
      read: false,
      createdAt: new Date(),
    };
    this.notifications.update(list => [notification, ...list]);
  }

  markAsRead(notificationId: string): void {
    this.notifications.update(list =>
      list.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }

  markAllAsRead(): void {
    this.notifications.update(list => list.map(n => ({ ...n, read: true })));
  }

  private generateSampleRequests(): RecruitmentRequest[] {
    return [
      {
        id: '1',
        requesterId: 'user-2',
        requesterName: 'WarChief Grom',
        requestType: 'seeking',
        desiredRace: 'Orc',
        desiredClass: 'Warrior',
        levelRange: [50, 80],
        offeredCompensation: 5000,
        duration: 7,
        status: 'open',
        description: 'Need a strong Orc warrior for upcoming siege. Must have experience in frontline combat.',
        createdAt: new Date(Date.now() - 3600000),
        responses: [],
      },
      {
        id: '2',
        requesterId: 'user-3',
        requesterName: 'Shadow Master',
        requestType: 'offering',
        desiredRace: 'Dark Elf',
        desiredClass: 'Assassin',
        levelRange: [60, 90],
        offeredCompensation: 3000,
        duration: 14,
        status: 'open',
        description: 'Offering elite Dark Elf assassin for hire. Specializes in stealth operations.',
        createdAt: new Date(Date.now() - 7200000),
        responses: [],
      },
      {
        id: '3',
        requesterId: 'user-4',
        requesterName: 'Necro Lord',
        requestType: 'seeking',
        desiredRace: 'Undead',
        desiredClass: 'Necromancer',
        levelRange: [70, 100],
        offeredCompensation: 8000,
        duration: 30,
        status: 'open',
        description: 'Seeking powerful necromancer for long-term raid campaign. Top compensation!',
        createdAt: new Date(Date.now() - 86400000),
        responses: [],
      },
    ];
  }
}
