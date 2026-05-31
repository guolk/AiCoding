import type { Member, MemberFormData } from '../types/member';
import type { CardType, MemberCard, CardOperation } from '../types/card';
import type { Checkin } from '../types/checkin';
import type { Marketing } from '../types/marketing';
import { addDays, formatDate, getToday } from './date';

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const firstNames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];
const lastNames = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀兰', '霞', '平'];

const randomName = (): string => {
  return firstNames[Math.floor(Math.random() * firstNames.length)] +
         lastNames[Math.floor(Math.random() * lastNames.length)];
};

const randomPhone = (): string => {
  return '1' + ['3', '5', '7', '8', '9'][Math.floor(Math.random() * 5)] +
         Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
};

const randomDate = (minDaysAgo: number, maxDaysAgo: number): string => {
  const days = Math.floor(Math.random() * (maxDaysAgo - minDaysAgo + 1)) + minDaysAgo;
  return addDays(getToday(), -days);
};

export const generateMockMembers = (): Member[] => {
  const members: Member[] = [];
  for (let i = 0; i < 15; i++) {
    const joinDate = randomDate(30, 365);
    const member: Member = {
      id: generateId(),
      name: randomName(),
      phone: randomPhone(),
      emergencyContact: randomName(),
      emergencyPhone: randomPhone(),
      joinDate,
      recommender: Math.random() > 0.5 ? randomName() : '',
      photo: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20portrait%20photo%20of%20${i + 1}%20chinese%20person%20studio%20headshot&image_size=square`,
      medicalNotes: Math.random() > 0.7 ? '高血压，避免剧烈运动' : '',
      preferences: Math.random() > 0.6 ? '偏好私教课，周末有空' : '',
      notes: Math.random() > 0.7 ? 'VIP客户，需要特别关注' : '',
      status: 'active',
      createdAt: joinDate,
      updatedAt: getToday(),
      birthday: addDays(getToday(), -Math.floor(Math.random() * 365 * 40 + 18 * 365)),
    };
    members.push(member);
  }
  return members;
};

export const generateMockCardTypes = (): CardType[] => {
  return [
    {
      id: generateId(),
      name: '月卡',
      type: 'monthly',
      price: 299,
      durationDays: 30,
      description: '30天不限次数',
      isActive: true,
      createdAt: getToday(),
    },
    {
      id: generateId(),
      name: '季卡',
      type: 'quarterly',
      price: 799,
      durationDays: 90,
      description: '90天不限次数',
      isActive: true,
      createdAt: getToday(),
    },
    {
      id: generateId(),
      name: '年卡',
      type: 'yearly',
      price: 2599,
      durationDays: 365,
      description: '365天不限次数',
      isActive: true,
      createdAt: getToday(),
    },
    {
      id: generateId(),
      name: '30次卡',
      type: 'count',
      price: 999,
      totalCount: 30,
      description: '30次有效期一年',
      isActive: true,
      createdAt: getToday(),
    },
    {
      id: generateId(),
      name: '储值卡-2000',
      type: 'stored',
      price: 2000,
      description: '储值2000元，每次消费60元',
      isActive: true,
      createdAt: getToday(),
    },
    {
      id: generateId(),
      name: '储值卡-5000',
      type: 'stored',
      price: 5000,
      description: '储值5000元送500，每次消费60元',
      isActive: true,
      createdAt: getToday(),
    },
  ];
};

export const generateMockMemberCards = (members: Member[], cardTypes: CardType[]): MemberCard[] => {
  const memberCards: MemberCard[] = [];
  members.forEach((member, index) => {
    const cardType = cardTypes[index % cardTypes.length];
    const startDate = member.joinDate;
    const endDate = cardType.durationDays
      ? addDays(startDate, cardType.durationDays)
      : addDays(startDate, 365);
    
    let remainingCount: number | undefined;
    let totalAmount: number | undefined;
    let usedAmount: number | undefined;

    if (cardType.type === 'count') {
      remainingCount = cardType.totalCount ? Math.floor(cardType.totalCount * (0.3 + Math.random() * 0.7)) : 0;
    } else if (cardType.type === 'stored') {
      totalAmount = cardType.price + (cardType.price === 5000 ? 500 : 0);
      usedAmount = Math.floor(totalAmount * (0.2 + Math.random() * 0.5));
    }

    const memberCard: MemberCard = {
      id: generateId(),
      memberId: member.id,
      cardTypeId: cardType.id,
      cardNumber: 'CARD' + String(index + 1).padStart(6, '0'),
      startDate,
      endDate: index < 2 ? addDays(getToday(), -10) : index < 4 ? addDays(getToday(), 5) : endDate,
      remainingCount,
      totalAmount,
      usedAmount,
      status: index < 2 ? 'expired' : index < 4 ? 'active' : 'active',
      createdAt: startDate,
    };
    memberCards.push(memberCard);
  });
  return memberCards;
};

export const generateMockCheckins = (members: Member[], memberCards: MemberCard[]): Checkin[] => {
  const checkins: Checkin[] = [];
  const methods: Checkin['checkinMethod'][] = ['manual', 'qr', 'face'];
  
  memberCards.forEach((card, cardIndex) => {
    if (card.status === 'expired') return;
    
    const numCheckins = Math.floor(Math.random() * 20) + 5;
    for (let i = 0; i < numCheckins; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const checkinTime = new Date();
      checkinTime.setDate(checkinTime.getDate() - daysAgo);
      checkinTime.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60));
      
      checkins.push({
        id: generateId(),
        memberId: card.memberId,
        memberCardId: card.id,
        checkinTime: checkinTime.toISOString(),
        checkinMethod: methods[Math.floor(Math.random() * methods.length)],
        consumedCount: 1,
        notes: '',
      });
    }
  });
  
  return checkins.sort((a, b) => new Date(b.checkinTime).getTime() - new Date(a.checkinTime).getTime());
};

export const generateMockMarketing = (members: Member[]): Marketing[] => {
  const marketings: Marketing[] = [];
  
  members.slice(0, 5).forEach((member, index) => {
    const scheduledDate = addDays(getToday(), index - 2);
    marketings.push({
      id: generateId(),
      memberId: member.id,
      type: index % 2 === 0 ? 'birthday' : 'renewal',
      content: index % 2 === 0 ? '祝您生日快乐！' : '您的会员卡即将到期，请及时续费',
      scheduledDate,
      sentDate: index < 2 ? scheduledDate : undefined,
      status: index < 2 ? 'sent' : 'pending',
    });
  });
  
  return marketings;
};

export const generateIdForNew = generateId;

export const createNewMember = (data: MemberFormData): Member => {
  const today = getToday();
  return {
    id: generateId(),
    ...data,
    status: 'active',
    createdAt: today,
    updatedAt: today,
  };
};
