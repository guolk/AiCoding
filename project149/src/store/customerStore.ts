import { create } from 'zustand';
import type { Customer } from '../types';
import { customers as mockCustomers } from '../data/customers';

interface CustomerState {
  customers: Customer[];
  loading: boolean;
  selectedCustomer: Customer | null;
}

interface CustomerActions {
  fetchCustomers: () => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  selectCustomer: (customer: Customer | null) => void;
  addServiceRecord: (customerId: string, record: { date: string; price: number }) => void;
  updatePreferences: (customerId: string, preferences: {
    dietaryRestrictions?: string[];
    allergies?: string[];
    tastePreferences?: Partial<Customer['tastePreferences']>;
    dislikedIngredients?: string[];
    favoriteCuisines?: string[];
    notes?: string;
  }) => void;
}

export type CustomerStore = CustomerState & CustomerActions;

export const useCustomerStore = create<CustomerStore>((set) => ({
  customers: mockCustomers,
  loading: false,
  selectedCustomer: null,

  fetchCustomers: async () => {
    set({ loading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },

  addCustomer: (customerData) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      customers: [...state.customers, newCustomer],
    }));
  },

  updateCustomer: (id, updates) => {
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      ),
      selectedCustomer:
        state.selectedCustomer?.id === id
          ? { ...state.selectedCustomer, ...updates, updatedAt: new Date().toISOString() }
          : state.selectedCustomer,
    }));
  },

  deleteCustomer: (id) => {
    set((state) => ({
      customers: state.customers.filter((c) => c.id !== id),
      selectedCustomer: state.selectedCustomer?.id === id ? null : state.selectedCustomer,
    }));
  },

  selectCustomer: (customer) => {
    set({ selectedCustomer: customer });
  },

  addServiceRecord: (customerId, record) => {
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === customerId
          ? {
              ...c,
              updatedAt: new Date().toISOString(),
            }
          : c
      ),
      selectedCustomer:
        state.selectedCustomer?.id === customerId
          ? {
              ...state.selectedCustomer,
              updatedAt: new Date().toISOString(),
            }
          : state.selectedCustomer,
    }));
  },

  updatePreferences: (customerId, preferences) => {
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === customerId
          ? {
              ...c,
              ...preferences,
              tastePreferences: preferences.tastePreferences
                ? { ...c.tastePreferences, ...preferences.tastePreferences }
                : c.tastePreferences,
              updatedAt: new Date().toISOString(),
            }
          : c
      ),
      selectedCustomer:
        state.selectedCustomer?.id === customerId
          ? {
              ...state.selectedCustomer,
              ...preferences,
              tastePreferences: preferences.tastePreferences
                ? { ...state.selectedCustomer.tastePreferences, ...preferences.tastePreferences }
                : state.selectedCustomer.tastePreferences,
              updatedAt: new Date().toISOString(),
            }
          : state.selectedCustomer,
    }));
  },
}));
