import { Component, inject } from '@angular/core';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { GoblinLeaderboardComponent } from './components/goblin-leaderboard/goblin-leaderboard.component';
import { StatsDashboardComponent } from './components/stats-dashboard/stats-dashboard.component';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TaskFormComponent, TaskListComponent, GoblinLeaderboardComponent, StatsDashboardComponent, ThemeToggleComponent],
  template: `
    <div class="app-container">
      <header>
        <div class="header-top">
          <app-theme-toggle />
        </div>
        <h1>🧌 Goblin Tasks</h1>
        <p>{{ themeService.isDark() ? '🌙 Nighttime Raid Mode - Sneak through the shadows!' : '☀️ Daytime Attack Mode - Charge into battle!' }}</p>
      </header>
      <app-stats-dashboard />
      <main>
        <div class="content">
          <div class="tasks-section">
            <app-task-form />
            <app-task-list />
          </div>
          <aside>
            <app-goblin-leaderboard />
          </aside>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
      transition: background 0.3s;
    }
    .app-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }
    header { text-align: center; margin-bottom: 24px; }
    .header-top {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 16px;
    }
    header h1 {
      color: var(--accent-gold);
      font-size: 2.5rem;
      margin: 0 0 8px;
      text-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
    }
    header p {
      color: var(--text-secondary);
      font-size: 1.1rem;
      margin: 0;
    }
    .content {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 24px;
    }
    @media (max-width: 900px) {
      .content { grid-template-columns: 1fr; }
    }
  `]
})
export class AppComponent {
  themeService = inject(ThemeService);
}
