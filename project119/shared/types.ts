export interface Paper {
  id: string;
  title: string;
  journal: string;
  publicationDate: string;
  doi: string;
  authors: string;
  field: string;
  currentCitations: number;
  createdAt: string;
  updatedAt: string;
}

export interface CitationRecord {
  id: string;
  paperId: string;
  citingPaperTitle: string;
  citingAuthors: string;
  citingJournal: string;
  citingYear: number;
  citationContext: string;
  category: 'positive' | 'critical' | 'method' | 'background' | 'other';
  citedDate: string;
}

export interface CitationHistory {
  id: string;
  paperId: string;
  year: number;
  month: number;
  citations: number;
}

export interface SocialMention {
  id: string;
  paperId: string;
  platform: 'twitter' | 'facebook' | 'reddit' | 'linkedin' | 'blog' | 'news';
  author: string;
  content: string;
  url: string;
  engagement: number;
  postedDate: string;
}

export interface DownloadData {
  id: string;
  paperId: string;
  year: number;
  month: number;
  downloads: number;
}

export interface ApplicationCase {
  id: string;
  paperId: string;
  title: string;
  description: string;
  type: 'product' | 'policy' | 'patent' | 'industry' | 'education' | 'other';
  url: string;
  source: string;
  date: string;
  createdAt: string;
}

export interface ImpactMetrics {
  hIndex: number;
  totalCitations: number;
  averageCitationsPerPaper: number;
  mostCitedPaper: Paper | null;
  percentileRanking: number;
}

export interface ComparisonData {
  userHIndex: number;
  fieldMedian: number;
  field75Percentile: number;
  field90Percentile: number;
  userPercentile: number;
}
