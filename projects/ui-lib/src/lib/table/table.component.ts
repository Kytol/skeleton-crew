import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  TableColumn, 
  SortEvent, 
  PageEvent, 
  SortDirection,
  DEFAULT_PAGE_SIZES 
} from '../shared/types';
import { SearchComponent } from '../search/search.component';

/**
 * UI Table Component
 * 
 * A dynamic table component with sorting, pagination, search, and column management.
 */
@Component({
  selector: 'ui-table',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchComponent],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent implements OnChanges {
  /** Column configuration */
  @Input() columns: TableColumn[] = [];

  /** Table data */
  @Input() data: any[] = [];

  /** Number of items per page */
  @Input() pageSize = 10;

  /** Whether search is enabled */
  @Input() searchable = false;

  /** Whether sorting is enabled */
  @Input() sortable = false;

  /** Whether column manager is enabled */
  @Input() columnManager = false;

  /** Whether to use server-side mode */
  @Input() serverMode = false;

  /** Sort change event */
  @Output() sortChange = new EventEmitter<SortEvent>();

  /** Page change event */
  @Output() pageChange = new EventEmitter<PageEvent>();

  /** Search change event */
  @Output() searchChange = new EventEmitter<string>();

  /** Column visibility change event */
  @Output() columnVisibilityChange = new EventEmitter<TableColumn[]>();

  /** Row click event */
  @Output() rowClick = new EventEmitter<any>();

  /** Available page sizes */
  pageSizes = DEFAULT_PAGE_SIZES;

  /** Current page (1-indexed) */
  currentPage = 1;

  /** Current sort state */
  sortField: string | null = null;
  sortDirection: SortDirection = null;

  /** Search query */
  searchQuery = '';

  /** Column manager dropdown state */
  columnManagerOpen = false;

  constructor(private cdr: ChangeDetectorRef) {}


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['pageSize']) {
      this.currentPage = 1;
    }
  }

  /** Get visible columns */
  get visibleColumns(): TableColumn[] {
    return this.columns.filter(col => col.visible !== false);
  }

  /** Get displayed data (with pagination, sorting, filtering if not server mode) */
  get displayedData(): any[] {
    if (this.serverMode) {
      return this.data;
    }

    let result = [...this.data];

    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(row => 
        this.visibleColumns.some(col => {
          const value = row[col.field];
          return value && String(value).toLowerCase().includes(query);
        })
      );
    }

    // Apply sorting
    if (this.sortField && this.sortDirection) {
      result.sort((a, b) => {
        const aVal = a[this.sortField!];
        const bVal = b[this.sortField!];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return this.sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    // Apply pagination
    const start = (this.currentPage - 1) * this.pageSize;
    return result.slice(start, start + this.pageSize);
  }

  /** Get total number of pages */
  get totalPages(): number {
    if (this.serverMode) {
      return Math.ceil(this.data.length / this.pageSize);
    }
    
    let filteredLength = this.data.length;
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filteredLength = this.data.filter(row => 
        this.visibleColumns.some(col => {
          const value = row[col.field];
          return value && String(value).toLowerCase().includes(query);
        })
      ).length;
    }
    return Math.ceil(filteredLength / this.pageSize);
  }

  /** Handle column header click for sorting */
  onHeaderClick(column: TableColumn): void {
    if (!this.sortable || column.sortable === false) return;

    if (this.sortField === column.field) {
      // Cycle: null -> asc -> desc -> null
      if (this.sortDirection === null) {
        this.sortDirection = 'asc';
      } else if (this.sortDirection === 'asc') {
        this.sortDirection = 'desc';
      } else {
        this.sortDirection = null;
        this.sortField = null;
      }
    } else {
      this.sortField = column.field;
      this.sortDirection = 'asc';
    }

    this.sortChange.emit({ 
      field: this.sortField || column.field, 
      direction: this.sortDirection 
    });
    this.cdr.markForCheck();
  }


  /** Handle page change */
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.pageChange.emit({ page: this.currentPage, pageSize: this.pageSize });
    this.cdr.markForCheck();
  }

  /** Handle page size change */
  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1;
    this.pageChange.emit({ page: this.currentPage, pageSize: this.pageSize });
    this.cdr.markForCheck();
  }

  /** Handle search input */
  onSearch(query: string): void {
    this.searchQuery = query;
    this.currentPage = 1;
    this.searchChange.emit(query);
    this.cdr.markForCheck();
  }

  /** Toggle column visibility */
  toggleColumnVisibility(column: TableColumn): void {
    column.visible = column.visible === false ? true : false;
    this.columnVisibilityChange.emit([...this.columns]);
    this.cdr.markForCheck();
  }

  /** Toggle column manager dropdown */
  toggleColumnManager(): void {
    this.columnManagerOpen = !this.columnManagerOpen;
    this.cdr.markForCheck();
  }

  /** Handle row click */
  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  /** Handle keyboard navigation */
  onKeyDown(event: KeyboardEvent, row: any): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onRowClick(row);
    }
  }

  /** Get sort indicator for column */
  getSortIndicator(column: TableColumn): string {
    if (this.sortField !== column.field) return '';
    if (this.sortDirection === 'asc') return '↑';
    if (this.sortDirection === 'desc') return '↓';
    return '';
  }

  /** Track by function for rows */
  trackByIndex(index: number): number {
    return index;
  }

  /** Track by function for columns */
  trackByField(index: number, column: TableColumn): string {
    return column.field;
  }
}
