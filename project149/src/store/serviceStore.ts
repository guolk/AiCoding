import { create } from 'zustand';
import type { ServiceRecord } from '../types';
import { services as mockServices } from '../data/services';

export interface ServiceItem {
  dishName: string;
  portion: number;
  rating?: number;
  feedback?: string;
}

export interface Service {
  id: string;
  customerId: string;
  customerName: string;
  menuId: string;
  menuName: string;
  date: string;
  time: string;
  location: string;
  guestCount: number;
  dishes: ServiceItem[];
  totalPrice: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  prepTimeline?: {
    task: string;
    startTime: string;
    duration: number;
  }[];
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Review {
  id: string;
  serviceId: string;
  customerId: string;
  overallRating: number;
  tasteRating: number;
  presentationRating: number;
  serviceRating: number;
  valueRating: number;
  comment: string;
  improvements: string;
  wouldRecommend: boolean;
  createdAt: string;
}

export interface RepurchaseStats {
  totalServices: number;
  repeatCustomers: number;
  repeatRate: number;
  averageServicesPerCustomer: number;
  customerRetention: {
    period: string;
    retained: number;
    total: number;
  }[];
  popularDishes: {
    name: string;
    count: number;
    averageRating: number;
  }[];
}

interface ServiceState {
  services: ServiceRecord[];
  reviews: Review[];
  repurchaseStats: RepurchaseStats | null;
}

interface ServiceActions {
  fetchServices: () => Promise<void>;
  addService: (service: Omit<ServiceRecord, 'id'>) => void;
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  updateCustomerPreferences: (customerId: string, preferences: {
    dietaryRestrictions?: string[];
    allergies?: string[];
    tastePreferences?: Partial<{ spicy: number; salty: number; sweet: number; sour: number; bitter: number }>;
    dislikedIngredients?: string[];
    favoriteCuisines?: string[];
    notes?: string;
  }) => Promise<void>;
  calculateRepurchaseRate: () => RepurchaseStats;
}

export type ServiceStore = ServiceState & ServiceActions;

export const useServiceStore = create<ServiceStore>((set, get) => ({
  services: mockServices,
  reviews: [],
  repurchaseStats: null,

  fetchServices: async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  },

  addService: (serviceData) => {
    const newService: ServiceRecord = {
      ...serviceData,
      id: Date.now().toString(),
    };
    set((state) => ({
      services: [...state.services, newService],
    }));
  },

  addReview: (reviewData) => {
    const newReview: Review = {
      ...reviewData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      reviews: [...state.reviews, newReview],
    }));
  },

  updateCustomerPreferences: async (customerId, preferences) => {
    const { useCustomerStore } = await import('./customerStore');
    useCustomerStore.getState().updatePreferences(customerId, preferences);
  },

  calculateRepurchaseRate: () => {
    const { services, reviews } = get();
    
    const customerServiceCount = new Map<string, number>();
    services.forEach((service) => {
      const count = customerServiceCount.get(service.customerId) || 0;
      customerServiceCount.set(service.customerId, count + 1);
    });

    const totalServices = services.length;
    const totalCustomers = customerServiceCount.size;
    const repeatCustomers = Array.from(customerServiceCount.values()).filter(
      (count) => count > 1
    ).length;
    const repeatRate = totalCustomers > 0 ? repeatCustomers / totalCustomers : 0;
    const averageServicesPerCustomer =
      totalCustomers > 0 ? totalServices / totalCustomers : 0;

    const dishStats = new Map<
      string,
      { count: number; totalRating: number; ratingCount: number }
    >();
    services.forEach((service) => {
      service.menu.forEach((item) => {
        const existing = dishStats.get(item.dishName) || {
          count: 0,
          totalRating: 0,
          ratingCount: 0,
        };
        existing.count++;
        const dishRating = service.dishesRating.find(
          (dr) => dr.dishId === item.dishId
        );
        if (dishRating) {
          existing.totalRating += dishRating.rating;
          existing.ratingCount++;
        }
        dishStats.set(item.dishName, existing);
      });
    });

    const popularDishes = Array.from(dishStats.entries())
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        averageRating:
          stats.ratingCount > 0 ? stats.totalRating / stats.ratingCount : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const calculateRetention = (startDate: Date, periodName: string) => {
      const customersInPeriod = new Set<string>();
      const retainedCustomers = new Set<string>();

      services.forEach((service) => {
        const serviceDate = new Date(service.serviceDate);
        if (serviceDate >= startDate && serviceDate <= now) {
          customersInPeriod.add(service.customerId);
          const count = customerServiceCount.get(service.customerId) || 0;
          if (count > 1) {
            retainedCustomers.add(service.customerId);
          }
        }
      });

      return {
        period: periodName,
        retained: retainedCustomers.size,
        total: customersInPeriod.size,
      };
    };

    const stats: RepurchaseStats = {
      totalServices,
      repeatCustomers,
      repeatRate,
      averageServicesPerCustomer,
      customerRetention: [
        calculateRetention(thirtyDaysAgo, '近30天'),
        calculateRetention(ninetyDaysAgo, '近90天'),
      ],
      popularDishes,
    };

    set({ repurchaseStats: stats });
    return stats;
  },
}));
