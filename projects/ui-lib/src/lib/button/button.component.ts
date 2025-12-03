import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  HostBinding,
  ChangeDetectionStrategy,
  AfterContentInit,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonVariant, ButtonSize, BUTTON_SIZES } from '../shared/types';

/**
 * UI Button Component
 * 
 * A reusable button component with variants, sizes, and states.
 * Supports icons, loading state, and full keyboard accessibility.
 */
@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent implements AfterContentInit {
  /** Button visual variant */
  @Input() variant: ButtonVariant = 'primary';
  
  /** Button size */
  @Input() size: ButtonSize = 'md';
  
  /** Whether the button is disabled */
  @Input() disabled = false;
  
  /** Whether the button is in loading state */
  @Input() loading = false;
  
  /** Icon to display on the left side */
  @Input() iconLeft: string | null = null;
  
  /** Icon to display on the right side */
  @Input() iconRight: string | null = null;
  
  /** Click event emitter */
  @Output() clicked = new EventEmitter<MouseEvent>();

  /** Track if there's text content - will be set after content init */
  hasTextContent = true;

  constructor(private elementRef: ElementRef) {}

  /** Host binding for disabled attribute */
  @HostBinding('attr.disabled')
  get isDisabled(): boolean | null {
    return this.disabled || this.loading ? true : null;
  }

  /** Get CSS classes based on variant and size */
  get buttonClasses(): Record<string, boolean> {
    return {
      'ui-button': true,
      [`ui-button--${this.variant}`]: true,
      [`ui-button--${this.size}`]: true,
      'ui-button--disabled': this.disabled,
      'ui-button--loading': this.loading,
      'ui-button--icon-only': this.isIconOnly
    };
  }

  /** Check if button is icon-only (has icon but no text content projected) */
  get isIconOnly(): boolean {
    return (this.iconLeft !== null || this.iconRight !== null) && !this.hasTextContent;
  }

  /** Get padding style based on size */
  get paddingStyle(): string {
    // For icon-only buttons, use equal padding
    if (this.isIconOnly) {
      return this.getIconOnlyPadding();
    }
    return BUTTON_SIZES[this.size]?.padding || BUTTON_SIZES.md.padding;
  }

  /** Get icon-only padding based on size */
  private getIconOnlyPadding(): string {
    switch (this.size) {
      case 'sm': return '4px';
      case 'lg': return '10px';
      case 'md':
      default: return '6px';
    }
  }

  /** Get font size style based on size */
  get fontSizeStyle(): string {
    return BUTTON_SIZES[this.size]?.fontSize || BUTTON_SIZES.md.fontSize;
  }

  /** Check for text content after content is initialized */
  ngAfterContentInit(): void {
    this.checkTextContent();
  }

  /** Check if there's meaningful text content in the projected content */
  private checkTextContent(): void {
    const contentElement = this.elementRef.nativeElement.querySelector('.ui-button__content');
    if (contentElement) {
      const textContent = contentElement.textContent?.trim() || '';
      this.hasTextContent = textContent.length > 0;
    }
  }

  /** Handle click events */
  onClick(event: MouseEvent): void {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.clicked.emit(event);
  }

  /** Handle keyboard events for accessibility (Enter and Space keys) */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      if (this.disabled || this.loading) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      this.clicked.emit(new MouseEvent('click', { bubbles: true, cancelable: true }));
    }
  }

  /** Update text content status - can be called from template */
  updateTextContent(hasContent: boolean): void {
    this.hasTextContent = hasContent;
  }
}
