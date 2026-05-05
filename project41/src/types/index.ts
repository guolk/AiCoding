export interface User {
  id: number;
  username: string;
  email: string;
  roleId: number;
  status: 'active' | 'inactive' | 'pending';
  phone?: string;
  address?: string;
  role?: Role;
  createdAt: string;
  updatedAt?: string;
}

export interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
  userCount: number;
  status: 'active' | 'inactive';
  permissions: number[];
  createdAt: string;
}

export interface Permission {
  id: number;
  name: string;
  code: string;
  type: 'menu' | 'action';
  parentId: number | null;
  status: 'active' | 'inactive';
}

export interface Activity {
  id: number;
  action: string;
  user: string;
  time: string;
  status: 'success' | 'failed';
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  pendingRequests: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LoginRequest {
  username: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  token: string;
  user: User & {
    role: Role;
    permissions: Permission[];
  };
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  roleId: number;
  status: 'active' | 'inactive' | 'pending';
  phone?: string;
  address?: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  roleId?: number;
  status?: 'active' | 'inactive' | 'pending';
  phone?: string;
  address?: string;
}

export interface CreateRoleRequest {
  name: string;
  code: string;
  description?: string;
  permissions: number[];
}

export interface UpdateRoleRequest {
  name?: string;
  code?: string;
  description?: string;
  permissions?: number[];
  status?: 'active' | 'inactive';
}

export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  defaultLanguage: 'zh-CN' | 'en-US';
  defaultTheme: 'light' | 'dark';
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  requireMFA: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  notifyUserCreated: boolean;
  notifyUserUpdated: boolean;
  notifyUserDeleted: boolean;
  notifySystemError: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: (User & { role: Role; permissions: Permission[] }) | null;
  token: string | null;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export type Page = 'login' | 'dashboard' | 'users' | 'roles' | 'permissions' | 'settings';

export type SettingsTab = 'general' | 'security' | 'email' | 'notification';

export type QuestionType = 'single_choice' | 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_answer' | 'programming';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type UserRole = 'admin' | 'teacher' | 'student';
export type ExamStatus = 'draft' | 'published' | 'in_progress' | 'ended' | 'archived';
export type SubmissionStatus = 'draft' | 'submitted' | 'graded';
export type PaperMode = 'manual' | 'random';

export interface ExamUser {
  id: number;
  username: string;
  email: string;
  realName?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface SingleChoiceData {
  options: string[];
  correctAnswer: number;
}

export interface MultipleChoiceData {
  options: string[];
  correctAnswers: number[];
}

export interface TrueFalseData {
  correctAnswer: boolean;
}

export interface FillBlankData {
  blanks: Array<{ answer: string; hint?: string }>;
}

export interface ShortAnswerData {
  referenceAnswer?: string;
}

export interface ProgrammingData {
  language: string;
  templateCode?: string;
  testCases: Array<{ input: string; expectedOutput: string; hidden?: boolean }>;
  timeLimit: number;
  memoryLimit: number;
}

export interface Question {
  id: number;
  title: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  tags: string[];
  score: number;
  explanation?: string;
  knowledgePoints: string[];
  creatorId: number;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
  questionData: Record<string, any>;
}

export interface PaperQuestionItem {
  questionId: number;
  score?: number;
}

export interface RandomRule {
  questionType: QuestionType;
  count: number;
  difficulty?: DifficultyLevel;
  tags?: string[];
  scorePerQuestion: number;
}

export interface Paper {
  id: number;
  title: string;
  description?: string;
  mode: PaperMode;
  creatorId: number;
  createdAt: string;
  updatedAt?: string;
  totalScore: number;
  questionCount: number;
  tags: string[];
  isActive: boolean;
}

export interface PaperDetail extends Paper {
  questions: Array<{
    id: number;
    title: string;
    type: QuestionType;
    difficulty: DifficultyLevel;
    score: number;
    sortOrder: number;
    questionData: Record<string, any>;
  }>;
}

export interface Exam {
  id: number;
  title: string;
  paperId: number;
  creatorId: number;
  startTime: string;
  endTime: string;
  duration: number;
  status: ExamStatus;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  antiCheatEnabled: boolean;
  maxTabSwitchCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ExamForStudent {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: ExamStatus;
  paperTitle: string;
  totalScore: number;
}

export interface ExamStartResult {
  examId: number;
  submissionId: number;
  title: string;
  duration: number;
  endTime: string;
  questions: Array<{
    id: number;
    title: string;
    type: QuestionType;
    difficulty: DifficultyLevel;
    score: number;
    language?: string;
    templateCode?: string;
  }>;
  savedAnswers: Record<number, any>;
}

export interface AnswerSubmit {
  questionId: number;
  answer: any;
}

export interface Submission {
  id: number;
  examId: number;
  userId: number;
  status: SubmissionStatus;
  totalScore?: number;
  submittedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface QuestionResult {
  questionId: number;
  questionType: QuestionType;
  score: number;
  maxScore: number;
  isCorrect?: boolean;
  userAnswer: any;
  correctAnswer?: any;
  manualComment?: string;
}

export interface SubmissionDetail extends Submission {
  results: QuestionResult[];
}

export interface ScoreDistribution {
  range: string;
  count: number;
}

export interface QuestionStats {
  questionId: number;
  questionTitle: string;
  correctRate: number;
  avgScore: number;
  totalAttempts: number;
}

export interface KnowledgePointStats {
  name: string;
  correctRate: number;
  totalQuestions: number;
  avgScore: number;
}

export interface ExamAnalytics {
  examId: number;
  examTitle: string;
  totalSubmissions: number;
  avgScore: number;
  maxScore: number;
  minScore: number;
  passRate: number;
  scoreDistribution: ScoreDistribution[];
  questionStats: QuestionStats[];
  knowledgeStats: KnowledgePointStats[];
}

export interface ManualGradingRequest {
  submissionId: number;
  questionId: number;
  score: number;
  comment?: string;
}
