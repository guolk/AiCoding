export interface Tree {
  id: string;
  species: string;
  scientificName: string;
  dbh: number;
  height: number;
  crownWidth: number;
  estimatedAge: number;
  gpsLatitude: string;
  gpsLongitude: string;
  location: string;
  ownership: string;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  coverImage: string;
  createdAt: string;
  updatedAt: string;
}

export interface CulturalRecord {
  id: string;
  treeId: string;
  type: 'historical' | 'celebrity' | 'legend';
  title: string;
  content: string;
  period: string;
}

export interface MediaAsset {
  id: string;
  treeId: string;
  category: 'full' | 'trunk' | 'leaf' | 'fruit' | 'video';
  url: string;
  description: string;
  uploadedAt: string;
}

export interface HealthAssessment {
  id: string;
  treeId: string;
  treeSpecies: string;
  assessmentDate: string;
  overallScore: number;
  trunkDecay: 'none' | 'mild' | 'moderate' | 'severe';
  hollowStatus: 'none' | 'mild' | 'moderate' | 'severe';
  breakStatus: 'none' | 'mild' | 'moderate' | 'severe';
  pestDisease: 'none' | 'mild' | 'moderate' | 'severe';
  soilCompaction: 'none' | 'mild' | 'moderate' | 'severe';
  rootProtectionScore: number;
  lightConditionScore: number;
  soilQualityScore: number;
  assessor: string;
  notes: string;
  createdAt: string;
}

export interface ProtectionMeasure {
  id: string;
  assessmentId: string;
  treeId: string;
  type: 'filling' | 'support' | 'fertilization' | 'other';
  description: string;
  operationDate: string;
  operator: string;
  effect: 'effective' | 'partial' | 'ineffective';
}

export interface SurveyGrid {
  id: string;
  name: string;
  centerLat: number;
  centerLng: number;
  assignee: string;
  totalTrees: number;
  surveyedTrees: number;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface AuditRecord {
  id: string;
  treeId: string;
  treeSpecies: string;
  auditor: string;
  coordinateAccuracy: 'accurate' | 'approximate' | 'inaccurate';
  photoQuality: 'clear' | 'acceptable' | 'poor';
  dataCompleteness: 'complete' | 'partial' | 'incomplete';
  result: 'approved' | 'rejected' | 'pending';
  comment: string;
  auditedAt: string;
}

export type HealthStatusLabel = {
  [key in Tree['healthStatus']]: string;
};

export const HEALTH_STATUS_LABELS: HealthStatusLabel = {
  excellent: '优',
  good: '良',
  fair: '中',
  poor: '差',
  critical: '危',
};

export const HEALTH_STATUS_COLORS: HealthStatusLabel = {
  excellent: 'bg-forest-400 text-white',
  good: 'bg-forest-300 text-forest-800',
  fair: 'bg-amber-200 text-amber-500',
  poor: 'bg-orange-300 text-orange-800',
  critical: 'bg-red-400 text-white',
};

export const CULTURAL_TYPE_LABELS = {
  historical: '历史故事',
  celebrity: '名人轶事',
  legend: '地方传说',
} as const;

export const MEDIA_CATEGORY_LABELS = {
  full: '全株照片',
  trunk: '树干纹理',
  leaf: '叶片',
  fruit: '果实',
  video: '视频',
} as const;

export const MEASURE_TYPE_LABELS = {
  filling: '填补空洞',
  support: '支撑架设',
  fertilization: '复壮施肥',
  other: '其他措施',
} as const;

export const SEVERITY_LABELS = {
  none: '无',
  mild: '轻度',
  moderate: '中度',
  severe: '重度',
} as const;

export const AUDIT_RESULT_LABELS = {
  approved: '已通过',
  rejected: '已退回',
  pending: '待审核',
} as const;

export const GRID_STATUS_LABELS = {
  pending: '待调查',
  in_progress: '调查中',
  completed: '已完成',
} as const;
