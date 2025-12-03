import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  forwardRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputType } from '../shared/types';

/** Unique ID counter for input elements */
let inputIdCounter = 0;

/**
 * UI Input Component
 * 
 * A reusable input field component with labels, validation states, and icons.
 * Supports reactive forms via ControlValueAccessor.
 */
@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor {
  /** Label text displayed above the input */
  @Input() label = '';

  /** Placeholder text for the input */
  @Input() placeholder = '';

  /** Input type (text, number, email, password) */
  @Input() type: InputType = 'text';

  /** Current input value */
  @Input() value = '';

  /** Whether the input is disabled */
  @Input() disabled = false;

  /** Error message to display */
  @Input() error: string | null = null;

  /** Icon to display on the left side (prefix) */
  @Input() prefixIcon: string | null = null;

  /** Icon to display on the right side (suffix) */
  @Input() suffixIcon: string | null = null;

  /** Event emitted when value changes */
  @Output() valueChange = new EventEmitter<string>();

  /** Unique ID for the input element */
  readonly inputId = `ui-input-${++inputIdCounter}`;

  /** ControlValueAccessor callbacks */
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};


  /** Get CSS classes for the input wrapper */
  get wrapperClasses(): Record<string, boolean> {
    return {
      'ui-input-wrapper': true,
      'ui-input-wrapper--disabled': this.disabled,
      'ui-input-wrapper--error': !!this.error,
      'ui-input-wrapper--has-prefix': !!this.prefixIcon,
      'ui-input-wrapper--has-suffix': !!this.suffixIcon
    };
  }

  /** Handle input value changes */
  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newValue = target.value;
    this.value = newValue;
    this.valueChange.emit(newValue);
    this.onChange(newValue);
  }

  /** Handle input blur */
  onBlur(): void {
    this.onTouched();
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
