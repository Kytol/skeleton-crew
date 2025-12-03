import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from 'ui-lib';
import { SquadService } from '../../services/squad.service';
import { MercenaryService } from '../../services/mercenary.service';
import { RACE_CONFIG, CLASS_CONFIG } from '../../models/mercenary.model';

@Component({
  selector: 'app-squad-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <div class="squad-panel">
      <div class="squad-header">
        <div class="squad-title">
          @if (isEditing) {
            <input [(ngModel)]="editName" (blur)="saveName()" (keyup.enter)="saveName()" />
          } @else {
            <h2>{{ squadService.currentSquad().name }}</h2>
            <button class="edit-btn" (click)="startEdit()">✏️</button>
          }
        </div>
        <div class="squad-stats">
          <span class="count">👥 {{ squadService.squadSize() }}/{{ squadService.currentSquad().maxCapacity }}</span>
          <span class="upkeep">💰 {{ squadService.totalUpkeep() }}/day</span>
        </div>
      </div>

      <div class="formation">
        @for (row of formationRows; track row) {
          <div class="formation-row">
            <span class="row-label">{{ row | titlecase }}</span>
            <div class="slots">
              @for (slot of getRowSlots(row); track slot.position) {
                <div
                  class="slot"
                  [class.filled]="slot.mercenaryId"
                  [class.drop-target]="dragOverSlot === slot.position"
                  (dragover)="onDragOver($event, slot.position)"
                  (dragleave)="onDragLeave()"
                  (drop)="onDrop($event, slot.position)"
                >
                  @if (slot.mercenaryId) {
                    @if (getMercenary(slot.mercenaryId); as merc) {
                      <div
                        class="merc-mini"
                        draggable="true"
                        (dragstart)="onDragStart($event, merc.id)"
                        (dragend)="onDragEnd()"
                      >
                        <span class="avatar">{{ merc.avatar }}</span>
                        <div class="merc-info">
                          <span class="name">{{ merc.name }}</span>
                          <span class="level">Lv.{{ merc.level }}</span>
                        </div>
                        <button class="remove-btn" (click)="removeFromSquad(merc.id)">✕</button>
                      </div>
                    }
                  } @else {
                    <span class="empty-slot">+</span>
                  }
                </div>
              }
            </div>
          </div>
        }
      </div>

      <div class="squad-actions">
        <h4>Quick Add Available</h4>
        <div class="available-list">
          @for (merc of availableMercenaries().slice(0, 5); track merc.id) {
            <div class="available-item">
              <span>{{ merc.avatar }} {{ merc.name }} (Lv.{{ merc.level }})</span>
              <ui-button variant="primary" size="sm" (clicked)="addToSquad(merc.id)">+</ui-button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .squad-panel {
      background: var(--bg-card);
      border: 2px solid var(--accent-gold);
      border-radius: 12px;
      padding: 20px;
    }
    .squad-header { margin-bottom: 20px; }
    .squad-title { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .squad-title h2 { color: var(--accent-gold); margin: 0; font-size: 1.25rem; }
    .squad-title input {
      background: var(--input-bg); color: var(--text-primary);
      border: 1px solid var(--accent-gold); border-radius: 4px;
      padding: 4px 8px; font-size: 1.1rem;
    }
    .edit-btn { background: transparent; border: none; cursor: pointer; font-size: 1rem; }
    .squad-stats { display: flex; gap: 16px; color: var(--text-secondary); font-size: 0.9rem; }
    .formation { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
    .formation-row { display: flex; align-items: center; gap: 12px; }
    .row-label { width: 60px; color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; }
    .slots { display: flex; gap: 8px; flex: 1; }
    .slot {
      flex: 1; min-height: 60px;
      background: var(--card-overlay); border: 2px dashed var(--border-secondary);
      border-radius: 8px; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    .slot.filled { border-style: solid; border-color: var(--border-primary); }
    .slot.drop-target { border-color: var(--accent-gold); background: rgba(255,215,0,0.1); }
    .empty-slot { color: var(--text-muted); font-size: 1.5rem; }
    .merc-mini {
      display: flex; align-items: center; gap: 8px; padding: 8px;
      width: 100%; cursor: grab;
    }
    .merc-mini:active { cursor: grabbing; }
    .avatar { font-size: 1.5rem; }
    .merc-info { flex: 1; display: flex; flex-direction: column; }
    .name { color: var(--text-primary); font-size: 0.75rem; font-weight: bold; }
    .level { color: var(--text-muted); font-size: 0.65rem; }
    .remove-btn {
      background: rgba(154,76,76,0.3); border: none; color: #ff6b6b;
      width: 20px; height: 20px; border-radius: 50%; cursor: pointer;
      font-size: 0.7rem;
    }
    .squad-actions h4 { color: var(--text-secondary); margin: 0 0 12px; font-size: 0.9rem; }
    .available-list { display: flex; flex-direction: column; gap: 8px; max-height: 200px; overflow-y: auto; }
    .available-item {
      display: flex; justify-content: space-between; align-items: center;
      background: var(--card-overlay); padding: 8px 12px; border-radius: 6px;
      font-size: 0.85rem; color: var(--text-secondary);
    }
  `]
})
export class SquadPanelComponent {
  squadService = inject(SquadService);
  private mercenaryService = inject(MercenaryService);
  
  formationRows = ['front', 'middle', 'back'] as const;
  
  getRowSlots(row: 'front' | 'middle' | 'back') {
    return this.squadService.formationByRow()[row];
  }

  isEditing = false;
  editName = '';
  draggedMercId: string | null = null;
  dragOverSlot: number | null = null;

  availableMercenaries = this.mercenaryService.filteredMercenaries;

  getMercenary(id: string) {
    return this.mercenaryService.getMercenaryById(id);
  }

  startEdit(): void {
    this.editName = this.squadService.currentSquad().name;
    this.isEditing = true;
  }

  saveName(): void {
    if (this.editName.trim()) {
      this.squadService.renameSquad(this.editName.trim());
    }
    this.isEditing = false;
  }

  addToSquad(mercId: string): void {
    this.squadService.addToSquad(mercId);
  }

  removeFromSquad(mercId: string): void {
    this.squadService.removeFromSquad(mercId);
  }

  onDragStart(e: DragEvent, mercId: string): void {
    this.draggedMercId = mercId;
    e.dataTransfer?.setData('text/plain', mercId);
  }

  onDragEnd(): void {
    this.draggedMercId = null;
    this.dragOverSlot = null;
  }

  onDragOver(e: DragEvent, slotPosition: number): void {
    e.preventDefault();
    this.dragOverSlot = slotPosition;
  }

  onDragLeave(): void {
    this.dragOverSlot = null;
  }

  onDrop(e: DragEvent, slotPosition: number): void {
    e.preventDefault();
    if (this.draggedMercId) {
      this.squadService.moveInSquad(this.draggedMercId, slotPosition);
    }
    this.draggedMercId = null;
    this.dragOverSlot = null;
  }
}
