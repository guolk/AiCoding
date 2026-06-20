export interface ClubInfo {
  id: string;
  name: string;
  foundedDate: string;
  purpose: string;
  advisor: string;
  feePolicy: string;
  logo?: string;
  description?: string;
}

export interface Cadre {
  id: string;
  name: string;
  position: string;
  term: string;
  startDate: string;
  endDate?: string;
  department?: string;
  avatar?: string;
}

export interface ConstitutionVersion {
  id: string;
  version: string;
  content: string;
  createdAt: string;
  createdBy: string;
  description?: string;
}

export interface Member {
  id: string;
  name: string;
  grade: string;
  major: string;
  joinDate: string;
  position: string;
  phone?: string;
  email?: string;
  points: number;
  status: "active" | "inactive" | "graduated";
  avatar?: string;
  attendance: number;
}

export interface PointRecord {
  id: string;
  memberId: string;
  memberName: string;
  points: number;
  reason: string;
  activityId?: string;
  activityName?: string;
  createdAt: string;
}

export interface MemberRecord {
  id: string;
  name: string;
  type: "join" | "leave";
  date: string;
  status: "pending" | "approved" | "rejected";
  reason?: string;
  grade?: string;
  major?: string;
  phone?: string;
}

export type ActivityStatus =
  | "planning"
  | "ongoing"
  | "completed"
  | "cancelled";

export interface Activity {
  id: string;
  name: string;
  date: string;
  location: string;
  organizer: string;
  budget: number;
  participantCount: number;
  status: ActivityStatus;
  description?: string;
  photos?: string[];
  maxParticipants?: number;
}

export type PlanStatus = "draft" | "reviewing" | "approved" | "rejected";

export interface PlanVersion {
  id: string;
  activityId: string;
  activityName: string;
  version: string;
  title: string;
  content: string;
  status: PlanStatus;
  createdAt: string;
  createdBy: string;
}

export interface ActivityEvaluation {
  id: string;
  activityId: string;
  activityName: string;
  participationRate: number;
  satisfactionScore: number;
  goalAchievement: number;
  summary: string;
  createdAt: string;
}

export type FinanceType = "income" | "expense";

export interface FinanceRecord {
  id: string;
  type: FinanceType;
  category: string;
  categoryLabel: string;
  amount: number;
  date: string;
  description: string;
  relatedActivityId?: string;
  relatedActivityName?: string;
  createdAt: string;
}

export interface FinanceReport {
  id: string;
  title: string;
  period: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  details: string;
  createdAt: string;
}

export interface BudgetItem {
  id: string;
  category: string;
  categoryLabel: string;
  plannedAmount: number;
  actualAmount: number;
  description: string;
  semester: string;
}

export type AchievementCategory =
  | "scholarship"
  | "honor"
  | "competition"
  | "volunteer";

export interface Achievement {
  id: string;
  memberId: string;
  memberName: string;
  title: string;
  category: AchievementCategory;
  date: string;
  description: string;
  attachments?: string[];
  createdAt: string;
}

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "reviewing"
  | "approved"
  | "rejected";

export interface HonorApplication {
  id: string;
  memberId: string;
  memberName: string;
  honorName: string;
  applicationDate: string;
  status: ApplicationStatus;
  materials: string[];
  remarks?: string;
}

export interface DashboardStats {
  totalMembers: number;
  totalActivities: number;
  totalPoints: number;
  totalBalance: number;
  memberGrowth: number;
  activityGrowth: number;
  financeGrowth: number;
  pendingApprovals: number;
}
