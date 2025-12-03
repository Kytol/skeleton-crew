import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, InputComponent } from 'ui-lib';
import { RecruitmentService } from '../../services/recruitment.service';
import { RecruitmentRequest, RequestType } from '../../models/recruitment.model';
import { MercenaryRace, MercenaryClass, RACE_CONFIG, CLASS_CONFIG } from '../../models/mercenary.model';

@Component({
  selector: 'app-recruitment-board',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="recruitment-board">
      <div class="board-header">
        <h2>📋 Recruitment Board</h2>
        <ui-button variant="primary" (clicked)="showCreateForm.set(true)">+ Post Request</ui-button>
      </div>

      @if (showCreateForm()) {
        <div class="create-form">
          <h3>Create Recruitment Request</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Request Type</label>
              <select [(ngModel)]="newRequest.requestType">
                <option value="seeking">🔍 Seeking Mercenary</option>
                <option value="offering">📢 Offering Mercenary</option>
              </select>
            </div>
            <div class="form-group">
              <label>Desired Race</label>
              <select [(ngModel)]="newRequest.desiredRace">
                <option value="any">Any Race</option>
                @for (race of races; track race) {
                  <option [value]="race">{{ getRaceEmoji(race) }} {{ race }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label>Desired Class</label>
              <select [(ngModel)]="newRequest.desiredClass">
                <option value="any">Any Class</option>
                @for (cls of classes; track cls) {
                  <option [value]="cls">{{ getClassIcon(cls) }} {{ cls }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label>Level Range</label>
              <div class="range-inputs">
                <input type="number" [(ngModel)]="newRequest.levelMin" min="1" max="100" />
                <span>to</span>
                <input type="number" [(ngModel)]="newRequest.levelMax" min="1" max="100" />
              </div>
            </div>
            <div class="form-group">
              <label>Compensation (Gold)</label>
              <input type="number" [(ngModel)]="newRequest.compensation" min="0" />
            </div>
            <div class="form-group">
              <label>Duration (Days)</label>
              <input type="number" [(ngModel)]="newRequest.duration" min="1" />
            </div>
          </div>
          <div class="form-group full-width">
            <label>Description</label>
            <textarea [(ngModel)]="newRequest.description" rows="3" placeholder="Describe your requirements..."></textarea>
          </div>
          <div class="form-actions">
            <ui-button variant="outline" (clicked)="showCreateForm.set(false)">Cancel</ui-button>
            <ui-button variant="primary" (clicked)="createRequest()">Post Request</ui-button>
          </div>
        </div>
      }

      <div class="requests-list">
        @for (request of recruitmentService.openRequests(); track request.id) {
          <div class="request-card" [class]="request.requestType">
            <div class="request-header">
              <span class="type-badge" [class]="request.requestType">
                {{ request.requestType === 'seeking' ? '🔍 Seeking' : '📢 Offering' }}
              </span>
              <span class="time">{{ getTimeAgo(request.createdAt) }}</span>
            </div>
            <div class="request-body">
              <div class="requester">
                <span class="name">{{ request.requesterName }}</span>
              </div>
              <div class="requirements">
                <span class="tag">{{ request.desiredRace === 'any' ? 'Any Race' : getRaceEmoji(request.desiredRace) + ' ' + request.desiredRace }}</span>
                <span class="tag">{{ request.desiredClass === 'any' ? 'Any Class' : getClassIcon(request.desiredClass) + ' ' + request.desiredClass }}</span>
                <span class="tag">Lv.{{ request.levelRange[0] }}-{{ request.levelRange[1] }}</span>
              </div>
              <p class="description">{{ request.description }}</p>
              <div class="offer-info">
                <span class="compensation">💰 {{ request.offeredCompensation }} Gold</span>
                <span class="duration">📅 {{ request.duration }} days</span>
              </div>
            </div>
            <div class="request-footer">
              <span class="responses">💬 {{ request.responses.length }} responses</span>
              <ui-button variant="primary" size="sm" (clicked)="openResponseModal(request)">Respond</ui-button>
            </div>
          </div>
        }
      </div>

      @if (selectedRequest()) {
        <div class="modal-overlay" (click)="closeResponseModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <button class="close-btn" (click)="closeResponseModal()">✕</button>
            <h3>Respond to Request</h3>
            <div class="request-summary">
              <p><strong>{{ selectedRequest()!.requesterName }}</strong> is {{ selectedRequest()!.requestType === 'seeking' ? 'looking for' : 'offering' }}:</p>
              <p>{{ selectedRequest()!.desiredRace }} {{ selectedRequest()!.desiredClass }} (Lv.{{ selectedRequest()!.levelRange[0] }}-{{ selectedRequest()!.levelRange[1] }})</p>
            </div>
            <div class="response-form">
              <label>Your Message</label>
              <textarea [(ngModel)]="responseMessage" rows="4" placeholder="Write your response..."></textarea>
              <label>Counter Offer (optional)</label>
              <input type="number" [(ngModel)]="counterOffer" placeholder="Leave empty to accept original offer" />
            </div>
            <div class="modal-actions">
              <ui-button variant="outline" (clicked)="closeResponseModal()">Cancel</ui-button>
              <ui-button variant="primary" (clicked)="submitResponse()">Send Response</ui-button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .recruitment-board { padding: 20px 0; }
    .board-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .board-header h2 { color: var(--accent-gold); margin: 0; }
    .create-form {
      background: var(--bg-card); border: 2px solid var(--border-primary);
      border-radius: 12px; padding: 24px; margin-bottom: 24px;
    }
    .create-form h3 { color: var(--text-primary); margin: 0 0 20px; }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group.full-width { grid-column: 1 / -1; }
    .form-group label { color: var(--text-secondary); font-size: 0.85rem; }
    .form-group select, .form-group input, .form-group textarea {
      background: var(--input-bg); color: var(--text-primary);
      border: 1px solid var(--border-primary); border-radius: 6px;
      padding: 10px; font-size: 0.9rem;
    }
    .form-group textarea { resize: vertical; }
    .range-inputs { display: flex; align-items: center; gap: 8px; }
    .range-inputs input { width: 80px; }
    .range-inputs span { color: var(--text-muted); }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
    .requests-list { display: flex; flex-direction: column; gap: 16px; }
    .request-card {
      background: var(--bg-card); border: 2px solid var(--border-primary);
      border-radius: 12px; padding: 20px;
    }
    .request-card.seeking { border-left: 4px solid #5a8ac4; }
    .request-card.offering { border-left: 4px solid #5ac47a; }
    .request-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
    .type-badge {
      padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;
    }
    .type-badge.seeking { background: rgba(90,138,196,0.2); color: #5a8ac4; }
    .type-badge.offering { background: rgba(90,196,122,0.2); color: #5ac47a; }
    .time { color: var(--text-muted); font-size: 0.8rem; }
    .requester .name { color: var(--text-white); font-weight: bold; }
    .requirements { display: flex; gap: 8px; margin: 12px 0; flex-wrap: wrap; }
    .tag { background: var(--card-overlay); padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; color: var(--text-secondary); }
    .description { color: var(--text-secondary); margin: 12px 0; font-size: 0.9rem; }
    .offer-info { display: flex; gap: 20px; }
    .compensation { color: var(--accent-gold); font-weight: bold; }
    .duration { color: var(--text-muted); }
    .request-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-secondary); }
    .responses { color: var(--text-muted); font-size: 0.85rem; }
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.8);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
    }
    .modal-content {
      background: var(--bg-secondary); border: 2px solid var(--border-primary);
      border-radius: 16px; padding: 24px; max-width: 500px; width: 90%; position: relative;
    }
    .close-btn {
      position: absolute; top: 16px; right: 16px;
      background: transparent; border: none; color: var(--text-muted);
      font-size: 1.5rem; cursor: pointer;
    }
    .modal-content h3 { color: var(--accent-gold); margin: 0 0 16px; }
    .request-summary { background: var(--card-overlay); padding: 12px; border-radius: 8px; margin-bottom: 16px; }
    .request-summary p { color: var(--text-secondary); margin: 4px 0; }
    .response-form { display: flex; flex-direction: column; gap: 12px; }
    .response-form label { color: var(--text-secondary); font-size: 0.85rem; }
    .response-form textarea, .response-form input {
      background: var(--input-bg); color: var(--text-primary);
      border: 1px solid var(--border-primary); border-radius: 6px; padding: 10px;
    }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
  `]
})
export class RecruitmentBoardComponent {
  recruitmentService = inject(RecruitmentService);

  showCreateForm = signal(false);
  selectedRequest = signal<RecruitmentRequest | null>(null);
  responseMessage = '';
  counterOffer: number | null = null;

  races: MercenaryRace[] = ['Orc', 'Goblin', 'Warlock', 'Troll', 'Undead', 'Demon', 'Dark Elf'];
  classes: MercenaryClass[] = ['Warrior', 'Assassin', 'Mage', 'Tank', 'Healer', 'Berserker', 'Necromancer'];

  newRequest = {
    requestType: 'seeking' as RequestType,
    desiredRace: 'any' as MercenaryRace | 'any',
    desiredClass: 'any' as MercenaryClass | 'any',
    levelMin: 1,
    levelMax: 100,
    compensation: 1000,
    duration: 7,
    description: '',
  };

  getRaceEmoji(race: string): string { return RACE_CONFIG[race as MercenaryRace]?.emoji || ''; }
  getClassIcon(cls: string): string { return CLASS_CONFIG[cls as MercenaryClass]?.icon || ''; }

  getTimeAgo(date: Date): string {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  createRequest(): void {
    this.recruitmentService.createRequest({
      requestType: this.newRequest.requestType,
      desiredRace: this.newRequest.desiredRace,
      desiredClass: this.newRequest.desiredClass,
      levelRange: [this.newRequest.levelMin, this.newRequest.levelMax],
      offeredCompensation: this.newRequest.compensation,
      duration: this.newRequest.duration,
      description: this.newRequest.description,
    });
    this.showCreateForm.set(false);
    this.resetForm();
  }

  openResponseModal(request: RecruitmentRequest): void {
    this.selectedRequest.set(request);
    this.responseMessage = '';
    this.counterOffer = null;
  }

  closeResponseModal(): void {
    this.selectedRequest.set(null);
  }

  submitResponse(): void {
    const request = this.selectedRequest();
    if (request && this.responseMessage.trim()) {
      this.recruitmentService.respondToRequest(
        request.id,
        this.responseMessage,
        this.counterOffer || undefined
      );
      this.closeResponseModal();
    }
  }

  private resetForm(): void {
    this.newRequest = {
      requestType: 'seeking',
      desiredRace: 'any',
      desiredClass: 'any',
      levelMin: 1,
      levelMax: 100,
      compensation: 1000,
      duration: 7,
      description: '',
    };
  }
}
