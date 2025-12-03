import { Injectable, signal, effect } from '@angular/core';

export type ThemeMode = 'eclipse' | 'fire';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'raid-squad-theme';
  
  readonly theme = signal<ThemeMode>(this.loadTheme());
  readonly isDark = () => this.theme() === 'eclipse';

  constructor() {
    effect(() => {
      const theme = this.theme();
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(this.STORAGE_KEY, theme);
    });
  }

  private loadTheme(): ThemeMode {
    const saved = localStorage.getItem(this.STORAGE_KEY) as ThemeMode;
    return saved || 'eclipse';
  }

  toggle(): void {
    this.theme.update(t => t === 'eclipse' ? 'fire' : 'eclipse');
  }
}
