import { create } from 'zustand';
import type {
  Project,
  ProjectData,
  ScriptInfo,
  Character,
  TimelineNode,
  Clue,
  TruthNode,
  PlaytestRecord,
  PlayerFeedback,
  Version,
  DMHandbook,
  FAQ,
  TruthReveal
} from '@/types';
import {
  getProjects,
  saveProjects,
  getProjectData,
  saveProjectData,
  deleteProjectData,
  createDefaultDataSnapshot,
  createProject as createProjectUtil,
  createVersion
} from '@/utils/storage';
import { deepClone } from '@/utils';

interface ProjectStore {
  projects: Project[];
  currentProjectId: string | null;
  currentProjectData: ProjectData | null;
  isLoading: boolean;

  loadProjects: () => void;
  loadProject: (projectId: string) => void;
  setCurrentProjectId: (projectId: string | null) => void;
  
  createProject: (name: string) => string;
  deleteProject: (projectId: string) => void;
  renameProject: (projectId: string, newName: string) => void;
  
  saveCurrentProject: () => void;
  
  updateScriptInfo: (info: Partial<ScriptInfo>) => void;
  
  addCharacter: (character: Character) => void;
  updateCharacter: (characterId: string, updates: Partial<Character>) => void;
  deleteCharacter: (characterId: string) => void;
  
  addTimelineNode: (node: TimelineNode) => void;
  updateTimelineNode: (nodeId: string, updates: Partial<TimelineNode>) => void;
  deleteTimelineNode: (nodeId: string) => void;
  reorderTimelineNodes: (nodeIds: string[]) => void;
  
  addClue: (clue: Clue) => void;
  updateClue: (clueId: string, updates: Partial<Clue>) => void;
  deleteClue: (clueId: string) => void;
  
  addTruthNode: (node: TruthNode) => void;
  updateTruthNode: (nodeId: string, updates: Partial<TruthNode>) => void;
  deleteTruthNode: (nodeId: string) => void;
  
  addPlaytestRecord: (record: PlaytestRecord) => void;
  updatePlaytestRecord: (recordId: string, updates: Partial<PlaytestRecord>) => void;
  deletePlaytestRecord: (recordId: string) => void;
  
  addFeedback: (feedback: PlayerFeedback) => void;
  updateFeedback: (feedbackId: string, updates: Partial<PlayerFeedback>) => void;
  deleteFeedback: (feedbackId: string) => void;
  
  saveVersion: (changes: string) => void;
  restoreVersion: (versionId: string) => void;
  
  updateDMHandbook: (updates: Partial<DMHandbook>) => void;
  
  addFAQ: (faq: FAQ) => void;
  updateFAQ: (faqId: string, updates: Partial<FAQ>) => void;
  deleteFAQ: (faqId: string) => void;
  
  updateTruthReveal: (updates: Partial<TruthReveal>) => void;
  
  importProject: (projectData: ProjectData) => string;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  currentProjectId: null,
  currentProjectData: null,
  isLoading: false,

  loadProjects: () => {
    const projects = getProjects();
    set({ projects });
  },

  loadProject: (projectId: string) => {
    const projectData = getProjectData(projectId);
    if (projectData) {
      set({
        currentProjectId: projectId,
        currentProjectData: projectData
      });
    }
  },

  setCurrentProjectId: (projectId: string | null) => {
    if (projectId === null) {
      set({ currentProjectId: null, currentProjectData: null });
    } else {
      get().loadProject(projectId);
    }
  },

  createProject: (name: string) => {
    const projectData = createProjectUtil(name);
    const project: Project = {
      id: projectData.id,
      name: projectData.name,
      createdAt: projectData.createdAt,
      updatedAt: projectData.updatedAt,
      currentVersion: projectData.currentVersion
    };
    const projects = [...get().projects, project];
    
    saveProjects(projects);
    saveProjectData(projectData);
    
    set({ projects });
    return projectData.id;
  },

  deleteProject: (projectId: string) => {
    const projects = get().projects.filter((p) => p.id !== projectId);
    saveProjects(projects);
    deleteProjectData(projectId);
    
    if (get().currentProjectId === projectId) {
      set({
        projects,
        currentProjectId: null,
        currentProjectData: null
      });
    } else {
      set({ projects });
    }
  },

