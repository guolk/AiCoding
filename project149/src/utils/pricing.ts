import type { Dish } from '../types';

export interface PricingBreakdown {
  ingredientCosts: {
    dishName: string;
    cost: number;
    quantity: number;
    perUnitCost: number;
  }[];
  subtotal: number;
  serviceFee: number;
  occasionSurcharge: number;
  total: number;
  perPerson: number;
  dishCount: number;
}

const OCCASION_MULTIPLIERS: Record<string, number> = {
  '家庭聚餐': 0.2,
  '生日派对': 0.3,
  '商务宴请': 0.5,
  '婚礼宴席': 0.8,
  '节日庆典': 0.4,
  '日常烹饪': 0.0,
  '浪漫约会': 0.3,
  '朋友聚会': 0.2,
  '健身聚会': 0.1,
  '儿童节聚餐': 0.25,
};

const GUEST_DISCOUNT_TIERS = [
  { minGuests: 1, maxGuests: 4, multiplier: 1.0 },
  { minGuests: 5, maxGuests: 9, multiplier: 0.95 },
  { minGuests: 10, maxGuests: 19, multiplier: 0.9 },
  { minGuests: 20, maxGuests: Infinity, multiplier: 0.85 },
];

export const SERVICE_FEE_OPTIONS = [
  { label: '基础服务 (20%)', rate: 0.2, description: '适合日常烹饪' },
  { label: '标准服务 (30%)', rate: 0.3, description: '含摆盘和基础服务' },
  { label: '高端服务 (40%)', rate: 0.4, description: '含专业摆盘和侍餐' },
  { label: 'VIP服务 (50%)', rate: 0.5, description: '全程管家式服务' },
];

export function calculateIngredientsCost(
  dishes: Dish[],
  portions: number[],
  guestCount: number
): number {
  let totalCost = 0;

  dishes.forEach((dish, index) => {
    const portion = portions[index] || 1;
    const multiplier = portion * guestCount;
    totalCost += dish.cost * multiplier;
  });

  return Math.round(totalCost * 100) / 100;
}

export function calculateServiceFee(
  baseCost: number,
  serviceFeeRate: number = 0.3
): number {
  return Math.round(baseCost * serviceFeeRate * 100) / 100;
}

export function calculateOccasionSurcharge(
  baseCost: number,
  occasionType: string
): number {
  const multiplier = OCCASION_MULTIPLIERS[occasionType] || 0.0;
  return Math.round(baseCost * multiplier * 100) / 100;
}

export function calculateGuestDiscount(
  baseCost: number,
  guestCount: number
): { discount: number; multiplier: number } {
  const discountTier = GUEST_DISCOUNT_TIERS.find(
    (tier) => guestCount >= tier.minGuests && guestCount <= tier.maxGuests
  );
  const multiplier = discountTier?.multiplier || 1.0;
  const discount = Math.round(baseCost * (1 - multiplier) * 100) / 100;
  return { discount, multiplier };
}

export function calculateTotalPrice(
  ingredientsCost: number,
  serviceFee: number,
  occasionSurcharge: number = 0,
  guestDiscount: number = 0
): number {
  return Math.round((ingredientsCost + serviceFee + occasionSurcharge - guestDiscount) * 100) / 100;
}

export function getPricingBreakdown(
  dishes: Dish[],
  portions: number[],
  guestCount: number,
  occasionType: string,
  serviceFeeRate: number = 0.3
): PricingBreakdown {
  const ingredientCosts = dishes.map((dish, index) => {
    const portion = portions[index] || 1;
    const multiplier = portion * guestCount;
    const perUnitCost = dish.cost;
    const cost = Math.round(dish.cost * multiplier * 100) / 100;
    return {
      dishName: dish.name,
      cost,
      quantity: portion,
      perUnitCost,
    };
  });

  const subtotal = calculateIngredientsCost(dishes, portions, guestCount);
  const serviceFee = calculateServiceFee(subtotal, serviceFeeRate);
  const occasionSurcharge = calculateOccasionSurcharge(subtotal, occasionType);
  const { discount: guestDiscount } = calculateGuestDiscount(subtotal, guestCount);
  const total = calculateTotalPrice(subtotal, serviceFee, occasionSurcharge, guestDiscount);

  return {
    ingredientCosts,
    subtotal,
    serviceFee,
    occasionSurcharge,
    total,
    perPerson: guestCount > 0 ? Math.round((total / guestCount) * 100) / 100 : 0,
    dishCount: dishes.length,
  };
}

export function getOccasionLabel(occasionType: string): string {
  return occasionType || '日常烹饪';
}

export function getOccasionSurchargePercent(occasionType: string): number {
  return (OCCASION_MULTIPLIERS[occasionType] || 0.0) * 100;
}
