export interface Relic {
  id: string;
  name: string;
  category: string;
  era: string;
  material: string;
  decoration: string;
  inscription: string;
  excavateLocation: string;
  currentLocation: string;
  relicNumber: string;
  dimensions: {
    height?: number;
    width?: number;
    length?: number;
    diameter?: number;
    weight?: number;
    unit: string;
  };
  photos: RelicPhoto[];
  createdAt: string;
  updatedAt: string;
}

export interface RelicPhoto {
  id: string;
  relicId: string;
  type: 'front' | 'side' | 'detail' | 'rubbing';
  url: string;
  caption: string;
  uploadDate: string;
}

export interface ResearchNote {
  id: string;
  relicId?: string;
  title: string;
  content: string;
  references: Reference[];
  viewpoints: Viewpoint[];
  personalInsights: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Reference {
  id: string;
  noteId: string;
  title: string;
  author: string;
  publication: string;
  year: number;
  page: string;
  excerpt: string;
  doi?: string;
}

export interface Viewpoint {
  id: string;
  noteId: string;
  scholar: string;
  aspect: 'dating' | 'usage' | 'origin';
  content: string;
  evidence: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface TypeAnalysis {
  id: string;
  name: string;
  type: 'comparison' | 'evolution' | 'periodization';
  description: string;
  relicIds: string[];
  analysisData: Record<string, unknown>;
  createdAt: string;
}

export interface Material {
  id: string;
  type: 'pdf' | 'rubbing' | 'map';
  title: string;
  description: string;
  filePath: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface Output {
  id: string;
  type: 'outline' | 'argument';
  title: string;
  content: Record<string, unknown>;
  relicIds: string[];
  noteIds: string[];
  createdAt: string;
}

export interface DashboardStats {
  totalRelics: number;
  totalNotes: number;
  totalAnalysis: number;
  totalMaterials: number;
  recentRelics: Relic[];
  recentNotes: ResearchNote[];
}

export type PhotoType = 'front' | 'side' | 'detail' | 'rubbing';

export const PHOTO_TYPE_LABELS: Record<PhotoType, string> = {
  front: '正面',
  side: '侧面',
  detail: '局部',
  rubbing: '拓片'
};

export const ASPECT_LABELS: Record<'dating' | 'usage' | 'origin', string> = {
  dating: '年代',
  usage: '用途',
  origin: '产地'
};

export const CONFIDENCE_LABELS: Record<'high' | 'medium' | 'low', string> = {
  high: '高',
  medium: '中',
  low: '低'
};

export const ANALYSIS_TYPE_LABELS: Record<'comparison' | 'evolution' | 'periodization', string> = {
  comparison: '横向比较',
  evolution: '演变序列',
  periodization: '分期断代'
};

export const MATERIAL_TYPE_LABELS: Record<'pdf' | 'rubbing' | 'map', string> = {
  pdf: 'PDF文献',
  rubbing: '拓片资料',
  map: '参考地图'
};

export const OUTPUT_TYPE_LABELS: Record<'outline' | 'argument', string> = {
  outline: '论文提纲',
  argument: '论点证据'
};
