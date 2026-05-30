
import { create } from 'zustand';
import type {
  Contact,
  Anniversary,
  GiftHistory,
  GiftIdea,
  Holiday,
  PurchasePlan,
  PlanItem,
  Inventory,
  Page,
} from '../types';

const mockContacts: Contact[] = [
  {
    id: '1',
    userId: 'user1',
    name: '张小明',
    avatar: 'https://i.pravatar.cc/150?img=1',
    relation: '父亲',
    email: 'zhang@example.com',
    phone: '13800138001',
    notes: '喜欢喝茶和书法',
    likes: ['茶叶', '毛笔', '字帖', '紫砂壶', '京剧'],
    dislikes: ['甜食', '酒精', '电子产品'],
    allergies: ['海鲜', '花生'],
    dietaryRestrictions: ['低糖', '低盐'],
    sizes: [
      { type: '上衣', value: 'XL' },
      { type: '鞋子', value: '42码' },
    ],
    createdAt: '2025-01-01',
  },
  {
    id: '2',
    userId: 'user1',
    name: '李美丽',
    avatar: 'https://i.pravatar.cc/150?img=2',
    relation: '母亲',
    email: 'li@example.com',
    phone: '13800138002',
    notes: '喜欢养花和烹饪',
    likes: ['护肤品', '鲜花', '园艺工具', '厨具', '丝巾'],
    dislikes: ['太花哨的东西', '重口味食物'],
    allergies: ['芒果'],
    dietaryRestrictions: ['素食为主'],
    sizes: [
      { type: '上衣', value: 'L' },
      { type: '鞋子', value: '37码' },
    ],
    createdAt: '2025-01-01',
  },
  {
    id: '3',
    userId: 'user1',
    name: '王小红',
    avatar: 'https://i.pravatar.cc/150?img=3',
    relation: '妻子',
    email: 'wang@example.com',
    phone: '13800138003',
    notes: '今年是结婚5周年',
    likes: ['香水', '珠宝', 'SPA', '旅行', '浪漫晚餐'],
    dislikes: ['实用型礼物', '家电'],
    allergies: ['无'],
    dietaryRestrictions: ['无'],
    sizes: [
      { type: '上衣', value: 'M' },
      { type: '鞋子', value: '36码' },
      { type: '戒指', value: '12号' },
    ],
    createdAt: '2025-01-01',
  },
  {
    id: '4',
    userId: 'user1',
    name: '张小宝',
    avatar: 'https://i.pravatar.cc/150?img=4',
    relation: '儿子',
    email: 'xiaobao@example.com',
    phone: '13800138004',
    notes: '8岁，喜欢乐高和恐龙',
    likes: ['乐高', '恐龙玩具', '漫画书', '游戏机', '户外玩具'],
    dislikes: ['学习相关的礼物', '蔬菜'],
    allergies: ['牛奶'],
    dietaryRestrictions: ['乳糖不耐受'],
    sizes: [
      { type: '上衣', value: '140cm' },
      { type: '鞋子', value: '34码' },
    ],
    createdAt: '2025-01-01',
  },
  {
    id: '5',
    userId: 'user1',
    name: '李明华',
    avatar: 'https://i.pravatar.cc/150?img=5',
    relation: '岳父',
    email: 'lifather@example.com',
    phone: '13800138005',
    notes: '退休教师，喜欢下棋',
    likes: ['象棋', '茶叶', '收音机', '保健品', '老花镜'],
    dislikes: ['太新潮的东西'],
    allergies: ['无'],
    dietaryRestrictions: ['低糖'],
    sizes: [
      { type: '上衣', value: 'XXL' },
      { type: '鞋子', value: '41码' },
    ],
    createdAt: '2025-01-01',
  },
  {
    id: '6',
    userId: 'user1',
    name: '陈慧英',
    avatar: 'https://i.pravatar.cc/150?img=6',
    relation: '岳母',
    email: 'chen@example.com',
    phone: '13800138006',
    notes: '喜欢跳广场舞',
    likes: ['广场舞服装', '丝巾', '蜂蜜', '钙片', '按摩器'],
    dislikes: ['太贵重的礼物'],
    allergies: ['无'],
    dietaryRestrictions: ['无'],
    sizes: [
      { type: '上衣', value: 'XL' },
      { type: '鞋子', value: '38码' },
    ],
    createdAt: '2025-01-01',
  },
];

