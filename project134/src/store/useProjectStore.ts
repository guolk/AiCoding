import { create } from 'zustand';
import type { Project, BusinessCanvas, Milestone, KPIRecord } from '../types';
import { mockProjects } from '../data/mockData';
import { generateId, saveToLocalStorage, loadFromLocalStorage } from '../utils/helpers';

interface ProjectStore {
  projects: Project[];
  loadProjects: () => void;
  addProject: (project: Omit<Project, 'id' | 'milestones' | 'kpiRecords' | 'businessCanvas'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
  updateBusinessCanvas: (projectId: string, canvas: Partial<BusinessCanvas>) => void;
  addMilestone: (projectId: string, milestone: Omit<Milestone, 'id'>) => void;
  updateMilestone: (projectId: string, milestoneId: string, updates: Partial<Milestone>) => void;
  deleteMilestone: (projectId: string, milestoneId: string) => void;
  addKPIRecord: (projectId: string, record: Omit<KPIRecord, 'id'>) => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],

  loadProjects: () => {
    const saved = loadFromLocalStorage<Project[]>('incubator_projects', mockProjects);
    set({ projects: saved });
  },

  addProject: (project) => {
    const newProject: Project = {
      ...project,
      id: generateId(),
      milestones: [],
      kpiRecords: [],
      businessCanvas: {
        customers: '',
        valueProposition: '',
        channels: '',
        customerRelationships: '',
        revenueStreams: '',
        keyResources: '',
        keyActivities: '',
        keyPartnerships: '',
        costStructure: '',
      },
    };
    const projects = [...get().projects, newProject];
    set({ projects });
    saveToLocalStorage('incubator_projects', projects);
  },

  updateProject: (id, updates) => {
    const projects = get().projects.map(p =>
      p.id === id ? { ...p, ...updates } : p
    );
    set({ projects });
    saveToLocalStorage('incubator_projects', projects);
  },

  deleteProject: (id) => {
    const projects = get().projects.filter(p => p.id !== id);
    set({ projects });
    saveToLocalStorage('incubator_projects', projects);
  },

  getProjectById: (id) => {
    return get().projects.find(p => p.id === id);
  },

  updateBusinessCanvas: (projectId, canvas) => {
    const projects = get().projects.map(p =>
      p.id === projectId
        ? { ...p, businessCanvas: { ...p.businessCanvas, ...canvas } }
        : p
    );
    set({ projects });
    saveToLocalStorage('incubator_projects', projects);
  },

  addMilestone: (projectId, milestone) => {
    const newMilestone: Milestone = {
      ...milestone,
      id: generateId(),
    };
    const projects = get().projects.map(p =>
      p.id === projectId
        ? { ...p, milestones: [...p.milestones, newMilestone] }
        : p
    );
    set({ projects });
    saveToLocalStorage('incubator_projects', projects);
  },

  updateMilestone: (projectId, milestoneId, updates) => {
    const projects = get().projects.map(p =>
      p.id === projectId
        ? {
            ...p,
            milestones: p.milestones.map(m =>
              m.id === milestoneId ? { ...m, ...updates } : m
            ),
          }
        : p
    );
    set({ projects });
    saveToLocalStorage('incubator_projects', projects);
  },

  deleteMilestone: (projectId, milestoneId) => {
    const projects = get().projects.map(p =>
      p.id === projectId
        ? { ...p, milestones: p.milestones.filter(m => m.id !== milestoneId) }
        : p
    );
    set({ projects });
    saveToLocalStorage('incubator_projects', projects);
  },

  addKPIRecord: (projectId, record) => {
    const newRecord: KPIRecord = {
      ...record,
      id: generateId(),
    };
    const projects = get().projects.map(p =>
      p.id === projectId
        ? { ...p, kpiRecords: [...p.kpiRecords, newRecord] }
        : p
    );
    set({ projects });
    saveToLocalStorage('incubator_projects', projects);
  },
}));
