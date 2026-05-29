import { create } from 'zustand';
import {
  YearlyReviewData,
  YearData,
  Category,
  TimelineEvent,
  StatisticsData,
  GratitudeItem,
  Achievement,
  Regret,
  Goal,
} from '@/types';
import {
  loadYearlyData,
  saveYearlyData,
  createInitialYearData,
  generateId,
} from '@/utils/storage';

interface YearlyReviewState {
  data: YearlyReviewData;
  currentYear: number;
  isLoading: boolean;

  init: () => void;
  setCurrentYear: (year: number) => void;
  getCurrentYearData: () => YearData;
  
  updateReviewDomain: (category: Category, questionIndex: number, answer: string) => void;
  
  addTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => void;
  updateTimelineEvent: (id: string, updates: Partial<TimelineEvent>) => void;
  removeTimelineEvent: (id: string) => void;
  
  updateStatistics: (updates: Partial<StatisticsData>) => void;
  
  addGratitudeItem: (item: Omit<GratitudeItem, 'id'>) => void;
  updateGratitudeItem: (id: string, updates: Partial<GratitudeItem>) => void;
  removeGratitudeItem: (id: string) => void;
  
  addAchievement: (achievement: Omit<Achievement, 'id'>) => void;
  updateAchievement: (id: string, updates: Partial<Achievement>) => void;
  removeAchievement: (id: string) => void;
  
  addRegret: (regret: Omit<Regret, 'id'>) => void;
  updateRegret: (id: string, updates: Partial<Regret>) => void;
  removeRegret: (id: string) => void;
  
  addGoal: (goal: Omit<Goal, 'id'>, targetYear?: number) => void;
  updateGoal: (id: string, updates: Partial<Goal>, targetYear?: number) => void;
  removeGoal: (id: string, targetYear?: number) => void;
  
  updateTenYearVision: (vision: string) => void;
  
  importData: (data: YearlyReviewData) => void;
  clearAllData: () => void;
}

