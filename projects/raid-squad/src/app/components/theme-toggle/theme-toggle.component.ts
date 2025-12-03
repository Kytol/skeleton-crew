import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="theme-toggle" (click)="themeService.toggle()" [attr.aria-label]="ariaLabel">
      <span class="toggle-track" [class.fire]="!themeService.isDark()">
        <span class="toggle-icon eclipse">🌑</span>
        <span class="toggle-thumb" [class.fire]="!themeService.isDark()">
          {{ themeService.isDark() ? '🌑' : '🔥' }}
        </span>
        <span class="toggle-icon fire">🔥</span>
      </span>
      <span class="toggle-label" [class.fire]="!themeService.isDark()">{{ themeService.isDark() ? 'Eclipse Mode' : 'Fire Mode' }}</span>
    </button>
  `,
  styles: [`
    .theme-toggle {
      display: flex;
      align-items: center;
      gap: 12px;
      background: transparent;
      border: 2px solid var(--border-primary);
      border-radius: 30px;
      cursor: pointer;
      padding: 8px 16px;
      transition: all 0.3s;
    }
    .theme-toggle:hover {
      border-color: var(--accent-gold);
      background: var(--card-overlay);
    }
    .toggle-track {
      position: relative;
      width: 56px;
      height: 28px;
      background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 6px;
      transition: background 0.4s;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
    }
    .toggle-track.fire {
      background: linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ffcc00 100%);
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.2), 0 0 20px rgba(255,107,53,0.4);
    }
    .toggle-thumb {
      position: absolute;
      width: 22px;
      height: 22px;
      background: linear-gradient(135deg, #2a2a4a 0%, #1a1a2e 100%);
      border-radius: 50%;
      left: 3px;
      transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    }
    .toggle-thumb.fire {
      transform: translateX(28px);
      background: linear-gradient(135deg, #fff 0%, #ffe0b0 100%);
      box-shadow: 0 0 15px rgba(255,200,0,0.6);
    }
    .toggle-icon {
      font-size: 12px;
      z-index: 1;
      opacity: 0.6;
    }
    .toggle-label {
      color: var(--text-primary);
      font-size: 0.9rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      transition: color 0.3s;
    }
    .toggle-label.fire {
      color: #fff;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
  `]
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);

  get ariaLabel(): string {
    return this.themeService.isDark() 
      ? 'Switch to Fire mode' 
      : 'Switch to Eclipse mode';
  }
}
