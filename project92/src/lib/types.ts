export interface Nutrients {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  vitaminA: number;
  vitaminC: number;
  vitaminD: number;
  calcium: number;
  iron: number;
  magnesium: number;
  potassium: number;
  sodium: number;
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  nutrients: Nutrients;
  barcode?: string;
  imageUrl?: string;
  source: "openfoodfacts" | "custom" | "photo";
  isFavorite?: boolean;
}

export interface MealEntry {
  id: string;
  foodItem: FoodItem;
  quantity: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  timestamp: string;
  photoUrl?: string;
  notes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female";
  height: number;
  weight: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal: "weight_loss" | "muscle_gain" | "maintenance" | "chronic_condition";
  chronicCondition?: string;
  bmr: number;
  tdee: number;
  targetCalories: number;
  macroPreset: "balanced" | "keto" | "low_carb" | "high_protein" | "vegetarian";
  customMacroRatios?: {
    protein: number;
    carbs: number;
    fat: number;
  };
  waterTarget: number;
  createdAt: string;
}

export interface WaterEntry {
  id: string;
  amount: number;
  timestamp: string;
}

export interface FoodReaction {
  id: string;
  foodItemId: string;
  foodItemName: string;
  timestamp: string;
  energyLevel: 1 | 2 | 3 | 4 | 5;
  digestion: "good" | "normal" | "bad";
  symptoms?: string[];
  notes?: string;
}

export interface DailyNutrition {
  date: string;
  meals: MealEntry[];
  waterEntries: WaterEntry[];
  totalNutrients: Nutrients;
}

export interface NutritionTarget {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  vitaminA: number;
  vitaminC: number;
  vitaminD: number;
  calcium: number;
  iron: number;
  magnesium: number;
  potassium: number;
  sodium: number;
}
