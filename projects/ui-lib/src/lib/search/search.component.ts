import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DEFAULT_DEBOUNCE_MS } from '../shared/types';

/**
 * UI Search Component
 * 
 * A search field component with debounce functionality.
 * Emits valueChange events after the debounce period.
 */
@Component({
  selector: 'ui-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent implements OnInit, OnDestroy {
  /** Placeholder text for the search input */
  @Input() placeholder = 'Search...';

  /** Current search value */
  @Input() value = '';

  /** Debounce time in milliseconds */
  @Input() debounce = DEFAULT_DEBOUNCE_MS;

  /** Whether the search input is disabled */
  @Input() disabled = false;

  /** Event emitted when value changes (after debounce) */
  @Output() valueChange = new EventEmitter<string>();

  /** Subject for debouncing input */
  private searchSubject = new Subject<string>();
  private subscription: Subscription | null = null;

  ngOnInit(): void {
    this.setupDebounce();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }


  /** Set up debounced value emission */
  private setupDebounce(): void {
    this.subscription = this.searchSubject.pipe(
      debounceTime(this.debounce),
      distinctUntilChanged()
    ).subscribe(value => {
      this.valueChange.emit(value);
    });
  }

  /** Get CSS classes for the search wrapper */
  get wrapperClasses(): Record<string, boolean> {
    return {
      'ui-search': true,
      'ui-search--disabled': this.disabled
    };
  }

  /** Handle input value changes */
  onInputChange(event: Event): void {
    if (this.disabled) return;
    
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.searchSubject.next(this.value);
  }

  /** Handle Escape key to clear the search */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && !this.disabled) {
      this.clearSearch();
    }
  }

  /** Clear the search value */
  clearSearch(): void {
    this.value = '';
    this.searchSubject.next('');
    this.valueChange.emit('');
  }
}
