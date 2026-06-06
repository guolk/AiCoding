import { create } from 'zustand';
import type {
  Project,
  Observation,
  SpatialAnalysis,
  PedestrianStudy,
  Comparison,
  CaseStudy,
} from '../../shared/types';
import {
  projectDB,
  observationDB,
  analysisDB,
  pedestrianStudyDB,
  comparisonDB,
  caseStudyDB,
} from '../lib/db';
import { seedDatabase } from '../lib/mockData';

interface AppState {
  projects: Project[];
  observations: Observation[];
  analyses: SpatialAnalysis[];
  pedestrianStudies: PedestrianStudy[];
  comparisons: Comparison[];
  caseStudies: CaseStudy[];
  isLoading: boolean;
  activeProjectId: string | null;

  setActiveProjectId: (id: string | null) => void;
  loadAllData: () => Promise<void>;

  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateProject: (project: Project) => Promise<string>;
  deleteProject: (id: string) => Promise<void>;

  createObservation: (observation: Omit<Observation, 'id'>) => Promise<string>;
  updateObservation: (observation: Observation) => Promise<string>;
  deleteObservation: (id: string) => Promise<void>;

  createAnalysis: (analysis: Omit<SpatialAnalysis, 'id'>) => Promise<string>;
  updateAnalysis: (analysis: SpatialAnalysis) => Promise<string>;
  deleteAnalysis: (id: string) => Promise<void>;

  createPedestrianStudy: (study: Omit<PedestrianStudy, 'id'>) => Promise<string>;
  updatePedestrianStudy: (study: PedestrianStudy) => Promise<string>;
  deletePedestrianStudy: (id: string) => Promise<void>;

  createComparison: (comparison: Omit<Comparison, 'id'>) => Promise<string>;
  updateComparison: (comparison: Comparison) => Promise<string>;
  deleteComparison: (id: string) => Promise<void>;

