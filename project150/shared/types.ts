export type Platform = 'amazon' | 'ebay' | 'shopify';

export type ProductStatus = 'listing' | 'promoting' | 'slow_selling' | 'clearing';

export type ReviewStatus = 'pending' | 'responded' | 'resolved';

export type AdStatus = 'active' | 'paused' | 'completed';

export type ShipmentStatus = 'pending' | 'shipping' | 'arrived' | 'warehoused';

export interface PlatformInfo {
  id: string;
  name: string;
  code: Platform;
  logoUrl?: string;
  color: string;
}

export interface Store {
  id: string;
  platformId: string;
  platform: Platform;
  name: string;
  sellerId?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface SalesData {
  id: string;
  storeId: string;
  platform: Platform;
  storeName: string;
  date: string;
  salesAmount: number;
  orderCount: number;
  refundCount: number;
  refundRate: number;
  reviewScore?: number;
  adSpend: number;
  profit: number;
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  platform: Platform;
  platformId: string;
  asin?: string;
  status: ProductStatus;
  price: number;
  cost: number;
  imageUrl?: string;
  listedAt: string;
  createdAt: string;
}

export interface KeywordRank {
  id: string;
  productId: string;
  keyword: string;
  platform: Platform;
  rank: number;
  targetRank?: number;
  date: string;
  createdAt: string;
}

export interface NegativeReview {
  id: string;
  productId: string;
  platform: Platform;
  reviewId?: string;
  rating: number;
  content: string;
  reviewer?: string;
  date: string;
  reasonCategory?: string;
  responseStrategy?: string;
  responseDate?: string;
  status: ReviewStatus;
  createdAt: string;
}

export interface AdCampaign {
  id: string;
  name: string;
  platform: Platform;
  type: string;
  budget: number;
  dailyBudget?: number;
  acos?: number;
  impressions: number;
  clicks: number;
  cpc?: number;
  sales: number;
  orders: number;
  startDate: string;
  endDate?: string;
  status: AdStatus;
  notes?: string;
  createdAt: string;
}

export interface KeywordBid {
  id: string;
  campaignId: string;
  keyword: string;
  oldBid: number;
  newBid: number;
  date: string;
  reason?: string;
  effect7dAcos?: number;
  effect7dSales?: number;
  createdAt: string;
}

export interface Inventory {
  id: string;
  productId: string;
  platform: Platform;
  warehouse: string;
  currentStock: number;
  reservedStock: number;
  dailySalesRate: number;
  safetyStock: number;
  leadTimeDays: number;
  restockDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shipment {
  id: string;
  batchNo: string;
  origin: string;
  destination: string;
  shippingMethod: string;
  departureDate: string;
  estimatedArrival: string;
  actualArrival?: string;
  cost: number;
  status: ShipmentStatus;
  trackingNo?: string;
  notes?: string;
  items: ShipmentItem[];
  createdAt: string;
}

export interface ShipmentItem {
  id: string;
  shipmentId: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  createdAt: string;
}

export interface PriceAdjustment {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  oldPrice: number;
  newPrice: number;
  date: string;
  reason?: string;
  effectDays: number;
  salesBefore?: number;
  salesAfter?: number;
  createdAt: string;
}

export interface Promotion {
  id: string;
  name: string;
  platform: Platform;
  type: string;
  startDate: string;
  endDate: string;
  discountDescription?: string;
  budget?: number;
  targetSales?: number;
  actualSales?: number;
  roi?: number;
  reviewNotes?: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalSales: number;
  totalOrders: number;
  avgRefundRate: number;
  avgReviewScore: number;
  salesTrend: { date: string; amount: number }[];
  platformComparison: { platform: Platform; name: string; sales: number; profit: number; roi: number }[];
  alerts: AlertItem[];
}

export interface AlertItem {
  id: string;
  type: 'warning' | 'danger' | 'info';
  message: string;
  link?: string;
  createdAt: string;
}

export interface ROIChartData {
  date: string;
  adSpend: number;
  sales: number;
  roi: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'operator' | 'supply';
  name?: string;
  createdAt: string;
}
