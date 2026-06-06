import type { Dish } from '../types';

export interface NutritionAdvice {
  category: 'calories' | 'protein' | 'carbs' | 'fat';
  status: 'excellent' | 'good' | 'moderate' | 'high' | 'low';
  message: string;
  suggestion: string;
}

export interface NutritionAnalysis {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  perPersonCalories: number;
  perPersonProtein: number;
  perPersonCarbs: number;
  perPersonFat: number;
  proteinPercentage: number;
  carbsPercentage: number;
  fatPercentage: number;
}

const DAILY_RECOMMENDATIONS = {
  calories: 2000,
  protein: 60,
  carbs: 300,
  fat: 65,
};

export function calculateTotalNutrition(
  dishes: Dish[],
  portions: number[],
  guestCount: number
): NutritionAnalysis {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  dishes.forEach((dish, index) => {
    const portion = portions[index] || 1;
    totalCalories += dish.nutrition.calories * portion;
    totalProtein += dish.nutrition.protein * portion;
    totalCarbs += dish.nutrition.carbs * portion;
    totalFat += dish.nutrition.fat * portion;
  });

  const totalMacroCalories = (totalProtein + totalCarbs) * 4 + totalFat * 9;
  const proteinPercentage = totalMacroCalories > 0 ? Math.round(((totalProtein * 4) / totalMacroCalories) * 100) : 0;
  const carbsPercentage = totalMacroCalories > 0 ? Math.round(((totalCarbs * 4) / totalMacroCalories) * 100) : 0;
  const fatPercentage = totalMacroCalories > 0 ? Math.round(((totalFat * 9) / totalMacroCalories) * 100) : 0;

  return {
    totalCalories: Math.round(totalCalories),
    totalProtein: Math.round(totalProtein * 10) / 10,
    totalCarbs: Math.round(totalCarbs * 10) / 10,
    totalFat: Math.round(totalFat * 10) / 10,
    perPersonCalories: Math.round(totalCalories / guestCount),
    perPersonProtein: Math.round((totalProtein / guestCount) * 10) / 10,
    perPersonCarbs: Math.round((totalCarbs / guestCount) * 10) / 10,
    perPersonFat: Math.round((totalFat / guestCount) * 10) / 10,
    proteinPercentage,
    carbsPercentage,
    fatPercentage,
  };
}

export function analyzeNutritionBalance(
  nutrition: NutritionAnalysis
): NutritionAdvice[] {
  const advice: NutritionAdvice[] = [];
  const perPerson = {
    calories: nutrition.perPersonCalories,
    protein: nutrition.perPersonProtein,
    carbs: nutrition.perPersonCarbs,
    fat: nutrition.perPersonFat,
  };

  const checkNutrient = (
    key: keyof typeof perPerson,
    label: string,
    recommended: number,
    unit: string,
    idealRange: [number, number]
  ) => {
    const value = perPerson[key];
    const ratio = value / recommended;
    const [low, high] = idealRange;

    let status: NutritionAdvice['status'];
    let message: string;
    let suggestion: string;

    if (ratio >= low && ratio <= high) {
      status = 'excellent';
      message = `${label}含量理想，为${value}${unit}/人`;
      suggestion = '继续保持当前的配比';
    } else if (ratio >= low * 0.7 && ratio <= high * 1.3) {
      status = 'good';
      message = `${label}含量适中，为${value}${unit}/人`;
      suggestion = '可根据客人需求微调';
    } else if (ratio < low * 0.7) {
      status = 'low';
      message = `${label}含量偏低，为${value}${unit}/人`;
      suggestion = `建议增加富含${label}的食材`;
    } else {
      status = 'high';
      message = `${label}含量偏高，为${value}${unit}/人`;
      suggestion = `建议减少${label}摄入`;
    }

    advice.push({ category: key, status, message, suggestion });
  };

  checkNutrient('calories', '热量', DAILY_RECOMMENDATIONS.calories, 'kcal', [0.7, 1.2]);
  checkNutrient('protein', '蛋白质', DAILY_RECOMMENDATIONS.protein, 'g', [0.8, 1.2]);
  checkNutrient('carbs', '碳水化合物', DAILY_RECOMMENDATIONS.carbs, 'g', [0.6, 1.2]);
  checkNutrient('fat', '脂肪', DAILY_RECOMMENDATIONS.fat, 'g', [0.5, 1.0]);

  return advice;
}

export function generateNutritionSummary(dishes: Dish[]): {
  highlights: string[];
  warnings: string[];
} {
  const highlights: string[] = [];
  const warnings: string[] = [];

  dishes.forEach((dish) => {
    if (dish.tags.includes('高蛋白') || dish.nutrition.protein > 25) {
      highlights.push(`${dish.name}是优质蛋白来源`);
    }
    if (dish.tags.includes('低脂') || dish.nutrition.fat < 10) {
      highlights.push(`${dish.name}脂肪含量低`);
    }
    if (dish.tags.includes('高纤维')) {
      highlights.push(`${dish.name}富含膳食纤维`);
    }
    if (dish.nutrition.calories > 500) {
      warnings.push(`${dish.name}热量较高，注意分量`);
    }
  });

  if (dishes.some((d) => d.category === 'appetizer')) {
    highlights.push('菜单包含前菜，用餐体验更完整');
  }
  if (dishes.some((d) => d.category === 'soup')) {
    highlights.push('菜单包含汤品，搭配更均衡');
  }
  if (dishes.some((d) => d.category === 'dessert')) {
    highlights.push('菜单包含甜点，提升用餐体验');
  }

  return { highlights, warnings };
}
