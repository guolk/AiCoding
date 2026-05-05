import { v4 as uuidv4 } from 'uuid';
import {
  LanguageLearner,
  LanguageSkill,
  LanguageLevel,
  InterestTag,
  Timezone,
  MatchScore,
  MatchBreakdown,
  Match,
} from '@/types';
import { getLanguageLevelValue, getCommonInterests } from '@/constants/languages';

const MATCH_WEIGHTS = {
  LANGUAGE_COMPLEMENTARITY: 0.35,
  INTEREST_SIMILARITY: 0.25,
  TIMEZONE_OVERLAP: 0.20,
  LEVEL_COMPATIBILITY: 0.20,
};

const MATCH_THRESHOLD = 50;

function calculateLanguageComplementarity(
  learner1: LanguageLearner,
  learner2: LanguageLearner
): { score: number; explanation: string } {
  const learner1Learning = learner1.learningLanguages;
  const learner2Learning = learner2.learningLanguages;
  const learner1Native = learner1.nativeLanguages;
  const learner2Native = learner2.nativeLanguages;

  let score = 0;
  let matchedCount = 0;
  const matchingPairs: string[] = [];

  for (const skill1 of learner1Learning) {
    for (const skill2 of learner2Native) {
      if (skill1.language === skill2.language) {
        matchedCount++;
        score += 25;
        matchingPairs.push(`Learner 1 learns ${skill1.language}, Learner 2 is native`);
      }
    }
  }

  for (const skill1 of learner2Learning) {
    for (const skill2 of learner1Native) {
      if (skill1.language === skill2.language) {
        matchedCount++;
        score += 25;
        matchingPairs.push(`Learner 2 learns ${skill1.language}, Learner 1 is native`);
      }
    }
  }

  for (const skill1 of learner1Learning) {
    for (const skill2 of learner2Learning) {
      if (skill1.language === skill2.language) {
        const levelDiff = Math.abs(
          getLanguageLevelValue(skill1.level) - getLanguageLevelValue(skill2.level)
        );
        if (levelDiff <= 2) {
          score += 10;
          matchingPairs.push(`Both learning ${skill1.language} with compatible levels`);
        }
      }
    }
  }

  score = Math.min(score, 100);

  let explanation = '';
  if (matchedCount >= 2) {
    explanation = 'Perfect language match! You can teach each other your native languages.';
  } else if (matchedCount === 1) {
    explanation = 'Good language match. One of you can help the other practice.';
  } else if (score > 0) {
    explanation = 'You share interest in the same languages, can practice together.';
  } else {
    explanation = 'Limited language overlap, but you can still learn from each other.';
  }

  return { score, explanation };
}

function calculateInterestSimilarity(
  learner1: LanguageLearner,
  learner2: LanguageLearner
): { score: number; explanation: string; commonInterests: InterestTag[] } {
  const commonInterests = getCommonInterests(learner1.interests, learner2.interests);
  const totalInterests = new Set([...learner1.interests, ...learner2.interests]).size;

  const similarityRatio = totalInterests > 0 ? commonInterests.length / totalInterests : 0;
  const score = Math.round(similarityRatio * 100);

  let explanation = '';
  if (commonInterests.length >= 5) {
    explanation = 'Excellent! You share many common interests. Great conversation starters!';
  } else if (commonInterests.length >= 3) {
    explanation = 'Good match! You have several common interests to talk about.';
  } else if (commonInterests.length >= 1) {
    explanation = 'You share some common interests. Good foundation for conversation.';
  } else {
    explanation = 'Different interests, but this is a great opportunity to learn about new things!';
  }

  return { score, explanation, commonInterests };
}

function calculateTimezoneOverlap(
  learner1: LanguageLearner,
  learner2: LanguageLearner
): { score: number; explanation: string; overlappingHours: string[] } {
  const offset1 = learner1.timezone.offset;
  const offset2 = learner2.timezone.offset;
  const timeDiff = Math.abs(offset1 - offset2);

  let overlappingHours: string[] = [];
  let score = 0;

  if (timeDiff === 0) {
    score = 100;
    overlappingHours = generateOverlapHours(0, 12, 20);
  } else if (timeDiff <= 3) {
    score = 80 - timeDiff * 10;
    overlappingHours = generateOverlapHours(timeDiff, 12, 20);
  } else if (timeDiff <= 6) {
    score = 50 - (timeDiff - 3) * 8;
    overlappingHours = generateOverlapHours(timeDiff, 13, 19);
  } else if (timeDiff <= 9) {
    score = 25 - (timeDiff - 6) * 5;
    overlappingHours = generateOverlapHours(timeDiff, 14, 18);
  } else {
    score = 5;
    overlappingHours = generateOverlapHours(timeDiff, 15, 17);
  }

  score = Math.max(score, 0);

  let explanation = '';
  if (timeDiff === 0) {
    explanation = `Same timezone (${learner1.timezone.label}). Perfect for scheduling!`;
  } else if (timeDiff <= 3) {
    explanation = `Small time difference (${timeDiff} hours). Easy to find overlapping hours.`;
  } else if (timeDiff <= 6) {
    explanation = `Moderate time difference (${timeDiff} hours). Some scheduling flexibility needed.`;
  } else {
    explanation = `Large time difference (${timeDiff} hours). Will require coordination.`;
  }

  return { score, explanation, overlappingHours };
}

