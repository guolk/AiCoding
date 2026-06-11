export interface Facility {
  id: string;
  type: 'extinguisher' | 'hydrant' | 'smoke_alarm' | 'emergency_light' | 'exit_sign';
  name: string;
  location: string;
  code: string;
  manufactureDate: string;
  expiryDate: string;
  status: 'normal' | 'abnormal' | 'expired' | 'inspecting';
  lastInspectionDate: string;
}

export interface InspectionRecord {
  id: string;
  facilityId: string;
  facilityName: string;
  inspectionDate: string;
  inspector: string;
  status: 'normal' | 'abnormal';
  issues: string;
}

export interface MaintenanceRecord {
  id: string;
  facilityId: string;
  facilityName: string;
  type: string;
  maintenanceDate: string;
  maintainer: string;
  parts: string;
  cost: number;
  description: string;
}

export interface Hazard {
  id: string;
  description: string;
  discoveryDate: string;
  level: 'A' | 'B';
  responsiblePerson: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  rectificationResult: string;
  completionDate: string;
  location: string;
}

export interface PlanStep {
  order: number;
  phase: string;
  action: string;
  responsible: string;
  description: string;
}

export interface EmergencyPlan {
  id: string;
  scenarioType: string;
  title: string;
  createDate: string;
  version: string;
  steps: PlanStep[];
  status: 'active' | 'draft' | 'archived';
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  responsibility: string;
  phone: string;
  group: string;
}

export interface DrillRecord {
  id: string;
  name: string;
  date: string;
  type: string;
  participants: number;
  evaluation: 'excellent' | 'good' | 'average' | 'poor';
  summary: string;
  planId: string;
}

export interface TrainingRecord {
  id: string;
  title: string;
  date: string;
  content: string;
  trainer: string;
  participants: string[];
  passRate: number;
  status: 'completed' | 'scheduled';
}

export interface OnboardingTraining {
  id: string;
  employeeName: string;
  department: string;
  joinDate: string;
  trainingCompleted: boolean;
  completionDate: string;
  score: number;
}

export interface Question {
  id: string;
  type: 'single' | 'multiple' | 'judge';
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  content: string;
  options: string[];
  answer: string | string[];
  explanation: string;
}
