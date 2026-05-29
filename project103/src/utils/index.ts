import type { DiffWord } from '../types';

export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + 1
        );
      }
    }
  }

  return dp[m][n];
}

export function compareTexts(standard: string, userInput: string): DiffWord[] {
  const standardWords = standard.toLowerCase().replace(/[.,!?;:]/g, '').split(/\s+/).filter(w => w);
  const userWords = userInput.toLowerCase().replace(/[.,!?;:]/g, '').split(/\s+/).filter(w => w);
  
  const result: DiffWord[] = [];
  const usedIndices = new Set<number>();

  userWords.forEach((word, userIdx) => {
    let bestMatchIdx = -1;
    let bestDistance = Infinity;

    standardWords.forEach((stdWord, stdIdx) => {
      if (!usedIndices.has(stdIdx)) {
        const distance = levenshteinDistance(word, stdWord);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestMatchIdx = stdIdx;
        }
      }
    });

    if (bestMatchIdx >= 0 && bestDistance <= Math.floor(standardWords[bestMatchIdx].length * 0.4)) {
      usedIndices.add(bestMatchIdx);
      if (word === standardWords[bestMatchIdx]) {
        result.push({ text: word, type: 'correct', index: userIdx });
      } else {
        result.push({ text: word, type: 'wrong', index: userIdx });
      }
    } else {
      result.push({ text: word, type: 'extra', index: userIdx });
    }
  });

  standardWords.forEach((stdWord, idx) => {
    if (!usedIndices.has(idx)) {
      result.push({ text: stdWord, type: 'missing', index: -1 });
    }
  });

  return result;
}

export function calculateAccuracy(diff: DiffWord[]): number {
  const total = diff.filter(d => d.type !== 'extra').length;
  if (total === 0) return 0;
  
  const correct = diff.filter(d => d.type === 'correct').length;
  return Math.round((correct / total) * 100);
}

export function getWrongWords(diff: DiffWord[], standard: string, segmentId: string, materialId: string) {
  const standardWords = standard.toLowerCase().replace(/[.,!?;:]/g, '').split(/\s+/).filter(w => w);
  const wrongWords = diff.filter(d => d.type === 'wrong' || d.type === 'extra');
  
  return wrongWords.map(w => ({
    id: `${materialId}-${segmentId}-${w.text}-${Date.now()}`,
    word: w.text,
    correctWord: w.type === 'wrong' ? findClosestMatch(w.text, standardWords) : '',
    materialId,
    segmentId,
    timestamp: new Date().toISOString(),
    practiceCount: 1,
    correctCount: 0,
  }));
}

function findClosestMatch(word: string, words: string[]): string {
  let bestMatch = '';
  let bestDistance = Infinity;

  words.forEach(w => {
    const distance = levenshteinDistance(word, w);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestMatch = w;
    }
  });

  return bestMatch;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function getDifficultyColor(difficulty: 'beginner' | 'intermediate' | 'advanced'): string {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-100 text-green-800';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800';
    case 'advanced':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getMaterialTypeColor(type: string): string {
  const colors: Record<string, string> = {
    news: 'bg-blue-100 text-blue-800',
    ted: 'bg-purple-100 text-purple-800',
    movie: 'bg-pink-100 text-pink-800',
    song: 'bg-indigo-100 text-indigo-800',
    podcast: 'bg-teal-100 text-teal-800',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export function getLastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
}

export function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}
