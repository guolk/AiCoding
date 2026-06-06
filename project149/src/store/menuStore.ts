import { create } from 'zustand';
import type { Dish, Menu } from '../types';
import { calculateTotalNutrition } from '../utils/nutrition';
import { getPricingBreakdown } from '../utils/pricing';

export interface LocalMenuDish {
  dish?: Dish;
  portion: number;
  notes?: string;
  order: number;
}

interface MenuState {
  currentMenu: Omit<Menu, 'id' | 'createdAt' | 'dishes'> & { dishes: LocalMenuDish[] } | null;
  menus: Menu[];
  guestCount: number;
  serviceFeeRate: number;
}

interface MenuActions {
  createMenu: (data: {
    customerId?: string;
    name: string;
    occasionType: string;
  }) => void;
  addDishToMenu: (dish: Dish, portion?: number, notes?: string) => void;
  removeDishFromMenu: (dishId: string) => void;
  updateDishPortion: (dishId: string, portion: number) => void;
  reorderDishes: (fromIndex: number, toIndex: number) => void;
  updateGuestCount: (count: number) => void;
  updateServiceFeeRate: (rate: number) => void;
  updateMenuField: (field: string, value: any) => void;
  calculateNutrition: () => void;
  calculatePrice: () => void;
  saveMenu: () => string | null;
  clearMenu: () => void;
}

export type MenuStore = MenuState & MenuActions;

export const useMenuStore = create<MenuStore>((set, get) => ({
  currentMenu: null,
  menus: [],
  guestCount: 1,
  serviceFeeRate: 0.3,

  createMenu: (data) => {
    const newMenu = {
      customerId: data.customerId || '',
      name: data.name,
      occasionType: data.occasionType,
      dishes: [],
      nutritionSummary: {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        perPersonCalories: 0,
      },
      totalCost: 0,
      serviceFee: 0,
      totalPrice: 0,
      status: 'draft' as const,
    };
    set({ currentMenu: newMenu });
  },

  addDishToMenu: (dish, portion = 1, notes) => {
    set((state) => {
      if (!state.currentMenu) return state;
      const existingIndex = state.currentMenu.dishes.findIndex(
        (md) => md.dish!.id === dish.id
      );
      let newDishes: LocalMenuDish[];
      if (existingIndex >= 0) {
        newDishes = [...state.currentMenu.dishes];
        newDishes[existingIndex] = {
          ...newDishes[existingIndex],
          portion: newDishes[existingIndex].portion + portion,
          notes: notes || newDishes[existingIndex].notes,
        };
      } else {
        newDishes = [...state.currentMenu.dishes, { 
          dish, 
          portion, 
          notes, 
          order: state.currentMenu.dishes.length 
        }];
      }
      return {
        currentMenu: {
          ...state.currentMenu,
          dishes: newDishes,
        },
      };
    });
    get().calculateNutrition();
    get().calculatePrice();
  },

  removeDishFromMenu: (dishId) => {
    set((state) => {
      if (!state.currentMenu) return state;
      const newDishes = state.currentMenu.dishes
        .filter((md) => md.dish!.id !== dishId)
        .map((md, index) => ({ ...md, order: index }));
      return {
        currentMenu: {
          ...state.currentMenu,
          dishes: newDishes,
        },
      };
    });
    get().calculateNutrition();
    get().calculatePrice();
  },

  updateDishPortion: (dishId, portion) => {
    set((state) => {
      if (!state.currentMenu) return state;
      return {
        currentMenu: {
          ...state.currentMenu,
          dishes: state.currentMenu.dishes.map((md) =>
            md.dish!.id === dishId ? { ...md, portion: Math.max(1, portion) } : md
          ),
        },
      };
    });
    get().calculateNutrition();
    get().calculatePrice();
  },

  reorderDishes: (fromIndex, toIndex) => {
    set((state) => {
      if (!state.currentMenu) return state;
      const newDishes = [...state.currentMenu.dishes];
      const [removed] = newDishes.splice(fromIndex, 1);
      newDishes.splice(toIndex, 0, removed);
      const reorderedDishes = newDishes.map((md, index) => ({ ...md, order: index }));
      return {
        currentMenu: {
          ...state.currentMenu,
          dishes: reorderedDishes,
        },
      };
    });
  },

  updateGuestCount: (count) => {
    set({ guestCount: Math.max(1, count) });
    get().calculateNutrition();
    get().calculatePrice();
  },

  updateServiceFeeRate: (rate) => {
    set({ serviceFeeRate: rate });
    get().calculatePrice();
  },

  updateMenuField: (field, value) => {
    set((state) => {
      if (!state.currentMenu) return state;
      return {
        currentMenu: {
          ...state.currentMenu,
          [field]: value,
        },
      };
    });
  },

  calculateNutrition: () => {
    set((state) => {
      if (!state.currentMenu || state.currentMenu.dishes.length === 0) {
        return {
          currentMenu: state.currentMenu ? {
            ...state.currentMenu,
            nutritionSummary: {
              totalCalories: 0,
              totalProtein: 0,
              totalCarbs: 0,
              totalFat: 0,
              perPersonCalories: 0,
            },
          } : null,
        };
      }
      const dishes = state.currentMenu.dishes.map((md) => md.dish!);
      const portions = state.currentMenu.dishes.map((md) => md.portion);
      const nutrition = calculateTotalNutrition(dishes, portions, state.guestCount);
      return {
        currentMenu: {
          ...state.currentMenu,
          nutritionSummary: {
            totalCalories: nutrition.totalCalories,
            totalProtein: nutrition.totalProtein,
            totalCarbs: nutrition.totalCarbs,
            totalFat: nutrition.totalFat,
            perPersonCalories: nutrition.perPersonCalories,
          },
        },
      };
    });
  },

  calculatePrice: () => {
    set((state) => {
      if (!state.currentMenu || state.currentMenu.dishes.length === 0) {
        return {
          currentMenu: state.currentMenu ? {
            ...state.currentMenu,
            totalCost: 0,
            serviceFee: 0,
            totalPrice: 0,
          } : null,
        };
      }
      const dishes = state.currentMenu.dishes.map((md) => md.dish!);
      const portions = state.currentMenu.dishes.map((md) => md.portion);
      const pricing = getPricingBreakdown(
        dishes,
        portions,
        state.guestCount,
        state.currentMenu.occasionType,
        state.serviceFeeRate
      );
      return {
        currentMenu: {
          ...state.currentMenu,
          totalCost: pricing.subtotal,
          serviceFee: pricing.serviceFee + pricing.occasionSurcharge,
          totalPrice: pricing.total,
        },
      };
    });
  },

  saveMenu: () => {
    const { currentMenu, menus } = get();
    if (!currentMenu || currentMenu.dishes.length === 0) return null;
    
    const menuId = `menu-${Date.now()}`;
    const newMenu: Menu = {
      id: menuId,
      customerId: currentMenu.customerId || '',
      name: currentMenu.name,
      occasionType: currentMenu.occasionType,
      dishes: currentMenu.dishes.map((md) => ({
        dishId: md.dish!.id,
        portion: md.portion,
      })),
      nutritionSummary: currentMenu.nutritionSummary,
      totalCost: currentMenu.totalCost,
      serviceFee: currentMenu.serviceFee,
      totalPrice: currentMenu.totalPrice,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    
    set({ 
      menus: [...menus, newMenu],
      currentMenu: null,
    });
    
    return menuId;
  },

  clearMenu: () => {
    set({ 
      currentMenu: null,
      guestCount: 1,
      serviceFeeRate: 0.3,
    });
  },
}));
