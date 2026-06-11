import { create } from 'zustand';
import type { Tree, CulturalRecord, MediaAsset, HealthAssessment, ProtectionMeasure, SurveyGrid, AuditRecord } from '@/types';
import { mockTrees, mockCulturalRecords, mockMediaAssets, mockHealthAssessments, mockProtectionMeasures, mockSurveyGrids, mockAuditRecords } from '@/data/mockData';

interface TreeStore {
  trees: Tree[];
  culturalRecords: CulturalRecord[];
  mediaAssets: MediaAsset[];
  healthAssessments: HealthAssessment[];
  protectionMeasures: ProtectionMeasure[];
  surveyGrids: SurveyGrid[];
  auditRecords: AuditRecord[];

  addTree: (tree: Tree) => void;
  updateTree: (id: string, data: Partial<Tree>) => void;
  getTreeById: (id: string) => Tree | undefined;

  addCulturalRecord: (record: CulturalRecord) => void;
  getCulturalRecordsByTreeId: (treeId: string) => CulturalRecord[];

  addMediaAsset: (asset: MediaAsset) => void;
  getMediaAssetsByTreeId: (treeId: string) => MediaAsset[];

  addHealthAssessment: (assessment: HealthAssessment) => void;
  deleteHealthAssessment: (id: string) => void;
  getHealthAssessmentsByTreeId: (treeId: string) => HealthAssessment[];

  addProtectionMeasure: (measure: ProtectionMeasure) => void;
  getProtectionMeasuresByAssessmentId: (assessmentId: string) => ProtectionMeasure[];

  updateSurveyGrid: (id: string, data: Partial<SurveyGrid>) => void;

  addAuditRecord: (record: AuditRecord) => void;
  updateAuditRecord: (id: string, data: Partial<AuditRecord>) => void;
}

export const useTreeStore = create<TreeStore>((set, get) => ({
  trees: mockTrees,
  culturalRecords: mockCulturalRecords,
  mediaAssets: mockMediaAssets,
  healthAssessments: mockHealthAssessments,
  protectionMeasures: mockProtectionMeasures,
  surveyGrids: mockSurveyGrids,
  auditRecords: mockAuditRecords,

  addTree: (tree) => set((state) => ({ trees: [...state.trees, tree] })),
  updateTree: (id, data) => set((state) => ({
    trees: state.trees.map((t) => (t.id === id ? { ...t, ...data } : t)),
  })),
  getTreeById: (id) => get().trees.find((t) => t.id === id),

  addCulturalRecord: (record) => set((state) => ({ culturalRecords: [...state.culturalRecords, record] })),
  getCulturalRecordsByTreeId: (treeId) => get().culturalRecords.filter((r) => r.treeId === treeId),

  addMediaAsset: (asset) => set((state) => ({ mediaAssets: [...state.mediaAssets, asset] })),
  getMediaAssetsByTreeId: (treeId) => get().mediaAssets.filter((a) => a.treeId === treeId),

  addHealthAssessment: (assessment) => set((state) => ({ healthAssessments: [...state.healthAssessments, assessment] })),
  deleteHealthAssessment: (id) => set((state) => ({
    healthAssessments: state.healthAssessments.filter((a) => a.id !== id),
    protectionMeasures: state.protectionMeasures.filter((m) => m.assessmentId !== id),
  })),
  getHealthAssessmentsByTreeId: (treeId) => get().healthAssessments.filter((a) => a.treeId === treeId),

  addProtectionMeasure: (measure) => set((state) => ({ protectionMeasures: [...state.protectionMeasures, measure] })),
  getProtectionMeasuresByAssessmentId: (assessmentId) => get().protectionMeasures.filter((m) => m.assessmentId === assessmentId),

  updateSurveyGrid: (id, data) => set((state) => ({
    surveyGrids: state.surveyGrids.map((g) => (g.id === id ? { ...g, ...data } : g)),
  })),

  addAuditRecord: (record) => set((state) => ({ auditRecords: [...state.auditRecords, record] })),
  updateAuditRecord: (id, data) => set((state) => ({
    auditRecords: state.auditRecords.map((a) => (a.id === id ? { ...a, ...data } : a)),
  })),
}));
