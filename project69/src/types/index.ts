export type Instrument = '主唱' | '吉他' | '贝斯' | '鼓' | '键盘' | '萨克斯' | '小号' | '长号' | '小提琴' | '大提琴' | '其他';

export type RehearsalStatus = 'planned' | 'completed' | 'cancelled';

export type SongVersion = '原版' | '编曲版' | '现场版' | 'Demo版' | '其他';

export type SongStatus = '学习中' | '可演出' | '已归档';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export type BorrowStatus = 'pending' | 'approved' | 'returned' | 'rejected';

export type PermissionLevel = 'view' | 'edit' | 'admin';

export interface Member {
  id: string;
  name: string;
  instrument: Instrument;
  phone: string;
  email: string;
  avatar?: string;
  availableTimes: AvailableTime[];
  joinDate: string;
  status: 'active' | 'inactive';
}

export interface AvailableTime {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface Rehearsal {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  participantIds: string[];
  status: RehearsalStatus;
  notes?: string;
  leaveRequests: LeaveRequest[];
  songIds: string[];
}

export interface LeaveRequest {
  id: string;
  memberId: string;
  rehearsalId: string;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
}

export interface AttendanceRecord {
  rehearsalId: string;
  memberId: string;
  present: boolean;
  leaveId?: string;
}

export interface Song {
  id: string;
  name: string;
  artist: string;
  version: SongVersion;
  status: SongStatus;
  difficulty: number;
  duration?: number;
  scores: Score[];
  createdAt: string;
  updatedAt: string;
}

export interface Score {
  id: string;
  songId: string;
  instrument: Instrument;
  fileName: string;
  fileUrl: string;
  annotations: Annotation[];
  permissions: ScorePermission[];
}

export interface Annotation {
  id: string;
  scoreId: string;
  memberId: string;
  content: string;
  position: string;
  createdAt: string;
}

export interface ScorePermission {
  memberId: string;
  level: PermissionLevel;
}

export interface RehearsalRecord {
  id: string;
  rehearsalId?: string;
  date: string;
  participantIds: string[];
  songIds: string[];
  duration: number;
  focusSegments: string[];
  technicalIssues: TechnicalIssue[];
  recordingIds: string[];
  notes?: string;
}

export interface TechnicalIssue {
  id: string;
  rehearsalRecordId: string;
  songId: string;
  description: string;
  measure?: string;
  status: 'open' | 'resolved';
  assignedTo?: string;
}

export interface Recording {
  id: string;
  rehearsalRecordId: string;
  fileName: string;
  fileUrl: string;
  duration?: number;
  timestamp: string;
  description?: string;
}

export interface Performance {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  audienceCount?: number;
  setlist: SetlistItem[];
  preparationList: PreparationItem[];
  review?: PerformanceReview;
}

export interface SetlistItem {
  id: string;
  songId: string;
  order: number;
  notes?: string;
}

export interface PreparationItem {
  id: string;
  name: string;
  category: '装备' | '人员' | '其他';
  responsibleId?: string;
  completed: boolean;
  deadline?: string;
}

export interface PerformanceReview {
  highlights: string;
  improvements: string;
  overallRating: number;
  createdAt: string;
}

export interface Equipment {
  id: string;
  name: string;
  ownerId: string;
  description: string;
  category: string;
  available: boolean;
}

export interface BorrowRecord {
  id: string;
  equipmentId: string;
  borrowerId: string;
  ownerId: string;
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: BorrowStatus;
  notes?: string;
}

export interface SharedResource {
  id: string;
  name: string;
  type: 'score' | 'recording' | 'document' | 'other';
  ownerId: string;
  fileUrl: string;
  permissions: ResourcePermission[];
  createdAt: string;
}

export interface ResourcePermission {
  memberId: string;
  level: PermissionLevel;
}
