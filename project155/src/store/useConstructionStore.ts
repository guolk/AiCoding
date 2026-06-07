import { create } from 'zustand';
import type { ConstructionTask, Issue } from '../types';
import { mockData } from '../data/mockData';

interface ConstructionStore {
  constructionTasks: ConstructionTask[];
  issues: Issue[];
  addConstructionTask: (task: Omit<ConstructionTask, 'id'>) => void;
  updateConstructionTask: (id: string, updates: Partial<ConstructionTask>) => void;
  deleteConstructionTask: (id: string) => void;
  getConstructionTaskById: (id: string) => ConstructionTask | undefined;
  getConstructionTasksByProjectId: (projectId: string) => ConstructionTask[];
  getConstructionTasksByStatus: (status: ConstructionTask['status']) => ConstructionTask[];
  getConstructionTasksByType: (type: ConstructionTask['type']) => ConstructionTask[];
  setConstructionTasks: (tasks: ConstructionTask[]) => void;
  addIssue: (issue: Omit<Issue, 'id' | 'createdAt'>) => void;
  updateIssue: (id: string, updates: Partial<Issue>) => void;
  deleteIssue: (id: string) => void;
  getIssueById: (id: string) => Issue | undefined;
  getIssuesByProjectId: (projectId: string) => Issue[];
  getIssuesByTaskId: (taskId: string) => Issue[];
  getIssuesBySeverity: (severity: Issue['severity']) => Issue[];
  getIssuesByStatus: (status: Issue['status']) => Issue[];
  setIssues: (issues: Issue[]) => void;
  getTaskProgressByProjectId: (projectId: string) => number;
}

const initialConstructionTasks: ConstructionTask[] = mockData.constructionTasks.map(
  (ct) =>
    ({
      id: ct.id,
      projectId: ct.projectId,
      name: ct.name,
      type: ct.type as ConstructionTask['type'],
      plannedStartDate: ct.plannedStartDate,
      plannedEndDate: ct.plannedEndDate,
      actualStartDate: ct.actualStartDate ?? undefined,
      actualEndDate: ct.actualEndDate ?? undefined,
      progress: ct.progress,
      status: ct.status as ConstructionTask['status'],
      dependencies: [],
      assignee: ct.assignee,
    }) as ConstructionTask
);

const initialIssues: Issue[] = mockData.constructionIssues.map(
  (ci) =>
    ({
      id: ci.id,
      projectId: ci.projectId,
      taskId: ci.taskId,
      title: ci.title,
      description: ci.description,
      severity: ci.severity as Issue['severity'],
      status: ci.status as Issue['status'],
      images: ci.imageUrls,
      rectificationRequired: ci.solution || '',
      createdAt: ci.reportedDate,
      resolvedAt: ci.resolvedDate ?? undefined,
    }) as Issue
);

export const useConstructionStore = create<ConstructionStore>((set, get) => ({
  constructionTasks: initialConstructionTasks,
  issues: initialIssues,

  addConstructionTask: (task) => {
    const newTask: ConstructionTask = {
      ...task,
      id: `task-${Date.now()}`,
    };
    set((state) => ({
      constructionTasks: [...state.constructionTasks, newTask],
    }));
  },

  updateConstructionTask: (id, updates) => {
    set((state) => ({
      constructionTasks: state.constructionTasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    }));
  },

  deleteConstructionTask: (id) => {
    set((state) => ({
      constructionTasks: state.constructionTasks.filter((task) => task.id !== id),
      issues: state.issues.map((issue) =>
        issue.taskId === id ? { ...issue, taskId: undefined } : issue
      ),
    }));
  },

  getConstructionTaskById: (id) => {
    return get().constructionTasks.find((task) => task.id === id);
  },

  getConstructionTasksByProjectId: (projectId) => {
    return get().constructionTasks.filter((task) => task.projectId === projectId);
  },

  getConstructionTasksByStatus: (status) => {
    return get().constructionTasks.filter((task) => task.status === status);
  },

  getConstructionTasksByType: (type) => {
    return get().constructionTasks.filter((task) => task.type === type);
  },

  setConstructionTasks: (constructionTasks) => {
    set({ constructionTasks });
  },

  addIssue: (issue) => {
    const newIssue: Issue = {
      ...issue,
      id: `issue-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      issues: [...state.issues, newIssue],
    }));
  },

  updateIssue: (id, updates) => {
    set((state) => ({
      issues: state.issues.map((issue) =>
        issue.id === id ? { ...issue, ...updates } : issue
      ),
    }));
  },

  deleteIssue: (id) => {
    set((state) => ({
      issues: state.issues.filter((issue) => issue.id !== id),
    }));
  },

  getIssueById: (id) => {
    return get().issues.find((issue) => issue.id === id);
  },

  getIssuesByProjectId: (projectId) => {
    return get().issues.filter((issue) => issue.projectId === projectId);
  },

  getIssuesByTaskId: (taskId) => {
    return get().issues.filter((issue) => issue.taskId === taskId);
  },

  getIssuesBySeverity: (severity) => {
    return get().issues.filter((issue) => issue.severity === severity);
  },

  getIssuesByStatus: (status) => {
    return get().issues.filter((issue) => issue.status === status);
  },

  setIssues: (issues) => {
    set({ issues });
  },

  getTaskProgressByProjectId: (projectId) => {
    const tasks = get().constructionTasks.filter((task) => task.projectId === projectId);
    if (tasks.length === 0) return 0;
    const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
    return Math.round(totalProgress / tasks.length);
  },
}));

export default useConstructionStore;
