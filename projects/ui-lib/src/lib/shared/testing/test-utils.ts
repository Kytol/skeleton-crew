/**
 * Test utilities and common test helpers for UI Library
 */
import * as fc from 'fast-check';
import { ButtonVariant, ButtonSize, CalendarMode, InputType, SortDirection } from '../types';

// ============================================
// Property-Based Testing Generators
// ============================================

/** Generator for valid button variants */
export const buttonVariantArb = fc.constantFrom<ButtonVariant>('primary', 'secondary', 'outline');

/** Generator for valid button sizes */
export const buttonSizeArb = fc.constantFrom<ButtonSize>('sm', 'md', 'lg');

/** Generator for valid input types */
export const inputTypeArb = fc.constantFrom<InputType>('text', 'number', 'email', 'password');

/** Generator for valid calendar modes */
export const calendarModeArb = fc.constantFrom<CalendarMode>('single', 'range');

/** Generator for valid sort directions */
export const sortDirectionArb = fc.constantFrom<SortDirection>('asc', 'desc', null);

/** Generator for dates within a reasonable range (2020-2030) */
export const dateArb = fc.date({ 
  min: new Date(2020, 0, 1), 
  max: new Date(2030, 11, 31) 
});

/** Generator for non-empty strings (for labels, placeholders, etc.) */
export const nonEmptyStringArb = fc.string({ minLength: 1, maxLength: 100 });

/** Generator for table column configuration */
export const tableColumnArb = fc.record({
  field: fc.string({ minLength: 1, maxLength: 20 }),
  title: fc.string({ minLength: 1, maxLength: 50 }),
  sortable: fc.boolean(),
  visible: fc.boolean(),
  width: fc.option(fc.string({ minLength: 1, maxLength: 10 }))
});

/** Generator for search input configuration */
export const searchInputArb = fc.record({
  value: fc.string(),
  debounce: fc.integer({ min: 0, max: 1000 })
});

/** Generator for positive integers (for page numbers, etc.) */
export const positiveIntArb = fc.integer({ min: 1, max: 1000 });

/** Generator for valid debounce values */
export const debounceArb = fc.integer({ min: 0, max: 2000 });

// ============================================
// Test Helper Functions
// ============================================

/**
 * Helper to check if an element has a specific CSS class
 */
export function hasClass(element: HTMLElement, className: string): boolean {
  return element.classList.contains(className);
}

/**
 * Helper to get computed style property
 */
export function getComputedStyleProperty(element: HTMLElement, property: string): string {
  return window.getComputedStyle(element).getPropertyValue(property);
}

/**
 * Helper to simulate keyboard event
 */
export function createKeyboardEvent(type: string, key: string, options: Partial<KeyboardEventInit> = {}): KeyboardEvent {
  return new KeyboardEvent(type, {
    key,
    bubbles: true,
    cancelable: true,
    ...options
  });
}

/**
 * Helper to simulate click event
 */
export function createClickEvent(): MouseEvent {
  return new MouseEvent('click', {
    bubbles: true,
    cancelable: true
  });
}

/**
 * Helper to wait for async operations
 */
export function waitForAsync(ms: number = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Helper to trigger input event on an element
 */
export function triggerInputEvent(element: HTMLInputElement, value: string): void {
  element.value = value;
  element.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * Helper to check if element is focusable (has valid tabindex)
 */
export function isFocusable(element: HTMLElement): boolean {
  const tabindex = element.getAttribute('tabindex');
  if (tabindex !== null) {
    const tabindexNum = parseInt(tabindex, 10);
    return !isNaN(tabindexNum) && tabindexNum >= 0;
  }
  // Check if element is naturally focusable
  const focusableTags = ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'A'];
  return focusableTags.includes(element.tagName) && !element.hasAttribute('disabled');
}

/**
 * Helper to check if element has ARIA label
 */
export function hasAriaLabel(element: HTMLElement): boolean {
  return element.hasAttribute('aria-label') || 
         element.hasAttribute('aria-labelledby') ||
         element.hasAttribute('aria-hidden');
}

/**
 * Property test configuration with minimum iterations
 */
export const PBT_CONFIG = {
  numRuns: 100
};

// Re-export fast-check for convenience
export { fc };
