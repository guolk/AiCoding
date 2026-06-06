export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  dietaryRestrictions: string[];
  allergies: string[];
  tastePreferences: {
    spicy: number;
    salty: number;
    sweet: number;
    sour: number;
    bitter: number;
  };
  dislikedIngredients: string[];
  favoriteCuisines: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface DishIngredient {
  name: string;
  amount: number;
  unit: string;
}

export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export type DishCategory = 'appetizer' | 'main' | 'soup' | 'dessert' | 'drink';

export interface Dish {
  id: string;
  name: string;
  category: DishCategory;
  cuisine: string;
  ingredients: DishIngredient[];
  nutrition: Nutrition;
  cost: number;
  prepTime: number;
  cookTime: number;
  image: string;
  tags: string[];
}

export interface MenuDish {
  dishId: string;
  dishName?: string;
  portion: number;
  dish?: Dish;
  order?: number;
  notes?: string;
}

export interface NutritionSummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  perPersonCalories: number;
}

export type MenuStatus = 'draft' | 'confirmed' | 'completed' | 'cancelled';

export interface Menu {
  id: string;
  customerId: string;
  name: string;
  occasionType: string;
  dishes: MenuDish[];
  nutritionSummary: NutritionSummary;
  totalCost: number;
  serviceFee: number;
  totalPrice: number;
  status: MenuStatus;
  createdAt: string;
}

export interface ServiceMenuDish {
  dishId: string;
  dishName: string;
}

export interface DishRating {
  dishId: string;
  rating: number;
}

export interface ServiceRecord {
  id: string;
  customerId: string;
  serviceDate: string;
  guestCount: number;
  occasion: string;
  menu: ServiceMenuDish[];
  totalPrice: number;
  rating: number;
  feedback: string;
  dishesRating: DishRating[];
  improvements: string[];
  newPreferences: string[];
}

export interface SpecialRequest {
  id: string;
  customerId: string;
  occasionType: string;
  description: string;
  eventDate: string;
  guestCount: number;
  preferences: Record<string, any>;
  createdAt: string;
}

export interface ShoppingItem {
  name: string;
  amount: number;
  unit: string;
  checked: boolean;
  purchased: boolean;
}

export interface TimelineItem {
  dishId: string;
  dishName: string;
  startTime: string;
  endTime: string;
  servingOrder: number;
  status: 'pending' | 'preparing' | 'cooking' | 'ready' | 'served';
}

export interface EquipmentItem {
  name: string;
  category: string;
  checked: boolean;
}

export type PreparationStatus = 'pending' | 'in_progress' | 'shopping' | 'preparing' | 'ready' | 'completed';

export interface PreparationPlan {
  id: string;
  serviceId: string;
  menuId: string;
  shoppingList: ShoppingItem[];
  timeline: TimelineItem[];
  equipmentChecklist: EquipmentItem[];
  status: PreparationStatus;
  createdAt: string;
}
