/**
 * Shared types and interfaces for UI Library components
 */

// ============================================
// Button Component Types
// ============================================

export type ButtonVariant = 'primary' | 'secondary' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonSizeConfig {
  padding: string;
  fontSize: string;
}

export const BUTTON_SIZES: Record<ButtonSize, ButtonSizeConfig> = {
  sm: { padding: '4px 10px', fontSize: '12px' },
  md: { padding: '6px 14px', fontSize: '14px' },
  lg: { padding: '10px 20px', fontSize: '16px' }
};

// ============================================
// Input Component Types
// ============================================

export type InputType = 'text' | 'number' | 'email' | 'password';

// ============================================
// Calendar Component Types
// ============================================

export type CalendarMode = 'single' | 'range';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isDisabled: boolean;
}

export interface CalendarState {
  currentMonth: Date;
  selectedDate: Date | null;
  selectedRange: [Date, Date] | null;
  focusedDate: Date;
  viewMode: 'days' | 'months' | 'years';
}

// ============================================
// Table Component Types
// ============================================

export interface TableColumn {
  field: string;
  title: string;
  sortable?: boolean;
  visible?: boolean;
  width?: string;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortEvent {
  field: string;
  direction: SortDirection;
}

export interface PageEvent {
  page: number;
  pageSize: number;
}

export interface TableState {
  currentPage: number;
  pageSize: number;
  sortField: string | null;
  sortDirection: SortDirection;
  searchQuery: string;
  visibleColumns: string[];
}

export const DEFAULT_PAGE_SIZES = [5, 10, 25, 50, 100];

// ============================================
// Search Component Types
// ============================================

export const DEFAULT_DEBOUNCE_MS = 300;
