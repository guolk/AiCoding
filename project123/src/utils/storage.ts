import type {
  Project,
  ProjectData,
  ProjectDataSnapshot,
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
  TruthReveal,
  CharacterTruth
} from '@/types';
import { generateUUID, generateVersionNumber } from './index';

const PROJECTS_KEY = 'script-creator-projects';
const PROJECT_DATA_KEY_PREFIX = 'script-creator-project-';

export function getProjects(): Project[] {
  try {
    const data = localStorage.getItem(PROJECTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]): void {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function getProjectData(projectId: string): ProjectData | null {
  try {
    const data = localStorage.getItem(`${PROJECT_DATA_KEY_PREFIX}${projectId}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveProjectData(projectData: ProjectData): void {
  localStorage.setItem(`${PROJECT_DATA_KEY_PREFIX}${projectData.id}`, JSON.stringify(projectData));
}

export function deleteProjectData(projectId: string): void {
  localStorage.removeItem(`${PROJECT_DATA_KEY_PREFIX}${projectId}`);
}

// 创建默认的空数据快照
export function createDefaultDataSnapshot(): ProjectDataSnapshot {
  return {
    scriptInfo: {
      title: '',
      background: '',
      era: '',
      scenes: [],
      playerCount: 5,
      difficulty: 'medium',
      duration: 120,
      description: ''
    },
    characters: [],
    timeline: [],
    clues: [],
    truthNodes: [],
    playtestRecords: [],
    feedbacks: [],
    versions: [],
    dmHandbook: {
      introduction: '',
      preparationGuide: '',
      flowGuide: [],
      tips: [],
      emergencyGuide: ''
    },
    faqs: [],
    truthReveal: {
      summary: '',
      fullStory: '',
      characterTruths: [],
      keyClues: [],
      timeline: []
    }
  };
}

// 创建新角色
export function createDefaultCharacter(): Character {
  return {
    id: generateUUID(),
    name: '',
    identity: '',
    personality: '',
    motivation: '',
    secrets: '',
    relationships: [],
    avatar: ''
  };
}

// 创建时间线节点
export function createDefaultTimelineNode(): TimelineNode {
  return {
    id: generateUUID(),
    time: '',
    title: '',
    description: '',
    characterIds: [],
    location: ''
  };
}

// 创建线索
export function createDefaultClue(): Clue {
  return {
    id: generateUUID(),
    name: '',
    description: '',
    type: 'public',
    round: 1,
    location: '',
    relatedTruthIds: [],
    relatedCharacterIds: [],
    imageUrl: ''
  };
}

// 创建真相节点
export function createDefaultTruthNode(): TruthNode {
  return {
    id: generateUUID(),
    title: '',
    description: '',
    importance: 5
  };
}

// 创建试玩记录
export function createDefaultPlaytestRecord(): PlaytestRecord {
  return {
    id: generateUUID(),
    date: new Date().toISOString(),
    players: [],
    duration: 0,
    finalConclusion: '',
    correctRate: 0,
    notes: ''
  };
}

// 创建玩家反馈
export function createDefaultFeedback(playtestId: string): PlayerFeedback {
  return {
    id: generateUUID(),
    playtestId,
    category: 'other',
    content: '',
    severity: 'medium',
    createdAt: new Date().toISOString()
  };
}

// 创建 FAQ
export function createDefaultFAQ(): FAQ {
  return {
    id: generateUUID(),
    question: '',
    answer: '',
    category: '通用'
  };
}

// 创建角色真相
export function createDefaultCharacterTruth(characterId: string): CharacterTruth {
  return {
    characterId,
    trueIdentity: '',
    realMotivation: '',
    keyActions: [],
    secretRevealed: ''
  };
}

// 创建新版本
export function createVersion(data: ProjectDataSnapshot, currentVersion: string, changes: string): Version {
  return {
    id: generateUUID(),
    versionNumber: generateVersionNumber(currentVersion, 'patch'),
    timestamp: new Date().toISOString(),
    changes,
    dataSnapshot: JSON.parse(JSON.stringify(data))
  };
}

// 创建新剧本项目
export function createProject(name: string): ProjectData {
  const now = new Date().toISOString();
  return {
    id: generateUUID(),
    name,
    createdAt: now,
    updatedAt: now,
    currentVersion: 'v1.0.0',
    data: createDefaultDataSnapshot()
  };
}

// 导出所有项目数据
export function exportAllProjects(): { projects: Project[]; projectDataMap: Record<string, ProjectData> } {
  const projects = getProjects();
  const projectDataMap: Record<string, ProjectData> = {};
  
  projects.forEach((p) => {
    const data = getProjectData(p.id);
    if (data) {
      projectDataMap[p.id] = data;
    }
  });

  return { projects, projectDataMap };
}

// 导入项目数据
export function importProjects(importData: { projects: Project[]; projectDataMap: Record<string, ProjectData> }): void {
  const existingProjects = getProjects();
  const importedProjects = importData.projects || [];
  
  const mergedProjects = [...existingProjects];
  importedProjects.forEach((p) => {
    if (!mergedProjects.find((ep) => ep.id === p.id)) {
      mergedProjects.push(p);
    }
  });

  saveProjects(mergedProjects);

  Object.values(importData.projectDataMap || {}).forEach((pd) => {
    saveProjectData(pd);
  });
}
