import { Injectable, signal, computed, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ThemeName, THEMES } from './theme.config';

/**
 * ThemeService provides programmatic theme switching functionality.
 * It manages the current theme state and applies theme classes to the document root.
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly _currentTheme = signal<ThemeName>('light');
  private readonly isBrowser: boolean;

  /** Current theme as a readonly signal */
  readonly currentTheme = this._currentTheme.asReadonly();

  /** Current theme configuration */
  readonly themeConfig = computed(() => THEMES[this._currentTheme()]);

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.initializeTheme();
  }

  /**
   * Initialize theme from stored preference or system preference
   */
  private initializeTheme(): void {
    if (!this.isBrowser) return;

    const stored = localStorage.getItem('ui-lib-theme') as ThemeName | null;
    if (stored && (stored === 'light' || stored === 'dark')) {
      this.setTheme(stored);
    } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      this.setTheme('dark');
    } else {
      this.setTheme('light');
    }
  }

  /**
   * Set the current theme
   * @param theme - The theme to apply ('light' or 'dark')
   */
  setTheme(theme: ThemeName): void {
    this._currentTheme.set(theme);
    
    if (this.isBrowser) {
      const root = document.documentElement;
      root.classList.remove('theme-light', 'theme-dark');
      root.classList.add(`theme-${theme}`);
      localStorage.setItem('ui-lib-theme', theme);
    }
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const newTheme = this._currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
}
