/**
 * Property-Based Tests for Button Component
 * 
 * Tests icon positioning properties using fast-check.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';
import { fc, PBT_CONFIG } from '../shared/testing';

// Generator for valid icon strings (non-whitespace-only strings)
const iconStringArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

describe('ButtonComponent Property-Based Tests', () => {
  let fixture: ComponentFixture<ButtonComponent>;
  let component: ButtonComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  /**
   * **Feature: angular-ui-library, Property 5: Icon inputs render in correct positions (Button)**
   * 
   * *For any* Button_Component with iconLeft or iconRight inputs, the icon elements 
   * SHALL appear in the corresponding DOM positions (left/prefix before content, 
   * right/suffix after content).
   * 
   * **Validates: Requirements 2.5**
   */
  describe('Property 5: Icon inputs render in correct positions (Button)', () => {
    it('should render iconLeft before content element in DOM order', () => {
      const result = fc.check(
        fc.property(iconStringArb, (iconValue) => {
          // Recreate fixture for each test to ensure clean state
          fixture.destroy();
          fixture = TestBed.createComponent(ButtonComponent);
          component = fixture.componentInstance;
          
          // Set up component with left icon
          component.iconLeft = iconValue;
          component.iconRight = null;
          fixture.detectChanges();

          const buttonElement = fixture.nativeElement.querySelector('button');
          const leftIcon = buttonElement.querySelector('.ui-button__icon--left');
          const content = buttonElement.querySelector('.ui-button__content');

          // Left icon should exist
          if (!leftIcon) return false;
          
          // Left icon should contain the icon value (compare trimmed for consistency)
          if (leftIcon.textContent.trim() !== iconValue.trim()) return false;

          // Get all child elements to check order
          const children = Array.from(buttonElement.children) as HTMLElement[];
          const leftIconIndex = children.findIndex(el => el.classList.contains('ui-button__icon--left'));
          const contentIndex = children.findIndex(el => el.classList.contains('ui-button__content'));

          // Left icon should appear before content in DOM
          return leftIconIndex !== -1 && contentIndex !== -1 && leftIconIndex < contentIndex;
        }),
        { numRuns: PBT_CONFIG.numRuns }
      );
      expect(result.failed).toBe(false);
    });

    it('should render iconRight after content element in DOM order', () => {
      const result = fc.check(
        fc.property(iconStringArb, (iconValue) => {
          // Recreate fixture for each test to ensure clean state
          fixture.destroy();
          fixture = TestBed.createComponent(ButtonComponent);
          component = fixture.componentInstance;
          
          // Set up component with right icon
          component.iconLeft = null;
          component.iconRight = iconValue;
          fixture.detectChanges();

          const buttonElement = fixture.nativeElement.querySelector('button');
          const rightIcon = buttonElement.querySelector('.ui-button__icon--right');
          const content = buttonElement.querySelector('.ui-button__content');

          // Right icon should exist
          if (!rightIcon) return false;
          
          // Right icon should contain the icon value (compare trimmed for consistency)
          if (rightIcon.textContent.trim() !== iconValue.trim()) return false;

          // Get all child elements to check order
          const children = Array.from(buttonElement.children) as HTMLElement[];
          const rightIconIndex = children.findIndex(el => el.classList.contains('ui-button__icon--right'));
          const contentIndex = children.findIndex(el => el.classList.contains('ui-button__content'));

          // Right icon should appear after content in DOM
          return rightIconIndex !== -1 && contentIndex !== -1 && rightIconIndex > contentIndex;
        }),
        { numRuns: PBT_CONFIG.numRuns }
      );
      expect(result.failed).toBe(false);
    });

    it('should render both icons in correct positions when both are provided', () => {
      const result = fc.check(
        fc.property(iconStringArb, iconStringArb, (leftIconValue, rightIconValue) => {
          // Recreate fixture for each test to ensure clean state
          fixture.destroy();
          fixture = TestBed.createComponent(ButtonComponent);
          component = fixture.componentInstance;
          
          // Set up component with both icons
          component.iconLeft = leftIconValue;
          component.iconRight = rightIconValue;
          fixture.detectChanges();

          const buttonElement = fixture.nativeElement.querySelector('button');
          const leftIcon = buttonElement.querySelector('.ui-button__icon--left');
          const rightIcon = buttonElement.querySelector('.ui-button__icon--right');

          // Both icons should exist
          if (!leftIcon || !rightIcon) return false;
          
          // Icons should contain correct values (compare trimmed for consistency)
          if (leftIcon.textContent.trim() !== leftIconValue.trim()) return false;
          if (rightIcon.textContent.trim() !== rightIconValue.trim()) return false;

          // Get all child elements to check order
          const children = Array.from(buttonElement.children) as HTMLElement[];
          const leftIconIndex = children.findIndex(el => el.classList.contains('ui-button__icon--left'));
          const contentIndex = children.findIndex(el => el.classList.contains('ui-button__content'));
          const rightIconIndex = children.findIndex(el => el.classList.contains('ui-button__icon--right'));

          // Order should be: leftIcon < content < rightIcon
          return leftIconIndex < contentIndex && contentIndex < rightIconIndex;
        }),
        { numRuns: PBT_CONFIG.numRuns }
      );
      expect(result.failed).toBe(false);
    });

    it('should not render icon elements when no icons are provided', () => {
      const result = fc.check(
        fc.property(fc.constant(null), () => {
          // Recreate fixture for each test to ensure clean state
          fixture.destroy();
          fixture = TestBed.createComponent(ButtonComponent);
          component = fixture.componentInstance;
          
          // Set up component without icons
          component.iconLeft = null;
          component.iconRight = null;
          fixture.detectChanges();

          const buttonElement = fixture.nativeElement.querySelector('button');
          const leftIcon = buttonElement.querySelector('.ui-button__icon--left');
          const rightIcon = buttonElement.querySelector('.ui-button__icon--right');

          // No icon elements should exist
          return leftIcon === null && rightIcon === null;
        }),
        { numRuns: PBT_CONFIG.numRuns }
      );
      expect(result.failed).toBe(false);
    });
  });

  /**
   * **Feature: angular-ui-library, Property 6: Keyboard activation triggers button click**
   * 
   * *For any* focused Button_Component that is not disabled and not loading, 
   * pressing Enter or Space key SHALL emit a click event.
   * 
   * **Validates: Requirements 2.6**
   */
  describe('Property 6: Keyboard activation triggers button click', () => {
    it('should emit click event when Enter key is pressed on enabled button', () => {
      const result = fc.check(
        fc.property(fc.constant('Enter'), (key) => {
          // Recreate fixture for each test
          fixture.destroy();
          fixture = TestBed.createComponent(ButtonComponent);
          component = fixture.componentInstance;
          
          component.disabled = false;
          component.loading = false;
          fixture.detectChanges();

          const clickState = { emitted: false };
          component.clicked.subscribe(() => {
            clickState.emitted = true;
          });

          const buttonElement = fixture.nativeElement.querySelector('button');
          const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
          buttonElement.dispatchEvent(event);

          return clickState.emitted;
        }),
        { numRuns: PBT_CONFIG.numRuns }
      );
      expect(result.failed).toBe(false);
    });

    it('should emit click event when Space key is pressed on enabled button', () => {
      const result = fc.check(
        fc.property(fc.constant(' '), (key) => {
          // Recreate fixture for each test
          fixture.destroy();
          fixture = TestBed.createComponent(ButtonComponent);
          component = fixture.componentInstance;
          
          component.disabled = false;
          component.loading = false;
          fixture.detectChanges();

          const clickState = { emitted: false };
          component.clicked.subscribe(() => {
            clickState.emitted = true;
          });

          const buttonElement = fixture.nativeElement.querySelector('button');
          const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
          buttonElement.dispatchEvent(event);

          return clickState.emitted;
        }),
        { numRuns: PBT_CONFIG.numRuns }
      );
      expect(result.failed).toBe(false);
    });

    it('should NOT emit click event when Enter/Space pressed on disabled button', () => {
      const result = fc.check(
        fc.property(fc.constantFrom('Enter', ' '), (key) => {
          // Recreate fixture for each test
          fixture.destroy();
          fixture = TestBed.createComponent(ButtonComponent);
          component = fixture.componentInstance;
          
          component.disabled = true;
          component.loading = false;
          fixture.detectChanges();

          const clickState = { emitted: false };
          component.clicked.subscribe(() => {
            clickState.emitted = true;
          });

          const buttonElement = fixture.nativeElement.querySelector('button');
          const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
          buttonElement.dispatchEvent(event);

          return !clickState.emitted;
        }),
        { numRuns: PBT_CONFIG.numRuns }
      );
      expect(result.failed).toBe(false);
    });

    it('should NOT emit click event when Enter/Space pressed on loading button', () => {
      const result = fc.check(
        fc.property(fc.constantFrom('Enter', ' '), (key) => {
          // Recreate fixture for each test
          fixture.destroy();
          fixture = TestBed.createComponent(ButtonComponent);
          component = fixture.componentInstance;
          
          component.disabled = false;
          component.loading = true;
          fixture.detectChanges();

          const clickState = { emitted: false };
          component.clicked.subscribe(() => {
            clickState.emitted = true;
          });

          const buttonElement = fixture.nativeElement.querySelector('button');
          const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
          buttonElement.dispatchEvent(event);

          return !clickState.emitted;
        }),
        { numRuns: PBT_CONFIG.numRuns }
      );
      expect(result.failed).toBe(false);
    });
  });

  /**
   * **Feature: angular-ui-library, Property 23: Components support keyboard focus (Button)**
   * 
   * *For any* interactive Button component, the component's primary interactive element 
   * SHALL have a tabindex that allows keyboard focus.
   * 
   * **Validates: Requirements 7.1**
   */
  describe('Property 23: Components support keyboard focus (Button)', () => {
    it('should have tabindex 0 when button is enabled', () => {
      const result = fc.check(
        fc.property(fc.constant(null), () => {
          // Recreate fixture for each test
          fixture.destroy();
          fixture = TestBed.createComponent(ButtonComponent);
          component = fixture.componentInstance;
          
          component.disabled = false;
          component.loading = false;
          fixture.detectChanges();

          const buttonElement = fixture.nativeElement.querySelector('button');
          const tabindex = buttonElement.getAttribute('tabindex');

          return tabindex === '0';
        }),
        { numRuns: PBT_CONFIG.numRuns }
      );
      expect(result.failed).toBe(false);
    });

    it('should have tabindex -1 when button is disabled', () => {
      const result = fc.check(
        fc.property(fc.constant(null), () => {
          // Recreate fixture for each test
          fixture.destroy();
          fixture = TestBed.createComponent(ButtonComponent);
          component = fixture.componentInstance;
          
          component.disabled = true;
          fixture.detectChanges();

          const buttonElement = fixture.nativeElement.querySelector('button');
          const tabindex = buttonElement.getAttribute('tabindex');

          return tabindex === '-1';
        }),
        { numRuns: PBT_CONFIG.numRuns }
      );
      expect(result.failed).toBe(false);
    });
  });

  /**
   * **Feature: angular-ui-library, Property 24: ARIA labels present on icon elements (Button)**
   * 
   * *For any* Button_Component with icon inputs, the icon elements SHALL have 
   * aria-label or aria-hidden attributes for accessibility.
   * 
   * **Validates: Requirements 7.2**
   */
  describe('Property 24: ARIA labels present on icon elements (Button)', () => {
    it('should have aria-hidden and aria-label on icon elements', () => {
      const result = fc.check(
        fc.property(iconStringArb, iconStringArb, (leftIcon, rightIcon) => {
          // Recreate fixture for each test
          fixture.destroy();
          fixture = TestBed.createComponent(ButtonComponent);
          component = fixture.componentInstance;
          
          component.iconLeft = leftIcon;
          component.iconRight = rightIcon;
          fixture.detectChanges();

          const buttonElement = fixture.nativeElement.querySelector('button');
          const leftIconEl = buttonElement.querySelector('.ui-button__icon--left');
          const rightIconEl = buttonElement.querySelector('.ui-button__icon--right');

          // Both icons should exist
          if (!leftIconEl || !rightIconEl) return false;

          // Check aria-hidden attribute
          const leftHasAriaHidden = leftIconEl.getAttribute('aria-hidden') === 'true';
          const rightHasAriaHidden = rightIconEl.getAttribute('aria-hidden') === 'true';

          // Check aria-label attribute
          const leftHasAriaLabel = leftIconEl.hasAttribute('aria-label');
          const rightHasAriaLabel = rightIconEl.hasAttribute('aria-label');

          return leftHasAriaHidden && rightHasAriaHidden && leftHasAriaLabel && rightHasAriaLabel;
        }),
        { numRuns: PBT_CONFIG.numRuns }
      );
      expect(result.failed).toBe(false);
    });
  });
});
