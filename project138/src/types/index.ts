export interface VisitPhoto {
  id: string;
  url: string;
  caption: string;
  type: 'photo' | 'sketch';
}

export interface Visit {
  id: string;
  name: string;
  location: string;
  country: string;
  date: string;
  duration: number;
  ticketPrice: number;
  rating: number;
  recommendation: string;
  type: MuseumType;
  createdAt: string;
  updatedAt: string;
  photos: VisitPhoto[];
}

export interface ExhibitionItem {
  id: string;
  name: string;
  price: number;
  photoUrl: string;
  type: 'catalog' | 'souvenir';
}

export interface ExhibitionHighlight {
  id: string;
  artifactName: string;
  note: string;
}

export interface Exhibition {
  id: string;
  visitId: string;
  name: string;
  museum: string;
  startDate: string;
  endDate: string;
  isTemporary: boolean;
  description: string;
  items: ExhibitionItem[];
  highlights: ExhibitionHighlight[];
}

export interface ReadingMaterial {
  id: string;
  title: string;
  author: string;
  status: 'unread' | 'reading' | 'read';
}

export interface LearningNote {
  id: string;
  visitId?: string;
  title: string;
  category: NoteCategory;
  content: string;
  beforeUnderstanding: string;
  afterUnderstanding: string;
  readingMaterials: ReadingMaterial[];
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  name: string;
  location: string;
  country: string;
  priority: number;
  type: MuseumType;
  category: 'global' | 'domestic';
  notes: string;
}

export interface TripPlan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  museumIds: string[];
}

export interface ExhibitionReminder {
  id: string;
  exhibitionName: string;
  museum: string;
  openDate: string;
  notes: string;
}

export type MuseumType = 'art' | 'history' | 'science' | 'nature' | 'other';
export type NoteCategory = 'event' | 'person' | 'culture' | 'other';

export const MUSEUM_TYPE_LABELS: Record<MuseumType, string> = {
  art: '艺术',
  history: '历史',
  science: '科学',
  nature: '自然',
  other: '其他',
};

export const NOTE_CATEGORY_LABELS: Record<NoteCategory, string> = {
  event: '历史事件',
  person: '历史人物',
  culture: '文化知识',
  other: '其他',
};

export const MUSEUM_TYPE_COLORS: Record<MuseumType, string> = {
  art: '#c9a96e',
  history: '#8b4513',
  science: '#4a90d9',
  nature: '#5a9e6f',
  other: '#6b7b8d',
};
