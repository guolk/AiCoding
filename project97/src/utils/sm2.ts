import { addDays } from 'date-fns';
import type { WrongNote } from '../types';

export type Quality = 0 | 1 | 2 | 3 | 4 | 5;

export interface SM2Result {
  nextReviewDate: Date;
  easeFactor: number;
  interval: number;
  reviewCount: number;
}

export function calculateNextReview(
  wrongNote: WrongNote,
  quality: Quality
): SM2Result {
  let { easeFactor, interval, reviewCount } = wrongNote;

  if (quality < 3) {
    interval = 1;
  } else {
    if (reviewCount === 0) interval = 1;
    else if (reviewCount === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  return {
    nextReviewDate: addDays(new Date(), interval),
    easeFactor,
    interval,
    reviewCount: reviewCount + 1,
  };
}

export function formatReviewDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function isDueForReview(nextReviewDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reviewDate = new Date(nextReviewDate);
  reviewDate.setHours(0, 0, 0, 0);
  return reviewDate <= today;
}
