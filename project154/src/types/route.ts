export type RouteType = 'commute' | 'leisure' | 'race';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';
export type SurfaceType = 'asphalt' | 'concrete' | 'gravel' | 'mixed';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface SeasonRating {
  season: Season;
  rating: number;
  description: string;
}

export interface RouteStats {
  totalReviews: number;
  avgSurfaceScore: number;
  avgSafetyScore: number;
  avgExperienceScore: number;
  avgOverallRating: number;
  totalRides: number;
}

export interface Route {
  id: string;
  creatorId: string;
  name: string;
  startPoint: string;
  endPoint: string;
  distance: number;
  elevation: number;
  surfaceType: SurfaceType;
  difficulty: Difficulty;
  type: RouteType;
  description: string;
  scenery: string;
  facilities: string;
  notes: string;
  seasonRatings: SeasonRating[];
  coordinates: [number, number][];
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  stats: RouteStats;
  isFavorite?: boolean;
}

export interface RouteFilters {
  type?: RouteType[];
  difficulty?: Difficulty[];
  surfaceType?: SurfaceType[];
  season?: Season;
  minDistance?: number;
  maxDistance?: number;
  minElevation?: number;
  maxElevation?: number;
  search?: string;
  sortBy?: 'rating' | 'distance' | 'difficulty' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface RoutePagination {
  routes: Route[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const routeTypeLabels: Record<RouteType, string> = {
  commute: '通勤',
  leisure: '休闲',
  race: '竞技',
};

export const difficultyLabels: Record<Difficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
  extreme: '极限',
};

export const surfaceTypeLabels: Record<SurfaceType, string> = {
  asphalt: '沥青路',
  concrete: '水泥路',
  gravel: '砂石路',
  mixed: '混合路面',
};

export const seasonLabels: Record<Season, string> = {
  spring: '春季',
  summer: '夏季',
  autumn: '秋季',
  winter: '冬季',
};