  renameProject: (projectId: string, newName: string) => {
    const projects = get().projects.map((p) =>
      p.id === projectId ? { ...p, name: newName, updatedAt: new Date().toISOString() } : p
    );
    saveProjects(projects);
    
    let currentProjectData = get().currentProjectData;
    if (currentProjectData && currentProjectData.id === projectId) {
      currentProjectData = { ...currentProjectData, name: newName };
      saveProjectData(currentProjectData);
    }
    
    set({ projects, currentProjectData });
  },

  saveCurrentProject: () => {
    const { currentProjectData } = get();
    if (currentProjectData) {
      const updated = {
        ...currentProjectData,
        updatedAt: new Date().toISOString()
      };
      saveProjectData(updated);
      set({ currentProjectData: updated });
      
      const projects = get().projects.map((p) =>
        p.id === updated.id ? { ...p, name: updated.name, updatedAt: updated.updatedAt } : p
      );
      saveProjects(projects);
      set({ projects });
    }
  },

  updateScriptInfo: (info: Partial<ScriptInfo>) => {
    const { currentProjectData } = get();
    if (!currentProjectData) return;

    const updated = {
      ...currentProjectData,
      data: {
        ...currentProjectData.data,
        scriptInfo: {
          ...currentProjectData.data.scriptInfo,
          ...info
        }
      }
    };

    set({ currentProjectData: updated });
    get().saveCurrentProject();
  },

  addCharacter: (character: Character) => {
    const { currentProjectData } = get();
    if (!currentProjectData) return;

    const updated = {
      ...currentProjectData,
      data: {
        ...currentProjectData.data,
        characters: [...currentProjectData.data.characters, character]
      }
    };

    set({ currentProjectData: updated });
    get().saveCurrentProject();
  },

  updateCharacter: (characterId: string, updates: Partial<Character>) => {
    const { currentProjectData } = get();
    if (!currentProjectData) return;

    const updated = {
      ...currentProjectData,
      data: {
        ...currentProjectData.data,
        characters: currentProjectData.data.characters.map((c) =>
          c.id === characterId ? { ...c, ...updates } : c
        )
      }
    };

    set({ currentProjectData: updated });
    get().saveCurrentProject();
  },

  deleteCharacter: (characterId: string) => {
    const { currentProjectData } = get();
    if (!currentProjectData) return;

    const updated = {
      ...currentProjectData,
      data: {
        ...currentProjectData.data,
        characters: currentProjectData.data.characters.filter((c) => c.id !== characterId),
        timeline: currentProjectData.data.timeline.map((node) => ({
          ...node,
          characterIds: node.characterIds.filter((id) => id !== characterId)
        })),
        clues: currentProjectData.data.clues.map((clue) => ({
          ...clue,
          relatedCharacterIds: clue.relatedCharacterIds.filter((id) => id !== characterId)
        }))
      }
    };

    set({ currentProjectData: updated });
    get().saveCurrentProject();
  },

  addTimelineNode: (node: TimelineNode) => {
    const { currentProjectData } = get();
    if (!currentProjectData) return;

    const updated = {
      ...currentProjectData,
      data: {
        ...currentProjectData.data,
        timeline: [...currentProjectData.data.timeline, node]
      }
    };

    set({ currentProjectData: updated });
    get().saveCurrentProject();
  },

  updateTimelineNode: (nodeId: string, updates: Partial<TimelineNode>) => {
    const { currentProjectData } = get();
    if (!currentProjectData) return;

    const updated = {
      ...currentProjectData,
      data: {
        ...currentProjectData.data,
        timeline: currentProjectData.data.timeline.map((n) =>
          n.id === nodeId ? { ...n, ...updates } : n
        )
      }
    };

    set({ currentProjectData: updated });
    get().saveCurrentProject();
  },

  deleteTimelineNode: (nodeId: string) => {
    const { currentProjectData } = get();
    if (!currentProjectData) return;

    const updated = {
      ...currentProjectData,
      data: {
        ...currentProjectData.data,
        timeline: currentProjectData.data.timeline.filter((n) => n.id !== nodeId)
      }
    };

    set({ currentProjectData: updated });
    get().saveCurrentProject();
  },

  reorderTimelineNodes: (nodeIds: string[]) => {
    const { currentProjectData } = get();
    if (!currentProjectData) return;

    const nodeMap = new Map(currentProjectData.data.timeline.map((n) => [n.id, n]));
    const reordered = nodeIds.map((id) => nodeMap.get(id)!).filter(Boolean);

    const updated = {
      ...currentProjectData,
      data: {
        ...currentProjectData.data,
        timeline: reordered
      }
    };

    set({ currentProjectData: updated });
    get().saveCurrentProject();
  },

