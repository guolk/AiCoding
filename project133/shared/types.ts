export interface Step {
  order: number;
  title: string;
  description: string;
}

export interface DataTableColumn {
  name: string;
  unit: string;
  type: 'number' | 'text';
}

export interface Question {
  id: number;
  content: string;
  type: 'essay' | 'calculation';
}

export interface ExperimentTemplate {
  id: number;
  name: string;
  courseName: string;
  purpose: string;
  principle: string;
  instruments: string[];
  steps: Step[];
  dataTable: DataTableColumn[];
  questions: Question[];
  safetyNotes: string[];
  previewRequirements: string[];
  assessmentPoints: string[];
  createdAt: string;
  updatedAt: string;
}

export type ReportStatus = 'ungraded' | 'graded' | 'needs-revision';

export interface StudentReport {
  id: number;
  studentId: number;
  studentName: string;
  studentNo: string;
  className: string;
  templateId: number;
  templateName: string;
  submittedAt: string;
  status: ReportStatus;
  data: Record<string, string | number>;
  answers: Record<number, string>;
  grade?: number;
  feedback?: string;
  gradedAt?: string;
}

export interface CommentTemplate {
  id: number;
  category: string;
  content: string;
}

export type ResourceType = 'literature' | 'equipment' | 'video';

export interface Resource {
  id: number;
  type: ResourceType;
  title: string;
  description: string;
  url?: string;
  status?: string;
  lastMaintenance?: string;
}

export interface UpdateRecord {
  date: string;
  content: string;
  operator: string;
}

export interface Archive {
  id: number;
  semester: string;
  year: number;
  courseName: string;
  summary: string;
  updateRecords: UpdateRecord[];
}

export interface Schedule {
  id: number;
  date: string;
  timeSlot: string;
  labName: string;
  courseName: string;
  className: string;
}

export interface ClassInfo {
  id: number;
  name: string;
  studentCount: number;
}

export interface Student {
  id: number;
  name: string;
  studentNo: string;
  classId: number;
  className: string;
}

export interface DashboardStats {
  totalTemplates: number;
  totalReports: number;
  ungradedReports: number;
  todaySchedules: number;
  recentReports: StudentReport[];
  todayScheduleList: Schedule[];
}

export interface AnalyticsData {
  resultComparison: {
    groupName: string;
    deviation: number;
    score: number;
  }[];
  stepErrors: {
    step: string;
    errorCount: number;
  }[];
  gradeDistribution: {
    range: string;
    count: number;
  }[];
  averageGrade: number;
  passRate: number;
}
