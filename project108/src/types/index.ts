
export interface Contact {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  relation: string;
  email?: string;
  phone?: string;
  notes?: string;
  likes: string[];
  dislikes: string[];
  allergies: string[];
  dietaryRestrictions: string[];
  sizes: { type: string; value: string }[];
  createdAt: string;
}

export interface Anniversary {
  id: string;
  contactId: string;
  type: 'birthday' | 'anniversary' | 'holiday' | 'custom';
  name: string;
  date: string;
  reminderDays: number;
  recurring: boolean;
}

export interface GiftHistory {
  id: string;
  contactId: string;
  giftName: string;
  occasion: string;
  date: string;
  price: number;
  reaction: string;
  notes?: string;
}

export interface GiftIdea {
  id: string;
  userId: string;
  name: string;
  description?: string;
  tags: string[];
  priceMin: number;
  priceMax: number;
  purchaseChannels: { name: string; url?: string }[];
  imageUrl?: string;
  suggestedFor: string[];
  status: 'idea' | 'saved' | 'purchased';
  createdAt: string;
}

export interface Holiday {
  id: string;
  userId: string;
  name: string;
  date: string;
  type: 'national' | 'family' | 'personal';
  reminderDays: number;
}

export interface PurchasePlan {
  id: string;
  userId: string;
  holidayId?: string;
  holidayName: string;
  totalBudget: number;
  deadline: string;
  status: 'planning' | 'active' | 'completed';
  createdAt: string;
}

export interface PlanItem {
  id: string;
  planId: string;
  contactId: string;
  giftIdeaId?: string;
  giftName: string;
  budget: number;
  deadline: string;
  status: 'pending' | 'purchased' | 'delivered' | 'given';
  storageLocation?: string;
  purchaseDate?: string;
  givenDate?: string;
  feedback?: string;
  price?: number;
}

export interface Inventory {
  id: string;
  userId: string;
  name: string;
  quantity: number;
  location: string;
  purchaseDate: string;
  price: number;
  notes?: string;
}

export type Page = 
  | 'dashboard' 
  | 'contacts' 
  | 'contact-detail' 
  | 'gift-ideas' 
  | 'purchase-plans' 
  | 'gift-tracking' 
  | 'budget-analysis';