const mockAnniversaries: Anniversary[] = [
  {
    id: 'a1',
    contactId: '1',
    type: 'birthday',
    name: '父亲生日',
    date: '1968-03-15',
    reminderDays: 14,
    recurring: true,
  },
  {
    id: 'a2',
    contactId: '2',
    type: 'birthday',
    name: '母亲生日',
    date: '1970-07-20',
    reminderDays: 14,
    recurring: true,
  },
  {
    id: 'a3',
    contactId: '3',
    type: 'birthday',
    name: '妻子生日',
    date: '1992-11-08',
    reminderDays: 7,
    recurring: true,
  },
  {
    id: 'a4',
    contactId: '4',
    type: 'birthday',
    name: '儿子生日',
    date: '2018-06-01',
    reminderDays: 7,
    recurring: true,
  },
  {
    id: 'a5',
    contactId: '5',
    type: 'birthday',
    name: '岳父生日',
    date: '1959-09-12',
    reminderDays: 14,
    recurring: true,
  },
  {
    id: 'a6',
    contactId: '6',
    type: 'birthday',
    name: '岳母生日',
    date: '1962-04-25',
    reminderDays: 14,
    recurring: true,
  },
  {
    id: 'a7',
    contactId: '3',
    type: 'anniversary',
    name: '结婚纪念日',
    date: '2021-05-20',
    reminderDays: 30,
    recurring: true,
  },
];

const mockGiftHistory: GiftHistory[] = [
  {
    id: 'gh1',
    contactId: '1',
    giftName: '紫砂茶壶套装',
    occasion: '2025年父亲节',
    date: '2025-06-15',
    price: 388,
    reaction: '非常喜欢，说这是他收到的最好的礼物之一',
    notes: '买了一套宜兴紫砂茶壶，带四个小茶杯',
  },
  {
    id: 'gh2',
    contactId: '2',
    giftName: '高端护肤套装',
    occasion: '2025年母亲节',
    date: '2025-05-11',
    price: 1280,
    reaction: '开心得合不拢嘴，当天就开始用了',
    notes: '兰蔻小黑瓶套装',
  },
  {
    id: 'gh3',
    contactId: '3',
    giftName: '迪奥香水礼盒',
    occasion: '2025年情人节',
    date: '2025-02-14',
    price: 980,
    reaction: '很喜欢香味，说比去年的礼物有心',
    notes: '迪奥真我香水 + 身体乳套装',
  },
  {
    id: 'gh4',
    contactId: '4',
    giftName: '乐高恐龙乐园',
    occasion: '2025年春节',
    date: '2025-01-29',
    price: 599,
    reaction: '超级兴奋，连续玩了三天才拼完',
    notes: '乐高侏罗纪公园系列',
  },
  {
    id: 'gh5',
    contactId: '1',
    giftName: '智能血压计',
    occasion: '2025年春节',
    date: '2025-01-29',
    price: 299,
    reaction: '很实用，说以后可以自己监测血压了',
    notes: '欧姆龙品牌',
  },
  {
    id: 'gh6',
    contactId: '2',
    giftName: '丝巾礼盒',
    occasion: '2025年春节',
    date: '2025-01-29',
    price: 368,
    reaction: '图案很漂亮，说春节走亲戚可以戴',
    notes: '万事利品牌，真丝丝巾',
  },
];

