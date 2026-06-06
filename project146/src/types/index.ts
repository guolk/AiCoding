export interface Boat {
  id: string;
  name: string;
  type: string;
  length: number;
  displacement: number;
  engine: string;
  equipment: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Maintenance {
  id: string;
  boatId: string;
  category: 'engine' | 'sails' | 'rigging' | 'safety' | 'other';
  description: string;
  date: string;
  cost: number;
  notes: string;
}

export interface Certificate {
  id: string;
  boatId: string;
  name: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
}

export interface GpsPoint {
  id: string;
  voyageId: string;
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: string;
}

export interface Event {
  id: string;
  voyageId: string;
  type: 'weather' | 'equipment' | 'wildlife' | 'other';
  description: string;
  timestamp: string;
  latitude: number;
  longitude: number;
}

export interface WeatherRecord {
  id: string;
  voyageId: string;
  actualWindSpeed: number;
  actualWindDirection: string;
  actualWaveHeight: number;
  date: string;
}

export interface Voyage {
  id: string;
  boatId: string;
  departureTime: string;
  arrivalTime?: string;
  destination: string;
  startPoint: string;
  distance: number;
  duration: number;
  weatherConditions: string;
  windSpeed: number;
  windDirection: string;
  notes: string;
  createdAt: string;
  gpsPoints?: GpsPoint[];
  events?: Event[];
  weatherRecord?: WeatherRecord;
}

export interface ForecastDay {
  id: string;
  forecastId: string;
  date: string;
  windSpeed: number;
  windDirection: string;
  waveHeight: number;
  tide: number;
  precipitation: number;
}

export interface WeatherForecast {
  id: string;
  forecastDate: string;
  location: string;
  days: ForecastDay[];
}

export interface Waypoint {
  id: string;
  planId: string;
  name: string;
  latitude: number;
  longitude: number;
  eta?: string;
  order: number;
  notes?: string;
}

export interface SupplyItem {
  id: string;
  planId: string;
  name: string;
  quantity: number;
  unit: string;
  category: 'fuel' | 'water' | 'food' | 'parts' | 'safety' | 'other';
  purchased?: boolean;
}

export interface RiskAssessment {
  id: string;
  planId: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: 'low' | 'medium' | 'high';
  mitigation: string;
}

export interface VoyagePlan {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'planned' | 'in-progress' | 'completed' | 'cancelled';
  boatId: string;
  description: string;
  waypoints: Waypoint[];
  supplyItems: SupplyItem[];
  riskAssessments: RiskAssessment[];
  createdAt: string;
}

export interface SeasonalWeather {
  month: number;
  region: string;
  avgWindSpeed: number;
  predominantWind: string;
  avgWaveHeight: number;
  bestFor: string;
  rating: number;
}

export type WindDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export interface Statistics {
  totalVoyages: number;
  totalDistance: number;
  totalHours: number;
  avgSpeed: number;
  boatsCount: number;
  activePlans: number;
}
