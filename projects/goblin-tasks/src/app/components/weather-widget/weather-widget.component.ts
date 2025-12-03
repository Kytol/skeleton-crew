import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-weather-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="weather-widget" [class]="weather().type">
      <div class="weather-icon">{{ weather().icon }}</div>
      <div class="weather-info">
        <span class="weather-name">{{ weather().name }}</span>
        <span class="weather-desc">{{ weather().description }}</span>
      </div>
      <div class="weather-effects">
        @if (weather().effects.xpMultiplier !== 1) {
          <span class="effect" [class.bonus]="weather().effects.xpMultiplier > 1">
            XP {{ weather().effects.xpMultiplier > 1 ? '+' : '' }}{{ ((weather().effects.xpMultiplier - 1) * 100) | number:'1.0-0' }}%
          </span>
        }
        @if (weather().effects.goldMultiplier !== 1) {
          <span class="effect" [class.bonus]="weather().effects.goldMultiplier > 1">
            💰 {{ weather().effects.goldMultiplier > 1 ? '+' : '' }}{{ ((weather().effects.goldMultiplier - 1) * 100) | number:'1.0-0' }}%
          </span>
        }
        @if (weather().effects.categoryBonus) {
          <span class="effect bonus">{{ weather().effects.categoryBonus | titlecase }} +25%</span>
        }
      </div>
    </div>
  `,
  styles: [`
    .weather-widget {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: var(--card-overlay);
      border-radius: 12px;
      border: 2px solid var(--border-primary);
      transition: all 0.5s ease;
    }
    .weather-widget.sunny { border-color: #ffd700; background: linear-gradient(135deg, rgba(255,215,0,0.1), transparent); }
    .weather-widget.rainy { border-color: #4a90d9; background: linear-gradient(135deg, rgba(74,144,217,0.1), transparent); }
    .weather-widget.stormy { border-color: #8b5cf6; background: linear-gradient(135deg, rgba(139,92,246,0.1), transparent); }
    .weather-widget.foggy { border-color: #94a3b8; background: linear-gradient(135deg, rgba(148,163,184,0.1), transparent); }
    .weather-widget.magical { border-color: #f472b6; background: linear-gradient(135deg, rgba(244,114,182,0.15), rgba(139,92,246,0.1)); animation: magical-glow 2s ease-in-out infinite; }
    @keyframes magical-glow { 0%, 100% { box-shadow: 0 0 10px rgba(244,114,182,0.3); } 50% { box-shadow: 0 0 20px rgba(244,114,182,0.5); } }
    .weather-icon { font-size: 2rem; }
    .weather-info { display: flex; flex-direction: column; flex: 1; }
    .weather-name { color: var(--text-primary); font-weight: bold; font-size: 0.95rem; }
    .weather-desc { color: var(--text-muted); font-size: 0.8rem; }
    .weather-effects { display: flex; gap: 8px; flex-wrap: wrap; }
    .effect { padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; background: var(--bg-secondary); color: var(--text-secondary); }
    .effect.bonus { background: rgba(76,154,107,0.2); color: #5ac47a; }
  `]
})
export class WeatherWidgetComponent {
  private gameService = inject(GameService);
  weather = this.gameService.weather;
}
