export interface Topic {
  id: string;
  title: string;
  description: string;
  tags: string[];
  heatScore: number;
  feasibilityScore: number;
  status: 'idea' | 'evaluating' | 'approved' | 'rejected';
  createdAt: string;
}

export interface CommunicationEntry {
  date: string;
  content: string;
  type: 'email' | 'phone' | 'meeting';
}

export interface Guest {
  id: string;
  name: string;
  avatar?: string;
  contact: string;
  company: string;
  title: string;
  status: 'invited' | 'negotiating' | 'confirmed' | 'declined';
  lastContact: string;
  communicationLog: CommunicationEntry[];
}

export interface Episode {
  id: string;
  title: string;
  topicId?: string;
  guestId?: string;
  status: 'planning' | 'scheduled' | 'recording' | 'editing' | 'published' | 'archived';
  publishDate?: string;
}

export interface Question {
  id: string;
  content: string;
  order: number;
  estimatedTime: number;
}

export interface FlowItem {
  id: string;
  title: string;
  description: string;
  duration: number;
  order: number;
}

export interface Transition {
  id: string;
  from: string;
  to: string;
  content: string;
}

export interface Outline {
  id: string;
  episodeId: string;
  questions: Question[];
  flow: FlowItem[];
  transitions: Transition[];
}

export interface ClipMarker {
  id: string;
  startTime: number;
  endTime: number;
  note: string;
  type: 'cut' | 'keep' | 'review';
}

export interface RecordingSession {
  id: string;
  episodeId: string;
  scheduledAt: string;
  reminderSent: boolean;
  equipmentCheck: boolean;
  actualDuration?: number;
  techIssues?: string;
  clipsToEdit?: ClipMarker[];
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface RecordingFile {
  id: string;
  sessionId: string;
  version: 'original' | 'edited' | 'final';
  fileName: string;
  fileSize: number;
  duration: number;
  createdAt: string;
}

export interface CutItem {
  id: string;
  startTime: number;
  endTime: number;
  description: string;
  done: boolean;
}

export interface MusicItem {
  id: string;
  name: string;
  position: 'intro' | 'outro' | 'background';
  startTime: number;
  volume: number;
  done: boolean;
}

export interface EditingTask {
  id: string;
  episodeId: string;
  cuts: CutItem[];
  music: MusicItem[];
  cta: string;
  progress: number;
  status: 'pending' | 'in_progress' | 'review' | 'completed';
}

export interface ShowNote {
  id: string;
  timestamp: number;
  content: string;
  link?: string;
}

export interface Transcript {
  id: string;
  episodeId: string;
  content: string;
  showNotes: ShowNote[];
  progress: number;
}

export interface Asset {
  id: string;
  episodeId: string;
  coverUrl: string;
  images: { id: string; url: string; caption: string }[];
  designNotes: string;
}

export interface Platform {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
}

export interface Publication {
  id: string;
  episodeId: string;
  platformId: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledAt?: string;
  publishedAt?: string;
  url?: string;
}

export interface AnalyticsData {
  id: string;
  episodeId: string;
  platformId: string;
  date: string;
  plays: number;
  newSubscribers: number;
  comments: number;
  averageListenTime: number;
}

export interface Feedback {
  id: string;
  episodeId: string;
  content: string;
  source: string;
  highlighted: boolean;
  sentiment: 'positive' | 'neutral' | 'negative';
  createdAt: string;
  author?: string;
}

export interface TodoItem {
  id: string;
  title: string;
  type: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}
