import { Injectable, signal, effect } from '@angular/core';

export type ThemeMode = 'nighttime-raid' | 'daytime-attack';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'goblin-theme';
  
  readonly theme = signal<ThemeMode>(this.loadTheme());
  readonly isDark = () => this.theme() === 'nighttime-raid';

  constructor() {
    effect(() => {
      const theme = this.theme();
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(this.STORAGE_KEY, theme);
    });
  }

  private loadTheme(): ThemeMode {
    const saved = localStorage.getItem(this.STORAGE_KEY) as ThemeMode;
    return saved || 'nighttime-raid';
  }

  toggle(): void {
    this.theme.update(t => t === 'nighttime-raid' ? 'daytime-attack' : 'nighttime-raid');
  }

  setTheme(theme: ThemeMode): void {
    this.theme.set(theme);
  }
}
