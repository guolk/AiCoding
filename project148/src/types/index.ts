export interface Aquarium {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  volume: number;
  filterType: string;
  lighting: string;
  substrate: string;
  aquascapeStyle: string;
  setupDate: string;
  status: 'running' | 'cycling' | 'offline';
  coverImage?: string;
}

export interface WaterTest {
  id: string;
  tankId: string;
  testDate: string;
  ph: number;
  ammonia: number;
  nitrite: number;
  nitrate: number;
  gh: number;
  kh: number;
  notes?: string;
}

export interface Plant {
  id: string;
  tankId: string;
  name: string;
  scientificName?: string;
  quantity: number;
  addDate: string;
  source?: string;
  status: 'healthy' | 'growing' | 'melting' | 'dead';
}

export interface Fish {
  id: string;
  tankId: string;
  name: string;
  scientificName?: string;
  quantity: number;
  addDate: string;
  source?: string;
  status: 'healthy' | 'observing' | 'sick' | 'dead';
}

export interface Photo {
  id: string;
  tankId: string;
  url: string;
  date: string;
  notes?: string;
}

export interface WaterChange {
  id: string;
  tankId: string;
  date: string;
  amount: number;
  waterSource: string;
  notes?: string;
}

export interface Fertilization {
  id: string;
  tankId: string;
  date: string;
  fertilizerType: string;
  dosage: number;
  notes?: string;
}

export interface CO2Log {
  id: string;
  tankId: string;
  date: string;
  bubblesPerSecond: number;
  durationHours: number;
  effect: string;
  notes?: string;
}

export interface EquipmentMaintenance {
  id: string;
  tankId: string;
  date: string;
  equipment: string;
  action: string;
  notes?: string;
}

export type TreatmentStage = 'detection' | 'analysis' | 'action' | 'verification';

export interface TreatmentStep {
  id: string;
  stage: TreatmentStage;
  content: string;
  date: string;
  result?: string;
}

export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical';
export type AnomalyStatus = 'detected' | 'analyzing' | 'treating' | 'verified' | 'resolved';

export interface Anomaly {
  id: string;
  tankId: string;
  detectDate: string;
  description: string;
  severity: AnomalySeverity;
  status: AnomalyStatus;
  steps: TreatmentStep[];
}

export type GrowthEventType = 'new_leaf' | 'propagation' | 'flowering' | 'melting' | 'pruning';

export interface GrowthLog {
  id: string;
  plantId: string;
  date: string;
  eventType: GrowthEventType;
  description: string;
}

export type DiseaseResult = 'recovered' | 'ongoing' | 'deceased';

export interface DiseaseRecord {
  id: string;
  fishId: string;
  detectDate: string;
  symptoms: string;
  diagnosis: string;
  medication: string;
  recoverDate?: string;
  result: DiseaseResult;
}

export interface BreedingRecord {
  id: string;
  fishId: string;
  spawnDate: string;
  eggCount: number;
  hatchDays: number;
  fryCount: number;
  survivalCount: number;
  notes?: string;
}

export interface AppState {
  aquariums: Aquarium[];
  waterTests: WaterTest[];
  plants: Plant[];
  fishes: Fish[];
  photos: Photo[];
  waterChanges: WaterChange[];
  fertilizations: Fertilization[];
  co2Logs: CO2Log[];
  equipmentMaintenances: EquipmentMaintenance[];
  anomalies: Anomaly[];
  growthLogs: GrowthLog[];
  diseaseRecords: DiseaseRecord[];
  breedingRecords: BreedingRecord[];
}
