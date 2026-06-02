export type ProjectStage = 'idea' | 'validation' | 'development' | 'launch' | 'growth';
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'delayed';
export type InterestLevel = 'high' | 'medium' | 'low';
export type FollowStatus = 'contacted' | 'meeting' | 'negotiating' | 'invested' | 'lost';
export type ProviderCategory = 'legal' | 'finance' | 'brand' | 'technology';
export type ActivityType = 'roadshow' | 'training' | 'exchange';
export type ActivityStatus = 'upcoming' | 'ongoing' | 'completed';
export type ParticipantStatus = 'registered' | 'signed_in' | 'absent';
export type DataRoomStatus = 'pending' | 'in_progress' | 'completed';
export type DataRoomCategory = 'company' | 'finance' | 'legal' | 'contracts' | 'ip' | 'hr' | 'tech' | 'marketing';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface BusinessCanvas {
  customers: string;
  valueProposition: string;
  channels: string;
  customerRelationships: string;
  revenueStreams: string;
  keyResources: string;
  keyActivities: string;
  keyPartnerships: string;
  costStructure: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  targetDate: string;
  status: MilestoneStatus;
  completedDate?: string;
}

export interface KPIRecord {
  id: string;
  projectId: string;
  date: string;
  userCount: number;
  revenue: number;
  financingProgress: number;
}

export interface Project {
  id: string;
  name: string;
  track: string;
  foundingTeam: TeamMember[];
  founders: string;
  contact: string;
  joinDate: string;
  stage: ProjectStage;
  description: string;
  businessCanvas: BusinessCanvas;
  milestones: Milestone[];
  kpiRecords: KPIRecord[];
}

export interface ServiceRecord {
  id: string;
  date: string;
  projectId: string;
  content: string;
}

export interface Mentor {
  id: string;
  name: string;
  expertise: string[];
  avatar?: string;
  contact: string;
  serviceRecords: ServiceRecord[];
}

export interface Investor {
  id: string;
  name: string;
  institution: string;
  interestLevel: InterestLevel;
  followStatus: FollowStatus;
  contact: string;
  projects: string[];
}

export interface ServiceProvider {
  id: string;
  category: ProviderCategory;
  name: string;
  contact: string;
  description: string;
}

export interface ActivityParticipant {
  projectId: string;
  checkedIn: boolean;
  checkInTime?: string;
  status: ParticipantStatus;
}

export interface ActivityFeedback {
  id: string;
  projectId: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  name: string;
  date: string;
  location: string;
  description?: string;
  status: ActivityStatus;
  participants: ActivityParticipant[];
  feedbacks: ActivityFeedback[];
}

export interface DataRoomItem {
  id: string;
  projectId: string;
  category: DataRoomCategory;
  name: string;
  description?: string;
  fileName?: string;
  uploadDate?: string;
  status: DataRoomStatus;
}
