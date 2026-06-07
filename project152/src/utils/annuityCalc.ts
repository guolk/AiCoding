import type { AnnuityRecord, PatentType } from '../types';
import { addYears, isExpired } from './dateUtils';
import { generateId } from './formatters';

const INVENTION_FEE_SCALE: Record<string, number> = {
  '1-3': 900,
  '4-6': 1200,
  '7-9': 2000,
  '10-12': 4000,
  '13-15': 6000,
  '16-20': 8000,
};

const UTILITY_MODEL_FEE_SCALE: Record<string, number> = {
  '1-3': 600,
  '4-5': 900,
  '6-8': 1200,
  '9-10': 2000,
};

const DESIGN_FEE_SCALE: Record<string, number> = {
  '1-3': 600,
  '4-5': 900,
  '6-8': 1200,
  '9-10': 2000,
};

function getFeeScale(patentType: string): Record<string, number> {
  switch (patentType) {
    case 'INVENTION':
      return INVENTION_FEE_SCALE;
    case 'UTILITY_MODEL':
      return UTILITY_MODEL_FEE_SCALE;
    case 'DESIGN':
      return DESIGN_FEE_SCALE;
    default:
      return INVENTION_FEE_SCALE;
  }
}

export function calculateAnnuityAmount(year: number, patentType: string): number {
  const feeScale = getFeeScale(patentType);

  for (const [range, fee] of Object.entries(feeScale)) {
    const [min, max] = range.split('-').map(Number);
    if (year >= min && year <= max) {
      return fee;
    }
  }

  const maxYear = Math.max(...Object.keys(feeScale).map((r) => Number(r.split('-')[1])));
  if (year > maxYear) {
    const lastRange = Object.keys(feeScale).reduce((a, b) => {
      const aMax = Number(a.split('-')[1]);
      const bMax = Number(b.split('-')[1]);
      return aMax > bMax ? a : b;
    });
    return feeScale[lastRange];
  }

  return 900;
}

export function generateAnnuitySchedule(
  applicationDate: string,
  patentType: PatentType,
  years: number
): AnnuityRecord[] {
  const records: AnnuityRecord[] = [];
  const maxYears = patentType === 'INVENTION' ? 20 : 10;
  const actualYears = Math.min(years, maxYears);

  for (let year = 1; year <= actualYears; year++) {
    const dueDate = addYears(applicationDate, year);
    const amount = calculateAnnuityAmount(year, patentType);

    records.push({
      id: generateId(),
      year,
      dueDate,
      amount,
      status: 'PENDING',
    });
  }

  return records;
}

export function checkAnnuityStatus(
  record: AnnuityRecord
): 'PENDING' | 'PAID' | 'OVERDUE' | 'EXEMPTED' {
  if (record.status === 'EXEMPTED') {
    return 'EXEMPTED';
  }

  if (record.status === 'PAID') {
    return 'PAID';
  }

  if (isExpired(record.dueDate)) {
    return 'OVERDUE';
  }

  return 'PENDING';
}
