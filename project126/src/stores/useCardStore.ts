import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CardType, MemberCard, CardOperation, CardTypeFormData, CardTypeEnum, OperationType } from '@/types/card';
import { generateMockCardTypes, generateMockMemberCards, generateIdForNew } from '@/utils/mock';
import { addDays, getToday } from '@/utils/date';

interface CardState {
  cardTypes: CardType[];
  memberCards: MemberCard[];
  operations: CardOperation[];
  initialized: boolean;
  initMockData: (memberIds: string[]) => void;
  getCardTypeById: (id: string) => CardType | undefined;
  getMemberCardById: (id: string) => MemberCard | undefined;
  getMemberCardsByMemberId: (memberId: string) => MemberCard[];
  addCardType: (data: CardTypeFormData) => CardType;
  updateCardType: (id: string, data: Partial<CardTypeFormData>) => void;
  toggleCardTypeActive: (id: string) => void;
  deleteCardType: (id: string) => void;
  createMemberCard: (memberId: string, cardTypeId: string) => MemberCard;
  pauseCard: (cardId: string, reason: string) => void;
  resumeCard: (cardId: string) => void;
  extendCard: (cardId: string, days: number, reason: string) => void;
  upgradeCard: (cardId: string, newCardTypeId: string, reason: string) => void;
  refundCard: (cardId: string, reason: string) => void;
  rechargeCard: (cardId: string, amount: number) => void;
  getOperationsByCardId: (cardId: string) => CardOperation[];
  getActiveMemberCards: () => MemberCard[];
  _addOperation: (memberCardId: string, operationType: OperationType, reason: string, before: MemberCard, after: MemberCard) => void;
}