  addClue: (clue: Clue) => {
    const { currentProjectData } = get();
    if (!currentProjectData) return;

    const updated = {
      ...currentProjectData,
      data: {
        ...currentProjectData.data,
        clues: [...currentProjectData.data.clues, clue]
      }
    };

    set({ currentProjectData: updated });
    get().saveCurrentProject();
  },

  updateClue: (clueId: string, updates: Partial<Clue>) => {
    const { currentProjectData } = get();
    if (!currentProjectData) return;

    const updated = {
      ...currentProjectData,
      data: {
        ...currentProjectData.data,
        clues: currentProjectData.data.clues.map((c) =>
          c.id === clueId ? { ...c, ...updates } : c
        )
      }
    };

    set({ currentProjectData: updated });
    get().saveCurrentProject();
  },

  deleteClue: (clueId: string) => {
    const { currentProjectData } = get();
    if (!currentProjectData) return;

    const updated = {
      ...currentProjectData,
      data: {
        ...currentProjectData.data,
        clues: currentProjectData.data.clues.filter((c) => c.id !== clueId)
      }
    };

    set({ currentProjectData: updated });
    get().saveCurrentProject();
  },

  addTruthNode: (node: TruthNode) => {
    const { currentProjectData } = get();
    if (!currentProjectData) return;

    const updated = {
      ...currentProjectData,
      data: {
        ...currentProjectData.data,
        truthNodes: [...currentProjectData.data.truthNodes, node]
      }
    };

    set({ currentProjectData: updated });
    get().saveCurrentProject();
  },

  updateTruthNode: (nodeId: string, updates: Partial<TruthNode>) => {
    const { currentProjectData } = get();
    if (!currentProjectData) return;

    const updated = {
      ...currentProjectData,
      data: {
        ...currentProjectData.data,
        truthNodes: currentProjectData.data.truthNodes.map((n) =>
          n.id === nodeId ? { ...n, ...updates } : n
        )
      }
    };

    set({ currentProjectData: updated });
    get().saveCurrentProject();
  },

  deleteTruthNode: (nodeId: string) => {
    const { currentProjectData } = get();
    if (!currentProjectData) return;

    const updated = {
      ...currentProjectData,
      data: {
        ...currentProjectData.data,
        truthNodes: currentProjectData.data.truthNodes.filter((n) => n.id !== nodeId),
        clues: currentProjectData.data.clues.map((c) => ({
          ...c,
          relatedTruthIds: c.relatedTruthIds.filter((id) => id !== nodeId)
        }))
      }
    };

    set({ currentProjectData: updated });
    get().saveCurrentProject();
  },

  addPlaytestRecord: (record: PlaytestRecord) => {
    const { currentProjectData } = get();
    if (!currentProjectData) return;

    const updated = {
      ...currentProjectData,
      data: {
        ...currentProjectData.data,
        playtestRecords: [...currentProjectData.data.playtestRecords, record]
      }
    };

    set({ currentProjectData: updated });
    get().saveCurrentProject();
  },

  updatePlaytestRecord: (recordId: string, updates: Partial<PlaytestRecord>) => {
    const { currentProjectData } = get();
    if (!currentProjectData) return;

    const updated = {
      ...currentProjectData,
      data: {
        ...currentProjectData.data,
        playtestRecords: currentProjectData.data.playtestRecords.map((r) =>
          r.id === recordId ? { ...r, ...updates } : r
        )
      }
    };

    set({ currentProjectData: updated });
    get().saveCurrentProject();
  },

  deletePlaytestRecord: (recordId: string) => {
    const { currentProjectData } = get();
    if (!currentProjectData) return;

    const updated = {
      ...currentProjectData,
      data: {
        ...currentProjectData.data,
        playtestRecords: currentProjectData.data.playtestRecords.filter((r) => r.id !== recordId),
        feedbacks: currentProjectData.data.feedbacks.filter((f) => f.playtestId !== recordId)
      }
    };

    set({ currentProjectData: updated });
    get().saveCurrentProject();
  },

  addFeedback: (feedback: PlayerFeedback) => {
    const { currentProjectData } = get();
    if (!currentProjectData) return;

    const updated = {
      ...currentProjectData,
      data: {
        ...currentProjectData.data,
        feedbacks: [...currentProjectData.data.feedbacks, feedback]
      }
    };

    set({ currentProjectData: updated });
    get().saveCurrentProject();
  },

