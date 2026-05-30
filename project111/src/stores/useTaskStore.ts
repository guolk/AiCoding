import { create } from 'zustand';
import type { Task, TaskStatus, TaskDifficulty, TaskType } from '../types';
import { mockTasks } from '../data/mockData';
import { useUserStore } from './useUserStore';

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  selectedTask: Task | null;
  filterType: TaskType | 'all';
  filterDifficulty: TaskDifficulty | 'all';
  setFilterType: (type: TaskType | 'all') => void;
  setFilterDifficulty: (difficulty: TaskDifficulty | 'all') => void;
  setSelectedTask: (task: Task | null) => void;
  completeTask: (taskId: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  getFilteredTasks: () => Task[];
  getTodayTasks: () => Task[];
  getWeeklyCompleted: () => number;
  getPendingTasks: () => Task[];
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: mockTasks,
  loading: false,
  selectedTask: null,
  filterType: 'all',
  filterDifficulty: 'all',
  setFilterType: (type) => set({ filterType: type }),
  setFilterDifficulty: (difficulty) => set({ filterDifficulty: difficulty }),
  setSelectedTask: (task) => set({ selectedTask: task }),
  completeTask: async (taskId: string) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (task && task.status !== 'completed') {
      const userStore = useUserStore.getState();
      userStore.updateExp(task.expReward);
      userStore.updateCoins(task.coinReward);
      
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? { ...t, status: 'completed' as TaskStatus, completedAt: new Date().toISOString() }
            : t
        ),
      }));
    }
  },
  updateTaskStatus: (taskId: string, status: TaskStatus) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
    })),
  getFilteredTasks: () => {
    const { tasks, filterType, filterDifficulty } = get();
    return tasks.filter((task) => {
      const typeMatch = filterType === 'all' || task.type === filterType;
      const difficultyMatch =
        filterDifficulty === 'all' || task.difficulty === filterDifficulty;
      return typeMatch && difficultyMatch;
    });
  },
  getTodayTasks: () => {
    return get().tasks.filter((task) => task.type === 'daily');
  },
  getWeeklyCompleted: () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return get().tasks.filter((task) => {
      if (!task.completedAt) return false;
      const completedAt = new Date(task.completedAt);
      return completedAt >= weekAgo && completedAt <= now;
    }).length;
  },
  getPendingTasks: () => {
    return get().tasks.filter((task) => task.status !== 'completed');
  },
}));
