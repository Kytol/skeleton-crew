import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from 'ui-lib';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <button class="theme-toggle" (click)="themeService.toggle()" [attr.aria-label]="ariaLabel">
      <span class="toggle-track" [class.light]="!themeService.isDark()">
        <span class="toggle-icon moon">🌙</span>
        <span class="toggle-thumb"></span>
        <span class="toggle-icon sun">☀️</span>
      </span>
      <span class="toggle-label">{{ themeService.isDark() ? 'Nighttime Raid' : 'Daytime Attack' }}</span>
    </button>
  `,
  styles: [`
    .theme-toggle {
      display: flex;
      align-items: center;
      gap: 12px;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      transition: background 0.2s;
    }
    .theme-toggle:hover { background: var(--hover-bg, rgba(255,255,255,0.1)); }
    .toggle-track {
      position: relative;
      width: 60px;
      height: 30px;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 6px;
      transition: background 0.3s;
    }
    .toggle-track.light {
      background: linear-gradient(135deg, #87ceeb 0%, #f0e68c 100%);
    }
    .toggle-thumb {
      position: absolute;
      width: 24px;
      height: 24px;
      background: #fff;
      border-radius: 50%;
      left: 3px;
      transition: transform 0.3s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    .toggle-track.light .toggle-thumb { transform: translateX(30px); }
    .toggle-icon { font-size: 14px; z-index: 1; }
    .toggle-label {
      color: var(--text-primary, #e8d5b7);
      font-size: 0.9rem;
      font-weight: 500;
    }
  `]
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);

  get ariaLabel(): string {
    return this.themeService.isDark() 
      ? 'Switch to Daytime Attack mode' 
      : 'Switch to Nighttime Raid mode';
  }
}
