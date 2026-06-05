export interface Student {
  id: string;
  name: string;
  studentNo: string;
  gender: '男' | '女';
  birthDate: string;
  parentName: string;
  parentPhone: string;
  address: string;
  notes: string;
  photoUrl: string;
  seatRow: number;
  seatCol: number;
  createdAt: string;
}

export type AttendanceStatus = 'present' | 'late' | 'leave' | 'absent';

export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  remarks: string;
}

export interface Exam {
  id: string;
  name: string;
  date: string;
  term: string;
}

export interface Grade {
  id: string;
  studentId: string;
  examId: string;
  score: number;
  subject: string;
}

export type BehaviorType = 'positive' | 'negative';

export interface Behavior {
  id: string;
  studentId: string;
  date: string;
  type: BehaviorType;
  description: string;
  points: number;
}

export interface StudentGroup {
  id: string;
  name: string;
  description: string;
  assignment: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  studentId: string;
  role: string;
}

export type CommunicationType = 'phone' | 'message' | 'meeting' | 'other';

export interface Communication {
  id: string;
  studentId: string;
  date: string;
  type: CommunicationType;
  reason: string;
  content: string;
  operator: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  studentId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  attachmentUrl: string;
}

export interface HomeVisit {
  id: string;
  studentId: string;
  date: string;
  purpose: string;
  content: string;
  participants: string;
}

export interface AttendanceStats {
  date: string;
  present: number;
  late: number;
  leave: number;
  absent: number;
}

export interface GradeStats {
  average: number;
  passRate: number;
  excellentRate: number;
  maxScore: number;
  minScore: number;
  distribution: [number, number, number, number, number];
}

export interface SeatPosition {
  row: number;
  col: number;
}

export type PageType = 'dashboard' | 'students' | 'seating' | 'attendance' | 'leaves' | 'grades' | 'analysis' | 'classroom' | 'groups' | 'communication';
