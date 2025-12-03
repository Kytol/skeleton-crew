import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchComponent } from 'ui-lib';
import { MercenaryService } from '../../services/mercenary.service';
import { SortOption } from '../../models/mercenary.model';

@Component({
  selector: 'app-search-sort-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchComponent],
  template: `
    <div class="search-sort-bar">
      <div class="search-wrapper">
        <ui-search
          placeholder="Search mercenaries..."
          [value]="mercenaryService.searchQuery()"
          (valueChange)="onSearch($event)"
        />
      </div>
      <div class="sort-wrapper">
        <label>Sort by:</label>
        <select [value]="mercenaryService.sortOption()" (change)="onSort($event)">
          <option value="rating-desc">⭐ Rating (High to Low)</option>
          <option value="level-desc">📈 Level (High to Low)</option>
          <option value="level-asc">📉 Level (Low to High)</option>
          <option value="cost-asc">💰 Cost (Low to High)</option>
          <option value="cost-desc">💰 Cost (High to Low)</option>
          <option value="name-asc">🔤 Name (A-Z)</option>
        </select>
      </div>
      <div class="results-count">
        {{ mercenaryService.filteredMercenaries().length }} mercenaries found
      </div>
    </div>
  `,
  styles: [`
    .search-sort-bar {
      display: flex;
      align-items: center;
      gap: 20px;
      background: var(--bg-card);
      border: 2px solid var(--border-primary);
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .search-wrapper { flex: 1; min-width: 250px; }
    .sort-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .sort-wrapper label {
      color: var(--text-secondary);
      font-size: 0.9rem;
      white-space: nowrap;
    }
    .sort-wrapper select {
      background: var(--input-bg);
      color: var(--text-primary);
      border: 1px solid var(--border-primary);
      border-radius: 6px;
      padding: 10px 14px;
      font-size: 0.9rem;
      min-width: 200px;
    }
    .results-count {
      color: var(--text-muted);
      font-size: 0.85rem;
      margin-left: auto;
    }
  `]
})
export class SearchSortBarComponent {
  mercenaryService = inject(MercenaryService);

  onSearch(query: string): void {
    this.mercenaryService.setSearch(query);
  }

  onSort(e: Event): void {
    const option = (e.target as HTMLSelectElement).value as SortOption;
    this.mercenaryService.setSort(option);
  }
}
