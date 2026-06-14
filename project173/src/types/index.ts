export interface Project {
  id: string;
  name: string;
  village: string;
  type: 'infrastructure' | 'industry' | 'training' | 'environment' | 'other';
  fundSource: string;
  startDate: string;
  endDate: string;
  responsibleUnit: string;
  responsiblePerson: string;
  status: 'planning' | 'ongoing' | 'completed' | 'suspended';
  description: string;
  createTime: string;
  updateTime: string;
}

export interface QuantitativeTarget {
  id: string;
  projectId: string;
  indicatorName: string;
  baselineValue: number;
  targetValue: number;
  unit: string;
  description: string;
}

export interface BudgetItem {
  id: string;
  projectId: string;
  subProjectName: string;
  budgetAmount: number;
  actualAmount: number;
  description: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  plannedDate: string;
  actualDate: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  progress: number;
  description: string;
}

export interface VisitRecord {
  id: string;
  projectId: string;
  visitDate: string;
  visitor: string;
  problemsFound: string;
  measuresTaken: string;
  remarks: string;
}

export interface Photo {
  id: string;
  groupId: string;
  type: 'before' | 'during' | 'after';
  url: string;
  caption: string;
}

export interface PhotoGroup {
  id: string;
  projectId: string;
  stage: string;
  date: string;
  description: string;
  photos: Photo[];
}

export interface EffectData {
  id: string;
  projectId: string;
  indicatorName: string;
  period: string;
  value: number;
  unit: string;
  recordDate: string;
  recorder: string;
}

export interface BenefitCase {
  id: string;
  projectId: string;
  farmerName: string;
  village: string;
  familyMembers: number;
  photo: string;
  story: string;
  incomeIncrease: number;
  createTime: string;
}

export interface IssueHistory {
  id: string;
  issueId: string;
  action: string;
  operator: string;
  time: string;
  remarks: string;
}

export interface Issue {
  id: string;
  projectId: string;
  title: string;
  type: 'policy' | 'fund' | 'participation' | 'technology' | 'other';
  level: 'high' | 'medium' | 'low';
  description: string;
  status: 'open' | 'processing' | 'resolved' | 'closed';
  createTime: string;
  resolveTime: string | null;
  history: IssueHistory[];
}

export interface RiskMeasure {
  id: string;
  riskId: string;
  measure: string;
  responsiblePerson: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface Risk {
  id: string;
  projectId: string;
  title: string;
  type: 'policy' | 'economic' | 'natural' | 'social' | 'other';
  level: 'high' | 'medium' | 'low';
  description: string;
  impactAnalysis: string;
  status: 'identified' | 'monitoring' | 'mitigated' | 'occurred';
  createTime: string;
  measures: RiskMeasure[];
}

export const ProjectTypeMap: Record<string, string> = {
  infrastructure: '基础设施',
  industry: '产业发展',
  training: '技能培训',
  environment: '环境治理',
  other: '其他',
};

export const ProjectStatusMap: Record<string, string> = {
  planning: '规划中',
  ongoing: '进行中',
  completed: '已完成',
  suspended: '已暂停',
};

export const MilestoneStatusMap: Record<string, string> = {
  pending: '待开始',
  in_progress: '进行中',
  completed: '已完成',
  delayed: '已延期',
};

export const IssueTypeMap: Record<string, string> = {
  policy: '政策问题',
  fund: '资金问题',
  participation: '参与度问题',
  technology: '技术问题',
  other: '其他问题',
};

export const IssueLevelMap: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

export const IssueStatusMap: Record<string, string> = {
  open: '待处理',
  processing: '处理中',
  resolved: '已解决',
  closed: '已关闭',
};

export const RiskTypeMap: Record<string, string> = {
  policy: '政策风险',
  economic: '经济风险',
  natural: '自然风险',
  social: '社会风险',
  other: '其他风险',
};

export const RiskLevelMap: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

export const RiskStatusMap: Record<string, string> = {
  identified: '已识别',
  monitoring: '监控中',
  mitigated: '已缓解',
  occurred: '已发生',
};
