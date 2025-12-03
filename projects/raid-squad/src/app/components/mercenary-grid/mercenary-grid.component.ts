import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MercenaryService } from '../../services/mercenary.service';
import { MercenaryCardComponent } from '../mercenary-card/mercenary-card.component';
import { MercenaryDetailModalComponent } from '../mercenary-detail-modal/mercenary-detail-modal.component';
import { Mercenary } from '../../models/mercenary.model';

@Component({
  selector: 'app-mercenary-grid',
  standalone: true,
  imports: [CommonModule, MercenaryCardComponent, MercenaryDetailModalComponent],
  template: `
    <div class="mercenary-grid">
      @if (mercenaryService.filteredMercenaries().length === 0) {
        <div class="empty-state">
          <span class="empty-icon">🔍</span>
          <h3>No mercenaries found</h3>
          <p>Try adjusting your filters or search query</p>
        </div>
      } @else {
        @for (merc of mercenaryService.filteredMercenaries(); track merc.id) {
          <app-mercenary-card
            [mercenary]="merc"
            (viewDetails)="openDetail($event)"
            (hireClick)="hireMercenary($event)"
            (releaseClick)="releaseMercenary($event)"
          />
        }
      }
    </div>

    <app-mercenary-detail-modal
      [mercenary]="selectedMercenary()"
      (close)="closeDetail()"
      (hire)="hireMercenary($event); closeDetail()"
      (release)="releaseMercenary($event); closeDetail()"
    />
  `,
  styles: [`
    .mercenary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }
    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 60px 20px;
      background: var(--bg-card);
      border: 2px dashed var(--border-secondary);
      border-radius: 12px;
    }
    .empty-icon { font-size: 4rem; display: block; margin-bottom: 16px; }
    .empty-state h3 { color: var(--text-primary); margin: 0 0 8px; }
    .empty-state p { color: var(--text-muted); margin: 0; }
  `]
})
export class MercenaryGridComponent {
  mercenaryService = inject(MercenaryService);
  selectedMercenary = signal<Mercenary | null>(null);

  openDetail(merc: Mercenary): void {
    this.selectedMercenary.set(merc);
  }

  closeDetail(): void {
    this.selectedMercenary.set(null);
  }

  hireMercenary(merc: Mercenary): void {
    this.mercenaryService.hireMercenary(merc.id);
  }

  releaseMercenary(merc: Mercenary): void {
    this.mercenaryService.releaseMercenary(merc.id);
  }
}
