export type Category = 'work' | 'health' | 'learning' | 'relationship' | 'finance' | 'growth';
export type Priority = 'high' | 'medium' | 'low';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface QuestionAnswer {
  question: string;
  answer: string;
}

export interface DomainReview {
  category: Category;
  questions: QuestionAnswer[];
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  tags: string[];
}

export interface CustomStat {
  id: string;
  name: string;
  value: number;
}

export interface StatisticsData {
  booksRead: number;
  exerciseCount: number;
  skillsLearned: number;
  travelPlaces: number;
  moviesWatched: number;
  habitsStarted: number;
  customStats: CustomStat[];
}

export interface ReviewData {
  domains: DomainReview[];
  timeline: TimelineEvent[];
  statistics: StatisticsData;
}

export interface GratitudeItem {
  id: string;
  title: string;
  reason: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  impact: string;
  isHighlight: boolean;
}

export interface Regret {
  id: string;
  situation: string;
  lesson: string;
}

export interface GratitudeData {
  gratitudeItems: GratitudeItem[];
  achievements: Achievement[];
  regrets: Regret[];
}

export interface Obstacle {
  id: string;
  description: string;
  strategy: string;
  riskLevel: RiskLevel;
}

export interface Goal {
  id: string;
  category: Category;
  title: string;
  priority: Priority;
  actionPlan: string[];
  metrics: string;
  obstacles: Obstacle[];
}

export interface PlanData {
  goals: Goal[];
  tenYearVision: string;
}

export interface YearData {
  year: number;
  review: ReviewData;
  gratitude: GratitudeData;
  plan: PlanData;
  createdAt: string;
  updatedAt: string;
}

export type YearlyReviewData = Record<number, YearData>;

export const CATEGORY_INFO: Record<Category, { name: string; icon: string; color: string }> = {
  work: { name: '工作', icon: 'Briefcase', color: 'bg-blue-100 text-blue-700' },
  health: { name: '健康', icon: 'Heart', color: 'bg-red-100 text-red-700' },
  learning: { name: '学习', icon: 'BookOpen', color: 'bg-purple-100 text-purple-700' },
  relationship: { name: '人际关系', icon: 'Users', color: 'bg-green-100 text-green-700' },
  finance: { name: '财务', icon: 'Wallet', color: 'bg-yellow-100 text-yellow-700' },
  growth: { name: '个人成长', icon: 'TrendingUp', color: 'bg-primary-100 text-primary-700' },
};

export const CATEGORY_QUESTIONS: Record<Category, string[]> = {
  work: [
    '今年在工作上取得了哪些主要成就？',
    '遇到了哪些挑战？是如何克服的？',
    '工作技能有哪些提升？',
    '对当前的工作状态满意吗？为什么？',
    '明年希望在工作上有哪些新的突破？'
  ],
  health: [
    '今年的身体健康状况如何？',
    '有哪些良好的健康习惯养成了？',
    '运动和锻炼情况怎么样？',
    '睡眠质量和休息情况如何？',
    '明年在健康方面有什么计划？'
  ],
  learning: [
    '今年学习了哪些新的知识或技能？',
    '读了哪些印象深刻的书？',
    '有什么学习上的突破或感悟？',
    '学习过程中遇到了哪些困难？',
    '明年想要学习什么？'
  ],
  relationship: [
    '今年和家人朋友的关系如何？',
    '认识了哪些新朋友？',
    '哪些人际关系让你感到幸福？',
    '有哪些关系需要改善？',
    '明年在人际关系上有什么期望？'
  ],
  finance: [
    '今年的财务状况如何？',
    '有哪些新的收入来源？',
    '最大的支出是什么？',
    '有哪些财务方面的收获或教训？',
    '明年的财务目标是什么？'
  ],
  growth: [
    '今年在个人成长方面有哪些进步？',
    '哪些经历让你变得更成熟？',
    '对自己有了哪些新的认识？',
    '克服了哪些性格上的弱点？',
    '明年希望成为什么样的自己？'
  ]
};