function generateOverlapHours(timeDiff: number, startHour: number, endHour: number): string[] {
  const hours: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    hours.push(`${h.toString().padStart(2, '0')}:00`);
  }
  return hours;
}

function calculateLevelCompatibility(
  learner1: LanguageLearner,
  learner2: LanguageLearner
): { score: number; explanation: string } {
  let totalScore = 0;
  let comparablePairs = 0;

  for (const skill1 of learner1.learningLanguages) {
    for (const skill2 of [...learner2.nativeLanguages, ...learner2.learningLanguages]) {
      if (skill1.language === skill2.language) {
        comparablePairs++;
        const level1 = getLanguageLevelValue(skill1.level);
        const level2 = getLanguageLevelValue(skill2.level);
        const levelDiff = Math.abs(level1 - level2);

        if (levelDiff === 0) {
          totalScore += 100;
        } else if (levelDiff <= 1) {
          totalScore += 85;
        } else if (levelDiff <= 2) {
          totalScore += 70;
        } else if (levelDiff <= 3) {
          totalScore += 50;
        } else {
          totalScore += 30;
        }
      }
    }
  }

  const score = comparablePairs > 0 ? Math.round(totalScore / comparablePairs) : 50;

  let explanation = '';
  if (score >= 80) {
    explanation = 'Excellent level compatibility! You can help each other effectively.';
  } else if (score >= 60) {
    explanation = 'Good level match. You can learn from each other at a comfortable pace.';
  } else if (score >= 40) {
    explanation = 'Moderate level difference. One person may need to adapt more.';
  } else {
    explanation = 'Significant level difference. Patience and adaptation will be needed.';
  }

  return { score, explanation };
}

export function calculateMatchScore(
  learner1: LanguageLearner,
  learner2: LanguageLearner
): { score: MatchScore; breakdown: MatchBreakdown } {
  const languageComp = calculateLanguageComplementarity(learner1, learner2);
  const interestSim = calculateInterestSimilarity(learner1, learner2);
  const timezoneOver = calculateTimezoneOverlap(learner1, learner2);
  const levelComp = calculateLevelCompatibility(learner1, learner2);

  const totalScore = Math.round(
    languageComp.score * MATCH_WEIGHTS.LANGUAGE_COMPLEMENTARITY +
    interestSim.score * MATCH_WEIGHTS.INTEREST_SIMILARITY +
    timezoneOver.score * MATCH_WEIGHTS.TIMEZONE_OVERLAP +
    levelComp.score * MATCH_WEIGHTS.LEVEL_COMPATIBILITY
  );

  const score: MatchScore = {
    languageComplementarity: languageComp.score,
    interestSimilarity: interestSim.score,
    timezoneOverlap: timezoneOver.score,
    levelCompatibility: levelComp.score,
    totalScore,
  };

  const breakdown: MatchBreakdown = {
    languageComplementarity: {
      score: languageComp.score,
      explanation: languageComp.explanation,
    },
    interestSimilarity: {
      score: interestSim.score,
      explanation: interestSim.explanation,
      commonInterests: interestSim.commonInterests,
    },
    timezoneOverlap: {
      score: timezoneOver.score,
      explanation: timezoneOver.explanation,
      overlappingHours: timezoneOver.overlappingHours,
    },
    levelCompatibility: {
      score: levelComp.score,
      explanation: levelComp.explanation,
    },
  };

  return { score, breakdown };
}

export function isMatchAboveThreshold(score: MatchScore): boolean {
  return score.totalScore >= MATCH_THRESHOLD;
}

export function createMatch(
  sender: LanguageLearner,
  receiver: LanguageLearner,
  message?: string
): Match {
  const { score, breakdown } = calculateMatchScore(sender, receiver);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return {
    id: uuidv4(),
    senderId: sender.id,
    receiverId: receiver.id,
    score,
    breakdown,
    status: 'pending',
    message,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    sender,
    receiver,
  };
}

export function sortMatchesByScore(matches: Match[]): Match[] {
  return [...matches].sort((a, b) => b.score.totalScore - a.score.totalScore);
}

export function getTopDailyMatches(
  learner: LanguageLearner,
  candidates: LanguageLearner[],
  limit: number = 3
): Match[] {
  const validCandidates = candidates.filter(
    (candidate) => candidate.id !== learner.id
  );

  const matches: Match[] = validCandidates.map((candidate) =>
    createMatch(learner, candidate)
  );

  const qualifiedMatches = matches.filter((match) =>
    isMatchAboveThreshold(match.score)
  );

  const sortedMatches = sortMatchesByScore(qualifiedMatches);

  return sortedMatches.slice(0, limit);
}
