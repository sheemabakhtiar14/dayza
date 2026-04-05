import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Subtask, DayOfWeek, CompletionState } from '../types';
import { format } from 'date-fns';

interface AppState {
  tasks: Task[];
  completionState: CompletionState;
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (taskId: string, date: Date) => void;
  toggleSubtaskCompletion: (taskId: string, subtaskId: string, date: Date) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: [],
      completionState: {},

      addTask: (taskData) => set((state) => {
        const newTask: Task = {
          ...taskData,
          id: crypto.randomUUID(),
          completed: false,
        };
        return { tasks: [...state.tasks, newTask] };
      }),

      updateTask: (id, updatedTask) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, ...updatedTask } : task
        ),
      })),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      })),

      toggleTaskCompletion: (taskId, date) => set((state) => {
        const dateString = format(date, 'yyyy-MM-dd');
        const currentCompletion = state.completionState[dateString]?.[taskId]?.completed || false;
        
        return {
          completionState: {
            ...state.completionState,
            [dateString]: {
              ...state.completionState[dateString],
              [taskId]: {
                ...state.completionState[dateString]?.[taskId],
                completed: !currentCompletion,
              }
            }
          }
        };
      }),

      toggleSubtaskCompletion: (taskId, subtaskId, date) => set((state) => {
        const dateString = format(date, 'yyyy-MM-dd');
        const currentCompletion = state.completionState[dateString]?.[taskId]?.subtasks?.[subtaskId] || false;
        
        return {
          completionState: {
            ...state.completionState,
            [dateString]: {
              ...state.completionState[dateString],
              [taskId]: {
                ...state.completionState[dateString]?.[taskId],
                subtasks: {
                  ...state.completionState[dateString]?.[taskId]?.subtasks,
                  [subtaskId]: !currentCompletion,
                }
              }
            }
          }
        };
      }),
    }),
    {
      name: 'dayo-storage',
    }
  )
);
