export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  totalUnits: number;
  unitName: string; // e.g., "videos", "pages"
  createdAt: string;
  initialCompletedUnits?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  startTime?: string; // e.g., "09:00 AM"
  duration?: string; // e.g., "45m"
  priority?: 'Low' | 'Medium' | 'High';
  completed: boolean;
  subtasks: Subtask[];
  day: DayOfWeek;
  goalId?: string;
  goalUnits?: number;
}

export interface WeeklySchedule {
  tasks: Task[];
}

export interface CompletionState {
  [dateString: string]: { // e.g., "2023-10-27"
    [taskId: string]: {
      completed: boolean;
      subtasks: {
        [subtaskId: string]: boolean;
      }
    }
  }
}
