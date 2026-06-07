import type { Patent } from './patent';

export interface ValuationFactor {
  name: string;
  weight: number;
  score: number;
  description: string;
}

export interface PatentValuation {
  id: string;
  patentId: string;
  valuationDate: string;
  valuationMethod: string;
  estimatedValue: number;
  currency: string;
  factors: ValuationFactor[];
  assumptions: string;
  limitations: string;
  valuer: string;
  patent?: Patent;
}
