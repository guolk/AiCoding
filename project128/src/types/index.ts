
export type JewelryType = 'ring' | 'necklace' | 'earring' | 'bracelet' | 'brooch' | 'watch' | 'other';
export type PhotoType = 'wear' | 'detail' | 'certificate' | 'other';
export type OccasionType = 'daily' | 'formal' | 'wedding' | 'party' | 'business';
export type CertificateType = 'GIA' | 'IGI' | 'NGTC' | 'other';
export type MaintenanceType = 'clean' | 'polish' | 'inspection' | 'other';
export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export interface Photo {
  id: string;
  url: string;
  type: PhotoType;
  description: string;
}

export interface Claim {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: ClaimStatus;
}

export interface Insurance {
  id: string;
  jewelryId: string;
  policyNumber: string;
  coverage: number;
  startDate: string;
  endDate: string;
  provider: string;
  claims: Claim[];
}

export interface Valuation {
  id: string;
  jewelryId: string;
  value: number;
  date: string;
  source: string;
  notes: string;
}

export interface Certificate {
  id: string;
  jewelryId: string;
  type: CertificateType;
  number: string;
  issueDate: string;
  issuer: string;
  imageUrl: string;
}

export interface Maintenance {
  id: string;
  jewelryId: string;
  type: MaintenanceType;
  date: string;
  method: string;
  notes: string;
  nextReminderDate?: string;
}

export interface Repair {
  id: string;
  jewelryId: string;
  description: string;
  date: string;
  cost: number;
  notes: string;
}

export interface JewelryStory {
  giver: string;
  occasion: string;
  meaning: string;
}

export interface Jewelry {
  id: string;
  name: string;
  type: JewelryType;
  material: string;
  gemstone: string;
  brand: string;
  purchaseDate: string;
  purchasePrice: number;
  purchaseChannel: string;
  story: JewelryStory;
  suitableOccasions: OccasionType[];
  photos: Photo[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  wearCount: number;
  lastWornDate?: string;
}

export interface Outfit {
  id: string;
  name: string;
  occasion: string;
  date: string;
  jewelryIds: string[];
  photoUrl: string;
  notes: string;
  wearCount: number;
  lastWornDate?: string;
}

export interface MaterialCare {
  material: string;
  tips: string[];
  warning: string;
  cleaningFrequency: string;
}

export interface Reminder {
  id: string;
  type: 'maintenance' | 'insurance' | 'valuation';
  jewelryId: string;
  jewelryName: string;
  dueDate: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface StoreState {
  jewelries: Jewelry[];
  valuations: Valuation[];
  insurances: Insurance[];
  certificates: Certificate[];
  maintenances: Maintenance[];
  repairs: Repair[];
  outfits: Outfit[];
  addJewelry: (jewelry: Omit<Jewelry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateJewelry: (id: string, jewelry: Partial<Jewelry>) => void;
  deleteJewelry: (id: string) => void;
  addValuation: (valuation: Omit<Valuation, 'id'>) => void;
  addInsurance: (insurance: Omit<Insurance, 'id'>) => void;
  addCertificate: (certificate: Omit<Certificate, 'id'>) => void;
  addMaintenance: (maintenance: Omit<Maintenance, 'id'>) => void;
  addRepair: (repair: Omit<Repair, 'id'>) => void;
  addOutfit: (outfit: Omit<Outfit, 'id'>) => void;
  updateOutfit: (id: string, outfit: Partial<Outfit>) => void;
  deleteOutfit: (id: string) => void;
  getJewelryById: (id: string) => Jewelry | undefined;
  getValuationsByJewelryId: (jewelryId: string) => Valuation[];
  getInsuranceByJewelryId: (jewelryId: string) => Insurance | undefined;
  getCertificatesByJewelryId: (jewelryId: string) => Certificate[];
  getMaintenancesByJewelryId: (jewelryId: string) => Maintenance[];
  getRepairsByJewelryId: (jewelryId: string) => Repair[];
  getReminders: () => Reminder[];
  getTotalValue: () => number;
  getWearStats: () => { jewelryId: string; name: string; count: number }[];
}
