export interface Conference {
  id: string;
  name: string;
  organizer: string;
  acceptanceRate: number;
  deadline: string;
  notificationDate: string;
  publicationFee: number;
  website: string;
  notes: string;
  createdAt: string;
}

export type SubmissionStatus = 'preparing' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'revision_requested';

export interface Submission {
  id: string;
  conferenceId: string;
  paperId: string;
  status: SubmissionStatus;
  submittedAt: string;
  createdAt: string;
}

export interface Review {
  id: string;
  submissionId: string;
  reviewerName: string;
  comments: string;
  suggestions: string;
  score: number;
  decision: 'accept' | 'reject' | 'revision';
  createdAt: string;
}

export interface Paper {
  id: string;
  title: string;
  abstract: string;
  keywords: string[];
  createdAt: string;
}

export interface PaperVersion {
  id: string;
  paperId: string;
  version: string;
  filePath: string;
  changes: string;
  createdAt: string;
}

export interface Collaborator {
  id: string;
  paperId: string;
  name: string;
  affiliation: string;
  role: 'author' | 'corresponding' | 'advisor';
  responsibilities: string[];
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  paperId: string;
  category: 'page_limit' | 'citation_format' | 'figure_requirements' | 'other';
  item: string;
  completed: boolean;
  notes: string;
  createdAt: string;
}

export interface AttendancePlan {
  id: string;
  conferenceId: string;
  submissionId: string;
  conferenceStartDate: string;
  conferenceEndDate: string;
  createdAt: string;
}

export type TravelType = 'flight' | 'hotel' | 'visa' | 'presentation_time' | 'other';

export interface TravelItem {
  id: string;
  attendancePlanId: string;
  type: TravelType;
  description: string;
  date: string;
  details: string;
  confirmed: boolean;
  createdAt: string;
}

export type PresentationType = 'slides' | 'poster';

export interface Presentation {
  id: string;
  attendancePlanId: string;
  type: PresentationType;
  title: string;
  progress: number;
  filePath: string;
  notes: string;
  createdAt: string;
}

export type ExpenseCategory = 'registration' | 'travel' | 'accommodation' | 'food' | 'other';

export interface Expense {
  id: string;
  attendancePlanId: string;
  category: ExpenseCategory;
  description: string;
  budget: number;
  actual: number;
  receiptPath: string;
  reimbursed: boolean;
  createdAt: string;
}

export interface Scholar {
  id: string;
  name: string;
  affiliation: string;
  researchArea: string;
  email: string;
  phone: string;
  website: string;
  collaborationPotential: 'high' | 'medium' | 'low';
  conferenceMetAt: string;
  notes: string;
  createdAt: string;
}

export type CollaborationStatus = 'initial_contact' | 'discussion' | 'proposal' | 'active' | 'completed' | 'dormant';

export interface CollaborationIntent {
  id: string;
  scholarId: string;
  topic: string;
  status: CollaborationStatus;
  nextSteps: string;
  followUpDate: string;
  notes: string;
  createdAt: string;
}

export interface ConferenceNote {
  id: string;
  conferenceId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

export type VenueType = 'journal' | 'conference';

export interface Publication {
  id: string;
  title: string;
  venue: string;
  venueType: VenueType;
  year: number;
  citations: number;
  link: string;
  doi: string;
  createdAt: string;
}
