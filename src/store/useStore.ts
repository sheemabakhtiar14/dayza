import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Subtask, DayOfWeek, CompletionState, Goal } from '../types';
import { format } from 'date-fns';

interface AppState {
  tasks: Task[];
  goals: Goal[];
  completionState: CompletionState;
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  toggleTaskCompletion: (taskId: string, date: Date) => void;
  toggleSubtaskCompletion: (taskId: string, subtaskId: string, date: Date) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: [],
      goals: [],
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

      addGoal: (goalData) => set((state) => {
        const newGoal: Goal = {
          ...goalData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        return { goals: [...state.goals, newGoal] };
      }),

      updateGoal: (id, updatedGoal) => set((state) => ({
        goals: state.goals.map((goal) =>
          goal.id === id ? { ...goal, ...updatedGoal } : goal
        ),
      })),

      deleteGoal: (id) => set((state) => ({
        goals: state.goals.filter((goal) => goal.id !== id),
        // Also remove goalId from tasks
        tasks: state.tasks.map((task) => 
          task.goalId === id ? { ...task, goalId: undefined, goalUnits: undefined } : task
        ),
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
