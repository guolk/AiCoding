export interface Publication {
  id: string;
  title: string;
  type: 'book' | 'ebook' | 'column' | 'report';
  coverImage: string;
  publishDate: string;
  description: string;
  isbn?: string;
  price: number;
  contract?: CopyrightContract;
}

export interface CopyrightContract {
  id: string;
  publicationId: string;
  royaltyRate: number;
  startDate: string;
  endDate: string;
  publisher: string;
  status: 'active' | 'expired' | 'negotiating';
}

export interface SalesRecord {
  id: string;
  publicationId: string;
  channel: string;
  quantity: number;
  revenue: number;
  date: string;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  type: 'discount' | 'media' | 'launch' | 'other';
  startDate: string;
  endDate: string;
  description: string;
  impact: { before: number; after: number };
}

export interface ReaderFeedback {
  id: string;
  readerId: string;
  category: 'praise' | 'criticism' | 'question' | 'suggestion';
  content: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
  resolved: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export interface Reader {
  id: string;
  name: string;
  email: string;
  avatar: string;
  tags: string[];
  interactionCount: number;
  lastContactDate: string;
  notes: string;
}

export interface CreativeProject {
  id: string;
  title: string;
  status: 'planning' | 'writing' | 'editing' | 'published';
  targetDate: string;
  progress: number;
  outline: string;
  targetAudience: string;
  marketResearch: string;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  title: string;
  status: 'todo' | 'writing' | 'editing' | 'done';
  wordCount: number;
}

export interface Partner {
  id: string;
  name: string;
  company: string;
  role: string;
  email: string;
  phone: string;
  status: 'negotiating' | 'contracted' | 'completed';
  notes: string;
}

export interface Excerpt {
  id: string;
  publicationId: string;
  title: string;
  content: string;
  publishDate: string;
  platform: string;
  views: number;
}

export interface MediaInterview {
  id: string;
  title: string;
  mediaName: string;
  date: string;
  url: string;
  influenceRating: number;
}

export interface BookReview {
  id: string;
  publicationId: string;
  source: string;
  rating: number;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  date: string;
}
