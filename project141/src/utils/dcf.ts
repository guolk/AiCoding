import type { DCFResult, SensitivityData } from '../types';

export function calculateDCF(
  fcf: number,
  growthRate: number,
  discountRate: number,
  terminalRate: number,
  currentPrice: number,
  years: number = 10
): DCFResult {
  const cashFlowProjections: number[] = [];
  let intrinsicValue = 0;

  for (let i = 1; i <= years; i++) {
    const fcfYear = fcf * Math.pow(1 + growthRate / 100, i);
    const discountFactor = Math.pow(1 + discountRate / 100, i);
    const discountedFCF = fcfYear / discountFactor;
    cashFlowProjections.push(discountedFCF);
    intrinsicValue += discountedFCF;
  }

  const finalFCF = fcf * Math.pow(1 + growthRate / 100, years);
  const terminalValue = (finalFCF * (1 + terminalRate / 100)) / 
    ((discountRate - terminalRate) / 100);
  const terminalDiscountFactor = Math.pow(1 + discountRate / 100, years);
  const discountedTerminalValue = terminalValue / terminalDiscountFactor;
  intrinsicValue += discountedTerminalValue;

  const marginOfSafety = intrinsicValue > 0 
    ? ((intrinsicValue - currentPrice) / intrinsicValue) * 100 
    : 0;

  return {
    intrinsicValue,
    marginOfSafety,
    cashFlowProjections,
    terminalValue: discountedTerminalValue,
  };
}

export function calculateSensitivityMatrix(
  fcf: number,
  currentPrice: number,
  terminalRate: number = 2,
  growthRates: number[] = [-5, 0, 5, 10, 15, 20],
  discountRates: number[] = [6, 8, 10, 12, 14, 16]
): SensitivityData[][] {
  const matrix: SensitivityData[][] = [];

  for (const growthRate of growthRates) {
    const row: SensitivityData[] = [];
    for (const discountRate of discountRates) {
      const result = calculateDCF(
        fcf,
        growthRate,
        discountRate,
        terminalRate,
        currentPrice
      );
      row.push({
        growthRate,
        discountRate,
        intrinsicValue: result.intrinsicValue,
        marginOfSafety: result.marginOfSafety,
      });
    }
    matrix.push(row);
  }

  return matrix;
}

export function getSafetyMarginColor(margin: number): string {
  if (margin >= 50) return 'bg-up text-white';
  if (margin >= 30) return 'bg-green-500 text-white';
  if (margin >= 10) return 'bg-yellow-500 text-black';
  if (margin >= 0) return 'bg-orange-500 text-white';
  return 'bg-down text-white';
}

export function getSafetyMarginLabel(margin: number): string {
  if (margin >= 50) return '极度安全';
  if (margin >= 30) return '安全';
  if (margin >= 10) return '合理';
  if (margin >= 0) return '略贵';
  return '高估';
}

export function generateFCFProjections(
  initialFCF: number,
  growthRate: number,
  years: number = 10
): { year: number; fcf: number; discounted: number; discountRate: number }[] {
  const projections = [];
  const discountRate = 10;

  for (let i = 1; i <= years; i++) {
    const fcf = initialFCF * Math.pow(1 + growthRate / 100, i);
    const discountFactor = Math.pow(1 + discountRate / 100, i);
    projections.push({
      year: i,
      fcf,
      discounted: fcf / discountFactor,
      discountRate,
    });
  }

  return projections;
}
