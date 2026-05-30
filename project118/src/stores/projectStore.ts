import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, ProjectStatus, ProjectType, ProjectPhoto, ProjectYarn } from '@/types';
import { generateId } from '@/utils/colorUtils';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  createProject: (data: {
    name: string;
    type: ProjectType;
    patternId?: string;
    dimensions: { width: number; height: number; unit: 'cm' | 'in' };
    yarnsUsed?: ProjectYarn[];
    notes?: string;
  }) => string;
  loadProject: (id: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  updateProgress: (id: string, progress: number, status?: ProjectStatus) => void;
  addPhoto: (id: string, photo: Omit<ProjectPhoto, 'createdAt'>) => void;
  updatePhoto: (projectId: string, photoIndex: number, note: string) => void;
  deletePhoto: (projectId: string, photoIndex: number) => void;
  updateYarnUsage: (projectId: string, yarnId: string, usedWeight: number) => void;
  getProjectsByStatus: (status?: ProjectStatus) => Project[];
  getProjectById: (id: string) => Project | undefined;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      
      createProject: (data) => {
        const now = new Date().toISOString();
        const id = generateId();
        const newProject: Project = {
          id,
          name: data.name,
          type: data.type,
          patternId: data.patternId,
          dimensions: data.dimensions,
          yarnsUsed: data.yarnsUsed || [],
          progress: 0,
          status: 'planning',
          photos: [],
          notes: data.notes || '',
          createdAt: now,
          updatedAt: now
        };
        
        set(state => ({
          projects: [...state.projects, newProject],
          currentProject: newProject
        }));
        
        return id;
      },
      
      loadProject: (id) => {
        const project = get().projects.find(p => p.id === id);
        if (project) {
          set({ currentProject: project });
        }
      },
      
      updateProject: (id, updates) => {
        const now = new Date().toISOString();
        set(state => ({
          projects: state.projects.map(p =>
            p.id === id ? { ...p, ...updates, updatedAt: now } : p
          ),
          currentProject: state.currentProject?.id === id
            ? { ...state.currentProject, ...updates, updatedAt: now }
            : state.currentProject
        }));
      },
      
      deleteProject: (id) => {
        set(state => ({
          projects: state.projects.filter(p => p.id !== id),
          currentProject: state.currentProject?.id === id ? null : state.currentProject
        }));
      },
      
      updateProgress: (id, progress, status) => {
        const actualStatus = status || (progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'planning');
        get().updateProject(id, { progress: Math.max(0, Math.min(100, progress)), status: actualStatus });
      },
      
      addPhoto: (id, photo) => {
        const now = new Date().toISOString();
        set(state => ({
          projects: state.projects.map(p =>
            p.id === id
              ? { ...p, photos: [...p.photos, { ...photo, createdAt: now }], updatedAt: now }
              : p
          ),
          currentProject: state.currentProject?.id === id
            ? { ...state.currentProject, photos: [...state.currentProject.photos, { ...photo, createdAt: now }], updatedAt: now }
            : state.currentProject
        }));
      },
      
      updatePhoto: (projectId, photoIndex, note) => {
        const now = new Date().toISOString();
        set(state => ({
          projects: state.projects.map(p => {
            if (p.id !== projectId) return p;
            const newPhotos = [...p.photos];
            if (newPhotos[photoIndex]) {
              newPhotos[photoIndex] = { ...newPhotos[photoIndex], note };
            }
            return { ...p, photos: newPhotos, updatedAt: now };
          }),
          currentProject: state.currentProject?.id === projectId
            ? (() => {
                const newPhotos = [...state.currentProject.photos];
                if (newPhotos[photoIndex]) {
                  newPhotos[photoIndex] = { ...newPhotos[photoIndex], note };
                }
                return { ...state.currentProject, photos: newPhotos, updatedAt: now };
              })()
            : state.currentProject
        }));
      },
      
      deletePhoto: (projectId, photoIndex) => {
        const now = new Date().toISOString();
        set(state => ({
          projects: state.projects.map(p =>
            p.id === projectId
              ? { ...p, photos: p.photos.filter((_, i) => i !== photoIndex), updatedAt: now }
              : p
          ),
          currentProject: state.currentProject?.id === projectId
            ? { ...state.currentProject, photos: state.currentProject.photos.filter((_, i) => i !== photoIndex), updatedAt: now }
            : state.currentProject
        }));
      },
      
      updateYarnUsage: (projectId, yarnId, usedWeight) => {
        const now = new Date().toISOString();
        set(state => ({
          projects: state.projects.map(p => {
            if (p.id !== projectId) return p;
            
            const yarnIndex = p.yarnsUsed.findIndex(y => y.yarnId === yarnId);
            const newYarnsUsed = [...p.yarnsUsed];
            
            if (yarnIndex >= 0) {
              newYarnsUsed[yarnIndex] = {
                ...newYarnsUsed[yarnIndex],
                usedWeight
              };
            }
            
            return { ...p, yarnsUsed: newYarnsUsed, updatedAt: now };
          }),
          currentProject: state.currentProject?.id === projectId
            ? (() => {
                const yarnIndex = state.currentProject.yarnsUsed.findIndex(y => y.yarnId === yarnId);
                const newYarnsUsed = [...state.currentProject.yarnsUsed];
                
                if (yarnIndex >= 0) {
                  newYarnsUsed[yarnIndex] = {
                    ...newYarnsUsed[yarnIndex],
                    usedWeight
                  };
                }
                
                return { ...state.currentProject, yarnsUsed: newYarnsUsed, updatedAt: now };
              })()
            : state.currentProject
        }));
      },
      
      getProjectsByStatus: (status) => {
        const projects = get().projects;
        if (!status) return projects;
        return projects.filter(p => p.status === status);
      },
      
      getProjectById: (id) => {
        return get().projects.find(p => p.id === id);
      }
    }),
    {
      name: 'project-storage'
    }
  )
);
