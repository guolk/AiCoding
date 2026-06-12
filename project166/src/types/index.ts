export interface City {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  flag: string;
  internetScore: number;
  coworkingSpaces: number;
  costOfLiving: number;
  visaFriendliness: number;
  climate: string;
  timezone: string;
  overallScore: number;
  tags: string[];
  description: string;
  bestFor: string[];
  monthlyCostUsd: number;
  avgInternetMbps: number;
}

export interface TravelRecord {
  id: string;
  cityId: string;
  startDate: string;
  endDate: string;
  accommodationCost: number;
  bestWorkspace: string;
  communityActivities: string;
  satisfaction: number;
  notes?: string;
}

export interface WorkEfficiency {
  id: string;
  travelRecordId: string;
  cityId: string;
  weekLabel: string;
  tasksCompleted: number;
  focusHours: number;
}

export interface Migration {
  id: string;
  fromCityId: string;
  toCityId: string;
  date: string;
  transportType: 'flight' | 'train' | 'bus' | 'car' | 'other';
  cost: number;
  costCurrency: string;
  durationHours: number;
  notes?: string;
}

export type WorkspaceType = 'cafe' | 'coworking' | 'library' | 'other';

export interface Workspace {
  id: string;
  cityId: string;
  name: string;
  type: WorkspaceType;
  internetSpeed: number;
  noiseLevel: number;
  priceLevel: number;
  workFriendly: number;
  notes: string;
  address?: string;
}

export type VisaType = 'digital-nomad' | 'tourist' | 'business' | 'student' | 'other';

export interface VisaRecord {
  id: string;
  country: string;
  countryCode: string;
  visaType: VisaType;
  issueDate: string;
  expiryDate: string;
  maxStayDays: number;
  notes: string;
  requirements?: string;
}

export type BorderDirection = 'entry' | 'exit';

export interface BorderRecord {
  id: string;
  country: string;
  countryCode: string;
  direction: BorderDirection;
  date: string;
  notes?: string;
}

export type TxType = 'income' | 'expense';

export interface FinanceTx {
  id: string;
  date: string;
  type: TxType;
  amount: number;
  currency: string;
  category: string;
  cityId?: string;
  notes: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  usdRate: number;
  flag: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  category: 'hardware' | 'network' | 'software' | 'documents' | 'other';
  checked: boolean;
}