const mockGiftIdeas: GiftIdea[] = [
  {
    id: 'gi1',
    userId: 'user1',
    name: '高级手写钢笔',
    description: '万宝龙或派克品牌的钢笔，适合喜欢写字的人',
    tags: ['文具', '高端', '商务'],
    priceMin: 300,
    priceMax: 1500,
    purchaseChannels: [
      { name: '京东', url: 'https://jd.com' },
      { name: '天猫旗舰店', url: 'https://tmall.com' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400',
    suggestedFor: ['1'],
    status: 'saved',
    createdAt: '2025-02-01',
  },
  {
    id: 'gi2',
    userId: 'user1',
    name: '精品茶叶礼盒',
    description: '武夷山大红袍或西湖龙井的高端礼盒',
    tags: ['茶叶', '养生', '礼盒'],
    priceMin: 200,
    priceMax: 800,
    purchaseChannels: [
      { name: '茶礼网', url: 'https://example.com' },
      { name: '线下茶店', url: '' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
    suggestedFor: ['1', '5'],
    status: 'idea',
    createdAt: '2025-02-15',
  },
  {
    id: 'gi3',
    userId: 'user1',
    name: '名牌包包',
    description: 'Coach或MK的时尚手提包，送给妻子或妈妈',
    tags: ['时尚', '包包', '高端'],
    priceMin: 1500,
    priceMax: 5000,
    purchaseChannels: [
      { name: '奢侈品网站', url: 'https://example.com' },
      { name: '奥特莱斯', url: '' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400',
    suggestedFor: ['2', '3'],
    status: 'idea',
    createdAt: '2025-03-01',
  },
  {
    id: 'gi4',
    userId: 'user1',
    name: '乐高星球大战',
    description: '大型乐高套装，适合喜欢拼装的孩子',
    tags: ['玩具', '乐高', '儿童'],
    priceMin: 400,
    priceMax: 1200,
    purchaseChannels: [
      { name: '乐高旗舰店', url: 'https://lego.com' },
      { name: '天猫', url: 'https://tmall.com' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400',
    suggestedFor: ['4'],
    status: 'saved',
    createdAt: '2025-03-10',
  },
  {
    id: 'gi5',
    userId: 'user1',
    name: '高端按摩椅',
    description: '家用全身按摩椅，送给父母',
    tags: ['健康', '家电', '高端'],
    priceMin: 3000,
    priceMax: 15000,
    purchaseChannels: [
      { name: '京东', url: 'https://jd.com' },
      { name: '线下体验店', url: '' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
    suggestedFor: ['1', '2', '5', '6'],
    status: 'idea',
    createdAt: '2025-03-20',
  },
  {
    id: 'gi6',
    userId: 'user1',
    name: '亲子摄影套餐',
    description: '专业影楼的全家福或亲子照拍摄',
    tags: ['体验', '摄影', '家庭'],
    priceMin: 800,
    priceMax: 3000,
    purchaseChannels: [
      { name: '影楼官网', url: 'https://example.com' },
      { name: '美团', url: 'https://meituan.com' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400',
    suggestedFor: ['1', '2', '3', '4'],
    status: 'idea',
    createdAt: '2025-04-01',
  },
  {
    id: 'gi7',
    userId: 'user1',
    name: '高级护肤品套装',
    description: 'SK-II或海蓝之谜的护肤套装',
    tags: ['护肤', '美妆', '高端'],
    priceMin: 1000,
    priceMax: 4000,
    purchaseChannels: [
      { name: '丝芙兰', url: 'https://sephora.com' },
      { name: '专柜', url: '' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400',
    suggestedFor: ['2', '3', '6'],
    status: 'saved',
    createdAt: '2025-04-10',
  },
  {
    id: 'gi8',
    userId: 'user1',
    name: '智能家居套装',
    description: '智能音箱 + 智能灯泡 + 智能插座',
    tags: ['科技', '智能', '生活'],
    priceMin: 500,
    priceMax: 2000,
    purchaseChannels: [
      { name: '小米商城', url: 'https://mi.com' },
      { name: '京东', url: 'https://jd.com' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    suggestedFor: ['3', '5'],
    status: 'idea',
    createdAt: '2025-04-20',
  },
];

const mockHolidays: Holiday[] = [
  {
    id: 'h1',
    userId: 'user1',
    name: '春节',
    date: '2026-02-17',
    type: 'national',
    reminderDays: 30,
  },
  {
    id: 'h2',
    userId: 'user1',
    name: '情人节',
    date: '2026-02-14',
    type: 'national',
    reminderDays: 7,
  },
  {
    id: 'h3',
    userId: 'user1',
    name: '母亲节',
    date: '2026-05-10',
    type: 'national',
    reminderDays: 14,
  },
  {
    id: 'h4',
    userId: 'user1',
    name: '父亲节',
    date: '2026-06-21',
    type: 'national',
    reminderDays: 14,
  },
  {
    id: 'h5',
    userId: 'user1',
    name: '中秋节',
    date: '2026-10-06',
    type: 'national',
    reminderDays: 14,
  },
  {
    id: 'h6',
    userId: 'user1',
    name: '圣诞节',
    date: '2026-12-25',
    type: 'national',
    reminderDays: 21,
  },
  {
    id: 'h7',
    userId: 'user1',
    name: '元旦',
    date: '2027-01-01',
    type: 'national',
    reminderDays: 14,
  },
];

const mockPurchasePlans: PurchasePlan[] = [
  {
    id: 'pp1',
    userId: 'user1',
    holidayId: 'h2',
    holidayName: '2026年情人节',
    totalBudget: 3000,
    deadline: '2026-02-10',
    status: 'active',
    createdAt: '2026-01-15',
  },
  {
    id: 'pp2',
    userId: 'user1',
    holidayId: 'h1',
    holidayName: '2026年春节',
    totalBudget: 10000,
    deadline: '2026-02-01',
    status: 'planning',
    createdAt: '2026-01-01',
  },
  {
    id: 'pp3',
    userId: 'user1',
    holidayId: 'h4',
    holidayName: '2025年父亲节',
    totalBudget: 2000,
    deadline: '2025-06-10',
    status: 'completed',
    createdAt: '2025-05-20',
  },
];

const mockPlanItems: PlanItem[] = [
  {
    id: 'pi1',
    planId: 'pp1',
    contactId: '3',
    giftIdeaId: 'gi7',
    giftName: 'SK-II护肤套装',
    budget: 2500,
    deadline: '2026-02-10',
    status: 'pending',
  },
  {
    id: 'pi2',
    planId: 'pp1',
    contactId: '3',
    giftName: '玫瑰花束',
    budget: 500,
    deadline: '2026-02-13',
    status: 'pending',
  },
  {
    id: 'pi3',
    planId: 'pp2',
    contactId: '1',
    giftIdeaId: 'gi2',
    giftName: '高端茶叶礼盒',
    budget: 500,
    deadline: '2026-01-25',
    status: 'pending',
  },
  {
    id: 'pi4',
    planId: 'pp2',
    contactId: '2',
    giftIdeaId: 'gi7',
    giftName: '护肤礼盒',
    budget: 1500,
    deadline: '2026-01-25',
    status: 'pending',
  },
  {
    id: 'pi5',
    planId: 'pp2',
    contactId: '4',
    giftIdeaId: 'gi4',
    giftName: '乐高套装',
    budget: 800,
    deadline: '2026-01-25',
    status: 'pending',
  },
  {
    id: 'pi6',
    planId: 'pp2',
    contactId: '5',
    giftIdeaId: 'gi2',
    giftName: '茶叶礼盒',
    budget: 400,
    deadline: '2026-01-25',
    status: 'pending',
  },
  {
    id: 'pi7',
    planId: 'pp2',
    contactId: '6',
    giftName: '丝巾礼盒',
    budget: 400,
    deadline: '2026-01-25',
    status: 'pending',
  },
  {
    id: 'pi8',
    planId: 'pp3',
    contactId: '1',
    giftName: '紫砂茶壶套装',
    budget: 400,
    deadline: '2025-06-10',
    status: 'given',
    price: 388,
    purchaseDate: '2025-06-05',
    givenDate: '2025-06-15',
    feedback: '父亲非常喜欢，说这是他收到的最好的礼物之一',
  },
];

const mockInventory: Inventory[] = [
  {
    id: 'inv1',
    userId: 'user1',
    name: '备用礼物包装纸',
    quantity: 10,
    location: '书房储物柜',
    purchaseDate: '2025-12-01',
    price: 50,
    notes: '各种颜色和图案',
  },
  {
    id: 'inv2',
    userId: 'user1',
    name: '精品贺卡套装',
    quantity: 5,
    location: '书房储物柜',
    purchaseDate: '2025-11-15',
    price: 80,
    notes: '适合各种场合',
  },
  {
    id: 'inv3',
    userId: 'user1',
    name: '精美礼品袋（大）',
    quantity: 3,
    location: '书房储物柜',
    purchaseDate: '2026-01-01',
    price: 30,
  },
  {
    id: 'inv4',
    userId: 'user1',
    name: '精美礼品袋（中）',
    quantity: 8,
    location: '书房储物柜',
    purchaseDate: '2026-01-01',
    price: 40,
  },
];

interface AppState {
  contacts: Contact[];
  anniversaries: Anniversary[];
  giftHistory: GiftHistory[];
  giftIdeas: GiftIdea[];
  holidays: Holiday[];
  purchasePlans: PurchasePlan[];
  planItems: PlanItem[];
  inventory: Inventory[];
  currentPage: Page;
  selectedContactId: string | null;
  setCurrentPage: (page: Page) => void;
  setSelectedContactId: (id: string | null) => void;
  addContact: (contact: Omit<Contact, 'id' | 'userId' | 'createdAt'>) => void;
  updateContact: (id: string, contact: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  addGiftHistory: (history: Omit<GiftHistory, 'id'>) => void;
  addAnniversary: (anniversary: Omit<Anniversary, 'id'>) => void;
  addGiftIdea: (idea: Omit<GiftIdea, 'id' | 'userId' | 'createdAt' | 'status'>) => void;
  updateGiftIdea: (id: string, idea: Partial<GiftIdea>) => void;
  deleteGiftIdea: (id: string) => void;
  addPurchasePlan: (plan: Omit<PurchasePlan, 'id' | 'userId' | 'createdAt' | 'status'>) => void;
  updatePlanItem: (id: string, item: Partial<PlanItem>) => void;
  addPlanItem: (item: Omit<PlanItem, 'id'>) => void;
  addInventory: (item: Omit<Inventory, 'id' | 'userId'>) => void;
  updateInventory: (id: string, item: Partial<Inventory>) => void;
  deleteInventory: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  contacts: mockContacts,
  anniversaries: mockAnniversaries,
  giftHistory: mockGiftHistory,
  giftIdeas: mockGiftIdeas,
  holidays: mockHolidays,
  purchasePlans: mockPurchasePlans,
  planItems: mockPlanItems,
  inventory: mockInventory,
  currentPage: 'dashboard',
  selectedContactId: null,
  setCurrentPage: (page) => set({ currentPage: page }),
  setSelectedContactId: (id) => set({ selectedContactId: id }),
  addContact: (contact) =>
    set((state) => ({
      contacts: [
        ...state.contacts,
        {
          ...contact,
          id: `c${Date.now()}`,
          userId: 'user1',
          createdAt: new Date().toISOString().split('T')[0],
        },
      ],
    })),
  updateContact: (id, contact) =>
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c.id === id ? { ...c, ...contact } : c
      ),
    })),
  deleteContact: (id) =>
    set((state) => ({
      contacts: state.contacts.filter((c) => c.id !== id),
      anniversaries: state.anniversaries.filter((a) => a.contactId !== id),
      giftHistory: state.giftHistory.filter((gh) => gh.contactId !== id),
    })),
  addGiftHistory: (history) =>
    set((state) => ({
      giftHistory: [...state.giftHistory, { ...history, id: `gh${Date.now()}` }],
    })),
  addAnniversary: (anniversary) =>
    set((state) => ({
      anniversaries: [
        ...state.anniversaries,
        { ...anniversary, id: `a${Date.now()}` },
      ],
    })),
  addGiftIdea: (idea) =>
    set((state) => ({
      giftIdeas: [
        ...state.giftIdeas,
        {
          ...idea,
          id: `gi${Date.now()}`,
          userId: 'user1',
          createdAt: new Date().toISOString().split('T')[0],
          status: 'idea' as const,
        },
      ],
    })),
  updateGiftIdea: (id, idea) =>
    set((state) => ({
      giftIdeas: state.giftIdeas.map((gi) =>
        gi.id === id ? { ...gi, ...idea } : gi
      ),
    })),
  deleteGiftIdea: (id) =>
    set((state) => ({
      giftIdeas: state.giftIdeas.filter((gi) => gi.id !== id),
    })),
  addPurchasePlan: (plan) =>
    set((state) => ({
      purchasePlans: [
        ...state.purchasePlans,
        {
          ...plan,
          id: `pp${Date.now()}`,
          userId: 'user1',
          createdAt: new Date().toISOString().split('T')[0],
          status: 'planning' as const,
        },
      ],
    })),
  updatePlanItem: (id, item) =>
    set((state) => ({
      planItems: state.planItems.map((pi) =>
        pi.id === id ? { ...pi, ...item } : pi
      ),
    })),
  addPlanItem: (item) =>
    set((state) => ({
      planItems: [...state.planItems, { ...item, id: `pi${Date.now()}` }],
    })),
  addInventory: (item) =>
    set((state) => ({
      inventory: [
        ...state.inventory,
        { ...item, id: `inv${Date.now()}`, userId: 'user1' },
      ],
    })),
  updateInventory: (id, item) =>
    set((state) => ({
      inventory: state.inventory.map((inv) =>
        inv.id === id ? { ...inv, ...item } : inv
      ),
    })),
  deleteInventory: (id) =>
    set((state) => ({
      inventory: state.inventory.filter((inv) => inv.id !== id),
    })),
}));
