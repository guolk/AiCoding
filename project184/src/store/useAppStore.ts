import { create } from "zustand";
import type {
  ClubInfo,
  Cadre,
  ConstitutionVersion,
  Member,
  PointRecord,
  MemberRecord,
  Activity,
  PlanVersion,
  ActivityEvaluation,
  FinanceRecord,
  FinanceReport,
  BudgetItem,
  Achievement,
  HonorApplication,
} from "@/types";
import {
  mockClubInfo,
  mockCadres,
  mockConstitutions,
  mockMembers,
  mockPointRecords,
  mockMemberRecords,
  mockActivities,
  mockPlanVersions,
  mockEvaluations,
  mockFinanceRecords,
  mockFinanceReports,
  mockBudgetItems,
  mockAchievements,
  mockHonorApplications,
} from "@/mock/data";

interface AppState {
  clubInfo: ClubInfo;
  cadres: Cadre[];
  constitutions: ConstitutionVersion[];
  members: Member[];
  pointRecords: PointRecord[];
  memberRecords: MemberRecord[];
  activities: Activity[];
  planVersions: PlanVersion[];
  evaluations: ActivityEvaluation[];
  financeRecords: FinanceRecord[];
  financeReports: FinanceReport[];
  budgetItems: BudgetItem[];
  achievements: Achievement[];
  honorApplications: HonorApplication[];

  updateClubInfo: (info: Partial<ClubInfo>) => void;
  addCadre: (cadre: Cadre) => void;
  updateCadre: (id: string, cadre: Partial<Cadre>) => void;
  deleteCadre: (id: string) => void;
  addConstitution: (constitution: ConstitutionVersion) => void;

  addMember: (member: Member) => void;
  updateMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  addPointRecord: (record: PointRecord) => void;
  addMemberRecord: (record: MemberRecord) => void;
  updateMemberRecord: (
    id: string,
    record: Partial<MemberRecord>
  ) => void;

  addActivity: (activity: Activity) => void;
  updateActivity: (id: string, activity: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  addPlanVersion: (plan: PlanVersion) => void;
  updatePlanVersion: (id: string, plan: Partial<PlanVersion>) => void;
  addEvaluation: (evaluation: ActivityEvaluation) => void;

  addFinanceRecord: (record: FinanceRecord) => void;
  updateFinanceRecord: (id: string, record: Partial<FinanceRecord>) => void;
  deleteFinanceRecord: (id: string) => void;
  addFinanceReport: (report: FinanceReport) => void;
  addBudgetItem: (item: BudgetItem) => void;
  updateBudgetItem: (id: string, item: Partial<BudgetItem>) => void;
  deleteBudgetItem: (id: string) => void;

  addAchievement: (achievement: Achievement) => void;
  updateAchievement: (id: string, achievement: Partial<Achievement>) => void;
  deleteAchievement: (id: string) => void;
  addHonorApplication: (app: HonorApplication) => void;
  updateHonorApplication: (
    id: string,
    app: Partial<HonorApplication>
  ) => void;
}

export const useAppStore = create<AppState>((set) => ({
  clubInfo: mockClubInfo,
  cadres: mockCadres,
  constitutions: mockConstitutions,
  members: mockMembers,
  pointRecords: mockPointRecords,
  memberRecords: mockMemberRecords,
  activities: mockActivities,
  planVersions: mockPlanVersions,
  evaluations: mockEvaluations,
  financeRecords: mockFinanceRecords,
  financeReports: mockFinanceReports,
  budgetItems: mockBudgetItems,
  achievements: mockAchievements,
  honorApplications: mockHonorApplications,

  updateClubInfo: (info) =>
    set((state) => ({ clubInfo: { ...state.clubInfo, ...info } })),

  addCadre: (cadre) =>
    set((state) => ({ cadres: [cadre, ...state.cadres] })),
  updateCadre: (id, cadre) =>
    set((state) => ({
      cadres: state.cadres.map((c) =>
        c.id === id ? { ...c, ...cadre } : c
      ),
    })),
  deleteCadre: (id) =>
    set((state) => ({
      cadres: state.cadres.filter((c) => c.id !== id),
    })),

  addConstitution: (constitution) =>
    set((state) => ({
      constitutions: [constitution, ...state.constitutions],
    })),

  addMember: (member) =>
    set((state) => ({ members: [member, ...state.members] })),
  updateMember: (id, member) =>
    set((state) => ({
      members: state.members.map((m) =>
        m.id === id ? { ...m, ...member } : m
      ),
    })),
  deleteMember: (id) =>
    set((state) => ({
      members: state.members.filter((m) => m.id !== id),
    })),

  addPointRecord: (record) =>
    set((state) => ({
      pointRecords: [record, ...state.pointRecords],
    })),

  addMemberRecord: (record) =>
    set((state) => ({
      memberRecords: [record, ...state.memberRecords],
    })),
  updateMemberRecord: (id, record) =>
    set((state) => ({
      memberRecords: state.memberRecords.map((r) =>
        r.id === id ? { ...r, ...record } : r
      ),
    })),

  addActivity: (activity) =>
    set((state) => ({ activities: [activity, ...state.activities] })),
  updateActivity: (id, activity) =>
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === id ? { ...a, ...activity } : a
      ),
    })),
  deleteActivity: (id) =>
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== id),
    })),

  addPlanVersion: (plan) =>
    set((state) => ({
      planVersions: [plan, ...state.planVersions],
    })),
  updatePlanVersion: (id, plan) =>
    set((state) => ({
      planVersions: state.planVersions.map((p) =>
        p.id === id ? { ...p, ...plan } : p
      ),
    })),

  addEvaluation: (evaluation) =>
    set((state) => ({
      evaluations: [evaluation, ...state.evaluations],
    })),

  addFinanceRecord: (record) =>
    set((state) => ({
      financeRecords: [record, ...state.financeRecords],
    })),
  updateFinanceRecord: (id, record) =>
    set((state) => ({
      financeRecords: state.financeRecords.map((r) =>
        r.id === id ? { ...r, ...record } : r
      ),
    })),
  deleteFinanceRecord: (id) =>
    set((state) => ({
      financeRecords: state.financeRecords.filter((r) => r.id !== id),
    })),

  addFinanceReport: (report) =>
    set((state) => ({
      financeReports: [report, ...state.financeReports],
    })),

  addBudgetItem: (item) =>
    set((state) => ({ budgetItems: [item, ...state.budgetItems] })),
  updateBudgetItem: (id, item) =>
    set((state) => ({
      budgetItems: state.budgetItems.map((b) =>
        b.id === id ? { ...b, ...item } : b
      ),
    })),
  deleteBudgetItem: (id) =>
    set((state) => ({
      budgetItems: state.budgetItems.filter((b) => b.id !== id),
    })),

  addAchievement: (achievement) =>
    set((state) => ({
      achievements: [achievement, ...state.achievements],
    })),
  updateAchievement: (id, achievement) =>
    set((state) => ({
      achievements: state.achievements.map((a) =>
        a.id === id ? { ...a, ...achievement } : a
      ),
    })),
  deleteAchievement: (id) =>
    set((state) => ({
      achievements: state.achievements.filter((a) => a.id !== id),
    })),

  addHonorApplication: (app) =>
    set((state) => ({
      honorApplications: [app, ...state.honorApplications],
    })),
  updateHonorApplication: (id, app) =>
    set((state) => ({
      honorApplications: state.honorApplications.map((h) =>
        h.id === id ? { ...h, ...app } : h
      ),
    })),
}));
