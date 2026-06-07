import type { User } from './user';

export interface SurfaceScore {
  pothole: number;
  bikeLane: number;
  traffic: number;
}

export interface SafetyScore {
  intersection: number;
  lighting: number;
}

export interface ExperienceScore {
  scenery: number;
  challenge: number;
  enjoyment: number;
}

export interface SegmentRating {
  segmentIndex: number;
  segmentName: string;
  potholeScore: number;
  bikeLaneScore: number;
  trafficScore: number;
  intersectionScore: number;
  lightingScore: number;
}

export interface Review {
  id: string;
  routeId: string;
  userId: string;
  user: User;
  overallRating: number;
  surfaceScore: SurfaceScore;
  safetyScore: SafetyScore;
  experienceScore: ExperienceScore;
  segmentRatings: SegmentRating[];
  comment: string;
  likes: number;
  isLiked?: boolean;
  createdAt: string;
}

export interface ReviewFormData {
  routeId: string;
  surfaceScore: SurfaceScore;
  safetyScore: SafetyScore;
  experienceScore: ExperienceScore;
  segmentRatings: SegmentRating[];
  comment: string;
}

export interface ReviewFilters {
  routeId?: string;
  userId?: string;
  minRating?: number;
  maxRating?: number;
  sortBy?: 'rating' | 'createdAt' | 'likes';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ReviewPagination {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

export const scoreLabels: Record<string, string> = {
  pothole: '坑洼程度',
  bikeLane: '专用自行车道',
  traffic: '机动车干扰',
  intersection: '路口危险程度',
  lighting: '夜间光照条件',
  scenery: '风景指数',
  challenge: '挑战性',
  enjoyment: '愉悦感',
};

export const scoreDescriptions: Record<string, string[]> = {
  pothole: ['非常平整', '基本平整', '少量坑洼', '较多坑洼', '严重坑洼'],
  bikeLane: ['全程专用道', '大部分有专用道', '部分有专用道', '很少专用道', '无专用道'],
  traffic: ['无机动车', '少量机动车', '中等车流量', '车流量大', '车流量极大'],
  intersection: ['无复杂路口', '少量简单路口', '中等复杂路口', '较多复杂路口', '路况极复杂'],
  lighting: ['全程照明充足', '大部分有照明', '部分有照明', '很少照明', '无照明'],
  scenery: ['风景一般', '风景尚可', '风景不错', '风景优美', '风景绝美'],
  challenge: ['非常轻松', '较为轻松', '中等强度', '较有挑战', '极具挑战'],
  enjoyment: ['体验一般', '体验尚可', '体验不错', '体验很好', '体验极佳'],
};
