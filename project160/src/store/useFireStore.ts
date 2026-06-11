import { create } from 'zustand';
import type {
  Facility,
  InspectionRecord,
  MaintenanceRecord,
  Hazard,
  EmergencyPlan,
  TeamMember,
  DrillRecord,
  TrainingRecord,
  OnboardingTraining,
  Question,
} from '@/types';
import {
  mockFacilities,
  mockInspections,
  mockMaintenance,
  mockHazards,
  mockPlans,
  mockTeamMembers,
  mockDrills,
  mockTrainingRecords,
  mockOnboarding,
  mockQuestions,
} from '@/data/mockData';

interface FireStore {
  facilities: Facility[];
  inspections: InspectionRecord[];
  maintenanceRecords: MaintenanceRecord[];
  hazards: Hazard[];
  plans: EmergencyPlan[];
  teamMembers: TeamMember[];
  drills: DrillRecord[];
  trainingRecords: TrainingRecord[];
  onboardingRecords: OnboardingTraining[];
  questions: Question[];

  addFacility: (f: Facility) => void;
  updateFacility: (id: string, f: Partial<Facility>) => void;
  deleteFacility: (id: string) => void;

  addInspection: (i: InspectionRecord) => void;
  updateInspection: (id: string, i: Partial<InspectionRecord>) => void;
  deleteInspection: (id: string) => void;

  addMaintenance: (m: MaintenanceRecord) => void;
  updateMaintenance: (id: string, m: Partial<MaintenanceRecord>) => void;
  deleteMaintenance: (id: string) => void;

  addHazard: (h: Hazard) => void;
  updateHazard: (id: string, h: Partial<Hazard>) => void;
  deleteHazard: (id: string) => void;

  addPlan: (p: EmergencyPlan) => void;
  updatePlan: (id: string, p: Partial<EmergencyPlan>) => void;
  deletePlan: (id: string) => void;

  addTeamMember: (t: TeamMember) => void;
  updateTeamMember: (id: string, t: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;

  addDrill: (d: DrillRecord) => void;
  updateDrill: (id: string, d: Partial<DrillRecord>) => void;
  deleteDrill: (id: string) => void;

  addTraining: (t: TrainingRecord) => void;
  updateTraining: (id: string, t: Partial<TrainingRecord>) => void;
  deleteTraining: (id: string) => void;

  addOnboarding: (o: OnboardingTraining) => void;
  updateOnboarding: (id: string, o: Partial<OnboardingTraining>) => void;
  deleteOnboarding: (id: string) => void;

  addQuestion: (q: Question) => void;
  updateQuestion: (id: string, q: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
}

export const useFireStore = create<FireStore>((set) => ({
  facilities: mockFacilities,
  inspections: mockInspections,
  maintenanceRecords: mockMaintenance,
  hazards: mockHazards,
  plans: mockPlans,
  teamMembers: mockTeamMembers,
  drills: mockDrills,
  trainingRecords: mockTrainingRecords,
  onboardingRecords: mockOnboarding,
  questions: mockQuestions,

  addFacility: (f) => set((s) => ({ facilities: [...s.facilities, f] })),
  updateFacility: (id, f) => set((s) => ({ facilities: s.facilities.map((item) => (item.id === id ? { ...item, ...f } : item)) })),
  deleteFacility: (id) => set((s) => ({ facilities: s.facilities.filter((item) => item.id !== id) })),

  addInspection: (i) => set((s) => ({ inspections: [...s.inspections, i] })),
  updateInspection: (id, i) => set((s) => ({ inspections: s.inspections.map((item) => (item.id === id ? { ...item, ...i } : item)) })),
  deleteInspection: (id) => set((s) => ({ inspections: s.inspections.filter((item) => item.id !== id) })),

  addMaintenance: (m) => set((s) => ({ maintenanceRecords: [...s.maintenanceRecords, m] })),
  updateMaintenance: (id, m) => set((s) => ({ maintenanceRecords: s.maintenanceRecords.map((item) => (item.id === id ? { ...item, ...m } : item)) })),
  deleteMaintenance: (id) => set((s) => ({ maintenanceRecords: s.maintenanceRecords.filter((item) => item.id !== id) })),

  addHazard: (h) => set((s) => ({ hazards: [...s.hazards, h] })),
  updateHazard: (id, h) => set((s) => ({ hazards: s.hazards.map((item) => (item.id === id ? { ...item, ...h } : item)) })),
  deleteHazard: (id) => set((s) => ({ hazards: s.hazards.filter((item) => item.id !== id) })),

  addPlan: (p) => set((s) => ({ plans: [...s.plans, p] })),
  updatePlan: (id, p) => set((s) => ({ plans: s.plans.map((item) => (item.id === id ? { ...item, ...p } : item)) })),
  deletePlan: (id) => set((s) => ({ plans: s.plans.filter((item) => item.id !== id) })),

  addTeamMember: (t) => set((s) => ({ teamMembers: [...s.teamMembers, t] })),
  updateTeamMember: (id, t) => set((s) => ({ teamMembers: s.teamMembers.map((item) => (item.id === id ? { ...item, ...t } : item)) })),
  deleteTeamMember: (id) => set((s) => ({ teamMembers: s.teamMembers.filter((item) => item.id !== id) })),

  addDrill: (d) => set((s) => ({ drills: [...s.drills, d] })),
  updateDrill: (id, d) => set((s) => ({ drills: s.drills.map((item) => (item.id === id ? { ...item, ...d } : item)) })),
  deleteDrill: (id) => set((s) => ({ drills: s.drills.filter((item) => item.id !== id) })),

  addTraining: (t) => set((s) => ({ trainingRecords: [...s.trainingRecords, t] })),
  updateTraining: (id, t) => set((s) => ({ trainingRecords: s.trainingRecords.map((item) => (item.id === id ? { ...item, ...t } : item)) })),
  deleteTraining: (id) => set((s) => ({ trainingRecords: s.trainingRecords.filter((item) => item.id !== id) })),

  addOnboarding: (o) => set((s) => ({ onboardingRecords: [...s.onboardingRecords, o] })),
  updateOnboarding: (id, o) => set((s) => ({ onboardingRecords: s.onboardingRecords.map((item) => (item.id === id ? { ...item, ...o } : item)) })),
  deleteOnboarding: (id) => set((s) => ({ onboardingRecords: s.onboardingRecords.filter((item) => item.id !== id) })),

  addQuestion: (q) => set((s) => ({ questions: [...s.questions, q] })),
  updateQuestion: (id, q) => set((s) => ({ questions: s.questions.map((item) => (item.id === id ? { ...item, ...q } : item)) })),
  deleteQuestion: (id) => set((s) => ({ questions: s.questions.filter((item) => item.id !== id) })),
}));
