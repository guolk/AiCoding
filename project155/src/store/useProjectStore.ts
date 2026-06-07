import { create } from 'zustand';
import type { Project } from '../types';
import { mockData } from '../data/mockData';

interface ProjectStore {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
  getProjectsByStatus: (status: Project['status']) => Project[];
  setProjects: (projects: Project[]) => void;
}

const initialProjects: Project[] = mockData.projects.map(p => ({
  ...p,
  location: p.address,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
} as unknown as Project));

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: initialProjects,

  addProject: (project) => {
    const newProject: Project = {
      ...project,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      projects: [...state.projects, newProject],
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
