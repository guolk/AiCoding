import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Product,
  CategoryDimensions,
  PriceHistory,
  PromotionPrediction,
  UsedPriceReference,
  PurchaseRequirement,
  WeightSetting,
  SceneEvaluation,
  DecisionItem,
  SatisfactionReview,
} from '../types';

interface AppState {
  products: Product[];
  categoryDimensions: CategoryDimensions[];
  priceHistories: PriceHistory[];
  promotionPredictions: PromotionPrediction[];
  usedPriceReferences: UsedPriceReference[];
  requirements: PurchaseRequirement[];
  weightSettings: WeightSetting[];
  sceneEvaluations: SceneEvaluation[];
  decisionItems: DecisionItem[];
  satisfactionReviews: SatisfactionReview[];
}

interface AppContextType extends AppState {
  addProduct: (product: Omit<Product, 'id' | 'addedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleFavorite: (id: string) => void;
  addPriceHistory: (history: Omit<PriceHistory, 'id'>) => void;
  addUsedPriceReference: (ref: Omit<UsedPriceReference, 'id'>) => void;
  addRequirement: (req: Omit<PurchaseRequirement, 'id' | 'createdAt'>) => void;
  updateWeightSettings: (settings: WeightSetting[]) => void;
  addSceneEvaluation: (eval_: Omit<SceneEvaluation, 'id'>) => void;
  addDecisionItem: (item: Omit<DecisionItem, 'id' | 'reminderDate' | 'isReminderTriggered'>) => void;
  triggerReminder: (id: string) => void;
  addSatisfactionReview: (review: Omit<SatisfactionReview, 'id'>) => void;
  addCategoryDimensions: (dim: CategoryDimensions) => void;
}

const defaultCategoryDimensions: CategoryDimensions[] = [
  {
    category: '智能手机',
    dimensions: ['屏幕尺寸', '处理器', '运行内存', '存储容量', '电池容量', '摄像头像素', '重量', '充电功率', '防水等级'],
  },
  {
    category: '笔记本电脑',
    dimensions: ['屏幕尺寸', '处理器', '显卡', '内存', '硬盘容量', '电池续航', '重量', '厚度', '接口数量'],
  },
  {
    category: '耳机',
    dimensions: ['佩戴方式', '频响范围', '阻抗', '灵敏度', '降噪类型', '续航时间', '蓝牙版本', '重量'],
  },
  {
    category: '智能手表',
    dimensions: ['屏幕尺寸', '续航时间', '防水等级', '传感器', 'GPS', '心率监测', '血氧监测', '重量'],
  },
];

const defaultPromotionPredictions: PromotionPrediction[] = [
  { id: '1', category: '智能手机', month: 6, discountRate: 15, eventName: '618年中大促', historicalAccuracy: 0.85 },
  { id: '2', category: '智能手机', month: 11, discountRate: 20, eventName: '双11购物节', historicalAccuracy: 0.9 },
  { id: '3', category: '笔记本电脑', month: 6, discountRate: 12, eventName: '618年中大促', historicalAccuracy: 0.8 },
  { id: '4', category: '笔记本电脑', month: 11, discountRate: 18, eventName: '双11购物节', historicalAccuracy: 0.88 },
  { id: '5', category: '耳机', month: 3, discountRate: 10, eventName: '女神节', historicalAccuracy: 0.7 },
  { id: '6', category: '耳机', month: 11, discountRate: 25, eventName: '双11购物节', historicalAccuracy: 0.92 },
];

const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    category: '智能手机',
    brand: 'Apple',
    url: 'https://apple.com/iphone-15-pro',
    source: 'Apple官网',
    specs: [
      { dimension: '屏幕尺寸', value: '6.1英寸' },
      { dimension: '处理器', value: 'A17 Pro' },
      { dimension: '运行内存', value: '8GB' },
      { dimension: '存储容量', value: '256GB' },
      { dimension: '电池容量', value: '3274mAh' },
      { dimension: '摄像头像素', value: '4800万' },
      { dimension: '重量', value: '187g' },
      { dimension: '充电功率', value: '27W' },
      { dimension: '防水等级', value: 'IP68' },
    ],
    currentPrice: 7999,
    isFavorite: true,
    addedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: '华为Mate 60 Pro',
    category: '智能手机',
    brand: '华为',
    url: 'https://huawei.com/cn/phones/mate60-pro',
    source: '华为商城',
    specs: [
      { dimension: '屏幕尺寸', value: '6.82英寸' },
      { dimension: '处理器', value: '麒麟9000S' },
      { dimension: '运行内存', value: '12GB' },
      { dimension: '存储容量', value: '256GB' },
      { dimension: '电池容量', value: '5000mAh' },
      { dimension: '摄像头像素', value: '4800万' },
      { dimension: '重量', value: '225g' },
      { dimension: '充电功率', value: '88W' },
      { dimension: '防水等级', value: 'IP68' },
    ],
    currentPrice: 6999,
    isFavorite: true,
    addedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: '小米14',
    category: '智能手机',
    brand: '小米',
    specs: [
      { dimension: '屏幕尺寸', value: '6.36英寸' },
      { dimension: '处理器', value: '骁龙8 Gen3' },
      { dimension: '运行内存', value: '12GB' },
      { dimension: '存储容量', value: '256GB' },
      { dimension: '电池容量', value: '4610mAh' },
      { dimension: '摄像头像素', value: '5000万' },
      { dimension: '重量', value: '193g' },
      { dimension: '充电功率', value: '90W' },
      { dimension: '防水等级', value: 'IP68' },
    ],
    currentPrice: 3999,
    isFavorite: false,
    addedAt: new Date().toISOString(),
  },
];