export const useCardStore = create<CardState>()(
  persist(
    (set, get) => ({
      cardTypes: [],
      memberCards: [],
      operations: [],
      initialized: false,
      
      initMockData: (memberIds: string[]) => {
        if (get().initialized) return;
        const cardTypes = generateMockCardTypes();
        
        const members = memberIds.map((id, index) => ({
          id,
          joinDate: addDays(getToday(), -30 - index * 20),
        }));
        
        const memberCards = generateMockMemberCards(
          members as any,
          cardTypes
        );
        
        set({ cardTypes, memberCards, initialized: true });
      },
      
      getCardTypeById: (id: string) => {
        return get().cardTypes.find((ct) => ct.id === id);
      },
      
      getMemberCardById: (id: string) => {
        return get().memberCards.find((mc) => mc.id === id);
      },
      
      getMemberCardsByMemberId: (memberId: string) => {
        return get().memberCards.filter((mc) => mc.memberId === memberId);
      },
      
      addCardType: (data: CardTypeFormData) => {
        const newCardType: CardType = {
          id: generateIdForNew(),
          ...data,
          isActive: true,
          createdAt: getToday(),
        };
        set((state) => ({
          cardTypes: [...state.cardTypes, newCardType],
        }));
        return newCardType;
      },
      
      updateCardType: (id: string, data: Partial<CardTypeFormData>) => {
        set((state) => ({
          cardTypes: state.cardTypes.map((ct) =>
            ct.id === id ? { ...ct, ...data } : ct
          ),
        }));
      },
      
      toggleCardTypeActive: (id: string) => {
        set((state) => ({
          cardTypes: state.cardTypes.map((ct) =>
            ct.id === id ? { ...ct, isActive: !ct.isActive } : ct
          ),
        }));
      },
      
      deleteCardType: (id: string) => {
        const hasCards = get().memberCards.some((mc) => mc.cardTypeId === id);
        if (hasCards) {
          throw new Error('该卡型下存在会员卡，无法删除');
        }
        set((state) => ({
          cardTypes: state.cardTypes.filter((ct) => ct.id !== id),
        }));
      },
      
      createMemberCard: (memberId: string, cardTypeId: string) => {
        const cardType = get().getCardTypeById(cardTypeId);
        if (!cardType) throw new Error('卡型不存在');
        
        const now = new Date();
        const cardIndex = get().memberCards.length + 1;
        const endDate = cardType.durationDays
          ? addDays(now, cardType.durationDays)
          : addDays(now, 365);
        
        const newCard: MemberCard = {
          id: generateIdForNew(),
          memberId,
          cardTypeId,
          cardNumber: 'CARD' + String(cardIndex).padStart(6, '0'),
          startDate: getToday(),
          endDate,
          remainingCount: cardType.totalCount,
          totalAmount: cardType.type === 'stored' ? cardType.price + (cardType.price === 5000 ? 500 : 0) : undefined,
          usedAmount: cardType.type === 'stored' ? 0 : undefined,
          status: 'active',
          createdAt: getToday(),
        };
        
        const operation: CardOperation = {
          id: generateIdForNew(),
          memberCardId: newCard.id,
          operationType: 'create',
          reason: '开卡',
          operator: '系统',
          beforeData: '{}',
          afterData: JSON.stringify(newCard),
          createdAt: getToday(),
        };
        
        set((state) => ({
          memberCards: [...state.memberCards, newCard],
          operations: [...state.operations, operation],
        }));
        
        return newCard;
      },
      
      _addOperation: (memberCardId: string, operationType: OperationType, reason: string, before: MemberCard, after: MemberCard) => {
        const operation: CardOperation = {
          id: generateIdForNew(),
          memberCardId,
          operationType,
          reason,
          operator: '当前用户',
          beforeData: JSON.stringify(before),
          afterData: JSON.stringify(after),
          createdAt: getToday(),
        };
        set((state) => ({
          operations: [...state.operations, operation],
        }));
      },
      
      pauseCard: (cardId: string, reason: string) => {
        const card = get().getMemberCardById(cardId);
        if (!card) return;
        
        const updatedCard: MemberCard = {
          ...card,
          status: 'paused',
          pauseDate: getToday(),
        };
        
        get()._addOperation?.(cardId, 'pause', reason, card, updatedCard);
        
        set((state) => ({
          memberCards: state.memberCards.map((mc) =>
            mc.id === cardId ? updatedCard : mc
          ),
        }));
      },
      
      resumeCard: (cardId: string) => {
        const card = get().getMemberCardById(cardId);
        if (!card) return;
        
        const pauseDays = card.pauseDate
          ? Math.max(0, Math.ceil((new Date().getTime() - new Date(card.pauseDate).getTime()) / (1000 * 60 * 60 * 24)))
          : 0;
        
        const updatedCard: MemberCard = {
          ...card,
          status: 'active',
          endDate: addDays(card.endDate, pauseDays),
          pauseDate: undefined,
          pausedDays: (card.pausedDays || 0) + pauseDays,
        };
        
        get()._addOperation?.(cardId, 'resume', '恢复使用', card, updatedCard);
        
        set((state) => ({
          memberCards: state.memberCards.map((mc) =>
            mc.id === cardId ? updatedCard : mc
          ),
        }));
      },
      
      extendCard: (cardId: string, days: number, reason: string) => {
        const card = get().getMemberCardById(cardId);
        if (!card) return;
        
        const updatedCard: MemberCard = {
          ...card,
          endDate: addDays(card.endDate, days),
          status: 'active',
        };
        
        get()._addOperation?.(cardId, 'extend', reason, card, updatedCard);
        
        set((state) => ({
          memberCards: state.memberCards.map((mc) =>
            mc.id === cardId ? updatedCard : mc
          ),
        }));
      },
      
      upgradeCard: (cardId: string, newCardTypeId: string, reason: string) => {
        const card = get().getMemberCardById(cardId);
        if (!card) return;
        
        const newCardType = get().getCardTypeById(newCardTypeId);
        if (!newCardType) return;
        
        const endDate = newCardType.durationDays
          ? addDays(getToday(), newCardType.durationDays)
          : addDays(getToday(), 365);
        
        const updatedCard: MemberCard = {
          ...card,
          cardTypeId: newCardTypeId,
          endDate,
          remainingCount: newCardType.totalCount,
          status: 'active',
        };
        
        get()._addOperation?.(cardId, 'upgrade', reason, card, updatedCard);
        
        set((state) => ({
          memberCards: state.memberCards.map((mc) =>
            mc.id === cardId ? updatedCard : mc
          ),
        }));
      },
      
      refundCard: (cardId: string, reason: string) => {
        const card = get().getMemberCardById(cardId);
        if (!card) return;
        
        const updatedCard: MemberCard = {
          ...card,
          status: 'refunded',
        };
        
        get()._addOperation?.(cardId, 'refund', reason, card, updatedCard);
        
        set((state) => ({
          memberCards: state.memberCards.map((mc) =>
            mc.id === cardId ? updatedCard : mc
          ),
        }));
      },
      
      rechargeCard: (cardId: string, amount: number) => {
        const card = get().getMemberCardById(cardId);
        if (!card) return;
        
        const updatedCard: MemberCard = {
          ...card,
          totalAmount: (card.totalAmount || 0) + amount,
          status: 'active',
        };
        
        get()._addOperation?.(cardId, 'recharge', `充值${amount}元`, card, updatedCard);
        
        set((state) => ({
          memberCards: state.memberCards.map((mc) =>
            mc.id === cardId ? updatedCard : mc
          ),
        }));
      },
      
      getOperationsByCardId: (cardId: string) => {
        return get().operations
          .filter((op) => op.memberCardId === cardId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },
      
      getActiveMemberCards: () => {
        return get().memberCards.filter((mc) => mc.status === 'active');
      },
    }) as any,
    {
      name: 'card-store',
    }
  )
);
