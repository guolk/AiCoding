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

// 音乐学习平台类型定义
export type NoteDuration = 'w' | 'h' | 'q' | '8' | '16' | '32';
export type NotePitch = 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B';
export type ClefType = 'treble' | 'bass' | 'alto' | 'tenor';
export type TimeSignature = '4/4' | '3/4' | '2/4' | '6/8' | '3/8' | '2/2';
export type KeySignature = 'C' | 'G' | 'D' | 'A' | 'E' | 'B' | 'F#' | 'C#' | 'F' | 'Bb' | 'Eb' | 'Ab' | 'Db' | 'Gb' | 'Cb';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type NotationType = 'staff' | 'jianpu';

export interface Note {
  id: string;
  pitch: NotePitch;
  octave: number;
  duration: NoteDuration;
  dotted?: boolean;
  rest?: boolean;
  accidental?: '#' | 'b' | 'natural';
  tied?: boolean;
  annotations?: NoteAnnotation[];
}

export interface NoteAnnotation {
  id: string;
  type: 'finger' | 'dynamic' | 'expression' | 'text' | 'highlight';
  value: string;
  position?: 'above' | 'below' | 'left' | 'right';
  color?: string;
}

export interface Measure {
  id: string;
  notes: Note[];
  timeSignature?: TimeSignature;
  keySignature?: KeySignature;
  annotations?: MeasureAnnotation[];
  isHighlighted?: boolean;
  highlightColor?: string;
}

export interface MeasureAnnotation {
  id: string;
  type: 'text' | 'bracket' | 'repeat' | 'volta';
  value: string;
  startMeasure?: number;
  endMeasure?: number;
}

export interface SheetMusic {
  id: string;
  title: string;
  composer?: string;
  clef: ClefType;
  keySignature: KeySignature;
  timeSignature: TimeSignature;
  tempo: number;
  measures: Measure[];
  notationType: NotationType;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: string;
  title: string;
  difficulty: DifficultyLevel;
  description: string;
  sheetMusic: SheetMusic;
  expectedNotes: ExpectedNote[];
  duration: number;
  tags: string[];
  createdAt: string;
}

export interface ExpectedNote {
  pitch: NotePitch;
  octave: number;
  startTime: number;
  duration: number;
  measureIndex: number;
  noteIndex: number;
}

export interface VideoCourse {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId: number;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number;
  chapters: VideoChapter[];
  subtitles: Subtitle[];
  price: number;
  isSubscriptionOnly: boolean;
  difficulty: DifficultyLevel;
  createdAt: string;
  updatedAt: string;
}

export interface VideoChapter {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  description?: string;
}

export interface Subtitle {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  language: string;
}

export interface PitchDetectionResult {
  frequency: number;
  note: NotePitch;
  octave: number;
  deviation: number;
  isInTune: boolean;
  timestamp: number;
}

export interface RhythmEvaluationResult {
  measureIndex: number;
  expectedTime: number;
  actualTime: number;
  deviation: number;
  isOnTime: boolean;
  tolerance: number;
}

export interface PracticeSession {
  id: string;
  userId: number;
  exerciseId: string;
  startTime: string;
  endTime: string;
  duration: number;
  pitchAccuracy: number;
  rhythmAccuracy: number;
  overallAccuracy: number;
  detectedNotes: PitchDetectionResult[];
  rhythmResults: RhythmEvaluationResult[];
  incorrectMeasures: number[];
  createdAt: string;
}

export interface PracticeReport {
  id: string;
  userId: number;
  exerciseId: string;
  sessionId: string;
  accuracyCurve: AccuracyDataPoint[];
  commonErrors: CommonError[];
  suggestions: string[];
  overallScore: number;
  createdAt: string;
}

export interface AccuracyDataPoint {
  timestamp: number;
  accuracy: number;
  measureIndex: number;
}

export interface CommonError {
  type: 'pitch' | 'rhythm' | 'both';
  measureIndex: number;
  noteIndex?: number;
  description: string;
  frequency: number;
}

