import { MercenaryRace, MercenaryClass } from './mercenary.model';

export type RequestType = 'seeking' | 'offering';
export type RequestStatus = 'open' | 'pending' | 'completed' | 'cancelled';

export interface RecruitmentRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requestType: RequestType;
  desiredRace: MercenaryRace | 'any';
  desiredClass: MercenaryClass | 'any';
  levelRange: [number, number];
  offeredCompensation: number;
  duration: number; // days
  status: RequestStatus;
  description: string;
  createdAt: Date;
  responses: RequestResponse[];
}

export interface RequestResponse {
  id: string;
  responderId: string;
  responderName: string;
  message: string;
  offeredMercenaryId?: string;
  counterOffer?: number;
  createdAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Notification {
  id: string;
  type: 'response' | 'accepted' | 'rejected' | 'new-match';
  title: string;
  message: string;
  requestId?: string;
  read: boolean;
  createdAt: Date;
}
