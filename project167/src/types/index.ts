export type QualityFlag = 'normal' | 'out_of_range' | 'suspect' | 'missing';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Observation {
  id: string;
  datetime: string;
  temperature: number | null;
  humidity: number | null;
  pressure: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  precipitation: number | null;
  visibility: number | null;
  instrumentId: string;
  qualityFlag: QualityFlag;
  reviewStatus: ReviewStatus;
  remark?: string;
}

export interface Instrument {
  id: string;
  name: string;
  type: string;
  model: string;
  serialNumber: string;
  calibrationDate: string;
  nextCalibrationDate: string;
  tempError: number;
  humidityError: number;
  pressureError: number;
  windSpeedError: number;
  precipitationError: number;
  isActive: boolean;
}

export interface QualityRanges {
  temperature: { min: number; max: number };
  humidity: { min: number; max: number };
  pressure: { min: number; max: number };
  windSpeed: { min: number; max: number };
  precipitation: { min: number; max: number };
  visibility: { min: number; max: number };
}

export interface MonthlyStats {
  year: number;
  month: number;
  avgTemperature: number;
  avgHumidity: number;
  avgPressure: number;
  avgWindSpeed: number;
  totalPrecipitation: number;
  maxTemperature: number;
  minTemperature: number;
  avgVisibility: number;
  observationCount: number;
}

export interface YearlyStats {
  year: number;
  avgTemperature: number;
  avgHumidity: number;
  avgPressure: number;
  avgWindSpeed: number;
  totalPrecipitation: number;
  maxTemperature: number;
  minTemperature: number;
  avgVisibility: number;
  observationCount: number;
  monthlyStats: MonthlyStats[];
}

export type SeasonName = 'spring' | 'summer' | 'autumn' | 'winter';

export interface SeasonTransition {
  season: SeasonName;
  date: string;
  pentadMeanTemp: number;
  temperatures: number[];
}

export interface TrendResult {
  slope: number;
  intercept: number;
  rSquared: number;
  trendPerDecade: number;
  pValue?: number;
}

export interface WindRoseSpeedRange {
  range: string;
  min: number;
  max: number;
  frequency: number;
}

export interface WindRoseDatum {
  direction: string;
  angle: number;
  frequency: number;
  speedRanges: WindRoseSpeedRange[];
}

export interface WindRoseData {
  totalObservations: number;
  calmCount: number;
  calmFrequency: number;
  directions: WindRoseDatum[];
}

export interface ClimateExtremes {
  maxTemperature: { value: number; datetime: string };
  minTemperature: { value: number; datetime: string };
  maxPrecipitation: { value: number; datetime: string };
  maxWindSpeed: { value: number; datetime: string };
  minVisibility: { value: number; datetime: string };
}

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  flaggedFields: string[];
}

export interface ClimateAnomaly {
  year: number;
  month: number;
  value: number;
  baseline: number;
  anomaly: number;
  anomalyPercent: number;
}

export interface ClimateNormal {
  month: number;
  avgTemperature: number;
  avgHighTemp: number;
  avgLowTemp: number;
  avgHumidity: number;
  avgPressure: number;
  totalPrecipitation: number;
  avgVisibility: number;
  years: number[];
}

export interface ParsedCSV {
  headers: string[];
  rows: Observation[];
  errors: string[];
  warnings: string[];
}

export type ElementKey = 'temperature' | 'humidity' | 'pressure' | 'windSpeed' | 'precipitation' | 'visibility';

export const ELEMENT_LABELS: Record<ElementKey, string> = {
  temperature: '气温',
  humidity: '湿度',
  pressure: '气压',
  windSpeed: '风速',
  precipitation: '降水量',
  visibility: '能见度',
};

export const ELEMENT_UNITS: Record<ElementKey, string> = {
  temperature: '°C',
  humidity: '%',
  pressure: 'hPa',
  windSpeed: 'm/s',
  precipitation: 'mm',
  visibility: 'km',
};

export const WIND_DIRECTIONS = [
  { code: 'N', name: '北', angle: 0 },
  { code: 'NNE', name: '北东北', angle: 22.5 },
  { code: 'NE', name: '东北', angle: 45 },
  { code: 'ENE', name: '东东北', angle: 67.5 },
  { code: 'E', name: '东', angle: 90 },
  { code: 'ESE', name: '东东南', angle: 112.5 },
  { code: 'SE', name: '东南', angle: 135 },
  { code: 'SSE', name: '南东南', angle: 157.5 },
  { code: 'S', name: '南', angle: 180 },
  { code: 'SSW', name: '南西南', angle: 202.5 },
  { code: 'SW', name: '西南', angle: 225 },
  { code: 'WSW', name: '西西南', angle: 247.5 },
  { code: 'W', name: '西', angle: 270 },
  { code: 'WNW', name: '西西北', angle: 292.5 },
  { code: 'NW', name: '西北', angle: 315 },
  { code: 'NNW', name: '北西北', angle: 337.5 },
];