  updateFeedback: (feedbackId: string, updates: Partial<PlayerFeedback>) => {
    const { currentProjectData } = get();
    if (!currentProjectData) return;

    const updated = {
      ...currentProjectData,
      data: {
        ...currentProjectData.data,
        feedbacks: currentProjectData.data.feedbacks.map((f) =>
          f.id === feedbackId ? { ...f, ...updates } : f
        )
      }
    };

    set({ currentProjectData: updated });
    get().saveCurrentProject();
  },

  deleteFeedback: (feedbackId: string) => {
    const { currentProjectData } = get();
    if (!currentProjectData) return;

    const updated = {
      ...currentProjectData,
      data: {
        ...currentProjectData.data,
        feedbacks: currentProjectData.data.feedbacks.filter((f) => f.id !== feedbackId)
      }
    };

    set({ currentProjectData: updated });
    get().saveCurrentProject();
  },

  saveVersion: (changes: string) => {
    const { currentProjectData } = get();
    if (!currentProjectData) return;

    const newVersion = createVersion(
      currentProjectData.data,
      currentProjectData.currentVersion,
      changes
    );

    const updated = {
      ...currentProjectData,
      currentVersion: newVersion.versionNumber,
      data: {
        ...currentProjectData.data,
        versions: [...currentProjectData.data.versions, newVersion]
      }
    };

    set({ currentProjectData: updated });
    get().saveCurrentProject();
  },

  restoreVersion: (versionId: string) => {
    const { currentProjectData } = get();
    if (!currentProjectData) return;

    const version = currentProjectData.data.versions.find((v) => v.id === versionId);
    if (!version) return;

    const updated = {
      ...currentProjectData,
      currentVersion: version.versionNumber,
      data: deepClone(version.dataSnapshot)
    };

    set({ currentProjectData: updated });
    get().saveCurrentProject();
  },

  updateDMHandbook: (updates: Partial<DMHandbook>) => {
    const { currentProjectData } = get();
    if (!currentProjectData) return;

    const updated = {
      ...currentProjectData,
      data: {
        ...currentProjectData.data,
        dmHandbook: {
          ...currentProjectData.data.dmHandbook,
          ...updates
        }
      }
    };

    set({ currentProjectData: updated });
    get().saveCurrentProject();
  },

  addFAQ: (faq: FAQ) => {
    const { currentProjectData } = get();
    if (!currentProjectData) return;

    const updated = {
      ...currentProjectData,
      data: {
        ...currentProjectData.data,
        faqs: [...currentProjectData.data.faqs, faq]
      }
    };

    set({ currentProjectData: updated });
    get().saveCurrentProject();
  },

  updateFAQ: (faqId: string, updates: Partial<FAQ>) => {
    const { currentProjectData } = get();
    if (!currentProjectData) return;

    const updated = {
      ...currentProjectData,
      data: {
        ...currentProjectData.data,
        faqs: currentProjectData.data.faqs.map((f) =>
          f.id === faqId ? { ...f, ...updates } : f
        )
      }
    };

    set({ currentProjectData: updated });
    get().saveCurrentProject();
  },

  deleteFAQ: (faqId: string) => {
    const { currentProjectData } = get();
    if (!currentProjectData) return;

    const updated = {
      ...currentProjectData,
      data: {
        ...currentProjectData.data,
        faqs: currentProjectData.data.faqs.filter((f) => f.id !== faqId)
      }
    };

    set({ currentProjectData: updated });
    get().saveCurrentProject();
  },

  updateTruthReveal: (updates: Partial<TruthReveal>) => {
    const { currentProjectData } = get();
    if (!currentProjectData) return;

    const updated = {
      ...currentProjectData,
      data: {
        ...currentProjectData.data,
        truthReveal: {
          ...currentProjectData.data.truthReveal,
          ...updates
        }
      }
    };

    set({ currentProjectData: updated });
    get().saveCurrentProject();
  },

  importProject: (projectData: ProjectData) => {
    const existingProjects = get().projects;
    const exists = existingProjects.find((p) => p.id === projectData.id);
    
    if (exists) {
      return projectData.id;
    }

    saveProjectData(projectData);
    
    const project: Project = {
      id: projectData.id,
      name: projectData.name,
      createdAt: projectData.createdAt,
      updatedAt: projectData.updatedAt,
      currentVersion: projectData.currentVersion
    };
    const projects = [...existingProjects, project];
    saveProjects(projects);
    
    set({ projects });
    return projectData.id;
  }
}));
