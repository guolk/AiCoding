import { UserProfile, NutritionTarget, Nutrients, FoodItem, MealEntry } from "./types";

export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: "male" | "female"
): number {
  if (gender === "male") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

export function calculateTDEE(
  bmr: number,
  activityLevel: UserProfile["activityLevel"]
): number {
  const factors: Record<UserProfile["activityLevel"], number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return Math.round(bmr * factors[activityLevel]);
}

export function calculateTargetCalories(
  tdee: number,
  goal: UserProfile["goal"]
): number {
  switch (goal) {
    case "weight_loss":
      return Math.round(tdee * 0.8);
    case "muscle_gain":
      return Math.round(tdee * 1.15);
    case "maintenance":
      return tdee;
    case "chronic_condition":
      return Math.round(tdee * 0.95);
    default:
      return tdee;
  }
}

export function getMacroRatios(
  preset: UserProfile["macroPreset"],
  custom?: UserProfile["customMacroRatios"]
) {
  if (custom) return custom;
  const presets: Record<
    UserProfile["macroPreset"],
    { protein: number; carbs: number; fat: number }
  > = {
    balanced: { protein: 0.25, carbs: 0.5, fat: 0.25 },
    keto: { protein: 0.2, carbs: 0.05, fat: 0.75 },
    low_carb: { protein: 0.3, carbs: 0.2, fat: 0.5 },
    high_protein: { protein: 0.4, carbs: 0.35, fat: 0.25 },
    vegetarian: { protein: 0.25, carbs: 0.55, fat: 0.2 },
  };
  return presets[preset];
}

export function calculateNutritionTarget(
  profile: UserProfile
): NutritionTarget {
  const targetCalories = profile.targetCalories;
  const ratios = getMacroRatios(profile.macroPreset, profile.customMacroRatios);

  return {
    calories: targetCalories,
    protein: Math.round((targetCalories * ratios.protein) / 4),
    carbs: Math.round((targetCalories * ratios.carbs) / 4),
    fat: Math.round((targetCalories * ratios.fat) / 9),
    fiber: 25,
    vitaminA: 900,
    vitaminC: 90,
    vitaminD: 20,
    calcium: 1000,
    iron: 18,
    magnesium: 400,
    potassium: 4700,
    sodium: 2300,
  };
}

export function emptyNutrients(): Nutrients {
  return {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
    vitaminA: 0,
    vitaminC: 0,
    vitaminD: 0,
    calcium: 0,
    iron: 0,
    magnesium: 0,
    potassium: 0,
    sodium: 0,
  };
}

export function scaleNutrients(
  nutrients: Nutrients,
  factor: number
): Nutrients {
  const result: any = {};
  for (const key in nutrients) {
    result[key] = +(nutrients[key as keyof Nutrients] * factor).toFixed(1);
  }
  return result;
}

export function sumNutrients(meals: MealEntry[]): Nutrients {
  const total = emptyNutrients();
  for (const meal of meals) {
    const factor = meal.quantity / meal.foodItem.servingSize;
    const scaled = scaleNutrients(meal.foodItem.nutrients, factor);
    for (const key in total) {
      total[key as keyof Nutrients] = +(
        total[key as keyof Nutrients] + scaled[key as keyof Nutrients]
      ).toFixed(1);
    }
  }
  return total;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function isHighCalorieLowNutrient(food: FoodItem): boolean {
  const { calories, protein, fiber, vitaminA, vitaminC } = food.nutrients;
  return calories > 300 && protein < 5 && fiber < 1 && vitaminA < 50 && vitaminC < 5;
}

export function getMealTypeLabel(type: MealEntry["mealType"]): string {
  const labels: Record<MealEntry["mealType"], string> = {
    breakfast: "早餐",
    lunch: "午餐",
    dinner: "晚餐",
    snack: "加餐",
  };
  return labels[type];
}

export function getActivityLevelLabel(level: UserProfile["activityLevel"]): string {
  const labels: Record<UserProfile["activityLevel"], string> = {
    sedentary: "久坐",
    light: "轻度活动",
    moderate: "中度活动",
    active: "高度活动",
    very_active: "极高活动",
  };
  return labels[level];
}

export function getGoalLabel(goal: UserProfile["goal"]): string {
  const labels: Record<UserProfile["goal"], string> = {
    weight_loss: "减重",
    muscle_gain: "增肌",
    maintenance: "维持体重",
    chronic_condition: "改善慢性病",
  };
  return labels[goal];
}

export function getMacroPresetLabel(preset: UserProfile["macroPreset"]): string {
  const labels: Record<UserProfile["macroPreset"], string> = {
    balanced: "均衡饮食",
    keto: "生酮饮食",
    low_carb: "低碳饮食",
    high_protein: "高蛋白饮食",
    vegetarian: "素食饮食",
  };
  return labels[preset];
}
