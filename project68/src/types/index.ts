export type IdeaSource = 'reading' | 'observation' | 'conversation' | 'dream' | 'shower' | 'walk' | 'meditation' | 'other';
export type IdeaEmotion = 'excited' | 'unsure' | 'needs_verification' | 'curious' | 'inspired' | 'anxious' | 'neutral';
export type IdeaStatus = 'captured' | 'incubating' | 'evaluating' | 'project' | 'archived';
export type ProjectStatus = 'concept' | 'poq' | 'in_progress' | 'completed' | 'abandoned';
export type MediaType = 'text' | 'image' | 'link' | 'voice';

export interface MediaAttachment {
  id: string;
  type: MediaType;
  url: string;
  name?: string;
}

export interface IncubationEntry {
  id: string;
  date: string;
  content: string;
  mood?: string;
}

export interface FeasibilityAssessment {
  market: number;
  technical: number;
  timeline: number;
  notes?: string;
  date: string;
}

export interface FermentReminder {
  id: string;
  ideaId: string;
  remindAfterDays: number;
  createdAt: string;
  isActive: boolean;
}

export interface PoqEntry {
  id: string;
  date: string;
  hypothesis: string;
  method: string;
  result: string;
  learned: string;
  success: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  completed: boolean;
  completedAt?: string;
}

export interface ResourceRequirement {
  id: string;
  name: string;
  type: 'time' | 'money' | 'skill' | 'tool' | 'other';
  quantity: string;
  secured: boolean;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  source: IdeaSource;
  emotion: IdeaEmotion;
  tags: string[];
  media: MediaAttachment[];
  status: IdeaStatus;
  createdAt: string;
  updatedAt: string;
  
  incubationEntries: IncubationEntry[];
  feasibility?: FeasibilityAssessment;
  fermentReminders: FermentReminder[];
  
  projectId?: string;
}

export interface Project {
  id: string;
  ideaId?: string;
  title: string;
  description: string;
  goal: string;
  status: ProjectStatus;
  tags: string[];
  coverImage?: string;
  
  milestones: Milestone[];
  resources: ResourceRequirement[];
  poqEntries: PoqEntry[];
  
  abandonReason?: string;
  abandonDate?: string;
  restartPotential?: 'low' | 'medium' | 'high';
  
  portfolioUrl?: string;
  completionDate?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  usageCount: number;
}

export interface AppSettings {
  fermentDefaultDays: number;
  weeklyReviewDay: number;
  theme: 'light' | 'dark';
}

export const IDEA_SOURCES: { value: IdeaSource; label: string; icon: string }[] = [
  { value: 'reading', label: '阅读', icon: '📚' },
  { value: 'observation', label: '观察', icon: '👀' },
  { value: 'conversation', label: '对话', icon: '💬' },
  { value: 'dream', label: '梦境', icon: '🌙' },
  { value: 'shower', label: '淋浴时', icon: '🚿' },
  { value: 'walk', label: '散步中', icon: '🚶' },
  { value: 'meditation', label: '冥想', icon: '🧘' },
  { value: 'other', label: '其他', icon: '✨' },
];

export const IDEA_EMOTIONS: { value: IdeaEmotion; label: string; emoji: string; color: string }[] = [
  { value: 'excited', label: '兴奋', emoji: '🤩', color: 'yellow' },
  { value: 'unsure', label: '不确定', emoji: '🤔', color: 'blue' },
  { value: 'needs_verification', label: '需要验证', emoji: '🔬', color: 'purple' },
  { value: 'curious', label: '好奇', emoji: '✨', color: 'pink' },
  { value: 'inspired', label: '受启发', emoji: '💡', color: 'orange' },
  { value: 'anxious', label: '焦虑', emoji: '😰', color: 'red' },
  { value: 'neutral', label: '平静', emoji: '😌', color: 'green' },
];

export const IDEA_STATUSES: { value: IdeaStatus; label: string; color: string }[] = [
  { value: 'captured', label: '已捕捉', color: 'blue' },
  { value: 'incubating', label: '孵化中', color: 'yellow' },
  { value: 'evaluating', label: '评估中', color: 'purple' },
  { value: 'project', label: '已转化', color: 'green' },
  { value: 'archived', label: '已归档', color: 'gray' },
];

export const PROJECT_STATUSES: { value: ProjectStatus; label: string; color: string }[] = [
  { value: 'concept', label: '概念阶段', color: 'blue' },
  { value: 'poq', label: '概念验证', color: 'yellow' },
  { value: 'in_progress', label: '进行中', color: 'purple' },
  { value: 'completed', label: '已完成', color: 'green' },
  { value: 'abandoned', label: '已放弃', color: 'red' },
];
