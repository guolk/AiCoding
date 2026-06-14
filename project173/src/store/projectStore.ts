import type { Project, QuantitativeTarget, BudgetItem, Milestone, VisitRecord, PhotoGroup, EffectData, BenefitCase, Issue, Risk, IssueHistory, RiskMeasure } from '@/types';
import {
  mockProjects,
  mockQuantitativeTargets,
  mockBudgetItems,
  mockMilestones,
  mockVisitRecords,
  mockPhotoGroups,
  mockEffectData,
  mockBenefitCases,
  mockIssues,
  mockRisks,
  initMockData,
} from '@/data/mockData';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';

const STORAGE_KEY = 'rural_revival_data_v2';
const DATA_VERSION = '2.0.0';
const VERSION_KEY = 'rural_revival_data_version_v2';

interface StorageData {
  projects: Project[];
  targets: QuantitativeTarget[];
  budgets: BudgetItem[];
  milestones: Milestone[];
  visits: VisitRecord[];
  photoGroups: PhotoGroup[];
  effectData: EffectData[];
  cases: BenefitCase[];
  issues: Issue[];
  risks: Risk[];
}

interface ProjectStore {
  projects: Project[];
  targets: QuantitativeTarget[];
  budgets: BudgetItem[];
  milestones: Milestone[];
  visits: VisitRecord[];
  photoGroups: PhotoGroup[];
  effectData: EffectData[];
  cases: BenefitCase[];
  issues: Issue[];
  risks: Risk[];
  currentProjectId: string | null;
  loading: boolean;

  initializeData: () => void;
  setCurrentProjectId: (id: string | null) => void;
  getProjectById: (id: string) => Project | undefined;
  getProjectTargets: (projectId: string) => QuantitativeTarget[];
  getProjectBudgets: (projectId: string) => BudgetItem[];
  getProjectMilestones: (projectId: string) => Milestone[];
  getProjectVisits: (projectId: string) => VisitRecord[];
  getProjectPhotoGroups: (projectId: string) => PhotoGroup[];
  getProjectEffectData: (projectId: string) => EffectData[];
  getProjectCases: (projectId: string) => BenefitCase[];
  getProjectIssues: (projectId: string) => Issue[];
  getProjectRisks: (projectId: string) => Risk[];

  addProject: (project: Omit<Project, 'id' | 'createTime' | 'updateTime'>) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  addTarget: (target: Omit<QuantitativeTarget, 'id'>) => void;
  updateTarget: (id: string, data: Partial<QuantitativeTarget>) => void;
  deleteTarget: (id: string) => void;

  addBudget: (budget: Omit<BudgetItem, 'id'>) => void;
  updateBudget: (id: string, data: Partial<BudgetItem>) => void;
  deleteBudget: (id: string) => void;

  addMilestone: (milestone: Omit<Milestone, 'id'>) => void;
  updateMilestone: (id: string, data: Partial<Milestone>) => void;
  deleteMilestone: (id: string) => void;

  addVisit: (visit: Omit<VisitRecord, 'id'>) => void;
  updateVisit: (id: string, data: Partial<VisitRecord>) => void;
  deleteVisit: (id: string) => void;

  addPhotoGroup: (group: Omit<PhotoGroup, 'id'>) => void;
  addEffectData: (data: Omit<EffectData, 'id'>) => void;
  updateEffectData: (id: string, data: Partial<EffectData>) => void;

  addCase: (caseItem: Omit<BenefitCase, 'id' | 'createTime'>) => void;
  updateCase: (id: string, data: Partial<BenefitCase>) => void;
  deleteCase: (id: string) => void;

  addIssue: (issue: Omit<Issue, 'id' | 'createTime' | 'resolveTime' | 'history'>) => void;
  updateIssue: (id: string, data: Partial<Issue>) => void;
  addIssueHistory: (issueId: string, history: Omit<IssueHistory, 'id'>) => void;
  deleteIssue: (id: string) => void;

  addRisk: (risk: Omit<Risk, 'id' | 'createTime' | 'measures'>) => void;
  updateRisk: (id: string, data: Partial<Risk>) => void;
  addRiskMeasure: (riskId: string, measure: Omit<RiskMeasure, 'id'>) => void;
  updateRiskMeasure: (measureId: string, data: Partial<RiskMeasure>) => void;
  deleteRisk: (id: string) => void;

