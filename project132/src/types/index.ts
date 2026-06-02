export interface Ride {
  id: string;
  date: string;
  routeName: string;
  distance: number;
  duration: number;
  weather: string;
  ridingBuddies: string;
  roadCondition: string;
  notes: string;
  gpxData?: string;
  photos: string[];
  createdAt: string;
}

export interface RouteItem {
  id: string;
  name: string;
  distance: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  highlights: string;
  gasStations: { name: string; location: string }[];
  recommendation: string;
  bestSeason: string;
  isShared: boolean;
  createdAt: string;
}

export interface Modification {
  id: string;
  name: string;
  date: string;
  cost: number;
  notes: string;
}

export interface Motorcycle {
  id: string;
  brand: string;
  model: string;
  year: number;
  displacement: number;
  vin: string;
  purchaseDate: string;
  currentMileage: number;
  insuranceExpiry: string;
  inspectionExpiry: string;
  modifications: Modification[];
}

export interface Maintenance {
  id: string;
  type: 'oil' | 'brake' | 'tire' | 'chain' | 'other';
  date: string;
  mileage: number;
  description: string;
  cost: number;
  notes: string;
}

export interface Reminder {
  id: string;
  type: string;
  nextMileage: number;
  isActive: boolean;
}

export interface Fault {
  id: string;
  description: string;
  date: string;
  solution: string;
  cost: number;
}

export interface Gear {
  id: string;
  category: 'helmet' | 'jacket' | 'gloves' | 'pants' | 'boots' | 'protection' | 'other';
  brand: string;
  model: string;
  purchaseDate: string;
  status: 'new' | 'good' | 'worn' | 'replace';
  notes: string;
}
