import type { ConstitutionScores } from '../types';

const CONSTITUTION_TYPES = [
  'pinghe',
  'qixu',
  'yangxu',
  'yinxu',
  'tanshi',
  'shire',
  'xueyu',
  'qiyu',
  'tebing',
] as const;

const CONSTITUTION_NAMES: Record<string, string> = {
  pinghe: '平和质',
  qixu: '气虚质',
  yangxu: '阳虚质',
  yinxu: '阴虚质',
  tanshi: '痰湿质',
  shire: '湿热质',
  xueyu: '血瘀质',
  qiyu: '气郁质',
  tebing: '特禀质',
};

const CONSTITUTION_COLORS: Record<string, string> = {
  pinghe: '#22c55e',
  qixu: '#f59e0b',
  yangxu: '#ef4444',
  yinxu: '#ec4899',
  tanshi: '#8b5cf6',
  shire: '#f97316',
  xueyu: '#dc2626',
  qiyu: '#6366f1',
  tebing: '#14b8a6',
};

const QUESTIONS_PER_TYPE: Record<string, number> = {
  pinghe: 7,
  qixu: 7,
  yangxu: 7,
  yinxu: 7,
  tanshi: 7,
  shire: 7,
  xueyu: 6,
  qiyu: 6,
  tebing: 6,
};

export const TOTAL_ITEMS = Object.values(QUESTIONS_PER_TYPE).reduce((sum, count) => sum + count, 0);

function getStartIndex(type: string): number {
  const typeIndex = CONSTITUTION_TYPES.indexOf(type as typeof CONSTITUTION_TYPES[number]);
  let startIndex = 0;
  for (let i = 0; i < typeIndex; i++) {
    startIndex += QUESTIONS_PER_TYPE[CONSTITUTION_TYPES[i]];
  }
  return startIndex;
}

export function calculateConstitution(answers: number[]): ConstitutionScores {
  if (answers.length !== TOTAL_ITEMS) {
    throw new Error(`Answers array must have ${TOTAL_ITEMS} items, got ${answers.length}`);
  }

  const scores: Partial<ConstitutionScores> = {};

  CONSTITUTION_TYPES.forEach((type) => {
    const itemsCount = QUESTIONS_PER_TYPE[type];
    const startIndex = getStartIndex(type);
    const endIndex = startIndex + itemsCount;
    const typeAnswers = answers.slice(startIndex, endIndex);

    const rawScore = typeAnswers.reduce((sum, answer) => sum + answer, 0);
    const convertedScore =
      ((rawScore - itemsCount) / (itemsCount * 4)) * 100;

    scores[type] = Math.round(convertedScore * 100) / 100;
  });

  return scores as ConstitutionScores;
}

export function determineMainType(scores: ConstitutionScores): string {
  const biasedTypes = CONSTITUTION_TYPES.filter((t) => t !== 'pinghe');
  const allBiasedBelow30 = biasedTypes.every((t) => scores[t] < 30);

  if (scores.pinghe >= 60 && allBiasedBelow30) {
    return 'pinghe';
  }

  let mainType = 'pinghe';
  let maxScore = 0;

  biasedTypes.forEach((type) => {
    if (scores[type] >= 40 && scores[type] > maxScore) {
      maxScore = scores[type];
      mainType = type;
    }
  });

  return mainType;
}

export function determineSubTypes(scores: ConstitutionScores): string[] {
  const biasedTypes = CONSTITUTION_TYPES.filter((t) => t !== 'pinghe');
  const mainType = determineMainType(scores);

  const subTypes: string[] = [];

  biasedTypes.forEach((type) => {
    if (type === mainType) return;

    if (scores[type] >= 40) {
      subTypes.push(type);
    } else if (scores[type] >= 30 && scores[type] < 40) {
      subTypes.push(`${type}_tendency`);
    }
  });

  return subTypes;
}

export function getConstitutionName(type: string): string {
  if (type.endsWith('_tendency')) {
    const baseType = type.replace('_tendency', '');
    return `${CONSTITUTION_NAMES[baseType] || baseType}倾向`;
  }
  return CONSTITUTION_NAMES[type] || type;
}

export function getConstitutionColor(type: string): string {
  const baseType = type.replace('_tendency', '');
  return CONSTITUTION_COLORS[baseType] || '#6b7280';
}
