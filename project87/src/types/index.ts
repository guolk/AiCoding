export interface ProductSpec {
  dimension: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  url?: string;
  source?: string;
  specs: ProductSpec[];
  currentPrice: number;
  isFavorite: boolean;
  addedAt: string;
  imageUrl?: string;
}

export interface CategoryDimensions {
  category: string;
  dimensions: string[];
}

export interface PriceHistory {
  id: string;
  productId: string;
  price: number;
  recordedAt: string;
  note?: string;
}

export interface PromotionPrediction {
  id: string;
  category: string;
  month: number;
  discountRate: number;
  eventName: string;
  historicalAccuracy: number;
}

export interface UsedPriceReference {
  id: string;
  productName: string;
  brand: string;
  model: string;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  source: string;
  recordedAt: string;
}

export interface PurchaseRequirement {
  id: string;
  useCase: string;
  budget: number;
  topMetrics: string[];
  createdAt: string;
}

export interface WeightSetting {
  metric: string;
  weight: number;
}

export interface SceneEvaluation {
  id: string;
  productId: string;
  scene: string;
  suitabilityScore: number;
  notes: string;
}

export interface DecisionItem {
  id: string;
  productId: string;
  pros: string[];
  cons: string[];
  addedToWishlistAt: string;
  reminderDate: string;
  isReminderTriggered: boolean;
}

export interface SatisfactionReview {
  id: string;
  productId: string;
  productName: string;
  purchaseDate: string;
  reviewDate: string;
  rating: number;
  pros: string[];
  cons: string[];
  overallFeeling: string;
  wouldRecommend: boolean;
}

export interface WeightedScore {
  productId: string;
  productName: string;
  scores: Record<string, number>;
  totalScore: number;
  rank: number;
}
