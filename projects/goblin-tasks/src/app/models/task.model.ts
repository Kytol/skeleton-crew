export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  priority: TaskPriority;
  deadline: Date | null;
  assignedGoblinId: string | null;
  status: TaskStatus;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
}

export interface Goblin {
  id: string;
  name: string;
  totalRewards: number;
  tasksCompleted: number;
  avatar: string;
  specialty: string;
}

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; icon: string }> = {
  low: { label: 'Low', color: '#4c9a6b', icon: '🟢' },
  medium: { label: 'Medium', color: '#9a9a4c', icon: '🟡' },
  high: { label: 'High', color: '#9a6b4c', icon: '🟠' },
  urgent: { label: 'Urgent', color: '#9a4c4c', icon: '🔴' },
};
