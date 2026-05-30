import { Bill, EnergyType, CARBON_FACTORS } from '../types';

export const detectAnomaly = (
  currentUsage: number,
  previousUsage: number | undefined,
  samePeriodLastYear: number | undefined,
  threshold: number = 0.3
): { isAnomaly: boolean; reason?: string } => {
  if (previousUsage && previousUsage > 0) {
    const momChange = (currentUsage - previousUsage) / previousUsage;
    if (momChange > threshold) {
      return { isAnomaly: true, reason: `环比增长 ${(momChange * 100).toFixed(1)}%` };
    }
  }
  
  if (samePeriodLastYear && samePeriodLastYear > 0) {
    const yoyChange = (currentUsage - samePeriodLastYear) / samePeriodLastYear;
    if (yoyChange > threshold) {
      return { isAnomaly: true, reason: `同比增长 ${(yoyChange * 100).toFixed(1)}%` };
    }
  }
  
  return { isAnomaly: false };
};

export const SEASON_FACTORS: Record<string, number> = {
  '1': 1.2,
  '2': 1.15,
  '3': 1.0,
  '4': 0.9,
  '5': 0.85,
  '6': 0.9,
  '7': 1.3,
  '8': 1.35,
  '9': 1.1,
  '10': 0.95,
  '11': 1.05,
  '12': 1.25,
};

export const predictNextMonthBill = (
  historicalData: Bill[],
  energyType: EnergyType
): number => {
  const typeBills = historicalData.filter(b => b.energyType === energyType);
  if (typeBills.length === 0) return 0;
  
  const avgAmount = typeBills.reduce((sum, b) => sum + b.amount, 0) / typeBills.length;
  
  const nextMonth = new Date().getMonth() + 2;
  const seasonFactor = SEASON_FACTORS[((nextMonth - 1) % 12 + 1).toString()] || 1;
  
  return avgAmount * seasonFactor;
};

export const calculateROI = (
  initialCost: number,
  monthlySavings: number
): { paybackMonths: number; yearlyROI: number; fiveYearSavings: number } => {
  if (monthlySavings <= 0) {
    return { paybackMonths: Infinity, yearlyROI: 0, fiveYearSavings: -initialCost };
  }
  
  const paybackMonths = Math.ceil(initialCost / monthlySavings);
  const yearlyROI = (monthlySavings * 12 / initialCost) * 100;
  const fiveYearSavings = monthlySavings * 60 - initialCost;
  
  return { paybackMonths, yearlyROI, fiveYearSavings };
};

export const calculateCarbonSaved = (
  electricitySaved: number = 0,
  gasSaved: number = 0,
  waterSaved: number = 0
): number => {
  return (
    electricitySaved * CARBON_FACTORS.electricity +
    gasSaved * CARBON_FACTORS.gas +
    waterSaved * CARBON_FACTORS.water
  );
};

export const calculateTotalCarbon = (bills: Bill[]): number => {
  return bills.reduce((total, bill) => {
    const factor = CARBON_FACTORS[bill.energyType];
    return total + bill.usage * factor;
  }, 0);
};

export const getAverageUsagePerPerson = (
  bills: Bill[],
  familyMembers: number
): Record<EnergyType, number> => {
  const lastMonth = bills.reduce((acc, bill) => {
    if (!acc[bill.energyType] || bill.billingPeriod > acc[bill.energyType].billingPeriod) {
      acc[bill.energyType] = bill;
    }
    return acc;
  }, {} as Record<EnergyType, Bill>);
  
  return {
    electricity: lastMonth.electricity ? lastMonth.electricity.usage / familyMembers : 0,
    gas: lastMonth.gas ? lastMonth.gas.usage / familyMembers : 0,
    water: lastMonth.water ? lastMonth.water.usage / familyMembers : 0,
  };
};

export const CITY_AVERAGE_USAGE: Record<EnergyType, number> = {
  electricity: 200,
  gas: 15,
  water: 5,
};
