export type PlotStatus = 'available' | 'adopted' | 'pending';
export type CareType = 'water' | 'fertilize' | 'prune' | 'other';
export type QualityLevel = 'excellent' | 'good' | 'fair' | 'poor';
export type TaskType = 'lawn_maint' | 'watering' | 'cleanup' | 'other';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type ForumCategory = 'fertilizer' | 'pest' | 'tips' | 'general';
export type SharingStatus = 'available' | 'pending_pickup' | 'taken';
export type ToolStatus = 'available' | 'borrowed' | 'maintenance';
export type InventoryType = 'fertilizer' | 'seed';
export type ExpenseType = 'water' | 'electric';
export type ExpenseStatus = 'pending' | 'partial' | 'paid';
export type SplitMethod = 'equal' | 'by_area';

export interface RotationRecord {
  id: string;
  season: string;
  year: number;
  crop: string;
  notes: string;
}

export interface PlotAdopter {
  name: string;
  userId: string;
  startDate: string;
  endDate: string;
}

export interface Plot {
  id: string;
  name: string;
  area: number;
  coordinates: { x: number; y: number; width: number; height: number };
  status: PlotStatus;
  adopter?: PlotAdopter;
  currentCrop?: string;
  rotationHistory: RotationRecord[];
}

export interface CareRecord {
  id: string;
  date: string;
  type: CareType;
  notes: string;
}

export interface PhotoRecord {
  id: string;
  date: string;
  url: string;
  caption: string;
}

export interface HarvestRecord {
  id: string;
  date: string;
  quantity: number;
  unit: string;
  quality: QualityLevel;
  notes: string;
}

export interface PlantingLog {
  id: string;
  plotId: string;
  plotName: string;
  seedDate: string;
  variety: string;
  density: number;
  cropType: string;
  careRecords: CareRecord[];
  photos: PhotoRecord[];
  harvests: HarvestRecord[];
}

export interface VolunteerTask {
  id: string;
  title: string;
  type: TaskType;
  assignedTo: string[];
  date: string;
  time: string;
  location: string;
  status: TaskStatus;
  description: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  category: ForumCategory;
  likes: number;
  comments: Comment[];
  createdAt: string;
}

export interface SharingPost {
  id: string;
  crop: string;
  quantity: number;
  unit: string;
  author: string;
  pickupLocation: string;
  status: SharingStatus;
  createdAt: string;
  description?: string;
}

export interface BorrowRecord {
  id: string;
  userId: string;
  userName: string;
  borrowDate: string;
  returnDate?: string;
  expectedReturn: string;
}

export interface Tool {
  id: string;
  name: string;
  type: string;
  status: ToolStatus;
  borrowHistory: BorrowRecord[];
  currentBorrower?: BorrowRecord;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: InventoryType;
  quantity: number;
  unit: string;
  lowThreshold: number;
  lastUpdated: string;
}

export interface ShareItem {
  userId: string;
  userName: string;
  amount: number;
  paid: boolean;
}

export interface ExpenseRecord {
  id: string;
  type: ExpenseType;
  period: string;
  totalAmount: number;
  splitMethod: SplitMethod;
  individualShares: ShareItem[];
  status: ExpenseStatus;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
