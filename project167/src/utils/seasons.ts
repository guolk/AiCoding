import type { Observation, SeasonTransition, SeasonName } from '@/types';
import { mean } from './statistics';

const SEASON_THRESHOLDS = {
  spring: { start: 10, end: 22 },
  summer: { start: 22, end: 22 },
  autumn: { start: 22, end: 10 },
  winter: { start: 10, end: 10 },
};

function getDailyTemperatures(observations: Observation[]): Map<string, number> {
  const dailyMap = new Map<string, number[]>();

  for (const obs of observations) {
    if (obs.temperature === null || isNaN(obs.temperature)) continue;
    const date = obs.datetime.split('T')[0];
    if (!dailyMap.has(date)) dailyMap.set(date, []);
    dailyMap.get(date)!.push(obs.temperature);
  }

  const result = new Map<string, number>();
  for (const [date, temps] of dailyMap) {
    const avg = mean(temps);
    if (!isNaN(avg)) result.set(date, avg);
  }

  return result;
}

function getSortedDates(dailyTemps: Map<string, number>): string[] {
  return Array.from(dailyTemps.keys()).sort();
}

function getPentadMean(
  dailyTemps: Map<string, number>,
  sortedDates: string[],
  startIndex: number
): { mean: number; dates: string[]; temps: number[] } | null {
  const dates: string[] = [];
  const temps: number[] = [];

  for (let i = 0; i < 5; i++) {
    if (startIndex + i >= sortedDates.length) break;
    const date = sortedDates[startIndex + i];
    const temp = dailyTemps.get(date);
    if (temp !== undefined) {
      dates.push(date);
      temps.push(temp);
    }
  }

  if (temps.length < 3) return null;

  return { mean: mean(temps), dates, temps };
}

export function determineSeasonTransitions(
  observations: Observation[],
  year: number
): SeasonTransition[] {
  const dailyTemps = getDailyTemperatures(observations);
  const sortedDates = getSortedDates(dailyTemps).filter((d) => d.startsWith(String(year)));

  if (sortedDates.length < 30) return [];

  const transitions: SeasonTransition[] = [];
  let currentSeason: SeasonName | null = null;
  let consecutiveCount = 0;
  const requiredConsecutive = 4;

  for (let i = 0; i < sortedDates.length - 4; i++) {
    const pentad = getPentadMean(dailyTemps, sortedDates, i);
    if (!pentad) continue;

    let newSeason: SeasonName | null = null;

    if (currentSeason === null || currentSeason === 'winter') {
      if (pentad.mean >= SEASON_THRESHOLDS.spring.start) {
        newSeason = 'spring';
      }
    } else if (currentSeason === 'spring') {
      if (pentad.mean >= SEASON_THRESHOLDS.summer.start) {
        newSeason = 'summer';
      }
    } else if (currentSeason === 'summer') {
      if (pentad.mean < SEASON_THRESHOLDS.autumn.start) {
        newSeason = 'autumn';
      }
    } else if (currentSeason === 'autumn') {
      if (pentad.mean < SEASON_THRESHOLDS.winter.start) {
        newSeason = 'winter';
      }
    }

    if (newSeason && newSeason !== currentSeason) {
      consecutiveCount++;
      if (consecutiveCount >= requiredConsecutive) {
        const firstDate = pentad.dates[0];
        if (!transitions.find((t) => t.season === newSeason && t.date.startsWith(String(year)))) {
          transitions.push({
            season: newSeason,
            date: firstDate,
            pentadMeanTemp: pentad.mean,
            temperatures: pentad.temps,
          });
          currentSeason = newSeason;
          consecutiveCount = 0;
        }
      }
    } else {
      consecutiveCount = 0;
    }
  }

  if (transitions.length === 0) {
    const janTemps: number[] = [];
    const julTemps: number[] = [];

    for (const [date, temp] of dailyTemps) {
      const d = new Date(date);
      if (d.getFullYear() === year) {
        if (d.getMonth() === 0) janTemps.push(temp);
        if (d.getMonth() === 6) julTemps.push(temp);
      }
    }

    const janAvg = mean(janTemps);
    const julAvg = mean(julTemps);

    if (!isNaN(janAvg) && !isNaN(julAvg)) {
      if (julAvg < 10) {
        transitions.push({
          season: 'winter',
          date: `${year}-01-01`,
          pentadMeanTemp: janAvg,
          temperatures: janTemps.slice(0, 5),
        });
      } else if (janAvg >= 22) {
        transitions.push({
          season: 'summer',
          date: `${year}-01-01`,
          pentadMeanTemp: janAvg,
          temperatures: janTemps.slice(0, 5),
        });
      }
    }
  }

  return transitions.sort((a, b) => a.date.localeCompare(b.date));
}

export function getSeasonName(season: SeasonName): string {
  const names: Record<SeasonName, string> = {
    spring: '春季',
    summer: '夏季',
    autumn: '秋季',
    winter: '冬季',
  };
  return names[season];
}

export function getSeasonColor(season: SeasonName): string {
  const colors: Record<SeasonName, string> = {
    spring: 'text-green-600 bg-green-50 border-green-200',
    summer: 'text-red-600 bg-red-50 border-red-200',
    autumn: 'text-amber-600 bg-amber-50 border-amber-200',
    winter: 'text-blue-600 bg-blue-50 border-blue-200',
  };
  return colors[season];
}

export function getCurrentSeason(date: Date = new Date()): SeasonName {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}