export interface CommunityPost {
  id: string;
  userId: number;
  userName: string;
  userAvatar?: string;
  type: 'performance' | 'question' | 'discussion';
  title: string;
  content: string;
  audioUrl?: string;
  audioDuration?: number;
  exerciseId?: string;
  sheetMusicId?: string;
  likes: number;
  comments: Comment[];
  ratings: Rating[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  userId: number;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  isTeacher: boolean;
}

export interface Rating {
  id: string;
  userId: number;
  score: number;
  comment?: string;
  isTeacher: boolean;
  createdAt: string;
}

export interface CheckInRecord {
  id: string;
  userId: number;
  date: string;
  practiceDuration: number;
  exercisesCompleted: string[];
  notes?: string;
  createdAt: string;
}

export interface CheckInStreak {
  userId: number;
  currentStreak: number;
  longestStreak: number;
  totalCheckIns: number;
  lastCheckInDate: string;
}

export interface LeaderboardEntry {
  userId: number;
  userName: string;
  userAvatar?: string;
  streakDays: number;
  totalPracticeMinutes: number;
  rank: number;
}

export interface AIAccompanimentRequest {
  id: string;
  userId: number;
  melodyAudioUrl: string;
  key: KeySignature;
  tempo: number;
  style: 'classical' | 'jazz' | 'pop' | 'rock' | 'folk';
  complexity: 'simple' | 'medium' | 'complex';
}

export interface AIAccompanimentResult {
  id: string;
  requestId: string;
  audioUrl: string;
  mixedAudioUrl: string;
  chords: string[];
  createdAt: string;
}

export interface LearningPath {
  id: string;
  userId: number;
  currentLevel: DifficultyLevel;
  recommendedExercises: string[];
  weakAreas: WeakArea[];
  progress: LearningProgress;
  nextRecommended: NextRecommendation;
  createdAt: string;
  updatedAt: string;
}

export interface WeakArea {
  id: string;
  type: 'pitch' | 'rhythm' | 'technique';
  description: string;
  relatedExercises: string[];
  practiceCount: number;
  improvementRate: number;
}

export interface LearningProgress {
  totalExercisesCompleted: number;
  exercisesByLevel: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  averageAccuracy: number;
  totalPracticeMinutes: number;
}

export interface NextRecommendation {
  exerciseId: string;
  reason: string;
  estimatedDifficulty: DifficultyLevel;
}

export interface PurchaseItem {
  id: string;
  type: 'course' | 'subscription';
  courseId?: string;
  subscriptionPlan?: SubscriptionPlan;
  price: number;
  discount?: number;
  finalPrice: number;
  purchasedAt: string;
  expiresAt?: string;
  status: 'active' | 'expired' | 'refunded';
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  features: string[];
  isPopular?: boolean;
}

export interface StudentProgress {
  id: string;
  studentId: number;
  studentName: string;
  studentEmail: string;
  coursesEnrolled: string[];
  lastActive: string;
  totalPracticeMinutes: number;
  averageAccuracy: number;
  currentLevel: DifficultyLevel;
  checkInStreak: number;
}

export interface RevenueReport {
  id: string;
  teacherId: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  totalRevenue: number;
  courseSales: {
    courseId: string;
    courseTitle: string;
    unitsSold: number;
    revenue: number;
  }[];
  subscriptionRevenue: number;
  activeSubscriptions: number;
  newStudents: number;
}

export interface UserPurchase {
  id: string;
  userId: number;
  itemType: 'course' | 'subscription';
  itemId: string;
  purchaseDate: string;
  expiresAt?: string;
  isActive: boolean;
  pricePaid: number;
}

// API 响应类型
export interface SheetMusicListResponse {
  items: SheetMusic[];
  total: number;
}

export interface ExerciseListResponse {
  items: Exercise[];
  total: number;
}

export interface VideoCourseListResponse {
  items: VideoCourse[];
  total: number;
}

export interface PracticeSessionListResponse {
  items: PracticeSession[];
  total: number;
}

export interface CommunityPostListResponse {
  items: CommunityPost[];
  total: number;
}

export interface CheckInRecordListResponse {
  items: CheckInRecord[];
  total: number;
}

export interface PurchaseItemListResponse {
  items: PurchaseItem[];
  total: number;
}

export interface StudentProgressListResponse {
  items: StudentProgress[];
  total: number;
}
