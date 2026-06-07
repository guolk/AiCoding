import { create } from 'zustand';
import type {
  DashboardSummary,
  Store,
  SalesData,
  Product,
  KeywordRank,
  NegativeReview,
  AdCampaign,
  KeywordBid,
  Inventory,
  Shipment,
  PriceAdjustment,
  Promotion,
  AlertItem,
  Platform,
  ROIChartData,
} from '@/../shared/types';
import {
  mockData,
  getDashboardSummary,
  getSalesTrend,
  getROIChartData,
} from '@/mock/data';

interface AppState {
  loading: boolean;
  dashboardSummary: DashboardSummary | null;
  stores: Store[];
  salesData: SalesData[];
  products: Product[];
  keywordRanks: KeywordRank[];
  negativeReviews: NegativeReview[];
  adCampaigns: AdCampaign[];
  keywordBids: KeywordBid[];
  inventory: Inventory[];
  shipments: Shipment[];
  priceAdjustments: PriceAdjustment[];
  promotions: Promotion[];
  alerts: AlertItem[];
  salesTrend: { date: string; amount: number }[];
  platformComparison: { platform: Platform; name: string; sales: number; profit: number; roi: number }[];
  roiChartData: ROIChartData[];
  selectedPlatform: Platform | 'all';
  selectedDateRange: { start: string; end: string };
  sidebarCollapsed: boolean;

  fetchDashboard: () => void;
  setSelectedPlatform: (platform: Platform | 'all') => void;
  toggleSidebar: () => void;
  updateReviewResponse: (id: string, response: string, category: string) => void;
  updateProductStatus: (id: string, status: Product['status']) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  loading: false,
  dashboardSummary: null,
  stores: mockData.stores,
  salesData: mockData.salesData,
  products: mockData.products,
  keywordRanks: mockData.keywordRanks,
  negativeReviews: mockData.negativeReviews,
  adCampaigns: mockData.adCampaigns,
  keywordBids: mockData.keywordBids,
  inventory: mockData.inventory,
  shipments: mockData.shipments,
  priceAdjustments: mockData.priceAdjustments,
  promotions: mockData.promotions,
  alerts: mockData.alerts,
  salesTrend: mockData.salesTrend,
  platformComparison: mockData.platformComparison,
  roiChartData: [],
  selectedPlatform: 'all',
  selectedDateRange: {
    start: mockData.dates30[0],
    end: mockData.dates30[mockData.dates30.length - 1],
  },
  sidebarCollapsed: false,

  fetchDashboard: () => {
    set({ loading: true });
    setTimeout(() => {
      const summary = getDashboardSummary();
      const roiData = getROIChartData();
      set({
        dashboardSummary: summary,
        salesTrend: summary.salesTrend,
        platformComparison: summary.platformComparison,
        alerts: summary.alerts,
        roiChartData: roiData,
        loading: false,
      });
    }, 500);
  },

  setSelectedPlatform: (platform) => {
    set({ selectedPlatform: platform });
    const trend = getSalesTrend(platform === 'all' ? undefined : platform);
    set({ salesTrend: trend });
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },

  updateReviewResponse: (id, response, category) => {
    set((state) => ({
      negativeReviews: state.negativeReviews.map((r) =>
        r.id === id
          ? {
              ...r,
              responseStrategy: response,
              reasonCategory: category,
              responseDate: new Date().toISOString().split('T')[0],
              status: 'responded',
            }
          : r
      ),
    }));
  },

  updateProductStatus: (id, status) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, status } : p
      ),
    }));
  },
}));