  saveToStorage: () => void;
  resetData: () => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: mockProjects,
  targets: mockQuantitativeTargets,
  budgets: mockBudgetItems,
  milestones: mockMilestones,
  visits: mockVisitRecords,
  photoGroups: mockPhotoGroups,
  effectData: mockEffectData,
  cases: mockBenefitCases,
  issues: mockIssues,
  risks: mockRisks,
  currentProjectId: null,
  loading: false,

  initializeData: () => {
    console.log('[Store] initializeData called');
    const storedData = localStorage.getItem(STORAGE_KEY);
    
    if (storedData) {
      try {
        const data: StorageData = JSON.parse(storedData);
        if (data.projects && data.projects.length > 0) {
          set({
            projects: data.projects,
            targets: data.targets || [],
            budgets: data.budgets || [],
            milestones: data.milestones || [],
            visits: data.visits || [],
            photoGroups: data.photoGroups || [],
            effectData: data.effectData || [],
            cases: data.cases || [],
            issues: data.issues || [],
            risks: data.risks || [],
            loading: false,
          });
          return;
        }
      } catch (e) {
        console.error('Failed to parse stored data:', e);
      }
    }
    
    const data: StorageData = {
      projects: mockProjects,
      targets: mockQuantitativeTargets,
      budgets: mockBudgetItems,
      milestones: mockMilestones,
      visits: mockVisitRecords,
      photoGroups: mockPhotoGroups,
      effectData: mockEffectData,
      cases: mockBenefitCases,
      issues: mockIssues,
      risks: mockRisks,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(VERSION_KEY, DATA_VERSION);
    initMockData();
  },

  setCurrentProjectId: (id: string | null) => {
    set({ currentProjectId: id });
  },

  getProjectById: (id: string) => {
    return get().projects.find(p => p.id === id);
  },

  getProjectTargets: (projectId: string) => {
    return get().targets.filter(t => t.projectId === projectId);
  },

  getProjectBudgets: (projectId: string) => {
    return get().budgets.filter(b => b.projectId === projectId);
  },

  getProjectMilestones: (projectId: string) => {
    return get().milestones.filter(m => m.projectId === projectId);
  },

  getProjectVisits: (projectId: string) => {
    return get().visits.filter(v => v.projectId === projectId);
  },

  getProjectPhotoGroups: (projectId: string) => {
    return get().photoGroups.filter(p => p.projectId === projectId);
  },

  getProjectEffectData: (projectId: string) => {
    return get().effectData.filter(e => e.projectId === projectId);
  },

  getProjectCases: (projectId: string) => {
    return get().cases.filter(c => c.projectId === projectId);
  },

  getProjectIssues: (projectId: string) => {
    return get().issues.filter(i => i.projectId === projectId);
  },

  getProjectRisks: (projectId: string) => {
    return get().risks.filter(r => r.projectId === projectId);
  },

  addProject: (project) => {
    const now = new Date().toISOString().split('T')[0];
    const newProject: Project = {
      ...project,
      id: uuidv4(),
      createTime: now,
      updateTime: now,
    };
    set(state => ({ projects: [...state.projects, newProject] }));
    get().saveToStorage();
  },

  updateProject: (id, data) => {
    set(state => ({
      projects: state.projects.map(p =>
        p.id === id ? { ...p, ...data, updateTime: new Date().toISOString().split('T')[0] } : p
      ),
    }));
    get().saveToStorage();
  },

  deleteProject: (id) => {
    set(state => ({
      projects: state.projects.filter(p => p.id !== id),
      targets: state.targets.filter(t => t.projectId !== id),
      budgets: state.budgets.filter(b => b.projectId !== id),
      milestones: state.milestones.filter(m => m.projectId !== id),
      visits: state.visits.filter(v => v.projectId !== id),
      photoGroups: state.photoGroups.filter(p => p.projectId !== id),
      effectData: state.effectData.filter(e => e.projectId !== id),
      cases: state.cases.filter(c => c.projectId !== id),
      issues: state.issues.filter(i => i.projectId !== id),
      risks: state.risks.filter(r => r.projectId !== id),
      currentProjectId: state.currentProjectId === id ? null : state.currentProjectId,
    }));
    get().saveToStorage();
  },

  addTarget: (target) => {
    const newTarget: QuantitativeTarget = {
      ...target,
      id: uuidv4(),
    };
    set(state => ({ targets: [...state.targets, newTarget] }));
    get().saveToStorage();
  },

  updateTarget: (id, data) => {
    set(state => ({
      targets: state.targets.map(t => (t.id === id ? { ...t, ...data } : t)),
    }));
    get().saveToStorage();
  },

  deleteTarget: (id) => {
    set(state => ({
      targets: state.targets.filter(t => t.id !== id),
    }));
    get().saveToStorage();
  },

  addBudget: (budget) => {
    const newBudget: BudgetItem = {
      ...budget,
      id: uuidv4(),
    };
    set(state => ({ budgets: [...state.budgets, newBudget] }));
    get().saveToStorage();
  },

  updateBudget: (id, data) => {
    set(state => ({
      budgets: state.budgets.map(b => (b.id === id ? { ...b, ...data } : b)),
    }));
    get().saveToStorage();
  },

  deleteBudget: (id) => {
    set(state => ({
      budgets: state.budgets.filter(b => b.id !== id),
    }));
    get().saveToStorage();
  },

  addMilestone: (milestone) => {
    const newMilestone: Milestone = {
      ...milestone,
      id: uuidv4(),
    };
    set(state => ({ milestones: [...state.milestones, newMilestone] }));
    get().saveToStorage();
  },

  updateMilestone: (id, data) => {
    set(state => ({
      milestones: state.milestones.map(m => (m.id === id ? { ...m, ...data } : m)),
    }));
    get().saveToStorage();
  },

  deleteMilestone: (id) => {
    set(state => ({
      milestones: state.milestones.filter(m => m.id !== id),
    }));
    get().saveToStorage();
  },

  addVisit: (visit) => {
    const newVisit: VisitRecord = {
      ...visit,
      id: uuidv4(),
    };
    set(state => ({ visits: [...state.visits, newVisit] }));
    get().saveToStorage();
  },

  updateVisit: (id, data) => {
    set(state => ({
      visits: state.visits.map(v => (v.id === id ? { ...v, ...data } : v)),
    }));
    get().saveToStorage();
  },

  deleteVisit: (id) => {
    set(state => ({
      visits: state.visits.filter(v => v.id !== id),
    }));
    get().saveToStorage();
  },

  addPhotoGroup: (group) => {
    const newGroup: PhotoGroup = {
      ...group,
      id: uuidv4(),
    };
    set(state => ({ photoGroups: [...state.photoGroups, newGroup] }));
    get().saveToStorage();
  },

  addEffectData: (data) => {
    const newData: EffectData = {
      ...data,
      id: uuidv4(),
    };
    set(state => ({ effectData: [...state.effectData, newData] }));
    get().saveToStorage();
  },

  updateEffectData: (id, data) => {
    set(state => ({
      effectData: state.effectData.map(e => (e.id === id ? { ...e, ...data } : e)),
    }));
    get().saveToStorage();
  },

  addCase: (caseItem) => {
    const newCase: BenefitCase = {
      ...caseItem,
      id: uuidv4(),
      createTime: new Date().toISOString().split('T')[0],
    };
    set(state => ({ cases: [...state.cases, newCase] }));
    get().saveToStorage();
  },

  updateCase: (id, data) => {
    set(state => ({
      cases: state.cases.map(c => (c.id === id ? { ...c, ...data } : c)),
    }));
    get().saveToStorage();
  },

  deleteCase: (id) => {
    set(state => ({
      cases: state.cases.filter(c => c.id !== id),
    }));
    get().saveToStorage();
  },

  addIssue: (issue) => {
    const newIssue: Issue = {
      ...issue,
      id: uuidv4(),
      createTime: new Date().toISOString().split('T')[0],
      resolveTime: null,
      history: [],
    };
    set(state => ({ issues: [...state.issues, newIssue] }));
    get().saveToStorage();
  },

  updateIssue: (id, data) => {
    set(state => ({
      issues: state.issues.map(i => (i.id === id ? { ...i, ...data } : i)),
    }));
    get().saveToStorage();
  },

  addIssueHistory: (issueId, history) => {
    const newHistory: IssueHistory = {
      ...history,
      id: uuidv4(),
      issueId,
    };
    set(state => ({
      issues: state.issues.map(i =>
        i.id === issueId ? { ...i, history: [...i.history, newHistory] } : i
      ),
    }));
    get().saveToStorage();
  },

  deleteIssue: (id) => {
    set(state => ({
      issues: state.issues.filter(i => i.id !== id),
    }));
    get().saveToStorage();
  },

  addRisk: (risk) => {
    const newRisk: Risk = {
      ...risk,
      id: uuidv4(),
      createTime: new Date().toISOString().split('T')[0],
      measures: [],
    };
    set(state => ({ risks: [...state.risks, newRisk] }));
    get().saveToStorage();
  },

  updateRisk: (id, data) => {
    set(state => ({
      risks: state.risks.map(r => (r.id === id ? { ...r, ...data } : r)),
    }));
    get().saveToStorage();
  },

  addRiskMeasure: (riskId, measure) => {
    const newMeasure: RiskMeasure = {
      ...measure,
      id: uuidv4(),
      riskId,
    };
    set(state => ({
      risks: state.risks.map(r =>
        r.id === riskId ? { ...r, measures: [...r.measures, newMeasure] } : r
      ),
    }));
    get().saveToStorage();
  },

  updateRiskMeasure: (measureId, data) => {
    set(state => ({
      risks: state.risks.map(r => ({
        ...r,
        measures: r.measures.map(m => (m.id === measureId ? { ...m, ...data } : m)),
      })),
    }));
    get().saveToStorage();
  },

  deleteRisk: (id) => {
    set(state => ({
      risks: state.risks.filter(r => r.id !== id),
    }));
    get().saveToStorage();
  },

  saveToStorage: () => {
    const state = get();
    const data: StorageData = {
      projects: state.projects,
      targets: state.targets,
      budgets: state.budgets,
      milestones: state.milestones,
      visits: state.visits,
      photoGroups: state.photoGroups,
      effectData: state.effectData,
      cases: state.cases,
      issues: state.issues,
      risks: state.risks,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  resetData: () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VERSION_KEY);
    localStorage.removeItem('mockProjects');
    localStorage.removeItem('mockQuantitativeTargets');
    localStorage.removeItem('mockBudgetItems');
    localStorage.removeItem('mockMilestones');
    localStorage.removeItem('mockVisitRecords');
    localStorage.removeItem('mockPhotos');
    localStorage.removeItem('mockPhotoGroups');
    localStorage.removeItem('mockEffectData');
    localStorage.removeItem('mockBenefitCases');
    localStorage.removeItem('mockIssueHistories');
    localStorage.removeItem('mockIssues');
    localStorage.removeItem('mockRiskMeasures');
    localStorage.removeItem('mockRisks');
    
    initMockData();
    
    set({
      projects: mockProjects,
      targets: mockQuantitativeTargets,
      budgets: mockBudgetItems,
      milestones: mockMilestones,
      visits: mockVisitRecords,
      photoGroups: mockPhotoGroups,
      effectData: mockEffectData,
      cases: mockBenefitCases,
      issues: mockIssues,
      risks: mockRisks,
      currentProjectId: null,
      loading: false,
    });
  },
}));

