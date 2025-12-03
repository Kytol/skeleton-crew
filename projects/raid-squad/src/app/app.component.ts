import { Component, inject } from '@angular/core';
import { FilterSidebarComponent } from './components/filter-sidebar/filter-sidebar.component';
import { SearchSortBarComponent } from './components/search-sort-bar/search-sort-bar.component';
import { MercenaryGridComponent } from './components/mercenary-grid/mercenary-grid.component';
import { StatsHeaderComponent } from './components/stats-header/stats-header.component';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FilterSidebarComponent, SearchSortBarComponent, MercenaryGridComponent, StatsHeaderComponent, ThemeToggleComponent],
  template: `
    <div class="app-container">
      <header>
        <div class="header-top">
          <app-theme-toggle />
        </div>
        <h1>{{ themeService.isDark() ? '🌑' : '🔥' }} Raid Squad</h1>
        <p class="subtitle">Gang Recruitment Portal</p>
        <p class="tagline">{{ themeService.isDark() ? 'Strike from the shadows of the eclipse!' : 'Burn your enemies with fire and fury!' }}</p>
      </header>

      <app-stats-header />

      <div class="main-content">
        <app-filter-sidebar />
        <div class="content-area">
          <app-search-sort-bar />
          <app-mercenary-grid />
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(180deg, #0a0d14 0%, #12171f 50%, #0a0d14 100%);
    }
    .app-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
    }
    header {
      text-align: center;
      margin-bottom: 32px;
      padding: 40px 20px;
      background: var(--header-gradient);
      border-radius: 16px;
      border: 1px solid var(--header-border);
      transition: all 0.4s;
    }
    .header-top {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 20px;
    }
    header h1 {
      color: #ffd700;
      font-size: 3rem;
      margin: 0;
      text-shadow: 0 0 30px rgba(255, 215, 0, 0.4);
      letter-spacing: 2px;
    }
    .subtitle {
      color: #9a6b4c;
      font-size: 1.3rem;
      margin: 8px 0 0;
      text-transform: uppercase;
      letter-spacing: 4px;
    }
    .tagline {
      color: #8a9aaa;
      font-size: 1rem;
      margin: 16px 0 0;
    }
    .main-content {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 24px;
    }
    @media (max-width: 900px) {
      .main-content {
        grid-template-columns: 1fr;
      }
      header h1 { font-size: 2rem; }
    }
  `]
})
export class AppComponent {
  themeService = inject(ThemeService);
}