export const useYearlyReviewStore = create<YearlyReviewState>((set, get) => ({
  data: {},
  currentYear: new Date().getFullYear(),
  isLoading: true,

  init: () => {
    const data = loadYearlyData();
    set({ data, isLoading: false });
  },

  setCurrentYear: (year: number) => {
    const { data } = get();
    if (!data[year]) {
      const newData = { ...data, [year]: createInitialYearData(year) };
      saveYearlyData(newData);
      set({ data: newData, currentYear: year });
    } else {
      set({ currentYear: year });
    }
  },

  getCurrentYearData: () => {
    const { data, currentYear } = get();
    return data[currentYear] || createInitialYearData(currentYear);
  },

  updateReviewDomain: (category: Category, questionIndex: number, answer: string) => {
    const { data, currentYear } = get();
    const yearData = data[currentYear] || createInitialYearData(currentYear);
    
    const updatedDomains = yearData.review.domains.map(domain => {
      if (domain.category === category) {
        const updatedQuestions = [...domain.questions];
        updatedQuestions[questionIndex] = {
          ...updatedQuestions[questionIndex],
          answer
        };
        return { ...domain, questions: updatedQuestions };
      }
      return domain;
    });

    const updatedYearData = {
      ...yearData,
      review: { ...yearData.review, domains: updatedDomains },
      updatedAt: new Date().toISOString()
    };

    const newData = { ...data, [currentYear]: updatedYearData };
    saveYearlyData(newData);
    set({ data: newData });
  },

  addTimelineEvent: (event) => {
    const { data, currentYear } = get();
    const yearData = data[currentYear] || createInitialYearData(currentYear);
    
    const newEvent: TimelineEvent = {
      ...event,
      id: generateId()
    };

    const updatedYearData = {
      ...yearData,
      review: {
        ...yearData.review,
        timeline: [...yearData.review.timeline, newEvent].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      },
      updatedAt: new Date().toISOString()
    };

    const newData = { ...data, [currentYear]: updatedYearData };
    saveYearlyData(newData);
    set({ data: newData });
  },

  updateTimelineEvent: (id, updates) => {
    const { data, currentYear } = get();
    const yearData = data[currentYear] || createInitialYearData(currentYear);
    
    const updatedTimeline = yearData.review.timeline.map(event =>
      event.id === id ? { ...event, ...updates } : event
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const updatedYearData = {
      ...yearData,
      review: { ...yearData.review, timeline: updatedTimeline },
      updatedAt: new Date().toISOString()
    };

    const newData = { ...data, [currentYear]: updatedYearData };
    saveYearlyData(newData);
    set({ data: newData });
  },

  removeTimelineEvent: (id) => {
    const { data, currentYear } = get();
    const yearData = data[currentYear] || createInitialYearData(currentYear);
    
    const updatedTimeline = yearData.review.timeline.filter(event => event.id !== id);

    const updatedYearData = {
      ...yearData,
      review: { ...yearData.review, timeline: updatedTimeline },
      updatedAt: new Date().toISOString()
    };

    const newData = { ...data, [currentYear]: updatedYearData };
    saveYearlyData(newData);
    set({ data: newData });
  },

  updateStatistics: (updates) => {
    const { data, currentYear } = get();
    const yearData = data[currentYear] || createInitialYearData(currentYear);
    
    const updatedYearData = {
      ...yearData,
      review: {
        ...yearData.review,
        statistics: { ...yearData.review.statistics, ...updates }
      },
      updatedAt: new Date().toISOString()
    };

    const newData = { ...data, [currentYear]: updatedYearData };
    saveYearlyData(newData);
    set({ data: newData });
  },

  addGratitudeItem: (item) => {
    const { data, currentYear } = get();
    const yearData = data[currentYear] || createInitialYearData(currentYear);
    
    const newItem: GratitudeItem = { ...item, id: generateId() };

    const updatedYearData = {
      ...yearData,
      gratitude: {
        ...yearData.gratitude,
        gratitudeItems: [...yearData.gratitude.gratitudeItems, newItem]
      },
      updatedAt: new Date().toISOString()
    };

    const newData = { ...data, [currentYear]: updatedYearData };
    saveYearlyData(newData);
    set({ data: newData });
  },

  updateGratitudeItem: (id, updates) => {
    const { data, currentYear } = get();
    const yearData = data[currentYear] || createInitialYearData(currentYear);
    
    const updatedItems = yearData.gratitude.gratitudeItems.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );

    const updatedYearData = {
      ...yearData,
      gratitude: { ...yearData.gratitude, gratitudeItems: updatedItems },
      updatedAt: new Date().toISOString()
    };

    const newData = { ...data, [currentYear]: updatedYearData };
    saveYearlyData(newData);
    set({ data: newData });
  },

  removeGratitudeItem: (id) => {
    const { data, currentYear } = get();
    const yearData = data[currentYear] || createInitialYearData(currentYear);
    
    const updatedItems = yearData.gratitude.gratitudeItems.filter(item => item.id !== id);

    const updatedYearData = {
      ...yearData,
      gratitude: { ...yearData.gratitude, gratitudeItems: updatedItems },
      updatedAt: new Date().toISOString()
    };

    const newData = { ...data, [currentYear]: updatedYearData };
    saveYearlyData(newData);
    set({ data: newData });
  },

  addAchievement: (achievement) => {
    const { data, currentYear } = get();
    const yearData = data[currentYear] || createInitialYearData(currentYear);
    
    const newAchievement: Achievement = { ...achievement, id: generateId() };

    const updatedYearData = {
      ...yearData,
      gratitude: {
        ...yearData.gratitude,
        achievements: [...yearData.gratitude.achievements, newAchievement]
      },
      updatedAt: new Date().toISOString()
    };

    const newData = { ...data, [currentYear]: updatedYearData };
    saveYearlyData(newData);
    set({ data: newData });
  },

  updateAchievement: (id, updates) => {
    const { data, currentYear } = get();
    const yearData = data[currentYear] || createInitialYearData(currentYear);
    
    const updatedAchievements = yearData.gratitude.achievements.map(a =>
      a.id === id ? { ...a, ...updates } : a
    );

    const updatedYearData = {
      ...yearData,
      gratitude: { ...yearData.gratitude, achievements: updatedAchievements },
      updatedAt: new Date().toISOString()
    };

    const newData = { ...data, [currentYear]: updatedYearData };
    saveYearlyData(newData);
    set({ data: newData });
  },

  removeAchievement: (id) => {
    const { data, currentYear } = get();
    const yearData = data[currentYear] || createInitialYearData(currentYear);
    
    const updatedAchievements = yearData.gratitude.achievements.filter(a => a.id !== id);

    const updatedYearData = {
      ...yearData,
      gratitude: { ...yearData.gratitude, achievements: updatedAchievements },
      updatedAt: new Date().toISOString()
    };

    const newData = { ...data, [currentYear]: updatedYearData };
    saveYearlyData(newData);
    set({ data: newData });
  },

  addRegret: (regret) => {
    const { data, currentYear } = get();
    const yearData = data[currentYear] || createInitialYearData(currentYear);
    
    const newRegret: Regret = { ...regret, id: generateId() };

    const updatedYearData = {
      ...yearData,
      gratitude: {
        ...yearData.gratitude,
        regrets: [...yearData.gratitude.regrets, newRegret]
      },
      updatedAt: new Date().toISOString()
    };

    const newData = { ...data, [currentYear]: updatedYearData };
    saveYearlyData(newData);
    set({ data: newData });
  },

  updateRegret: (id, updates) => {
    const { data, currentYear } = get();
    const yearData = data[currentYear] || createInitialYearData(currentYear);
    
    const updatedRegrets = yearData.gratitude.regrets.map(r =>
      r.id === id ? { ...r, ...updates } : r
    );

    const updatedYearData = {
      ...yearData,
      gratitude: { ...yearData.gratitude, regrets: updatedRegrets },
      updatedAt: new Date().toISOString()
    };

    const newData = { ...data, [currentYear]: updatedYearData };
    saveYearlyData(newData);
    set({ data: newData });
  },

  removeRegret: (id) => {
    const { data, currentYear } = get();
    const yearData = data[currentYear] || createInitialYearData(currentYear);
    
    const updatedRegrets = yearData.gratitude.regrets.filter(r => r.id !== id);

    const updatedYearData = {
      ...yearData,
      gratitude: { ...yearData.gratitude, regrets: updatedRegrets },
      updatedAt: new Date().toISOString()
    };

    const newData = { ...data, [currentYear]: updatedYearData };
    saveYearlyData(newData);
    set({ data: newData });
  },

  addGoal: (goal, targetYear?) => {
    const { data, currentYear } = get();
    const year = targetYear ?? currentYear;
    const yearData = data[year] || createInitialYearData(year);
    
    const newGoal: Goal = { ...goal, id: generateId() };

    const updatedYearData = {
      ...yearData,
      plan: {
        ...yearData.plan,
        goals: [...yearData.plan.goals, newGoal]
      },
      updatedAt: new Date().toISOString()
    };

    const newData = { ...data, [year]: updatedYearData };
    saveYearlyData(newData);
    set({ data: newData });
  },

  updateGoal: (id, updates, targetYear?) => {
    const { data, currentYear } = get();
    const year = targetYear ?? currentYear;
    const yearData = data[year] || createInitialYearData(year);
    
    const updatedGoals = yearData.plan.goals.map(g =>
      g.id === id ? { ...g, ...updates } : g
    );

    const updatedYearData = {
      ...yearData,
      plan: { ...yearData.plan, goals: updatedGoals },
      updatedAt: new Date().toISOString()
    };

    const newData = { ...data, [year]: updatedYearData };
    saveYearlyData(newData);
    set({ data: newData });
  },

  removeGoal: (id, targetYear?) => {
    const { data, currentYear } = get();
    const year = targetYear ?? currentYear;
    const yearData = data[year] || createInitialYearData(year);
    
    const updatedGoals = yearData.plan.goals.filter(g => g.id !== id);

    const updatedYearData = {
      ...yearData,
      plan: { ...yearData.plan, goals: updatedGoals },
      updatedAt: new Date().toISOString()
    };

    const newData = { ...data, [year]: updatedYearData };
    saveYearlyData(newData);
    set({ data: newData });
  },

  updateTenYearVision: (vision) => {
    const { data, currentYear } = get();
    const yearData = data[currentYear] || createInitialYearData(currentYear);
    
    const updatedYearData = {
      ...yearData,
      plan: { ...yearData.plan, tenYearVision: vision },
      updatedAt: new Date().toISOString()
    };

    const newData = { ...data, [currentYear]: updatedYearData };
    saveYearlyData(newData);
    set({ data: newData });
  },

  importData: (data) => {
    saveYearlyData(data);
    set({ data });
  },

  clearAllData: () => {
    saveYearlyData({});
    set({ data: {} });
  }
}));
