export interface CelestialObject {
  id: string;
  name: string;
  type: 'planet' | 'star' | 'constellation' | 'galaxy' | 'nebula' | 'cluster';
  catalog?: 'Messier' | 'NGC' | 'IC';
  catalogNumber?: string;
  ra: number;
  dec: number;
  magnitude: number;
  constellation: string;
  description: string;
  observed: boolean;
  observedDates?: string[];
}

export interface PlanetPosition {
  planet: string;
  ra: number;
  dec: number;
  altitude: number;
  azimuth: number;
  magnitude: number;
  riseTime: Date;
  setTime: Date;
  visible: boolean;
}

export interface MoonPhase {
  phase: number;
  phaseName: string;
  illumination: number;
  age: number;
  riseTime: Date;
  setTime: Date;
}

export interface AstronomicalEvent {
  id: string;
  date: Date;
  type: 'meteor_shower' | 'eclipse' | 'planetary_opposition' | 'aurora' | 'conjunction' | 'other';
  name: string;
  description: string;
  peakTime?: Date;
  zenithHourlyRate?: number;
  visibility?: string;
}

export interface ObservationTarget {
  objectId: string;
  objectName: string;
  bestStartTime: Date;
  bestEndTime: Date;
  maxAltitude: number;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

export interface ObservationSession {
  id: string;
  date: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
    altitude: number;
  };
  weather: {
    condition: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
    visibility: number;
    seeing: number;
    transparency: number;
  };
  equipment: string[];
  notes: string;
  startTime: string;
  endTime: string;
}

export interface ObjectObservation {
  id: string;
  sessionId: string;
  objectId: string;
  objectName: string;
  date: string;
  success: boolean;
  quality: 1 | 2 | 3 | 4 | 5;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  description: string;
  sketchUrl?: string;
  photoUrls?: string[];
  magnification?: number;
  filter?: string;
  notes: string;
}

export interface CalendarEvent {
  id: string;
  date: string;
  type: 'astronomical' | 'personal' | 'weather';
  title: string;
  description: string;
  importance: 'high' | 'medium' | 'low';
  astronomicalEventId?: string;
}

export interface PersonalAnniversary {
  id: string;
  date: string;
  title: string;
  description: string;
  icon: string;
}

export interface WeatherForecast {
  date: string;
  condition: string;
  cloudCover: number;
  precipitation: number;
  temperature: number;
  windSpeed: number;
  visibility: number;
  seeingQuality: number;
  observingScore: number;
}

export interface Equipment {
  id: string;
  type: 'telescope' | 'eyepiece' | 'filter' | 'mount' | 'camera' | 'accessory';
  name: string;
  brand: string;
  model: string;
  purchaseDate?: string;
  price?: number;
  specifications: {
    aperture?: number;
    focalLength?: number;
    focalRatio?: string;
    eyepieceFocalLength?: number;
    apparentFieldOfView?: number;
  };
  notes: string;
  available: boolean;
}

export interface BorrowRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  borrowerName: string;
  borrowerContact: string;
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  notes: string;
  returned: boolean;
}

export interface UserLocation {
  name: string;
  latitude: number;
  longitude: number;
  altitude: number;
  timezone: string;
}

export interface MagnificationRecommendation {
  objectType: string;
  objectName: string;
  recommendedMagnifications: number[];
  eyepieces: string[];
  notes: string;
}