  createCaseStudy: (caseStudy: Omit<CaseStudy, 'id' | 'createdAt'>) => Promise<string>;
  updateCaseStudy: (caseStudy: CaseStudy) => Promise<string>;
  deleteCaseStudy: (id: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  projects: [],
  observations: [],
  analyses: [],
  pedestrianStudies: [],
  comparisons: [],
  caseStudies: [],
  isLoading: true,
  activeProjectId: null,

  setActiveProjectId: (id) => set({ activeProjectId: id }),

  loadAllData: async () => {
    set({ isLoading: true });
    try {
      await seedDatabase();

      const [projects, observations, analyses, pedestrianStudies, comparisons, caseStudies] =
        await Promise.all([
          projectDB.getAll(),
          observationDB.getAll(),
          analysisDB.getAll(),
          pedestrianStudyDB.getAll(),
          comparisonDB.getAll(),
          caseStudyDB.getAll(),
        ]);

      set({
        projects,
        observations,
        analyses,
        pedestrianStudies,
        comparisons,
        caseStudies,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load data:', error);
      set({ isLoading: false });
    }
  },

  createProject: async (projectData) => {
    const now = new Date().toISOString();
    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now().toString(36)}`,
      createdAt: now,
      updatedAt: now,
    };
    const id = await projectDB.create(newProject);
    set((state) => ({
      projects: [...state.projects, newProject],
    }));
    return id;
  },

  updateProject: async (project) => {
    const updatedProject = { ...project, updatedAt: new Date().toISOString() };
    await projectDB.update(updatedProject);
    set((state) => ({
      projects: state.projects.map((p) => (p.id === project.id ? updatedProject : p)),
    }));
    return project.id;
  },

  deleteProject: async (id) => {
    await projectDB.delete(id);
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      observations: state.observations.filter((o) => o.projectId !== id),
      analyses: state.analyses.filter((a) => a.projectId !== id),
      pedestrianStudies: state.pedestrianStudies.filter((s) => s.projectId !== id),
      caseStudies: state.caseStudies.filter((c) => c.projectId !== id),
      activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
    }));
  },

  createObservation: async (observationData) => {
    const newObservation: Observation = {
      ...observationData,
      id: `obs-${Date.now().toString(36)}`,
    };
    const id = await observationDB.create(newObservation);
    set((state) => ({
      observations: [...state.observations, newObservation],
    }));
    return id;
  },

  updateObservation: async (observation) => {
    await observationDB.update(observation);
    set((state) => ({
      observations: state.observations.map((o) => (o.id === observation.id ? observation : o)),
    }));
    return observation.id;
  },

  deleteObservation: async (id) => {
    await observationDB.delete(id);
    set((state) => ({
      observations: state.observations.filter((o) => o.id !== id),
    }));
  },

  createAnalysis: async (analysisData) => {
    const newAnalysis: SpatialAnalysis = {
      ...analysisData,
      id: `ana-${Date.now().toString(36)}`,
    };
    const id = await analysisDB.create(newAnalysis);
    set((state) => ({
      analyses: [...state.analyses, newAnalysis],
    }));
    return id;
  },

  updateAnalysis: async (analysis) => {
    await analysisDB.update(analysis);
    set((state) => ({
      analyses: state.analyses.map((a) => (a.id === analysis.id ? analysis : a)),
    }));
    return analysis.id;
  },

  deleteAnalysis: async (id) => {
    await analysisDB.delete(id);
    set((state) => ({
      analyses: state.analyses.filter((a) => a.id !== id),
    }));
  },

  createPedestrianStudy: async (studyData) => {
    const newStudy: PedestrianStudy = {
      ...studyData,
      id: `ped-${Date.now().toString(36)}`,
    };
    const id = await pedestrianStudyDB.create(newStudy);
    set((state) => ({
      pedestrianStudies: [...state.pedestrianStudies, newStudy],
    }));
    return id;
  },

  updatePedestrianStudy: async (study) => {
    await pedestrianStudyDB.update(study);
    set((state) => ({
      pedestrianStudies: state.pedestrianStudies.map((s) => (s.id === study.id ? study : s)),
    }));
    return study.id;
  },

  deletePedestrianStudy: async (id) => {
    await pedestrianStudyDB.delete(id);
    set((state) => ({
      pedestrianStudies: state.pedestrianStudies.filter((s) => s.id !== id),
    }));
  },

  createComparison: async (comparisonData) => {
    const newComparison: Comparison = {
      ...comparisonData,
      id: `comp-${Date.now().toString(36)}`,
    };
    const id = await comparisonDB.create(newComparison);
    set((state) => ({
      comparisons: [...state.comparisons, newComparison],
    }));
    return id;
  },

  updateComparison: async (comparison) => {
    await comparisonDB.update(comparison);
    set((state) => ({
      comparisons: state.comparisons.map((c) => (c.id === comparison.id ? comparison : c)),
    }));
    return comparison.id;
  },

  deleteComparison: async (id) => {
    await comparisonDB.delete(id);
    set((state) => ({
      comparisons: state.comparisons.filter((c) => c.id !== id),
    }));
  },

  createCaseStudy: async (caseStudyData) => {
    const newCaseStudy: CaseStudy = {
      ...caseStudyData,
      id: `case-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    };
    const id = await caseStudyDB.create(newCaseStudy);
    set((state) => ({
      caseStudies: [...state.caseStudies, newCaseStudy],
    }));
    return id;
  },

  updateCaseStudy: async (caseStudy) => {
    await caseStudyDB.update(caseStudy);
    set((state) => ({
      caseStudies: state.caseStudies.map((c) => (c.id === caseStudy.id ? caseStudy : c)),
    }));
    return caseStudy.id;
  },

  deleteCaseStudy: async (id) => {
    await caseStudyDB.delete(id);
    set((state) => ({
      caseStudies: state.caseStudies.filter((c) => c.id !== id),
    }));
  },
}));
