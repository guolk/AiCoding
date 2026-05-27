export interface Volunteer {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  skills: string[];
  availableTime: string;
  joinDate: string;
  totalHours: number;
  activities: string[];
  certifications: Certification[];
  awards: Award[];
}

export interface Certification {
  id: string;
  name: string;
  issueDate: string;
  issuer: string;
}

export interface Award {
  id: string;
  name: string;
  issueDate: string;
  description: string;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  maxVolunteers: number;
  requiredSkills: string[];
  status: 'draft' | 'recruiting' | 'ongoing' | 'completed' | 'cancelled';
  registrations: Registration[];
  materials: Material[];
  review?: ActivityReview;
  feedbacks: Feedback[];
}

export interface Registration {
  id: string;
  volunteerId: string;
  volunteerName: string;
  phone: string;
  signUpTime: string;
  status: 'pending' | 'approved' | 'rejected';
  checkInStatus: 'not-started' | 'checked-in' | 'checked-out';
  checkInTime?: string;
  checkOutTime?: string;
}

export interface Material {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  responsible: string;
  status: 'pending' | 'prepared' | 'used';
}

export interface ActivityReview {
  id: string;
  activityId: string;
  participantCount: number;
  beneficiaryCount: number;
  issues: string;
  improvements: string;
  summary: string;
  quantifiableResults: QuantifiableResult[];
  createdAt: string;
}

export interface QuantifiableResult {
  id: string;
  name: string;
  value: number;
  unit: string;
}

export interface Feedback {
  id: string;
  activityId: string;
  volunteerId: string;
  volunteerName: string;
  satisfaction: number;
  comment: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  description: string;
  groups: Group[];
  announcements: Announcement[];
  finances: FinanceRecord[];
}

export interface Group {
  id: string;
  name: string;
  description: string;
  leader: string;
  leaderContact: string;
  members: string[];
  responsibilities: string[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  priority: 'normal' | 'important' | 'urgent';
}

export interface FinanceRecord {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  operator: string;
  receiptUrl?: string;
}

export interface ServiceDemand {
  id: string;
  title: string;
  description: string;
  organization: string;
  contactPerson: string;
  contactPhone: string;
  requiredSkills: string[];
  preferredTime: string;
  expectedVolunteers: number;
  status: 'open' | 'matched' | 'completed' | 'cancelled';
  createdAt: string;
  applicants: DemandApplicant[];
  matchedVolunteers: string[];
}

export interface DemandApplicant {
  volunteerId: string;
  volunteerName: string;
  applyTime: string;
  status: 'pending' | 'approved' | 'rejected';
}
