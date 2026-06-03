export interface FirstAidItem {
  id: string;
  name: string;
  quantity: number;
  specification: string;
  expiryDate: string;
  purpose: string;
  category: string;
  location: string;
  safeQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencySupply {
  id: string;
  name: string;
  category: 'water' | 'food' | 'battery' | 'flashlight' | 'firstaid' | 'other';
  quantity: number;
  unit: string;
  expiryDate: string;
  rotationDays: number;
  lastRotated: string;
  createdAt: string;
}

export interface Medicine {
  id: string;
  name: string;
  type: 'prescription' | 'otc';
  isChildren: boolean;
  dosage: string;
  expiryDate: string;
  location: string;
  locationDetail: string;
  purpose: string;
  quantity: number;
  safeQuantity: number;
}

export interface UsageRecord {
  id: string;
  itemId: string;
  itemType: 'firstaid' | 'emergency' | 'medicine';
  itemName: string;
  quantityUsed: number;
  remainingQuantity: number;
  usedAt: string;
  reason: string;
}

export interface PurchaseRecord {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
  source: string;
  quality: 1 | 2 | 3 | 4 | 5;
  purchasedAt: string;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  category: string;
  content: string;
  relatedItemIds: string[];
  steps: string[];
}

export interface FamilyConfig {
  memberCount: number;
  childrenCount: number;
  elderlyCount: number;
  supplyDays: number;
}

export interface InventoryCheck {
  id: string;
  date: string;
  nextDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  checkedItems: { itemId: string; status: 'ok' | 'missing' | 'expired' }[];
}

export interface ShoppingItem {
  itemId: string;
  itemName: string;
  quantity: number;
  type: 'firstaid' | 'emergency' | 'medicine';
}

export type ExpiryStatus = 'expired' | 'urgent' | 'warning' | 'normal';

export const CATEGORY_LABELS: Record<string, string> = {
  bandage: '绷带敷料',
  antiseptic: '消毒用品',
  medicine: '药品',
  tool: '急救工具',
  other: '其他',
};

export const SUPPLY_CATEGORY_LABELS: Record<EmergencySupply['category'], string> = {
  water: '饮用水',
  food: '应急食品',
  battery: '电池',
  flashlight: '手电照明',
  firstaid: '急救包',
  other: '其他物资',
};

export const MEDICINE_TYPE_LABELS: Record<Medicine['type'], string> = {
  prescription: '处方药',
  otc: '非处方药(OTC)',
};
