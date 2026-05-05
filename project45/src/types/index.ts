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

export type Page = 'login' | 'dashboard' | 'users' | 'roles' | 'permissions' | 'settings' | 'papers' | 'notes' | 'mindmap' | 'timeline' | 'export' | 'sync';

export type SettingsTab = 'general' | 'security' | 'email' | 'notification';

export interface Author {
  id: string;
  name: string;
  givenName?: string;
  familyName?: string;
  affiliation?: string;
}

export interface Paper {
  id: string;
  title: string;
  authors: Author[];
  abstract?: string;
  keywords?: string[];
  doi?: string;
  pmid?: string;
  arxivId?: string;
  url?: string;
  pdfUrl?: string;
  pdfLocalPath?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  year?: number;
  publisher?: string;
  isbn?: string;
  issn?: string;
  references?: string[];
  citations?: string[];
  tags?: string[];
  readStatus: 'unread' | 'reading' | 'read';
  rating?: number;
  addedBy: number;
  addedAt: string;
  updatedAt?: string;
  notes?: string;
  folderId?: string;
}

export interface Annotation {
  id: string;
  paperId: string;
  pageNumber: number;
  type: 'highlight' | 'note' | 'question';
  color: string;
  content: string;
  rects?: { x: number; y: number; width: number; height: number }[];
  authorId: number;
  createdAt: string;
  updatedAt?: string;
  linkedNoteId?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  linkedPapers?: string[];
  linkedAnnotations?: string[];
  incomingLinks?: string[];
  outgoingLinks?: string[];
  parentNoteId?: string;
}

