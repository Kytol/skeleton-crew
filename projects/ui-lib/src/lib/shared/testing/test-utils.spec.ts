/**
 * Tests to verify testing infrastructure is properly configured
 */
import * as fc from 'fast-check';
import { 
  buttonVariantArb, 
  buttonSizeArb, 
  dateArb, 
  tableColumnArb,
  hasClass,
  createKeyboardEvent,
  createClickEvent,
  isFocusable,
  hasAriaLabel,
  PBT_CONFIG
} from './test-utils';

describe('Testing Infrastructure', () => {
  describe('fast-check integration', () => {
    it('should run property-based tests with fast-check', () => {
      // Simple property test to verify fast-check works
      fc.assert(
        fc.property(fc.integer(), fc.integer(), (a, b) => {
          return a + b === b + a; // Commutative property
        }),
        { numRuns: PBT_CONFIG.numRuns }
      );
      expect(true).toBe(true); // Satisfy Jasmine expectation tracking
    });
  });

  describe('Generators', () => {
    it('should generate valid button variants', () => {
      fc.assert(
        fc.property(buttonVariantArb, (variant) => {
          return ['primary', 'secondary', 'outline'].includes(variant);
        }),
        { numRuns: PBT_CONFIG.numRuns }
      );
      expect(true).toBe(true);
    });

    it('should generate valid button sizes', () => {
      fc.assert(
        fc.property(buttonSizeArb, (size) => {
          return ['sm', 'md', 'lg'].includes(size);
        }),
        { numRuns: PBT_CONFIG.numRuns }
      );
      expect(true).toBe(true);
    });

    it('should generate valid dates within range', () => {
      fc.assert(
        fc.property(dateArb, (date) => {
          const minDate = new Date(2020, 0, 1);
          const maxDate = new Date(2030, 11, 31);
          return date >= minDate && date <= maxDate;
        }),
        { numRuns: PBT_CONFIG.numRuns }
      );
      expect(true).toBe(true);
    });

    it('should generate valid table columns', () => {
      fc.assert(
        fc.property(tableColumnArb, (column) => {
          return (
            typeof column.field === 'string' &&
            typeof column.title === 'string' &&
            typeof column.sortable === 'boolean' &&
            typeof column.visible === 'boolean'
          );
        }),
        { numRuns: PBT_CONFIG.numRuns }
      );
      expect(true).toBe(true);
    });
  });

  describe('Helper Functions', () => {
    it('hasClass should correctly identify CSS classes', () => {
      const element = document.createElement('div');
      element.classList.add('test-class');
      
      expect(hasClass(element, 'test-class')).toBe(true);
      expect(hasClass(element, 'other-class')).toBe(false);
    });

    it('createKeyboardEvent should create valid keyboard events', () => {
      const event = createKeyboardEvent('keydown', 'Enter');
      
      expect(event.type).toBe('keydown');
      expect(event.key).toBe('Enter');
      expect(event.bubbles).toBe(true);
    });

    it('createClickEvent should create valid click events', () => {
      const event = createClickEvent();
      
      expect(event.type).toBe('click');
      expect(event.bubbles).toBe(true);
    });

    it('isFocusable should identify focusable elements', () => {
      const button = document.createElement('button');
      const div = document.createElement('div');
      const divWithTabindex = document.createElement('div');
      divWithTabindex.setAttribute('tabindex', '0');
      
      expect(isFocusable(button)).toBe(true);
      expect(isFocusable(div)).toBe(false);
      expect(isFocusable(divWithTabindex)).toBe(true);
    });

    it('hasAriaLabel should identify elements with ARIA labels', () => {
      const withLabel = document.createElement('button');
      withLabel.setAttribute('aria-label', 'Test');
      
      const withHidden = document.createElement('span');
      withHidden.setAttribute('aria-hidden', 'true');
      
      const withoutAria = document.createElement('div');
      
      expect(hasAriaLabel(withLabel)).toBe(true);
      expect(hasAriaLabel(withHidden)).toBe(true);
      expect(hasAriaLabel(withoutAria)).toBe(false);
    });
  });
});
