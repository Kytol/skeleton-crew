/**
 * Theme configuration types and constants
 */

export type ThemeName = 'light' | 'dark';

export interface ThemeVariables {
  colorBg: string;
  colorSurface: string;
  colorText: string;
  colorPrimary: string;
  colorSecondary: string;
  colorBorder: string;
}

export interface ThemeConfig {
  name: ThemeName;
  variables: ThemeVariables;
}

export const LIGHT_THEME: ThemeConfig = {
  name: 'light',
  variables: {
    colorBg: '#ffffff',
    colorSurface: '#f6f7f8',
    colorText: '#222',
    colorPrimary: '#3b82f6',
    colorSecondary: '#6b7280',
    colorBorder: '#d1d5db'
  }
};

export const DARK_THEME: ThemeConfig = {
  name: 'dark',
  variables: {
    colorBg: '#111827',
    colorSurface: '#1f2937',
    colorText: '#f3f4f6',
    colorPrimary: '#60a5fa',
    colorSecondary: '#9ca3af',
    colorBorder: '#374151'
  }
};

export const THEMES: Record<ThemeName, ThemeConfig> = {
  light: LIGHT_THEME,
  dark: DARK_THEME
};
