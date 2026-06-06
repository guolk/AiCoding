import { create } from 'zustand';
import type { Dish } from '../types';
import { dishes as mockDishes } from '../data/dishes';

export type DishCategory = 'appetizer' | 'main' | 'soup' | 'dessert' | 'drink';

export interface DishFilter {
  category?: DishCategory;
  cuisine?: string;
  dietaryTag?: string;
  maxPrice?: number;
  maxCookingTime?: number;
  searchTerm?: string;
  excludeIngredients?: string[];
  excludeAllergies?: string[];
}

interface DishState {
  dishes: Dish[];
  loading: boolean;
  filter: DishFilter;
}

interface DishActions {
  fetchDishes: () => Promise<void>;
  addDish: (dish: Omit<Dish, 'id'>) => void;
  updateDish: (id: string, updates: Partial<Dish>) => void;
  deleteDish: (id: string) => void;
  filterDishes: (filter: DishFilter) => Dish[];
  getRecommendedDishes: (customerPreferences: {
    favoriteCuisines: string[];
    dislikedIngredients: string[];
    allergies: string[];
    dietaryRestrictions: string[];
  }) => Dish[];
}

export type DishStore = DishState & DishActions;

export const useDishStore = create<DishStore>((set, get) => ({
  dishes: mockDishes,
  loading: false,
  filter: {},

  fetchDishes: async () => {
    set({ loading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },

  addDish: (dishData) => {
    const newDish: Dish = {
      ...dishData,
      id: `dish-${Date.now()}`,
    };
    set((state) => ({
      dishes: [...state.dishes, newDish],
    }));
  },

  updateDish: (id, updates) => {
    set((state) => ({
      dishes: state.dishes.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    }));
  },

  deleteDish: (id) => {
    set((state) => ({
      dishes: state.dishes.filter((d) => d.id !== id),
    }));
  },

  filterDishes: (filter) => {
    const { dishes } = get();
    return dishes.filter((dish) => {
      if (filter.category && dish.category !== filter.category) return false;
      if (filter.cuisine && dish.cuisine !== filter.cuisine) return false;
      if (filter.maxPrice && dish.cost > filter.maxPrice) return false;
      if (filter.maxCookingTime && (dish.prepTime + dish.cookTime) > filter.maxCookingTime) return false;
      
      if (filter.excludeIngredients) {
        const hasExcluded = dish.ingredients.some(ing => 
          filter.excludeIngredients!.some(excl => 
            ing.name.toLowerCase().includes(excl.toLowerCase())
          )
        );
        if (hasExcluded) return false;
      }
      
      if (filter.excludeAllergies) {
        const hasAllergen = dish.ingredients.some(ing =>
          filter.excludeAllergies!.some(allergy =>
            ing.name.toLowerCase().includes(allergy.toLowerCase())
          )
        );
        if (hasAllergen) return false;
      }
      
      if (filter.searchTerm) {
        const term = filter.searchTerm.toLowerCase();
        return (
          dish.name.toLowerCase().includes(term) ||
          dish.cuisine.toLowerCase().includes(term) ||
          dish.tags.some((tag) => tag.toLowerCase().includes(term))
        );
      }
      return true;
    });
  },

  getRecommendedDishes: (preferences) => {
    const { dishes } = get();
    return dishes
      .filter((dish) => {
        const hasDislikedIngredient = dish.ingredients.some(ing =>
          preferences.dislikedIngredients.some(disliked =>
            ing.name.toLowerCase().includes(disliked.toLowerCase())
          )
        );
        if (hasDislikedIngredient) return false;

        const hasAllergen = dish.ingredients.some(ing =>
          preferences.allergies.some(allergy =>
            ing.name.toLowerCase().includes(allergy.toLowerCase())
          )
        );
        if (hasAllergen) return false;

        return true;
      })
      .sort((a, b) => {
        const aMatch = preferences.favoriteCuisines.includes(a.cuisine) ? 1 : 0;
        const bMatch = preferences.favoriteCuisines.includes(b.cuisine) ? 1 : 0;
        return bMatch - aMatch;
      });
  },
}));
