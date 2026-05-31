export type CardTypeEnum = 'monthly' | 'quarterly' | 'yearly' | 'count' | 'stored';
export type CardStatus = 'active' | 'paused' | 'expired' | 'used_up' | 'refunded';
export type OperationType = 'create' | 'pause' | 'resume' | 'extend' | 'upgrade' | 'refund' | 'recharge';

export interface CardType {
  id: string;
  name: string;
  type: CardTypeEnum;
  price: number;
  durationDays?: number;
  totalCount?: number;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface MemberCard {
  id: string;
  memberId: string;
  cardTypeId: string;
  cardNumber: string;
  startDate: string;
  endDate: string;
  remainingCount?: number;
  totalAmount?: number;
  usedAmount?: number;
  status: CardStatus;
  createdAt: string;
  pauseDate?: string;
  pausedDays?: number;
}

export interface CardOperation {
  id: string;
  memberCardId: string;
  operationType: OperationType;
  reason: string;
  operator: string;
  beforeData: string;
  afterData: string;
  createdAt: string;
}

export interface CardTypeFormData {
  name: string;
  type: CardTypeEnum;
  price: number;
  durationDays?: number;
  totalCount?: number;
  description: string;
}
