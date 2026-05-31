import { DanielsPrediction, TrainingZone, TrainingType } from '@/types';
import { secondsToPace } from './formatters';

const DISTANCE_FACTORS: Record<string, { km: number; name: string }> = {
  '1500m': { km: 1.5, name: '1500米' },
  '3000m': { km: 3, name: '3000米' },
  '5km': { km: 5, name: '5公里' },
  '8km': { km: 8, name: '8公里' },
  '10km': { km: 10, name: '10公里' },
  '15km': { km: 15, name: '15公里' },
  '20km': { km: 20, name: '20公里' },
  'half': { km: 21.0975, name: '半程马拉松' },
  '25km': { km: 25, name: '25公里' },
  '30km': { km: 30, name: '30公里' },
  'full': { km: 42.195, name: '全程马拉松' }
};

export const AVAILABLE_DISTANCES = Object.entries(DISTANCE_FACTORS).map(([key, value]) => ({
  key,
  ...value
}));

function timeToMinutes(seconds: number): number {
  return seconds / 60;
}

function minutesPerKmToVDOT(km: number, minutes: number): number {
  return -4.6 + 0.182258 * (km / minutes) + 0.000104 * Math.pow(km / minutes, 2);
}

function vdotToMinutesPerKm(vdot: number, km: number): number {
  const intensityPercent = getIntensityPercent(km);
  const a = 0.182258 * intensityPercent;
  const b = 0.000104 * Math.pow(intensityPercent, 2);
  const c = -4.6 - vdot;
  
  const discriminant = Math.pow(a, 2) - 4 * b * c;
  if (discriminant < 0) return 0;
  
  const speed = (-a + Math.sqrt(discriminant)) / (2 * b);
  return km / speed;
}

function getIntensityPercent(km: number): number {
  if (km <= 3) return 1.0;
  if (km <= 5) return 0.975;
  if (km <= 10) return 0.94;
  if (km <= 15) return 0.92;
  if (km <= 21.0975) return 0.90;
  if (km <= 30) return 0.88;
  return 0.85;
}

export function calculateDanielsVDOT(
  raceDistance: string,
  raceTimeSeconds: number
): DanielsPrediction {
  const distConfig = DISTANCE_FACTORS[raceDistance];
  if (!distConfig || raceTimeSeconds <= 0) {
    return {
      vdot: 0,
      performanceLevel: '未知',
      predictedTimes: {
        '5km': '--:--:--',
        '10km': '--:--:--',
        'half': '--:--:--',
        'full': '--:--:--'
      },
      predictedSeconds: {
        '5km': 0,
        '10km': 0,
        'half': 0,
        'full': 0
      },
      trainingPaces: {
        easy: { min: '--:--', max: '--:--' },
        marathon: '--:--',
        threshold: '--:--',
        interval: { min: '--:--', max: '--:--' },
        repetition: { min: '--:--', max: '--:--' }
      }
    };
  }
  
  const km = distConfig.km;
  const minutes = timeToMinutes(raceTimeSeconds);
  const vdot = minutesPerKmToVDOT(km, minutes);
  
  const predictedDistances = ['5km', '10km', 'half', 'full'] as const;
  const predictedSeconds: DanielsPrediction['predictedSeconds'] = {
    '5km': 0,
    '10km': 0,
    'half': 0,
    'full': 0
  };
  const predictedTimes: DanielsPrediction['predictedTimes'] = {
    '5km': '--:--:--',
    '10km': '--:--:--',
    'half': '--:--:--',
    'full': '--:--:--'
  };
  
  predictedDistances.forEach(dist => {
    const distKm = DISTANCE_FACTORS[dist].km;
    const minutesPerKm = vdotToMinutesPerKm(vdot, distKm);
    const totalSeconds = minutesPerKm * distKm * 60;
    predictedSeconds[dist] = totalSeconds;
    predictedTimes[dist] = formatPredictedTime(totalSeconds);
  });
  
  const trainingPaces = calculateTrainingPaces(vdot);
  
  let performanceLevel = '入门';
  if (vdot >= 70) performanceLevel = '精英';
  else if (vdot >= 60) performanceLevel = '优秀';
  else if (vdot >= 50) performanceLevel = '良好';
  else if (vdot >= 40) performanceLevel = '中等';
  
  return {
    vdot: Math.round(vdot * 10) / 10,
    performanceLevel,
    predictedTimes,
    predictedSeconds,
    trainingPaces
  };
}

function formatPredictedTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.round(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function calculateTrainingPaces(vdot: number): DanielsPrediction['trainingPaces'] {
  if (vdot <= 0) {
    return {
      easy: { min: '--:--', max: '--:--' },
      marathon: '--:--',
      threshold: '--:--',
      interval: { min: '--:--', max: '--:--' },
      repetition: { min: '--:--', max: '--:--' }
    };
  }
  
  const vdotToPaceFactor = (vdot: number, factor: number): number => {
    const intensity = vdot * factor;
    const kmPerMin = (intensity + 4.6) / 0.182258;
    return 60 / kmPerMin;
  };
  
  return {
    easy: {
      min: secondsToPace(vdotToPaceFactor(vdot, 0.59) * 60),
      max: secondsToPace(vdotToPaceFactor(vdot, 0.74) * 60)
    },
    marathon: secondsToPace(vdotToPaceFactor(vdot, 0.80) * 60),
    threshold: secondsToPace(vdotToPaceFactor(vdot, 0.88) * 60),
    interval: {
      min: secondsToPace(vdotToPaceFactor(vdot, 0.95) * 60),
      max: secondsToPace(vdotToPaceFactor(vdot, 0.98) * 60)
    },
    repetition: {
      min: secondsToPace(vdotToPaceFactor(vdot, 0.98) * 60),
      max: secondsToPace(vdotToPaceFactor(vdot, 1.02) * 60)
    }
  };
}

export function calculateTrainingZones(
  vdot: number,
  maxHeartRate: number = 180
): TrainingZone[] {
  const trainingPaces = calculateTrainingPaces(vdot);
  
  const zones: TrainingZone[] = [
    {
      type: 'easy' as TrainingType,
      name: '轻松跑 (Easy)',
      description: '恢复和基础耐力训练，保持可以轻松交谈的节奏',
      paceRange: trainingPaces.easy,
      paceRangeSeconds: {
        min: 0,
        max: 0
      },
      heartRateRange: {
        min: Math.round(maxHeartRate * 0.65),
        max: Math.round(maxHeartRate * 0.75)
      },
      perceivedEffort: 'RPE 4-5',
      color: 'bg-emerald-500'
    },
    {
      type: 'marathon' as TrainingType,
      name: '马拉松配速 (Marathon Pace)',
      description: '模拟比赛配速的长距离训练，培养比赛节奏',
      paceRange: {
        min: trainingPaces.marathon,
        max: trainingPaces.marathon
      },
      paceRangeSeconds: {
        min: 0,
        max: 0
      },
      heartRateRange: {
        min: Math.round(maxHeartRate * 0.75),
        max: Math.round(maxHeartRate * 0.85)
      },
      perceivedEffort: 'RPE 6-7',
      color: 'bg-primary-500'
    },
    {
      type: 'threshold' as TrainingType,
      name: '乳酸阈值 (Threshold)',
      description: '提高乳酸阈值，延长可持续的高速跑时间',
      paceRange: {
        min: trainingPaces.threshold,
        max: trainingPaces.threshold
      },
      paceRangeSeconds: {
        min: 0,
        max: 0
      },
      heartRateRange: {
        min: Math.round(maxHeartRate * 0.85),
        max: Math.round(maxHeartRate * 0.90)
      },
      perceivedEffort: 'RPE 8-8.5',
      color: 'bg-amber-500'
    },
    {
      type: 'interval' as TrainingType,
      name: '间歇跑 (Interval)',
      description: '提高最大摄氧量VO2max，增强心肺功能',
      paceRange: trainingPaces.interval,
      paceRangeSeconds: {
        min: 0,
        max: 0
      },
      heartRateRange: {
        min: Math.round(maxHeartRate * 0.90),
        max: Math.round(maxHeartRate * 0.95)
      },
      perceivedEffort: 'RPE 9-9.5',
      color: 'bg-orange-500'
    },
    {
      type: 'repetition' as TrainingType,
      name: '重复跑 (Repetition)',
      description: '提高跑步经济性和速度，短距离高强度间歇',
      paceRange: trainingPaces.repetition,
      paceRangeSeconds: {
        min: 0,
        max: 0
      },
      heartRateRange: {
        min: Math.round(maxHeartRate * 0.95),
        max: maxHeartRate
      },
      perceivedEffort: 'RPE 9.5-10',
      color: 'bg-red-500'
    }
  ];
  
  return zones;
}
