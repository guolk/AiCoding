export type MedicineType = 'prescription' | 'otc';

export type DosageStatus = 'scheduled' | 'taken' | 'missed' | 'makeup';
export type DosageType = 'prescription' | 'otc';

export type MealRelation = 'before' | 'after' | 'any';

export type FrequencyType = 'daily' | 'weekdays' | 'weekends' | 'custom';

export interface Medicine {
  id: string;
  name: string;
  specification: string;
  indications: string;
  dosage: string;
  storageLocation: string;
  expiryDate: string;
  type: MedicineType;
  isPrescription: boolean;
  initialQuantity: number;
  currentQuantity: number;
  contraindications: {
    children: boolean;
    elderly: boolean;
    pregnancy: boolean;
    custom: string;
  };
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface DosageRecord {
  id: string;
  medicineId: string;
  medicineName: string;
  type: DosageType;
  dosage: string;
  scheduledTime: string;
  actualTime?: string;
  status: DosageStatus;
  makeupAdvice?: string;
  notes?: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  medicineId: string;
  medicineName: string;
  time: string;
  frequency: FrequencyType;
  relationToMeal: MealRelation;
  isChronic: boolean;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Supplement {
  id: string;
  name: string;
  brand: string;
  dosage: string;
  effects: string[];
  subjectiveFeedback: string;
  initialQuantity: number;
  currentQuantity: number;
  expiryDate: string;
  interactions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  id: string;
  date: string;
  hospital: string;
  doctor: string;
  department: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  nextVisitDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExamReport {
  id: string;
  recordId: string;
  examType: string;
  examDate: string;
  keyIndicators: string;
  notes: string;
  fileUrl?: string;
  createdAt: string;
}

export interface InventoryCheck {
  id: string;
  checkDate: string;
  medicineCount: number;
  expiredCount: number;
  notes: string;
  createdAt: string;
}

export interface AppState {
  medicines: Medicine[];
  dosageRecords: DosageRecord[];
  reminders: Reminder[];
  supplements: Supplement[];
  medicalRecords: MedicalRecord[];
  examReports: ExamReport[];
  inventoryChecks: InventoryCheck[];
  lastInventoryCheckDate?: string;
  inventoryCheckInterval: number;
}

export interface AppActions {
  addMedicine: (medicine: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMedicine: (id: string, updates: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  
  addDosageRecord: (record: Omit<DosageRecord, 'id' | 'createdAt'>) => void;
  updateDosageRecord: (id: string, updates: Partial<DosageRecord>) => void;
  
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  
  addSupplement: (supplement: Omit<Supplement, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSupplement: (id: string, updates: Partial<Supplement>) => void;
  deleteSupplement: (id: string) => void;
  
  addMedicalRecord: (record: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMedicalRecord: (id: string, updates: Partial<MedicalRecord>) => void;
  deleteMedicalRecord: (id: string) => void;
  
  addExamReport: (report: Omit<ExamReport, 'id' | 'createdAt'>) => void;
  deleteExamReport: (id: string) => void;
  
  addInventoryCheck: (check: Omit<InventoryCheck, 'id' | 'createdAt'>) => void;
  setInventoryCheckInterval: (days: number) => void;
  updateLastInventoryCheck: (date: string) => void;
  
  resetAll: () => void;
}
