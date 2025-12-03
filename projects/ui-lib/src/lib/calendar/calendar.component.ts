import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarMode, CalendarDay } from '../shared/types';

/**
 * UI Calendar Component
 * 
 * A calendar component for date selection with single and range modes.
 * Supports date constraints, time picker, and keyboard navigation.
 */
@Component({
  selector: 'ui-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarComponent implements OnInit {
  /** Selection mode: single date or date range */
  @Input() mode: CalendarMode = 'single';

  /** Currently selected value */
  @Input() value: Date | [Date, Date] | null = null;

  /** Minimum selectable date */
  @Input() minDate: Date | null = null;

  /** Maximum selectable date */
  @Input() maxDate: Date | null = null;

  /** Whether to show time picker */
  @Input() showTime = false;

  /** Event emitted when value changes */
  @Output() valueChange = new EventEmitter<Date | [Date, Date]>();

  /** Current displayed month */
  currentMonth = new Date();

  /** Days of the week headers */
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  /** Calendar grid days */
  calendarDays: CalendarDay[] = [];

  /** Currently focused date for keyboard navigation */
  focusedDate: Date = new Date();

  /** Time values for time picker */
  selectedHours = 0;
  selectedMinutes = 0;

  /** Range selection state */
  private rangeStart: Date | null = null;

  constructor(private cdr: ChangeDetectorRef) {}


  ngOnInit(): void {
    this.initializeFromValue();
    this.generateCalendarDays();
  }

  /** Initialize state from input value */
  private initializeFromValue(): void {
    if (this.value) {
      if (Array.isArray(this.value)) {
        this.currentMonth = new Date(this.value[0]);
        this.rangeStart = this.value[0];
      } else {
        this.currentMonth = new Date(this.value);
        this.selectedHours = this.value.getHours();
        this.selectedMinutes = this.value.getMinutes();
      }
    }
    this.focusedDate = new Date(this.currentMonth);
  }

  /** Generate calendar grid for current month */
  generateCalendarDays(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    this.calendarDays = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate 6 weeks (42 days)
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      this.calendarDays.push({
        date: date,
        isCurrentMonth: date.getMonth() === month,
        isToday: this.isSameDay(date, today),
        isSelected: this.isDateSelected(date),
        isInRange: this.isDateInRange(date),
        isDisabled: this.isDateDisabled(date)
      });
    }
    this.cdr.markForCheck();
  }

  /** Navigate to previous month */
  previousMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() - 1,
      1
    );
    this.generateCalendarDays();
  }

  /** Navigate to next month */
  nextMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      1
    );
    this.generateCalendarDays();
  }

  /** Get formatted month/year string */
  get monthYearLabel(): string {
    return this.currentMonth.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  }


  /** Handle date selection */
  selectDate(day: CalendarDay): void {
    if (day.isDisabled) return;

    if (this.mode === 'single') {
      const selectedDate = new Date(day.date);
      if (this.showTime) {
        selectedDate.setHours(this.selectedHours, this.selectedMinutes);
      }
      this.value = selectedDate;
      this.valueChange.emit(selectedDate);
    } else {
      // Range mode
      if (!this.rangeStart) {
        this.rangeStart = new Date(day.date);
      } else {
        const start = this.rangeStart;
        const end = new Date(day.date);
        
        if (end < start) {
          this.value = [end, start];
        } else {
          this.value = [start, end];
        }
        this.valueChange.emit(this.value);
        this.rangeStart = null;
      }
    }
    this.generateCalendarDays();
  }

  /** Handle keyboard navigation */
  onKeyDown(event: KeyboardEvent): void {
    let newDate = new Date(this.focusedDate);
    
    switch (event.key) {
      case 'ArrowLeft':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'ArrowRight':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'ArrowUp':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'ArrowDown':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'Enter':
      case ' ':
        const day = this.calendarDays.find(d => this.isSameDay(d.date, this.focusedDate));
        if (day && !day.isDisabled) {
          this.selectDate(day);
        }
        event.preventDefault();
        return;
      default:
        return;
    }

    event.preventDefault();
    this.focusedDate = newDate;
    
    // Navigate months if needed
    if (newDate.getMonth() !== this.currentMonth.getMonth()) {
      this.currentMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
      this.generateCalendarDays();
    }
    this.cdr.markForCheck();
  }

  /** Update time values */
  onTimeChange(): void {
    if (this.mode === 'single' && this.value && !Array.isArray(this.value)) {
      const newDate = new Date(this.value);
      newDate.setHours(this.selectedHours, this.selectedMinutes);
      this.value = newDate;
      this.valueChange.emit(newDate);
    }
  }

  /** Check if two dates are the same day (public for template) */
  isSameDayPublic(date1: Date, date2: Date): boolean {
    return this.isSameDay(date1, date2);
  }

  /** Check if two dates are the same day */
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  /** Check if date is selected */
  private isDateSelected(date: Date): boolean {
    if (!this.value) return false;
    
    if (Array.isArray(this.value)) {
      return this.isSameDay(date, this.value[0]) || this.isSameDay(date, this.value[1]);
    }
    return this.isSameDay(date, this.value);
  }

  /** Check if date is in selected range */
  private isDateInRange(date: Date): boolean {
    if (!this.value || !Array.isArray(this.value)) return false;
    return date > this.value[0] && date < this.value[1];
  }

  /** Check if date is disabled */
  private isDateDisabled(date: Date): boolean {
    if (this.minDate && date < this.minDate) return true;
    if (this.maxDate && date > this.maxDate) return true;
    return false;
  }

  /** Track by function for ngFor */
  trackByDate(index: number, day: CalendarDay): number {
    return day.date.getTime();
  }
}
