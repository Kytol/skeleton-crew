import { Component, inject, signal } from '@angular/core';
import { FilterSidebarComponent } from './components/filter-sidebar/filter-sidebar.component';
import { SearchSortBarComponent } from './components/search-sort-bar/search-sort-bar.component';
import { MercenaryGridComponent } from './components/mercenary-grid/mercenary-grid.component';
import { StatsHeaderComponent } from './components/stats-header/stats-header.component';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { SquadPanelComponent } from './components/squad-panel/squad-panel.component';
import { RecruitmentBoardComponent } from './components/recruitment-board/recruitment-board.component';
import { NotificationBellComponent } from './components/notification-bell/notification-bell.component';
import { ThemeService } from './services/theme.service';

type TabType = 'marketplace' | 'squad' | 'recruitment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    FilterSidebarComponent, SearchSortBarComponent, MercenaryGridComponent,
    StatsHeaderComponent, ThemeToggleComponent, SquadPanelComponent,
    RecruitmentBoardComponent, NotificationBellComponent
  ],
  template: `
    <div class="app-container">
      <header>
        <div class="header-top">
          <app-notification-bell />
          <app-theme-toggle />
        </div>
        <h1>{{ themeService.isDark() ? '🌑' : '🔥' }} Raid Squad</h1>
        <p class="subtitle">Gang Recruitment Portal</p>
        <p class="tagline">{{ themeService.isDark() ? 'Strike from the shadows of the eclipse!' : 'Burn your enemies with fire and fury!' }}</p>
      </header>

      <nav class="tabs">
        <button class="tab" [class.active]="activeTab() === 'marketplace'" (click)="activeTab.set('marketplace')">
          🏪 Marketplace
        </button>
        <button class="tab" [class.active]="activeTab() === 'squad'" (click)="activeTab.set('squad')">
          ⚔️ My Squad
        </button>
        <button class="tab" [class.active]="activeTab() === 'recruitment'" (click)="activeTab.set('recruitment')">
          📋 Recruitment
        </button>
      </nav>

      @if (activeTab() === 'marketplace') {
        <app-stats-header />
        <div class="main-content">
          <app-filter-sidebar />
          <div class="content-area">
            <app-search-sort-bar />
            <app-mercenary-grid />
          </div>
        </div>
      }

      @if (activeTab() === 'squad') {
        <div class="squad-layout">
          <app-squad-panel />
        </div>
      }

      @if (activeTab() === 'recruitment') {
        <app-recruitment-board />
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-primary) 100%);
    }
    .app-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
    }
    header {
      text-align: center;
      margin-bottom: 24px;
      padding: 40px 20px;
      background: var(--header-gradient);
      border-radius: 16px;
      border: 1px solid var(--header-border);
      transition: all 0.4s;
    }
    .header-top {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-bottom: 20px;
    }
    header h1 {
      color: var(--accent-gold);
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
      color: var(--text-secondary);
      font-size: 1rem;
      margin: 16px 0 0;
    }
    .tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      background: var(--bg-card);
      padding: 8px;
      border-radius: 12px;
      border: 2px solid var(--border-primary);
    }
    .tab {
      flex: 1;
      padding: 14px 20px;
      background: transparent;
      border: none;
      border-radius: 8px;
      color: var(--text-secondary);
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .tab:hover {
      background: var(--card-overlay);
      color: var(--text-primary);
    }
    .tab.active {
      background: var(--accent-gold);
      color: #000;
    }
    .main-content {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 24px;
    }
    .squad-layout {
      max-width: 900px;
      margin: 0 auto;
    }
    @media (max-width: 900px) {
      .main-content {
        grid-template-columns: 1fr;
      }
      header h1 { font-size: 2rem; }
      .tabs { flex-direction: column; }
    }
  `]
})
export class AppComponent {
  themeService = inject(ThemeService);
  activeTab = signal<TabType>('marketplace');
}
