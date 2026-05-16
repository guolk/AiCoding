export type BookStatus = 'want_to_read' | 'reading' | 'read' | 'abandoned';

export interface Book {
  id: string;
  isbn?: string;
  title: string;
  author?: string;
  publisher?: string;
  publishedDate?: string;
  description?: string;
  coverUrl?: string;
  pageCount?: number;
  status: BookStatus;
  readCount: number;
  currentPage: number;
  createdAt: string;
  updatedAt: string;
  tags?: Tag[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface ReadingSession {
  id: string;
  bookId: string;
  startTime: string;
  endTime?: string;
  startPage: number;
  endPage?: number;
  pagesRead: number;
  duration: number;
}

export type NoteType = 'highlight' | 'note';

export interface Note {
  id: string;
  bookId: string;
  type: NoteType;
  content: string;
  pageNumber?: number;
  chapter?: string;
  createdAt: string;
  updatedAt: string;
  topics?: string[];
}

export interface ReadingList {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  shareToken?: string;
  createdAt: string;
  updatedAt: string;
  books?: Book[];
}

export interface ReadHistory {
  id: string;
  bookId: string;
  completedDate?: string;
  rating?: number;
  review?: string;
}

export interface ReadingStats {
  totalBooks: number;
  totalPages: number;
  booksByStatus: Record<BookStatus, number>;
  averageReadingSpeed: number;
  currentStreak: number;
  longestStreak: number;
  favoriteTags: { tag: string; count: number }[];
}

export interface AnnualReport {
  year: number;
  totalBooksRead: number;
  totalPagesRead: number;
  totalReadingHours: number;
  favoriteGenre: string;
  longestStreak: number;
  averageRating: number;
  monthlyBreakdown: { month: number; books: number; pages: number }[];
  topBooks: { book: Book; rating?: number }[];
}
