export type EventType = 'wedding' | 'birthday' | 'babyShower' | 'other';
export type EventStatus = 'planning' | 'inProgress' | 'completed' | 'cancelled';
export type RSVPStatus = 'pending' | 'confirmed' | 'declined' | 'maybe';
export type InvitationStatus = 'draft' | 'sent' | 'delivered' | 'opened' | 'responded';
export type ContractStatus = 'draft' | 'pending' | 'signed' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type ThankYouStatus = 'pending' | 'sent' | 'completed';
export type TableShape = 'round' | 'square' | 'rectangle';
export type GiftType = 'cash' | 'gift' | 'check' | 'bankTransfer';
export type BudgetCategoryName = '服装' | '场地' | '餐饮' | '摄影' | '鲜花' | '布置' | '其他';

export interface Event {
  id: string;
  type: EventType;
  title: string;
  theme: string;
  style: string;
  description: string;
  date: string;
  location: string;
  address: string;
  estimatedGuests: number;
  totalBudget: number;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PlanVersion {
  id: string;
  eventId: string;
  name: string;
  content: string;
  notes: string;
  status: 'draft' | 'review' | 'approved' | 'archived';
  createdAt: string;
  createdBy: string;
}

export interface ScheduleItem {
  id: string;
  eventId: string;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  responsible: string;
  order: number;
  category: 'ceremony' | 'banquet' | 'performance' | 'preparation' | 'other';
}

export interface Guest {
  id: string;
  eventId: string;
  name: string;
  relation: string;
  phone: string;
  email: string;
  dietaryRestrictions: string;
  tableId: string | null;
  seatNumber: number | null;
  rsvpStatus: RSVPStatus;
  plusOne: boolean;
  plusOneName: string;
  notes: string;
  group: string;
}

export interface Table {
  id: string;
  eventId: string;
  name: string;
  capacity: number;
  shape: TableShape;
  x: number;
  y: number;
  notes: string;
}

export interface Invitation {
  id: string;
  guestId: string;
  eventId: string;
  status: InvitationStatus;
  sentAt: string | null;
  respondedAt: string | null;
  responseNotes: string;
  method: 'email' | 'paper' | 'wechat' | 'phone' | 'other';
  template: string;
}

export interface Vendor {
  id: string;
  eventId: string;
  category: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  notes: string;
}

export interface VendorQuote {
  id: string;
  vendorId: string;
  eventId: string;
  price: number;
  description: string;
  validUntil: string;
  isSelected: boolean;
  createdAt: string;
}

export interface Contract {
  id: string;
  vendorId: string;
  eventId: string;
  title: string;
  status: ContractStatus;
  amount: number;
  signedDate: string | null;
  startDate: string;
  endDate: string;
  notes: string;
}

export interface Payment {
  id: string;
  vendorId: string;
  contractId: string;
  eventId: string;
  milestone: string;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  paidDate: string | null;
  notes: string;
}

export interface VendorReview {
  id: string;
  vendorId: string;
  eventId: string;
  rating: number;
  qualityRating: number;
  punctualityRating: number;
  attitudeRating: number;
  comment: string;
  createdAt: string;
}

export interface BudgetCategory {
  id: string;
  eventId: string;
  name: BudgetCategoryName;
  budgeted: number;
  notes: string;
}

export interface Expense {
  id: string;
  categoryId: string;
  eventId: string;
  description: string;
  amount: number;
  date: string;
  vendorId: string | null;
  notes: string;
  receiptUrl: string | null;
}

export interface BudgetAdjustment {
  id: string;
  eventId: string;
  categoryId: string;
  previousAmount: number;
  newAmount: number;
  reason: string;
  createdAt: string;
}

export interface GiftRecord {
  id: string;
  eventId: string;
  type: GiftType;
  guestName: string;
  amount: number;
  description: string;
  date: string;
  notes: string;
}

export interface ThankYou {
  id: string;
  guestId: string;
  eventId: string;
  status: ThankYouStatus;
  sentAt: string | null;
  template: string;
  notes: string;
}

export interface PhotoAlbum {
  id: string;
  eventId: string;
  name: string;
  description: string;
  photoUrls: string[];
  shareLink: string;
  shareDate: string | null;
  isShared: boolean;
}

export interface TodoItem {
  id: string;
  eventId: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  category: string;
}
