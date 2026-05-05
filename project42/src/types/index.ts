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

export interface CreatePermissionRequest {
  name: string;
  code: string;
  type: 'menu' | 'action';
  parentId: number | null;
  status: 'active' | 'inactive';
}

export interface UpdatePermissionRequest {
  name?: string;
  code?: string;
  type?: 'menu' | 'action';
  parentId?: number | null;
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

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

export type ProblemStatus = 'draft' | 'published' | 'hidden';

export type Language = 'python' | 'java' | 'cpp' | 'go' | 'rust';

export type JudgeStatus = 'pending' | 'queued' | 'running' | 'accepted' | 'wrong_answer' | 'time_limit' | 'memory_limit' | 'runtime_error' | 'compile_error' | 'system_error';

export type ContestType = 'contest' | 'practice';

export type ScoringSystem = 'icpc' | 'oi';

export type ContestStatus = 'upcoming' | 'running' | 'frozen' | 'ended';

export interface ProblemTag {
  id: number;
  name: string;
  code: string;
  color?: string;
}

export interface TestCase {
  id: number;
  problemId: number;
  input: string;
  output: string;
  isSample: boolean;
  score: number;
  order: number;
}

export interface LanguageConfig {
  language: Language;
  timeLimit: number;
  memoryLimit: number;
  compileCommand?: string;
  runCommand: string;
}

export interface Problem {
  id: number;
  contestId?: number;
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  sampleInput: string;
  sampleOutput: string;
  note?: string;
  difficulty: DifficultyLevel;
  status: ProblemStatus;
  tags: number[];
  testCases: TestCase[];
  hasSpecialJudge: boolean;
  specialJudgeCode?: string;
  languages: Language[];
  languageConfigs: LanguageConfig[];
  timeLimit: number;
  memoryLimit: number;
  solvedCount: number;
  attemptedCount: number;
  authorId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: number;
  problemId: number;
  contestId?: number;
  userId: number;
  username: string;
  language: Language;
  code: string;
  status: JudgeStatus;
  score: number;
  runtime: number;
  memory: number;
  errorMessage?: string;
  testCaseResults: TestCaseResult[];
  submittedAt: string;
}

export interface TestCaseResult {
  testCaseId: number;
  status: JudgeStatus;
  runtime: number;
  memory: number;
  output?: string;
  errorMessage?: string;
}

export interface Contest {
  id: number;
  title: string;
  description: string;
  type: ContestType;
  scoringSystem: ScoringSystem;
  status: ContestStatus;
  startTime: string;
  endTime: string;
  freezeTime?: string;
  unfreezeTime?: string;
  problemIds: number[];
  participantCount: number;
  isPublic: boolean;
  authorId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContestParticipation {
  id: number;
  contestId: number;
  userId: number;
  username: string;
  rank: number;
  score: number;
  penalty: number;
  solvedCount: number;
  problemStatuses: Record<number, ProblemContestStatus>;
  ratingChange?: number;
  registeredAt: string;
}

export interface ProblemContestStatus {
  problemId: number;
  solved: boolean;
  firstACTime?: number;
  wrongAttempts: number;
  lastSubmissionId?: number;
}

export interface ContestTimelineEvent {
  id: number;
  contestId: number;
  userId: number;
  username: string;
  problemId: number;
  problemLetter: string;
  type: 'submission' | 'accept' | 'wrong_answer';
  time: number;
  submissionId: number;
}

export interface Solution {
  id: number;
  problemId: number;
  userId: number;
  username: string;
  title: string;
  content: string;
  language?: Language;
  code?: string;
  votes: number;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Discussion {
  id: number;
  problemId?: number;
  contestId?: number;
  userId: number;
  username: string;
  title: string;
  content: string;
  parentId?: number;
  votes: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserRating {
  id: number;
  userId: number;
  contestId: number;
  contestTitle: string;
  rating: number;
  previousRating: number;
  change: number;
  rank: number;
  participants: number;
  createdAt: string;
}

export interface UserStatistics {
  userId: number;
  totalSolved: number;
  totalAttempts: number;
  totalContests: number;
  bestRank?: number;
  worstRank?: number;
  averageRank?: number;
  currentRating: number;
  maxRating: number;
  ratingHistory: UserRating[];
}

export interface JudgeWebSocketMessage {
  type: 'status_update' | 'test_case_result' | 'complete';
  submissionId: number;
  status?: JudgeStatus;
  testCaseResult?: TestCaseResult;
  totalTestCases?: number;
  completedTestCases?: number;
  finalResult?: {
    status: JudgeStatus;
    score: number;
    runtime: number;
    memory: number;
    testCaseResults: TestCaseResult[];
  };
}

export interface ModerationCase {
  id: number;
  type: 'plagiarism' | 'inappropriate_content' | 'cheating';
  submissionId?: number;
  solutionId?: number;
  discussionId?: number;
  userId: number;
  reporterId?: number;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  evidence?: string;
  action?: string;
  moderatorId?: number;
  createdAt: string;
  resolvedAt?: string;
}

export interface PaginatedProblemsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  difficulty?: DifficultyLevel;
  tags?: number[];
  status?: ProblemStatus;
}

export interface PaginatedContestsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: ContestType;
  status?: ContestStatus;
}

export interface PaginatedSubmissionsParams {
  page?: number;
  pageSize?: number;
  problemId?: number;
  contestId?: number;
  userId?: number;
  status?: JudgeStatus;
  language?: Language;
}

export interface CreateProblemRequest {
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  sampleInput: string;
  sampleOutput: string;
  note?: string;
  difficulty: DifficultyLevel;
  tags: number[];
  hasSpecialJudge: boolean;
  specialJudgeCode?: string;
  languages: Language[];
  timeLimit: number;
  memoryLimit: number;
  languageConfigs?: LanguageConfig[];
}

export interface UpdateProblemRequest {
  title?: string;
  description?: string;
  inputFormat?: string;
  outputFormat?: string;
  sampleInput?: string;
  sampleOutput?: string;
  note?: string;
  difficulty?: DifficultyLevel;
  tags?: number[];
  status?: ProblemStatus;
  hasSpecialJudge?: boolean;
  specialJudgeCode?: string;
  languages?: Language[];
  timeLimit?: number;
  memoryLimit?: number;
  languageConfigs?: LanguageConfig[];
}

export interface CreateContestRequest {
  title: string;
  description: string;
  type: ContestType;
  scoringSystem: ScoringSystem;
  startTime: string;
  endTime: string;
  freezeTime?: string;
  problemIds: number[];
  isPublic: boolean;
}

export interface SubmitCodeRequest {
  problemId: number;
  contestId?: number;
  language: Language;
  code: string;
}

export interface RegisterContestRequest {
  contestId: number;
}

export interface CreateSolutionRequest {
  problemId: number;
  title: string;
  content: string;
  language?: Language;
  code?: string;
}

export interface CreateDiscussionRequest {
  problemId?: number;
  contestId?: number;
  title: string;
  content: string;
  parentId?: number;
}

export interface VoteRequest {
  targetType: 'solution' | 'discussion';
  targetId: number;
  vote: 1 | -1;
}

export interface ModerationActionRequest {
  caseId: number;
  action: string;
  notes?: string;
}