export interface CitationNode {
  id: string;
  paper: Paper;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface CitationLink {
  source: string;
  target: string;
  type: 'cites' | 'cited-by';
}

export interface CitationGraph {
  nodes: CitationNode[];
  links: CitationLink[];
}

export interface MindMapNode {
  id: string;
  noteId?: string;
  paperId?: string;
  label: string;
  children: MindMapNode[];
  parentId?: string;
  x?: number;
  y?: number;
  collapsed?: boolean;
}

export interface SharedLibrary {
  id: string;
  name: string;
  description?: string;
  ownerId: number;
  members: LibraryMember[];
  paperIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LibraryMember {
  userId: number;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joinedAt: string;
  readPapers?: string[];
  recommendedPapers?: string[];
}

export interface TimelineEvent {
  id: string;
  type: 'milestone' | 'paper-added' | 'note-created' | 'annotation-added' | 'review-completed';
  title: string;
  description?: string;
  date: string;
  paperId?: string;
  noteId?: string;
  userId: number;
  tags?: string[];
}

export interface Timeline {
  id: string;
  projectId: string;
  projectName: string;
  events: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSection {
  id: string;
  title: string;
  content: string;
  citations: { paperId: string; quote?: string; page?: number }[];
  order: number;
}

export interface LiteratureReview {
  id: string;
  title: string;
  paperIds: string[];
  sections: ReviewSection[];
  authorId: number;
  createdAt: string;
  updatedAt: string;
}

export type CitationStyle = 'apa' | 'mla' | 'chicago' | 'gb7714' | 'ieee' | 'custom';

export interface CustomCitationStyle {
  id: string;
  name: string;
  format: {
    author: string;
    year: string;
    title: string;
    journal: string;
    volume: string;
    pages: string;
    doi: string;
  };
  inTextFormat: string;
}

export interface ExportOptions {
  format: 'latex' | 'word' | 'markdown';
  includeAnnotations: boolean;
  includeCitations: boolean;
  citationStyle: CitationStyle;
}

export interface ZoteroItem {
  key: string;
  version: number;
  itemType: string;
  title: string;
  creators: { creatorType: string; firstName?: string; lastName?: string; name?: string }[];
  abstractNote?: string;
  publicationTitle?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  date?: string;
  series?: string;
  seriesTitle?: string;
  seriesText?: string;
  journalAbbreviation?: string;
  language?: string;
  DOI?: string;
  ISSN?: string;
  shortTitle?: string;
  url?: string;
  accessDate?: string;
  archive?: string;
  archiveLocation?: string;
  libraryCatalog?: string;
  callNumber?: string;
  rights?: string;
  extra?: string;
  tags?: { tag: string; type?: number }[];
  collections?: string[];
  relations?: Record<string, string>;
  dateAdded?: string;
  dateModified?: string;
}

export interface ZoteroCollection {
  key: string;
  version?: number;
  name: string;
  parentCollection?: string;
  relations?: Record<string, string>;
}

export interface SyncStatus {
  id: string;
  type: 'zotero';
  status: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncAt?: string;
  syncedCount: number;
  error?: string;
  progress?: {
    total: number;
    current: number;
  };
}

export interface ZoteroSyncConfig {
  apiKey?: string;
  userId?: string;
  libraryType: 'personal' | 'group';
  groupId?: string;
  collections?: string[];
  autoSync: boolean;
  syncInterval: number;
  twoWaySync: boolean;
  importPDFs: boolean;
  exportAnnotations: boolean;
}

export type LanguageCode = 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR' | 'fr-FR' | 'de-DE' | 'es-ES' | 'it-IT' | 'pt-BR' | 'ru-RU' | 'ar-SA' | 'hi-IN' | 'th-TH' | 'vi-VN';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export type LanguageLevel = 'beginner' | 'elementary' | 'intermediate' | 'upper-intermediate' | 'advanced' | 'native';

export interface LanguageSkill {
  language: LanguageCode;
  level: LanguageLevel;
  isNative: boolean;
}

export type LearningGoal = 'travel' | 'business' | 'academic' | 'daily_conversation' | 'exam_preparation' | 'cultural_interest';

export type InterestTag = 'travel' | 'music' | 'movies' | 'books' | 'sports' | 'food' | 'technology' | 'art' | 'history' | 'science' | 'gaming' | 'photography' | 'fitness' | 'politics' | 'fashion';

export interface Timezone {
  name: string;
  offset: number;
  label: string;
}

export interface LanguageLearner {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  nativeLanguages: LanguageSkill[];
  learningLanguages: LanguageSkill[];
  learningGoals: LearningGoal[];
  interests: InterestTag[];
  timezone: Timezone;
  bio?: string;
  location?: string;
  onlineStatus: 'online' | 'offline' | 'idle';
  lastActiveAt: string;
  rating: number;
  totalMatches: number;
  totalChatHours: number;
  subscriptionTier: 'free' | 'premium' | 'professional';
  subscriptionEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MatchScore {
  languageComplementarity: number;
  interestSimilarity: number;
  timezoneOverlap: number;
  levelCompatibility: number;
  totalScore: number;
}

export interface MatchBreakdown {
  languageComplementarity: {
    score: number;
    explanation: string;
  };
  interestSimilarity: {
    score: number;
    explanation: string;
    commonInterests: InterestTag[];
  };
  timezoneOverlap: {
    score: number;
    explanation: string;
    overlappingHours: string[];
  };
  levelCompatibility: {
    score: number;
    explanation: string;
  };
}

export interface Match {
  id: string;
  senderId: number;
  receiverId: number;
  score: MatchScore;
  breakdown: MatchBreakdown;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  message?: string;
  createdAt: string;
  expiresAt: string;
  sender?: LanguageLearner;
  receiver?: LanguageLearner;
}

export interface DailyRecommendation {
  date: string;
  userId: number;
  matches: Match[];
  viewed: boolean;
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  participants: number[];
  matchId: string;
  type: 'text' | 'voice' | 'video';
  status: 'active' | 'archived' | 'deleted';
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ChatMessageType = 'text' | 'system' | 'annotation' | 'correction';

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: number;
  content: string;
  type: ChatMessageType;
  language?: LanguageCode;
  annotations: MessageAnnotation[];
  corrections: GrammarCorrection[];
  createdAt: string;
  updatedAt: string;
}

export type AnnotationType = 'grammar_error' | 'natural_expression' | 'question' | 'suggestion';

export interface MessageAnnotation {
  id: string;
  messageId: string;
  annotatorId: number;
  type: AnnotationType;
  text: string;
  startIndex: number;
  endIndex: number;
  comment?: string;
  createdAt: string;
}

export interface GrammarCorrection {
  id: string;
  messageId: string;
  correctorId: number;
  originalText: string;
  correctedText: string;
  explanation?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface WebRTCSession {
  id: string;
  roomId: string;
  initiatorId: number;
  participants: number[];
  type: 'voice' | 'video';
  status: 'pending' | 'active' | 'ended';
  offerSDP?: string;
  answerSDP?: string;
  iceCandidates: string[];
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  realtimeTranscripts: RealtimeTranscript[];
  createdAt: string;
}

export interface RealtimeTranscript {
  id: string;
  sessionId: string;
  userId: number;
  text: string;
  language: LanguageCode;
  timestamp: number;
  isFinal: boolean;
}

export interface VocabularyItem {
  id: string;
  userId: number;
  word: string;
  language: LanguageCode;
  definitions: VocabularyDefinition[];
  examples: VocabularyExample[];
  pronunciation?: string;
  audioUrl?: string;
  sourceMessageId?: string;
  chatRoomId?: string;
  tags: string[];
  reviewCount: number;
  nextReviewAt: string;
  mastered: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VocabularyDefinition {
  partOfSpeech: string;
  definition: string;
  translation?: string;
}

export interface VocabularyExample {
  text: string;
  translation?: string;
  source: string;
}

export type AnkiCardFormat = 'basic' | 'basic_reverse' | 'cloze';

export interface AnkiExportConfig {
  format: AnkiCardFormat;
  deckName: string;
  includeAudio: boolean;
  includeExamples: boolean;
  language: LanguageCode;
}

export interface SessionRecording {
  id: string;
  sessionId: string;
  userId: number;
  status: 'recording' | 'processing' | 'ready' | 'failed';
  audioUrl?: string;
  transcript?: WhisperTranscript;
  consentGiven: boolean;
  createdAt: string;
  processedAt?: string;
}

export interface WhisperTranscript {
  segments: TranscriptSegment[];
  language: LanguageCode;
  duration: number;
}

export interface TranscriptSegment {
  id: string;
  speakerId: number;
  text: string;
  startTime: number;
  endTime: number;
  highlighted: boolean;
  confidence: number;
}

export interface LearningActivity {
  id: string;
  userId: number;
  date: string;
  chatMinutes: number;
  correctionsMade: number;
  correctionsReceived: number;
  wordsLearned: number;
  sessionsCompleted: number;
  goalsMet: string[];
}

export interface LearningCalendar {
  userId: number;
  year: number;
  month: number;
  activities: LearningActivity[];
  heatmapData: HeatmapDay[];
}

export interface HeatmapDay {
  date: string;
  intensity: number;
  activityTypes: ('chat' | 'correction' | 'vocabulary' | 'session')[];
}

export interface CommunityPost {
  id: string;
  authorId: number;
  title: string;
  content: string;
  language: LanguageCode;
  topic: string;
  tags: string[];
  likes: number;
  commentsCount: number;
  isAnonymous: boolean;
  status: 'draft' | 'published' | 'hidden';
  author?: LanguageLearner;
  createdAt: string;
  updatedAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: number;
  content: string;
  parentCommentId?: string;
  likes: number;
  author?: LanguageLearner;
  createdAt: string;
}

export interface SpeakingChallenge {
  id: string;
  title: string;
  description: string;
  language: LanguageCode;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  startDate: string;
  endDate: string;
  participantCount: number;
  status: 'upcoming' | 'active' | 'ended';
  createdAt: string;
}

export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  userId: number;
  audioUrl: string;
  transcript?: string;
  rating: number;
  ratingsCount: number;
  comments: PeerRating[];
  submittedAt: string;
  user?: LanguageLearner;
}

export interface PeerRating {
  id: string;
  submissionId: string;
  raterId: number;
  pronunciation: number;
  fluency: number;
  vocabulary: number;
  grammar: number;
  comment?: string;
  rater?: LanguageLearner;
  createdAt: string;
}

export type SubscriptionTier = 'free' | 'premium' | 'professional';

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  features: SubscriptionFeature[];
  isActive: boolean;
  isPopular: boolean;
}

export interface SubscriptionFeature {
  name: string;
  description: string;
  isIncluded: boolean;
  isUnlimited: boolean;
  limit?: number;
}

export interface UserSubscription {
  id: string;
  userId: number;
  planId: string;
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'expired' | 'paused';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod: string;
  usage: SubscriptionUsage;
  plan?: SubscriptionPlan;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionUsage {
  matchesUsed: number;
  matchesLimit: number;
  aiCorrectionsUsed: number;
  aiCorrectionsLimit: number;
  teacherConnectionsUsed: number;
  teacherConnectionsLimit: number;
  recordingMinutesUsed: number;
  recordingMinutesLimit: number;
}

export interface AIGrammarSuggestion {
  id: string;
  userId: number;
  originalText: string;
  suggestedText: string;
  explanation: string;
  confidence: number;
  language: LanguageCode;
  errorTypes: string[];
  isApplied: boolean;
  createdAt: string;
}

export interface ProfessionalTeacher {
  id: number;
  userId: number;
  specialties: string[];
  languages: LanguageCode[];
  certifications: string[];
  hourlyRate: number;
  rating: number;
  totalSessions: number;
  availableSlots: string[];
  bio: string;
  verified: boolean;
  createdAt: string;
}

export interface TeacherSession {
  id: string;
  teacherId: number;
  studentId: number;
  startTime: string;
  endTime: string;
  language: LanguageCode;
  topic?: string;
  notes?: string;
  rating?: number;
  review?: string;
  status: 'scheduled' | 'completed' | 'canceled' | 'no-show';
  price: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: number;
  type: 'match' | 'message' | 'correction' | 'system' | 'subscription' | 'challenge';
  title: string;
  content: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export interface DailyStatistics {
  date: string;
  totalUsers: number;
  activeUsers: number;
  newMatches: number;
  acceptedMatches: number;
  totalChatMessages: number;
  totalSessionMinutes: number;
  vocabularyAdded: number;
  correctionsMade: number;
  revenue: number;
  newSubscriptions: number;
}
