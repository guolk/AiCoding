import type { Route } from './route';

export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'hot' | 'cold';
export type RoadCondition = 'dry' | 'wet' | 'sandy' | 'icy';

export interface RideRecord {
  id: string;
  routeId: string;
  route?: Route;
  userId: string;
  rideDate: string;
  weather: Weather;
  roadCondition: RoadCondition;
  avgSpeed: number;
  maxSpeed: number;
  duration: number;
  calories: number;
  feeling: string;
  notes: string;
  speedData?: { time: number; speed: number }[];
  createdAt: string;
}

export interface RecordFormData {
  routeId: string;
  rideDate: string;
  weather: Weather;
  roadCondition: RoadCondition;
  avgSpeed: number;
  maxSpeed: number;
  duration: number;
  calories: number;
  feeling: string;
  notes: string;
}

export interface BestRecords {
  fastestSpeed: number;
  longestDistance: number;
  shortestTime: number;
  mostCalories: number;
  totalRides: number;
  totalDistance: number;
  totalTime: number;
  totalCalories: number;
}

export interface CompareResult {
  records: RideRecord[];
  avgSpeedComparison: { recordId: string; value: number }[];
  durationComparison: { recordId: string; value: number }[];
  weatherComparison: { recordId: string; weather: Weather; condition: RoadCondition }[];
}

export interface RecordFilters {
  routeId?: string;
  weather?: Weather[];
  roadCondition?: RoadCondition[];
  startDate?: string;
  endDate?: string;
  sortBy?: 'rideDate' | 'avgSpeed' | 'duration';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface RecordPagination {
  records: RideRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const weatherLabels: Record<Weather, string> = {
  sunny: '晴天',
  cloudy: '多云',
  rainy: '雨天',
  windy: '大风',
  hot: '高温',
  cold: '寒冷',
};

export const weatherIcons: Record<Weather, string> = {
  sunny: 'Sun',
  cloudy: 'Cloud',
  rainy: 'CloudRain',
  windy: 'Wind',
  hot: 'Thermometer',
  cold: 'Snowflake',
};

export const roadConditionLabels: Record<RoadCondition, string> = {
  dry: '干燥',
  wet: '湿滑',
  sandy: '砂石',
  icy: '结冰',
};

export const feelingOptions = [
  '非常棒',
  '感觉很好',
  '还不错',
  '一般般',
  '有点累',
  '非常累',
];
