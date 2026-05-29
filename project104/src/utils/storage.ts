import {
  YearlyReviewData,
  YearData,
  ReviewData,
  GratitudeData,
  PlanData,
  Category,
  CATEGORY_QUESTIONS,
} from '@/types';

const STORAGE_KEY = 'yearly_review_data';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function createInitialReviewData(): ReviewData {
  const categories: Category[] = ['work', 'health', 'learning', 'relationship', 'finance', 'growth'];
  return {
    domains: categories.map(category => ({
      category,
      questions: CATEGORY_QUESTIONS[category].map(question => ({
        question,
        answer: ''
      }))
    })),
    timeline: [],
    statistics: {
      booksRead: 0,
      exerciseCount: 0,
      skillsLearned: 0,
      travelPlaces: 0,
      moviesWatched: 0,
      habitsStarted: 0,
      customStats: []
    }
  };
}

function createInitialGratitudeData(): GratitudeData {
  return {
    gratitudeItems: [],
    achievements: [],
    regrets: []
  };
}

function createInitialPlanData(): PlanData {
  return {
    goals: [],
    tenYearVision: ''
  };
}

export function createInitialYearData(year: number): YearData {
  const now = new Date().toISOString();
  return {
    year,
    review: createInitialReviewData(),
    gratitude: createInitialGratitudeData(),
    plan: createInitialPlanData(),
    createdAt: now,
    updatedAt: now
  };
}

export function loadYearlyData(): YearlyReviewData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load yearly data:', e);
  }
  return {};
}

export function saveYearlyData(data: YearlyReviewData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save yearly data:', e);
  }
}

export function getYearData(year: number): YearData {
  const allData = loadYearlyData();
  if (allData[year]) {
    return allData[year];
  }
  return createInitialYearData(year);
}

export function saveYearData(year: number, data: YearData): void {
  const allData = loadYearlyData();
  allData[year] = {
    ...data,
    updatedAt: new Date().toISOString()
  };
  saveYearlyData(allData);
}

export function getAvailableYears(): number[] {
  const data = loadYearlyData();
  const years = Object.keys(data).map(Number).sort((a, b) => b - a);
  return years;
}
