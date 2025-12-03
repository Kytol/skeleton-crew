import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../projects/ui-lib/src/lib/button/button.component';
import { InputComponent } from '../../projects/ui-lib/src/lib/input/input.component';
import { SearchComponent } from '../../projects/ui-lib/src/lib/search/search.component';
import { CalendarComponent } from '../../projects/ui-lib/src/lib/calendar/calendar.component';
import { TableComponent } from '../../projects/ui-lib/src/lib/table/table.component';
import { TableColumn } from '../../projects/ui-lib/src/lib/shared/types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    InputComponent,
    SearchComponent,
    CalendarComponent,
    TableComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isDarkTheme = false;
  inputValue = '';
  searchValue = '';
  selectedDate: Date | null = null;

  // Table data
  tableColumns: TableColumn[] = [
    { field: 'id', title: 'ID', width: '60px' },
    { field: 'name', title: 'Name', sortable: true },
    { field: 'email', title: 'Email', sortable: true },
    { field: 'role', title: 'Role', sortable: true }
  ];

  tableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'User' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Admin' }
  ];

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
  }

  onButtonClick(): void {
    console.log('Button clicked!');
  }

  onInputChange(value: string): void {
    this.inputValue = value;
  }

  onSearchChange(value: string): void {
    this.searchValue = value;
    console.log('Search:', value);
  }

  onDateChange(date: Date | [Date, Date]): void {
    this.selectedDate = Array.isArray(date) ? date[0] : date;
    console.log('Date selected:', date);
  }
}