export function useProjectById(projectId: string | undefined) {
  const projects = useProjectStore((state) => state.projects);
  if (!projectId) return undefined;
  return projects.find((p) => p.id === projectId);
}

export function useProjectTargets(projectId: string | undefined) {
  const targets = useProjectStore((state) => state.targets);
  if (!projectId) return [];
  return targets.filter((t) => t.projectId === projectId);
}

export function useProjectBudgets(projectId: string | undefined) {
  const budgets = useProjectStore((state) => state.budgets);
  if (!projectId) return [];
  return budgets.filter((b) => b.projectId === projectId);
}

export function useProjectMilestones(projectId: string | undefined) {
  const milestones = useProjectStore((state) => state.milestones);
  if (!projectId) return [];
  return milestones.filter((m) => m.projectId === projectId);
}

export function useProjectVisits(projectId: string | undefined) {
  const visits = useProjectStore((state) => state.visits);
  if (!projectId) return [];
  return visits.filter((v) => v.projectId === projectId);
}

export function useProjectPhotoGroups(projectId: string | undefined) {
  const photoGroups = useProjectStore((state) => state.photoGroups);
  if (!projectId) return [];
  return photoGroups.filter((p) => p.projectId === projectId);
}

export function useProjectEffectData(projectId: string | undefined) {
  const effectData = useProjectStore((state) => state.effectData);
  if (!projectId) return [];
  return effectData.filter((e) => e.projectId === projectId);
}

export function useProjectCases(projectId: string | undefined) {
  const cases = useProjectStore((state) => state.cases);
  if (!projectId) return [];
  return cases.filter((c) => c.projectId === projectId);
}

export function useProjectIssues(projectId: string | undefined) {
  const issues = useProjectStore((state) => state.issues);
  if (!projectId) return [];
  return issues.filter((i) => i.projectId === projectId);
}

export function useProjectRisks(projectId: string | undefined) {
  const risks = useProjectStore((state) => state.risks);
  if (!projectId) return [];
  return risks.filter((r) => r.projectId === projectId);
}
