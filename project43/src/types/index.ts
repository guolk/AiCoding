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
