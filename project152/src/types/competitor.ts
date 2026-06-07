import type { Patent } from './patent';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CompetitorPatent {
  id: string;
  patentName: string;
  applicationNumber: string;
  applicant: string;
  competitorName: string;
  applicationDate: string;
  publicationDate?: string;
  technicalField: string;
  ipcClassification: string;
  discoveryDate: string;
  abstract: string;
  relevanceScore: number;
  monitoringStatus: 'MONITORING' | 'TRACKING' | 'DISMISSED';
  notes: string;
}

export interface InfringementAssessment {
  id: string;
  competitorPatentId: string;
  ourPatentId: string;
  assessmentDate: string;
  riskLevel: RiskLevel;
  similarityAnalysis: string;
  claimComparison: string;
  legalAdvice: string;
  recommendedActions: string[];
  assessor: string;
  competitorPatent?: CompetitorPatent;
  ourPatent?: Patent;
}
