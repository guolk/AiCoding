export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: IngredientCategory;
  nutrition?: NutritionInfo;
}

export type IngredientCategory = 'fresh' | 'frozen' | 'pantry' | 'spice' | 'dairy' | 'meat' | 'seafood' | 'produce' | 'other';

export interface NutritionInfo {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface RecipeStep {
  id: string;
  order: number;
  instruction: string;
  duration?: number;
  tips?: string;
}

export type CuisineType = 'chinese' | 'western' | 'japanese' | 'korean' | 'thai' | 'indian' | 'mexican' | 'italian' | 'other';
export type CookingMethod = 'stir-fry' | 'steam' | 'boil' | 'bake' | 'grill' | 'fry' | 'roast' | 'slow-cook' | 'raw' | 'other';
export type DietType = 'normal' | 'vegetarian' | 'vegan' | 'keto' | 'low-carb' | 'low-fat' | 'gluten-free' | 'dairy-free';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Recipe {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  sourceUrl?: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  cuisine: CuisineType;
  cookingMethod: CookingMethod;
  dietType: DietType;
  difficulty: DifficultyLevel;
  tags: string[];
  nutrition: NutritionInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface DietaryRestriction {
  id: string;
  type: 'allergy' | 'religion' | 'medical' | 'preference';
  name: string;
  forbiddenIngredients: string[];
  description?: string;
}

export interface MealSlot {
  id: string;
  dayOfWeek: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipeId?: string;
  recipe?: Recipe;
}

export interface MealPlan {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  meals: MealSlot[];
  dailyCalorieTarget: number;
}

export interface ShoppingItem {
  id: string;
  ingredientName: string;
  amount: number;
  unit: string;
  category: IngredientCategory;
  purchased: boolean;
  inStock: boolean;
  recipeSources: string[];
}

export interface ShoppingList {
  id: string;
  mealPlanId?: string;
  name: string;
  items: ShoppingItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IngredientSubstitution {
  ingredient: string;
  substitutes: { name: string; ratio: number; note?: string }[];
}

export interface CookingSession {
  recipeId: string;
  currentStep: number;
  servings: number;
  timers: { stepId: string; duration: number; remaining: number }[];
}

export interface UserSettings {
  dietaryRestrictions: DietaryRestriction[];
  dailyCalorieTarget: number;
  preferredCuisines: CuisineType[];
  cookingSkillLevel: DifficultyLevel;
  familyMembers: number;
}
