import { SpeciesRecord, DiversityIndex, CorrelationPoint } from '../types';

export function calculateShannonIndex(speciesCounts: number[]): number {
  const total = speciesCounts.reduce((sum, count) => sum + count, 0);
  if (total === 0) return 0;
  
  let shannon = 0;
  for (const count of speciesCounts) {
    if (count > 0) {
      const p = count / total;
      shannon -= p * Math.log(p);
    }
  }
  return parseFloat(shannon.toFixed(4));
}

export function calculateSimpsonIndex(speciesCounts: number[]): number {
  const total = speciesCounts.reduce((sum, count) => sum + count, 0);
  if (total < 2) return 0;
  
  let sumNi = 0;
  for (const count of speciesCounts) {
    sumNi += count * (count - 1);
  }
  const simpson = 1 - (sumNi / (total * (total - 1)));
  return parseFloat(simpson.toFixed(4));
}

export function calculateDiversityIndex(
  speciesRecords: SpeciesRecord[],
  siteId: string,
  date: string
): DiversityIndex {
  const siteRecords = speciesRecords.filter(
    (r) => r.siteId === siteId
  );
  
  const speciesCounts = siteRecords.map((r) => r.count);
  const totalIndividuals = speciesCounts.reduce((sum, c) => sum + c, 0);
  
  return {
    id: `idx-${Date.now()}`,
    siteId,
    date,
    shannonIndex: calculateShannonIndex(speciesCounts),
    simpsonIndex: calculateSimpsonIndex(speciesCounts),
    speciesCount: siteRecords.length,
    totalIndividuals,
  };
}

export function calculatePearsonCorrelation(
  xValues: number[],
  yValues: number[]
): number {
  if (xValues.length !== yValues.length || xValues.length < 2) return 0;
  
  const n = xValues.length;
  const sumX = xValues.reduce((sum, val) => sum + val, 0);
  const sumY = yValues.reduce((sum, val) => sum + val, 0);
  const sumXY = xValues.reduce((sum, val, i) => sum + val * yValues[i], 0);
  const sumX2 = xValues.reduce((sum, val) => sum + val * val, 0);
  const sumY2 = yValues.reduce((sum, val) => sum + val * val, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  if (denominator === 0) return 0;
  return parseFloat((numerator / denominator).toFixed(4));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}
