import type { Observation, WindRoseData, WindRoseDatum, WindRoseSpeedRange } from '@/types';
import { WIND_DIRECTIONS } from '@/types';

const WIND_SPEED_RANGES = [
  { range: '0-2', min: 0, max: 2 },
  { range: '2-5', min: 2, max: 5 },
  { range: '5-10', min: 5, max: 10 },
  { range: '10-20', min: 10, max: 20 },
  { range: '>20', min: 20, max: Infinity },
];

export function angleToDirection(angle: number | null): string {
  if (angle === null || isNaN(angle)) return 'Calm';

  const normalized = ((angle % 360) + 360) % 360;

  for (let i = 0; i < WIND_DIRECTIONS.length; i++) {
    const dir = WIND_DIRECTIONS[i];
    const nextDir = WIND_DIRECTIONS[(i + 1) % WIND_DIRECTIONS.length];

    let lowerBound = (dir.angle + nextDir.angle) / 2;
    let upperBound = lowerBound + 22.5;

    if (lowerBound > 360) lowerBound -= 360;
    if (upperBound > 360) upperBound -= 360;

    if (i === 0) {
      if (normalized >= 348.75 || normalized < 11.25) return dir.code;
    } else {
      if (normalized >= dir.angle - 11.25 && normalized < dir.angle + 11.25) {
        return dir.code;
      }
    }
  }

  return 'N';
}

export function directionToAngle(direction: string): number | null {
  const dir = WIND_DIRECTIONS.find((d) => d.code === direction.toUpperCase());
  return dir ? dir.angle : null;
}

export function getDirectionName(code: string): string {
  const dir = WIND_DIRECTIONS.find((d) => d.code === code);
  return dir ? dir.name : code;
}

export function calculateWindRose(observations: Observation[]): WindRoseData {
  const totalCount = observations.length;
  let calmCount = 0;

  const directionMap = new Map<string, { count: number; speeds: number[] }>();

  WIND_DIRECTIONS.forEach((dir) => {
    directionMap.set(dir.code, { count: 0, speeds: [] });
  });

  for (const obs of observations) {
    const windSpeed = obs.windSpeed;
    const windDir = obs.windDirection;

    if (windSpeed === null || isNaN(windSpeed)) continue;

    if (windSpeed < 0.3 || windDir === null || isNaN(windDir)) {
      calmCount++;
      continue;
    }

    const dirCode = angleToDirection(windDir);
    const dirData = directionMap.get(dirCode);

    if (dirData) {
      dirData.count++;
      dirData.speeds.push(windSpeed);
    }
  }

  const directions: WindRoseDatum[] = [];

  for (const dir of WIND_DIRECTIONS) {
    const data = directionMap.get(dir.code);
    if (!data) continue;

    const speedRanges: WindRoseSpeedRange[] = WIND_SPEED_RANGES.map((range) => ({
      ...range,
      frequency: 0,
    }));

    for (const speed of data.speeds) {
      for (const range of speedRanges) {
        if (speed >= range.min && speed < range.max) {
          range.frequency++;
          break;
        }
      }
    }

    if (totalCount > 0) {
      for (const range of speedRanges) {
        range.frequency = (range.frequency / totalCount) * 100;
      }
    }

    directions.push({
      direction: dir.code,
      angle: dir.angle,
      frequency: totalCount > 0 ? (data.count / totalCount) * 100 : 0,
      speedRanges,
    });
  }

  return {
    totalObservations: totalCount,
    calmCount,
    calmFrequency: totalCount > 0 ? (calmCount / totalCount) * 100 : 0,
    directions,
  };
}

export function getDominantDirection(windRose: WindRoseData): string {
  let maxFreq = -1;
  let dominantDir = 'Calm';

  for (const dir of windRose.directions) {
    if (dir.frequency > maxFreq) {
      maxFreq = dir.frequency;
      dominantDir = dir.direction;
    }
  }

  if (windRose.calmFrequency > maxFreq) {
    return '静风';
  }

  return getDirectionName(dominantDir);
}

export function getAverageWindSpeed(observations: Observation[]): number {
  const speeds = observations
    .map((o) => o.windSpeed)
    .filter((s): s is number => s !== null && !isNaN(s));

  if (speeds.length === 0) return NaN;
  return speeds.reduce((sum, s) => sum + s, 0) / speeds.length;
}

export function getBeaufortScale(windSpeed: number | null): { force: number; name: string; description: string } {
  if (windSpeed === null || isNaN(windSpeed) || windSpeed < 0) {
    return { force: 0, name: '未知', description: '数据无效' };
  }

  const scales = [
    { force: 0, max: 0.3, name: '无风', description: '烟直上' },
    { force: 1, max: 1.6, name: '软风', description: '烟能表示风向' },
    { force: 2, max: 3.4, name: '轻风', description: '人面感觉有风' },
    { force: 3, max: 5.5, name: '微风', description: '树叶及小枝摇动' },
    { force: 4, max: 8.0, name: '和风', description: '能吹起灰尘和纸张' },
    { force: 5, max: 10.8, name: '清劲风', description: '有叶的小树摇摆' },
    { force: 6, max: 13.9, name: '强风', description: '大树枝摇动' },
    { force: 7, max: 17.2, name: '疾风', description: '全树摇动' },
    { force: 8, max: 20.8, name: '大风', description: '树枝折毁' },
    { force: 9, max: 24.5, name: '烈风', description: '建筑物有小损坏' },
    { force: 10, max: 28.5, name: '狂风', description: '陆上少见，树可拔起' },
    { force: 11, max: 32.7, name: '暴风', description: '陆上很少，有重大损毁' },
    { force: 12, max: Infinity, name: '飓风', description: '摧毁力极大' },
  ];

  for (const scale of scales) {
    if (windSpeed < scale.max) {
      return scale;
    }
  }

  return scales[scales.length - 1];
}
