import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, InputComponent, CalendarComponent } from 'ui-lib';
import { TaskService } from '../../services/task.service';
import { TaskPriority, PRIORITY_CONFIG } from '../../models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, InputComponent, CalendarComponent],
  template: `
    <div class="task-form">
      <h2>📜 Create New Task</h2>
      <div class="form-fields">
        <ui-input
          label="Task Title"
          placeholder="Enter task title..."
          [(ngModel)]="title"
        />
        <ui-input
          label="Description"
          placeholder="What needs to be done..."
          [(ngModel)]="description"
        />
        <div class="form-row">
          <ui-input
            label="Reward (Gold)"
            type="number"
            placeholder="10"
            [(ngModel)]="reward"
          />
          <div class="priority-select">
            <label>Priority</label>
            <select [(ngModel)]="priority">
              @for (p of priorities; track p.value) {
                <option [value]="p.value">{{ p.icon }} {{ p.label }}</option>
              }
            </select>
          </div>
        </div>
        <div class="deadline-section">
          <label>
            <input type="checkbox" [(ngModel)]="hasDeadline" />
            Set Deadline
          </label>
          @if (hasDeadline) {
            <div class="calendar-wrapper">
              <ui-calendar
                mode="single"
                [showTime]="true"
                [minDate]="minDate"
                [value]="deadline"
                (valueChange)="onDeadlineChange($event)"
              />
            </div>
          }
        </div>
      </div>
      <ui-button variant="primary" (clicked)="createTask()">
        ✨ Create Task
      </ui-button>
    </div>
  `,
  styles: [`
    .task-form {
      background: var(--bg-card);
      border: 2px solid var(--border-primary);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      transition: all 0.3s;
    }
    h2 { color: var(--text-heading); margin: 0 0 20px 0; font-size: 1.5rem; }
    .form-fields { display: flex; flex-direction: column; gap: 16px; margin-bottom: 20px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .priority-select { display: flex; flex-direction: column; gap: 6px; }
    .priority-select label { color: var(--text-secondary); font-size: 0.875rem; }
    .priority-select select {
      background: var(--input-bg);
      color: var(--text-primary);
      border: 1px solid var(--border-primary);
      border-radius: 6px;
      padding: 10px 12px;
      font-size: 1rem;
    }
    .deadline-section { display: flex; flex-direction: column; gap: 12px; }
    .deadline-section > label {
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }
    .deadline-section input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: var(--accent-purple);
    }
    .calendar-wrapper {
      background: var(--input-bg);
      border-radius: 8px;
      padding: 12px;
      border: 1px solid var(--border-secondary);
    }
  `]
})
export class TaskFormComponent {
  private taskService = inject(TaskService);

  title = '';
  description = '';
  reward = '10';
  priority: TaskPriority = 'medium';
  hasDeadline = false;
  deadline: Date | null = null;
  minDate = new Date();

  priorities = [
    { value: 'low', ...PRIORITY_CONFIG.low },
    { value: 'medium', ...PRIORITY_CONFIG.medium },
    { value: 'high', ...PRIORITY_CONFIG.high },
    { value: 'urgent', ...PRIORITY_CONFIG.urgent },
  ];

  onDeadlineChange(date: Date | [Date, Date]): void {
    if (!Array.isArray(date)) {
      this.deadline = date;
    }
  }

  createTask(): void {
    if (!this.title.trim()) return;
    this.taskService.createTask(
      this.title,
      this.description,
      Number(this.reward) || 10,
      this.priority,
      this.hasDeadline ? this.deadline : null
    );
    this.title = '';
    this.description = '';
    this.reward = '10';
    this.priority = 'medium';
    this.hasDeadline = false;
    this.deadline = null;
  }
}
