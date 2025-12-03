import { Injectable, signal, computed, inject } from '@angular/core';
import { Squad, SquadSlot, MAX_SQUAD_CAPACITY, FormationPosition } from '../models/squad.model';
import { MercenaryService } from './mercenary.service';

@Injectable({ providedIn: 'root' })
export class SquadService {
  private mercenaryService = inject(MercenaryService);

  private squad = signal<Squad>({
    id: crypto.randomUUID(),
    name: 'My Raid Squad',
    maxCapacity: MAX_SQUAD_CAPACITY,
    slots: this.initializeSlots(),
    totalUpkeep: 0,
    createdAt: new Date(),
  });

  readonly currentSquad = this.squad.asReadonly();

  readonly squadMembers = computed(() => {
    const slots = this.squad().slots;
    return slots
      .filter(s => s.mercenaryId)
      .map(s => ({
        slot: s,
        mercenary: this.mercenaryService.getMercenaryById(s.mercenaryId!)
      }))
      .filter(m => m.mercenary);
  });

  readonly squadSize = computed(() => this.squadMembers().length);

  readonly totalUpkeep = computed(() =>
    this.squadMembers().reduce((sum, m) => sum + (m.mercenary?.dailyUpkeep || 0), 0)
  );

  readonly formationByRow = computed(() => {
    const slots = this.squad().slots;
    return {
      front: slots.filter(s => s.row === 'front'),
      middle: slots.filter(s => s.row === 'middle'),
      back: slots.filter(s => s.row === 'back'),
    };
  });

  private initializeSlots(): SquadSlot[] {
    const slots: SquadSlot[] = [];
    const rows: FormationPosition[] = ['front', 'middle', 'back'];
    let position = 0;
    rows.forEach(row => {
      for (let i = 0; i < 4; i++) {
        slots.push({ position: position++, row, mercenaryId: null });
      }
    });
    return slots;
  }

  addToSquad(mercenaryId: string, slotPosition?: number): boolean {
    const slots = this.squad().slots;
    const emptySlot = slotPosition !== undefined
      ? slots.find(s => s.position === slotPosition && !s.mercenaryId)
      : slots.find(s => !s.mercenaryId);

    if (!emptySlot) return false;

    // Check if already in squad
    if (slots.some(s => s.mercenaryId === mercenaryId)) return false;

    this.squad.update(sq => ({
      ...sq,
      slots: sq.slots.map(s =>
        s.position === emptySlot.position ? { ...s, mercenaryId } : s
      )
    }));

    this.mercenaryService.hireMercenary(mercenaryId);
    return true;
  }

  removeFromSquad(mercenaryId: string): void {
    this.squad.update(sq => ({
      ...sq,
      slots: sq.slots.map(s =>
        s.mercenaryId === mercenaryId ? { ...s, mercenaryId: null } : s
      )
    }));
    this.mercenaryService.releaseMercenary(mercenaryId);
  }

  moveInSquad(mercenaryId: string, toPosition: number): void {
    const slots = this.squad().slots;
    const fromSlot = slots.find(s => s.mercenaryId === mercenaryId);
    const toSlot = slots.find(s => s.position === toPosition);

    if (!fromSlot || !toSlot) return;

    this.squad.update(sq => ({
      ...sq,
      slots: sq.slots.map(s => {
        if (s.position === fromSlot.position) {
          return { ...s, mercenaryId: toSlot.mercenaryId };
        }
        if (s.position === toPosition) {
          return { ...s, mercenaryId };
        }
        return s;
      })
    }));
  }

  renameSquad(name: string): void {
    this.squad.update(sq => ({ ...sq, name }));
  }

  isInSquad(mercenaryId: string): boolean {
    return this.squad().slots.some(s => s.mercenaryId === mercenaryId);
  }
}
