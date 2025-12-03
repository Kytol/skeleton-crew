import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from 'ui-lib';
import { MercenaryService } from '../../services/mercenary.service';
import { MercenaryRace, MercenaryClass, RACE_CONFIG, CLASS_CONFIG } from '../../models/mercenary.model';

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <aside class="filter-sidebar">
      <h3>🔍 Filters</h3>
      
      <div class="filter-section">
        <h4>Race</h4>
        <div class="checkbox-group">
          @for (race of races; track race) {
            <label class="checkbox-item">
              <input type="checkbox" [checked]="isRaceSelected(race)" (change)="toggleRace(race)" />
              <span>{{ getRaceEmoji(race) }} {{ race }}</span>
            </label>
          }
        </div>
      </div>

      <div class="filter-section">
        <h4>Class</h4>
        <div class="checkbox-group">
          @for (cls of classes; track cls) {
            <label class="checkbox-item">
              <input type="checkbox" [checked]="isClassSelected(cls)" (change)="toggleClass(cls)" />
              <span>{{ getClassIcon(cls) }} {{ cls }}</span>
            </label>
          }
        </div>
      </div>

      <div class="filter-section">
        <h4>Level Range</h4>
        <div class="range-inputs">
          <input type="number" [value]="filters().levelRange[0]" (change)="updateLevelMin($event)" min="1" max="100" />
          <span>to</span>
          <input type="number" [value]="filters().levelRange[1]" (change)="updateLevelMax($event)" min="1" max="100" />
        </div>
      </div>

      <div class="filter-section">
        <h4>Hire Cost</h4>
        <div class="range-inputs">
          <input type="number" [value]="filters().costRange[0]" (change)="updateCostMin($event)" min="0" />
          <span>to</span>
          <input type="number" [value]="filters().costRange[1]" (change)="updateCostMax($event)" />
        </div>
      </div>

      <div class="filter-section">
        <h4>Status</h4>
        <select [value]="filters().status" (change)="updateStatus($event)">
          <option value="all">All</option>
          <option value="available">Available</option>
          <option value="hired">Hired</option>
          <option value="on-mission">On Mission</option>
        </select>
      </div>

      <ui-button variant="outline" (clicked)="resetFilters()">Reset Filters</ui-button>
    </aside>
  `,
  styles: [`
    .filter-sidebar {
      background: var(--bg-card);
      border: 2px solid var(--border-primary);
      border-radius: 12px;
      padding: 20px;
      height: fit-content;
      position: sticky;
      top: 24px;
    }
    h3 { color: var(--accent-gold); margin: 0 0 20px; font-size: 1.25rem; }
    h4 { color: var(--text-primary); margin: 0 0 12px; font-size: 0.9rem; }
    .filter-section { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border-secondary); }
    .checkbox-group { display: flex; flex-direction: column; gap: 8px; }
    .checkbox-item {
      display: flex; align-items: center; gap: 8px;
      color: var(--text-secondary); font-size: 0.85rem; cursor: pointer;
    }
    .checkbox-item input { accent-color: var(--accent-purple); }
    .range-inputs { display: flex; align-items: center; gap: 8px; }
    .range-inputs input {
      width: 80px; padding: 8px;
      background: var(--input-bg); color: var(--text-primary);
      border: 1px solid var(--border-primary); border-radius: 6px;
    }
    .range-inputs span { color: var(--text-muted); }
    select {
      width: 100%; padding: 10px;
      background: var(--input-bg); color: var(--text-primary);
      border: 1px solid var(--border-primary); border-radius: 6px;
    }
  `]
})
export class FilterSidebarComponent {
  private mercenaryService = inject(MercenaryService);
  filters = this.mercenaryService.filters;

  races: MercenaryRace[] = ['Orc', 'Goblin', 'Warlock', 'Troll', 'Undead', 'Demon', 'Dark Elf'];
  classes: MercenaryClass[] = ['Warrior', 'Assassin', 'Mage', 'Tank', 'Healer', 'Berserker', 'Necromancer'];

  getRaceEmoji(race: MercenaryRace): string { return RACE_CONFIG[race].emoji; }
  getClassIcon(cls: MercenaryClass): string { return CLASS_CONFIG[cls].icon; }

  isRaceSelected(race: MercenaryRace): boolean {
    return this.filters().races.includes(race);
  }

  isClassSelected(cls: MercenaryClass): boolean {
    return this.filters().classes.includes(cls);
  }

  toggleRace(race: MercenaryRace): void {
    const current = this.filters().races;
    const races = current.includes(race) ? current.filter(r => r !== race) : [...current, race];
    this.mercenaryService.updateFilters({ races });
  }

  toggleClass(cls: MercenaryClass): void {
    const current = this.filters().classes;
    const classes = current.includes(cls) ? current.filter(c => c !== cls) : [...current, cls];
    this.mercenaryService.updateFilters({ classes });
  }

  updateLevelMin(e: Event): void {
    const val = +(e.target as HTMLInputElement).value;
    this.mercenaryService.updateFilters({ levelRange: [val, this.filters().levelRange[1]] });
  }

  updateLevelMax(e: Event): void {
    const val = +(e.target as HTMLInputElement).value;
    this.mercenaryService.updateFilters({ levelRange: [this.filters().levelRange[0], val] });
  }

  updateCostMin(e: Event): void {
    const val = +(e.target as HTMLInputElement).value;
    this.mercenaryService.updateFilters({ costRange: [val, this.filters().costRange[1]] });
  }

  updateCostMax(e: Event): void {
    const val = +(e.target as HTMLInputElement).value;
    this.mercenaryService.updateFilters({ costRange: [this.filters().costRange[0], val] });
  }

  updateStatus(e: Event): void {
    const status = (e.target as HTMLSelectElement).value as any;
    this.mercenaryService.updateFilters({ status });
  }

  resetFilters(): void {
    this.mercenaryService.updateFilters({
      races: [], classes: [], levelRange: [1, 100], costRange: [0, 10000], status: 'all'
    });
  }
}
