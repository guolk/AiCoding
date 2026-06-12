export type UniversityStatus =
  | "researching"
  | "preparing"
  | "submitted"
  | "accepted"
  | "rejected"
  | "enrolled";

export type StageName =
  | "选校"
  | "文书准备"
  | "材料提交"
  | "等待录取"
  | "录取结果"
  | "签证"
  | "入学";

export interface Requirement {
  id: string;
  gpaMin: number;
  toeflMin: number;
  ieltsMin: number;
  greScore?: number;
  recommendationCount: number;
  otherRequirements: string;
}

export interface TuitionInfo {
  id: string;
  tuitionPerYear: number;
  livingCost: number;
  currency: string;
}

export interface ApplicationStage {
  id: string;
  stageName: StageName;
  progress: number;
  startDate: string;
  dueDate: string;
  isCompleted: boolean;
}

export interface University {
  id: string;
  name: string;
  country: string;
  major: string;
  deadline: string;
  logoUrl: string;
  status: UniversityStatus;
  requirements: Requirement;
  tuition: TuitionInfo;
  stages: ApplicationStage[];
  scholarship?: string;
}

export type DocumentType =
  | "personal_statement"
  | "motivation_letter"
  | "research_proposal"
  | "cv"
  | "other";

export type DocumentVersionStatus = "draft" | "reviewing" | "revising" | "final";

export interface DocumentVersion {
  id: string;
  versionNumber: number;
  universityId?: string;
  content: string;
  feedback: string;
  status: DocumentVersionStatus;
  createdAt: string;
}

export interface KeyPoint {
  id: string;
  content: string;
  category: "experience" | "ability" | "goal";
  importance: number;
  isChecked: boolean;
}

export interface DocumentTimeline {
  id: string;
  phase: "初稿" | "修改" | "导师反馈" | "终稿";
  dueDate: string;
  completedDate?: string;
  isCompleted: boolean;
}

export interface DocumentItem {
  id: string;
  type: DocumentType;
  title: string;
  currentVersionId: string;
  versions: DocumentVersion[];
  keyPoints: KeyPoint[];
  timeline: DocumentTimeline[];
  createdAt: string;
}

export type MaterialCategory =
  | "transcript"
  | "language_score"
  | "recommendation"
  | "resume"
  | "portfolio"
  | "other";

export type MaterialStatus =
  | "not_started"
  | "preparing"
  | "completed"
  | "submitted";

export interface MaterialItem {
  id: string;
  name: string;
  category: MaterialCategory;
  universityId: string;
  status: MaterialStatus;
  submittedAt?: string;
  note: string;
}

export interface RecommendationRequest {
  id: string;
  recommenderId: string;
  universityId: string;
  status: "pending" | "requested" | "submitted";
  deadline: string;
  reminderSent: boolean;
}

export interface Recommender {
  id: string;
  name: string;
  title: string;
  email: string;
  institution: string;
  requests: RecommendationRequest[];
}

export type ScholarshipStatus =
  | "planning"
  | "applied"
  | "interview"
  | "awarded"
  | "rejected";

export interface Scholarship {
  id: string;
  name: string;
  universityId: string;
  amount: number;
  currency: string;
  status: ScholarshipStatus;
  applyDate?: string;
  resultDate?: string;
}

export type ExpenseCategory =
  | "application_fee"
  | "visa_fee"
  | "material_fee"
  | "test_fee"
  | "travel_fee"
  | "other";

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  date: string;
  description: string;
  universityId?: string;
}

export const UNIVERSITY_STATUS_LABELS: Record<UniversityStatus, string> = {
  researching: "研究中",
  preparing: "准备中",
  submitted: "已提交",
  accepted: "已录取",
  rejected: "已拒绝",
  enrolled: "已入学",
};

export const UNIVERSITY_STATUS_COLORS: Record<UniversityStatus, string> = {
  researching: "bg-slate-100 text-slate-700",
  preparing: "bg-accent-100 text-accent-700",
  submitted: "bg-primary-100 text-primary-700",
  accepted: "bg-success-100 text-success-600",
  rejected: "bg-danger-100 text-danger-600",
  enrolled: "bg-gradient-to-r from-success-100 to-primary-100 text-primary-700",
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  personal_statement: "个人陈述 (PS)",
  motivation_letter: "动机信",
  research_proposal: "研究计划",
  cv: "个人简历 (CV)",
  other: "其他文书",
};

export const DOCUMENT_TYPE_COLORS: Record<DocumentType, string> = {
  personal_statement: "bg-primary-100 text-primary-700",
  motivation_letter: "bg-accent-100 text-accent-700",
  research_proposal: "bg-success-100 text-success-600",
  cv: "bg-slate-100 text-slate-700",
  other: "bg-purple-100 text-purple-700",
};

export const VERSION_STATUS_LABELS: Record<DocumentVersionStatus, string> = {
  draft: "草稿",
  reviewing: "审核中",
  revising: "修改中",
  final: "终稿",
};

export const VERSION_STATUS_COLORS: Record<DocumentVersionStatus, string> = {
  draft: "bg-slate-100 text-slate-600",
  reviewing: "bg-accent-100 text-accent-700",
  revising: "bg-primary-100 text-primary-700",
  final: "bg-success-100 text-success-600",
};

export const MATERIAL_STATUS_LABELS: Record<MaterialStatus, string> = {
  not_started: "未开始",
  preparing: "准备中",
  completed: "已完成",
  submitted: "已提交",
};

export const MATERIAL_STATUS_COLORS: Record<MaterialStatus, string> = {
  not_started: "bg-slate-100 text-slate-500",
  preparing: "bg-accent-100 text-accent-700",
  completed: "bg-success-100 text-success-600",
  submitted: "bg-primary-100 text-primary-700",
};

export const MATERIAL_CATEGORY_LABELS: Record<MaterialCategory, string> = {
  transcript: "成绩单",
  language_score: "语言成绩",
  recommendation: "推荐信",
  resume: "个人简历",
  portfolio: "作品集",
  other: "其他材料",
};

export const SCHOLARSHIP_STATUS_LABELS: Record<ScholarshipStatus, string> = {
  planning: "计划中",
  applied: "已申请",
  interview: "面试中",
  awarded: "已获得",
  rejected: "未获得",
};

export const SCHOLARSHIP_STATUS_COLORS: Record<ScholarshipStatus, string> = {
  planning: "bg-slate-100 text-slate-600",
  applied: "bg-primary-100 text-primary-700",
  interview: "bg-accent-100 text-accent-700",
  awarded: "bg-success-100 text-success-600",
  rejected: "bg-danger-100 text-danger-600",
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  application_fee: "申请费",
  visa_fee: "签证费",
  material_fee: "材料费",
  test_fee: "考试费",
  travel_fee: "交通费",
  other: "其他费用",
};
