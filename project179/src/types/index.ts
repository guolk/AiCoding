export interface MonitoringSite {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  ecosystemType: string;
  description: string;
  establishmentDate: string;
  photos: PhotoRecord[];
  historyEvents: HistoryEvent[];
  createdAt: string;
}

export interface PhotoRecord {
  id: string;
  url: string;
  date: string;
  description: string;
}

export interface HistoryEvent {
  id: string;
  date: string;
  event: string;
}

export interface SpeciesRecord {
  id: string;
  name: string;
  taxonomy: string;
  count: number;
  location: string;
  behavior: string;
  isInvasive: boolean;
  spreadRange: string;
  photos: string[];
  audios: string[];
  date: string;
  siteId: string;
  createdAt: string;
}

export interface EnvironmentalParam {
  id: string;
  siteId: string;
  date: string;
  soilTemperature: number;
  soilMoisture: number;
  waterPH: number;
  waterTemperature: number;
  waterTransparency: number;
  instrument: string;
  calibrationMethod: string;
  measureTime: string;
  isAbnormal: boolean;
  abnormalNote: string;
  createdAt: string;
}

export interface DiversityIndex {
  id: string;
  siteId: string;
  date: string;
  shannonIndex: number;
  simpsonIndex: number;
  speciesCount: number;
  totalIndividuals: number;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface CorrelationPoint {
  x: number;
  y: number;
  date: string;
}

export type TabType = 'info' | 'photos' | 'history';
export type AnalysisTabType = 'diversity' | 'population' | 'correlation';
