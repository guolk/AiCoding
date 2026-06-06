export interface Project {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  address: string;
  streetName: string;
}

export type MediaType = 'photo' | 'sketch' | 'text';

export interface MediaItem {
  id: string;
  type: MediaType;
  url?: string;
  content?: string;
  caption: string;
}

export interface Observation {
  id: string;
  projectId: string;
  title: string;
  description: string;
  observationTime: string;
  season: Season;
  markers: MapMarker[];
  media: MediaItem[];
}

export type ElementCategory = 'furniture' | 'signage' | 'vegetation' | 'building' | 'activity';

export interface SpatialElement {
  id: string;
  category: ElementCategory;
  description: string;
  photo?: string;
}

export type Severity = 'low' | 'medium' | 'high';

export interface ProblemItem {
  id: string;
  description: string;
  severity: Severity;
  suggestion: string;
}

export interface SpatialScores {
  safety: number;
  vitality: number;
  accessibility: number;
  comfort: number;
}

export interface SpatialAnalysis {
  id: string;
  projectId: string;
  location: string;
  scores: SpatialScores;
  elements: SpatialElement[];
  problems: ProblemItem[];
}

export interface FlowCount {
  id: string;
  startTime: string;
  endTime: string;
  pedestrianCount: number;
  bicycleCount: number;
}

export type ActivityType = 'walk' | 'stay' | 'consume' | 'social';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  count: number;
  description: string;
}

export type PathType = 'actual' | 'designed';

export interface PathItem {
  id: string;
  type: PathType;
  coordinates: Array<{ lat: number; lng: number }>;
}

export interface PedestrianStudy {
  id: string;
  projectId: string;
  location: string;
  studyDate: string;
  flowCounts: FlowCount[];
  activities: ActivityItem[];
  paths: PathItem[];
}

export interface CaseDimensions {
  safety: number;
  liveliness: number;
  accessibility: number;
  comfort: number;
}

export interface NoteItem {
  id: string;
  content: string;
}

export interface CaseStudy {
  id: string;
  projectId?: string;
  title: string;
  location: string;
  description: string;
  rating: number;
  sourceUrl?: string;
  dimensions: CaseDimensions;
  highlights: NoteItem[];
  improvements: NoteItem[];
  createdAt: string;
}

export interface ComparisonNote {
  id: string;
  title: string;
  content: string;
}

export interface Comparison {
  id: string;
  title: string;
  description: string;
  caseIds: string[];
  notes: ComparisonNote[];
  createdAt: string;
}

export const elementCategoryLabels: Record<ElementCategory, string> = {
  furniture: '街道家具',
  signage: '标识系统',
  vegetation: '绿化植被',
  building: '建筑界面',
  activity: '活动场所',
};

export const severityLabels: Record<Severity, string> = {
  low: '轻微',
  medium: '中等',
  high: '严重',
};

export const activityTypeLabels: Record<ActivityType, string> = {
  walk: '步行通过',
  stay: '驻留休息',
  consume: '商业消费',
  social: '社交聚集',
};

export const seasonLabels: Record<Season, string> = {
  spring: '春季',
  summer: '夏季',
  autumn: '秋季',
  winter: '冬季',
};

export const pathTypeLabels: Record<PathType, string> = {
  actual: '实际路径',
  designed: '设计路径',
};

export const scoreLabels: Record<keyof SpatialScores, string> = {
  safety: '安全感',
  vitality: '活力度',
  accessibility: '可达性',
  comfort: '舒适度',
};

export const dimensionLabels: Record<keyof CaseDimensions, string> = {
  safety: '安全感',
  liveliness: '活力度',
  accessibility: '可达性',
  comfort: '舒适度',
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
