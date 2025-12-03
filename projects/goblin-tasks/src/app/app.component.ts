import { Component, inject, viewChild } from '@angular/core';
import { TaskPanelComponent } from './components/task-panel/task-panel.component';
import { GoblinLeaderboardComponent } from './components/goblin-leaderboard/goblin-leaderboard.component';
import { StatsDashboardComponent } from './components/stats-dashboard/stats-dashboard.component';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { WeatherWidgetComponent } from './components/weather-widget/weather-widget.component';
import { DailyQuestsComponent } from './components/daily-quests/daily-quests.component';
import { ShopComponent } from './components/shop/shop.component';
import { QuestChainsComponent } from './components/quest-chains/quest-chains.component';
import { NotificationCenterComponent } from './components/notification-center/notification-center.component';
import { GoblinRecruitmentComponent } from './components/goblin-recruitment/goblin-recruitment.component';
import { ActionBarComponent } from './components/action-bar/action-bar.component';
import { AchievementsComponent } from './components/achievements/achievements.component';
import { ToastComponent } from './components/toast/toast.component';
import { GoblinDiceComponent } from './components/goblin-dice/goblin-dice.component';
import { ThemeService } from './services/theme.service';
import { GameService } from './services/game.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    TaskPanelComponent, GoblinLeaderboardComponent, StatsDashboardComponent,
    ThemeToggleComponent, WeatherWidgetComponent, DailyQuestsComponent, ShopComponent,
    QuestChainsComponent, NotificationCenterComponent, GoblinRecruitmentComponent,
    ActionBarComponent, AchievementsComponent, ToastComponent, GoblinDiceComponent
  ],
  template: `
    <div class="app-container">
      <header>
        <div class="header-top">
          <div class="header-left">
            <span class="gold-display">💰 {{ gameService.playerGold() }}</span>
          </div>
          <div class="header-center">
            <h1>🧌 Goblin Tasks</h1>
            <p>{{ themeService.isDark() ? '🌙 Nighttime Raid Mode' : '☀️ Daytime Attack Mode' }}</p>
          </div>
          <div class="header-right">
            <app-notification-center />
            <app-theme-toggle />
          </div>
        </div>
      </header>

      <div class="top-widgets">
        <app-weather-widget />
        <app-stats-dashboard />
      </div>

      <app-action-bar
        (openShop)="shopModal.open()"
        (openQuests)="questsModal.open()"
        (openRecruit)="recruitModal.open()"
        (openDice)="diceModal.open()"
        (openAchievements)="achievementsModal.open()"
      />

      <main>
        <div class="content">
          <div class="left-column">
            <app-task-panel />
            <app-daily-quests />
          </div>
          <aside>
            <app-goblin-leaderboard />
          </aside>
        </div>
      </main>

      <app-shop #shopModal />
      <app-quest-chains #questsModal />
      <app-goblin-recruitment #recruitModal />
      <app-goblin-dice #diceModal />
      <app-achievements #achievementsModal />
      <app-toast />
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
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
    }
    header { margin-bottom: 20px; }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
    }
    .header-left, .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 150px;
    }
    .header-right { justify-content: flex-end; }
    .header-center { text-align: center; flex: 1; }
    .gold-display {
      font-size: 1.25rem;
      color: var(--accent-gold);
      font-weight: bold;
      padding: 8px 16px;
      background: var(--card-overlay);
      border-radius: 20px;
      border: 2px solid var(--accent-gold);
    }
    header h1 {
      color: var(--accent-gold);
      font-size: 2.5rem;
      margin: 0 0 4px;
      text-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
    }
    header p {
      color: var(--text-secondary);
      font-size: 1rem;
      margin: 0;
    }
    .top-widgets {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    app-action-bar { margin-bottom: 20px; display: block; }
    .content {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 24px;
    }
    .left-column {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    @media (max-width: 1100px) {
      .top-widgets { grid-template-columns: 1fr; }
      .content { grid-template-columns: 1fr; }
    }
    @media (max-width: 600px) {
      .header-top { flex-direction: column; gap: 12px; }
      .header-left, .header-right { width: 100%; justify-content: center; }
    }
  `]
})
export class AppComponent {
  themeService = inject(ThemeService);
  gameService = inject(GameService);

  shopModal = viewChild.required<ShopComponent>('shopModal');
  questsModal = viewChild.required<QuestChainsComponent>('questsModal');
  recruitModal = viewChild.required<GoblinRecruitmentComponent>('recruitModal');
  diceModal = viewChild.required<GoblinDiceComponent>('diceModal');
  achievementsModal = viewChild.required<AchievementsComponent>('achievementsModal');
}