const defaultPriceHistories: PriceHistory[] = [
  { id: '1', productId: '1', price: 8999, recordedAt: '2023-09-22', note: '首发价格' },
  { id: '2', productId: '1', price: 8499, recordedAt: '2023-11-11', note: '双11优惠' },
  { id: '3', productId: '1', price: 7999, recordedAt: '2024-01-15', note: '官方调价' },
  { id: '4', productId: '2', price: 6999, recordedAt: '2023-09-25', note: '首发价格' },
  { id: '5', productId: '2', price: 6499, recordedAt: '2024-02-14', note: '情人节特惠' },
];

const defaultUsedPriceReferences: UsedPriceReference[] = [
  { id: '1', productName: 'iPhone 15 Pro', brand: 'Apple', model: '256GB', condition: 'good', minPrice: 5500, maxPrice: 6500, averagePrice: 6000, source: '闲鱼', recordedAt: new Date().toISOString() },
  { id: '2', productName: 'iPhone 15 Pro', brand: 'Apple', model: '256GB', condition: 'like-new', minPrice: 6500, maxPrice: 7200, averagePrice: 6800, source: '转转', recordedAt: new Date().toISOString() },
  { id: '3', productName: '华为Mate 60 Pro', brand: '华为', model: '256GB', condition: 'good', minPrice: 5000, maxPrice: 5800, averagePrice: 5400, source: '闲鱼', recordedAt: new Date().toISOString() },
];

const defaultWeightSettings: WeightSetting[] = [
  { metric: '性能', weight: 30 },
  { metric: '续航', weight: 25 },
  { metric: '拍照', weight: 20 },
  { metric: '外观', weight: 15 },
  { metric: '价格', weight: 10 },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('digital-product-helper');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      products: defaultProducts,
      categoryDimensions: defaultCategoryDimensions,
      priceHistories: defaultPriceHistories,
      promotionPredictions: defaultPromotionPredictions,
      usedPriceReferences: defaultUsedPriceReferences,
      requirements: [],
      weightSettings: defaultWeightSettings,
      sceneEvaluations: [],
      decisionItems: [],
      satisfactionReviews: [],
    };
  });

  useEffect(() => {
    localStorage.setItem('digital-product-helper', JSON.stringify(state));
  }, [state]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addProduct = (product: Omit<Product, 'id' | 'addedAt'>) => {
    setState((prev) => ({
      ...prev,
      products: [...prev.products, { ...product, id: generateId(), addedAt: new Date().toISOString() }],
    }));
  };

  const updateProduct = (id: string, product: Partial<Product>) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === id ? { ...p, ...product } : p)),
    }));
  };

  const deleteProduct = (id: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== id),
    }));
  };

  const toggleFavorite = (id: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)),
    }));
  };

  const addPriceHistory = (history: Omit<PriceHistory, 'id'>) => {
    setState((prev) => ({
      ...prev,
      priceHistories: [...prev.priceHistories, { ...history, id: generateId() }],
    }));
  };

  const addUsedPriceReference = (ref: Omit<UsedPriceReference, 'id'>) => {
    setState((prev) => ({
      ...prev,
      usedPriceReferences: [...prev.usedPriceReferences, { ...ref, id: generateId() }],
    }));
  };

  const addRequirement = (req: Omit<PurchaseRequirement, 'id' | 'createdAt'>) => {
    setState((prev) => ({
      ...prev,
      requirements: [...prev.requirements, { ...req, id: generateId(), createdAt: new Date().toISOString() }],
    }));
  };

  const updateWeightSettings = (settings: WeightSetting[]) => {
    setState((prev) => ({
      ...prev,
      weightSettings: settings,
    }));
  };

  const addSceneEvaluation = (eval_: Omit<SceneEvaluation, 'id'>) => {
    setState((prev) => ({
      ...prev,
      sceneEvaluations: [...prev.sceneEvaluations, { ...eval_, id: generateId() }],
    }));
  };

  const addDecisionItem = (item: Omit<DecisionItem, 'id' | 'reminderDate' | 'isReminderTriggered'>) => {
    const reminderDate = new Date(item.addedToWishlistAt);
    reminderDate.setDate(reminderDate.getDate() + 7);
    setState((prev) => ({
      ...prev,
      decisionItems: [
        ...prev.decisionItems,
        { ...item, id: generateId(), reminderDate: reminderDate.toISOString(), isReminderTriggered: false },
      ],
    }));
  };

  const triggerReminder = (id: string) => {
    setState((prev) => ({
      ...prev,
      decisionItems: prev.decisionItems.map((item) =>
        item.id === id ? { ...item, isReminderTriggered: true } : item
      ),
    }));
  };

  const addSatisfactionReview = (review: Omit<SatisfactionReview, 'id'>) => {
    setState((prev) => ({
      ...prev,
      satisfactionReviews: [...prev.satisfactionReviews, { ...review, id: generateId() }],
    }));
  };

  const addCategoryDimensions = (dim: CategoryDimensions) => {
    setState((prev) => ({
      ...prev,
      categoryDimensions: [...prev.categoryDimensions, dim],
    }));
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleFavorite,
        addPriceHistory,
        addUsedPriceReference,
        addRequirement,
        updateWeightSettings,
        addSceneEvaluation,
        addDecisionItem,
        triggerReminder,
        addSatisfactionReview,
        addCategoryDimensions,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
