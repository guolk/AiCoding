import { create } from 'zustand';
import type { Project } from '../types';
import { mockData } from '../data/mockData';

interface ProjectStore {
  projects: Project[];
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
  getProjectsByStatus: (status: Project['status']) => Project[];
  setProjects: (projects: Project[]) => void;
}

const initialProjects: Project[] = mockData.projects.map((p: any) => ({
  id: p.id,
  name: p.name,
  description: p.description || '',
  location: p.location || p.address || '',
  address: p.address || '',
  totalBudget: p.totalBudget || 0,
  spentAmount: p.spentAmount || 0,
  totalArea: p.totalArea || 0,
  progress: p.progress || 0,
  startDate: p.startDate || '',
  endDate: p.endDate || '',
  status: p.status || 'planning',
  createdAt: p.createdAt || '2026-01-01T00:00:00.000Z',
  updatedAt: p.updatedAt || '2026-06-01T00:00:00.000Z',
  coverImage: p.coverImage || '',
}));

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: initialProjects,

  addProject: (project) => {
    set((state) => ({
      projects: [...state.projects, project],
    }));
  },

  updateProject: (id, updates) => {
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === id
          ? { ...project, ...updates, updatedAt: new Date().toISOString() }
          : project
      ),
    }));
  },

  deleteProject: (id) => {
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== id),
    }));
  },

  getProjectById: (id) => {
    return get().projects.find((project) => project.id === id);
  },

  getProjectsByStatus: (status) => {
    return get().projects.filter((project) => project.status === status);
  },

  setProjects: (projects) => {
    set({ projects });
  },
}));

export default useProjectStore;
