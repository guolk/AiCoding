import { VocabularyItem } from '@/types';

export function calculateSM2(item: VocabularyItem, quality: number): Partial<VocabularyItem> {
  let { easeFactor, interval, repetitions } = item;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    easeFactor,
    interval,
    repetitions,
    nextReview: nextReview.toISOString().split('T')[0],
    status: quality < 2 ? 'learning' : quality < 3 ? 'learning' : 'mastered',
  };
}

export function isDueForReview(item: VocabularyItem): boolean {
  const today = new Date().toISOString().split('T')[0];
  return item.nextReview <= today && item.status !== 'unlearned';
}
