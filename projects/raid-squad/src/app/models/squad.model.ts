import { Mercenary } from './mercenary.model';

export type FormationPosition = 'front' | 'middle' | 'back';

export interface SquadSlot {
  position: number;
  row: FormationPosition;
  mercenaryId: string | null;
}

export interface Squad {
  id: string;
  name: string;
  maxCapacity: number;
  slots: SquadSlot[];
  totalUpkeep: number;
  createdAt: Date;
}

export const MAX_SQUAD_CAPACITY = 12;
export const FORMATION_ROWS: FormationPosition[] = ['front', 'middle', 'back'];
