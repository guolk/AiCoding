import { PaceResult, SplitData, RaceDistance } from '@/types';
import { secondsToPace, secondsToTime, paceToSpeed } from './formatters';

export const DISTANCE_CONFIG: Record<RaceDistance, { km: number; name: string }> = {
  '5km': { km: 5, name: '5公里' },
  '10km': { km: 10, name: '10公里' },
  'half': { km: 21.0975, name: '半程马拉松' },
  'full': { km: 42.195, name: '全程马拉松' },
  'other': { km: 0, name: '其他距离' }
};

export function calculatePaceFromFinishTime(
  distance: RaceDistance,
  hours: number,
  minutes: number,
  seconds: number
): PaceResult {
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  const distKm = DISTANCE_CONFIG[distance].km;
  
  if (totalSeconds <= 0 || distKm <= 0) {
    return {
      pacePerKm: '--:--',
      paceInSeconds: 0,
      speedKmh: 0,
      splits: []
    };
  }
  
  const pacePerKmInSeconds = totalSeconds / distKm;
  const speedKmh = paceToSpeed(pacePerKmInSeconds);
  
  const splits: SplitData[] = [];
  const totalKm = Math.ceil(distKm);
  
  let cumulativeSeconds = 0;
  
  for (let i = 1; i <= totalKm; i++) {
    const isLastKm = i === totalKm;
    const segmentKm = isLastKm ? distKm - (totalKm - 1) : 1;
    const segmentSeconds = pacePerKmInSeconds * segmentKm;
    
    cumulativeSeconds += segmentSeconds;
    
    splits.push({
      kilometer: i,
      time: secondsToPace(segmentSeconds),
      timeInSeconds: segmentSeconds,
      cumulativeTime: secondsToTime(cumulativeSeconds),
      cumulativeSeconds: cumulativeSeconds,
      pace: secondsToPace(pacePerKmInSeconds),
      paceInSeconds: pacePerKmInSeconds
    });
  }
  
  return {
    pacePerKm: secondsToPace(pacePerKmInSeconds),
    paceInSeconds: pacePerKmInSeconds,
    speedKmh,
    splits
  };
}

export function calculateGradientAdjustment(
  basePaceSeconds: number,
  gradientPercent: number
): {
  adjustedPace: string;
  adjustedPaceSeconds: number;
  timeDiff: string;
  timeDiffSeconds: number;
  isSlower: boolean;
  explanation: string;
} {
  if (!basePaceSeconds || basePaceSeconds <= 0) {
    return {
      adjustedPace: '--:--',
      adjustedPaceSeconds: 0,
      timeDiff: '0秒',
      timeDiffSeconds: 0,
      isSlower: false,
      explanation: '请输入有效的基础配速'
    };
  }
  
  let adjustmentFactor: number;
  let explanation: string;
  
  if (gradientPercent > 0) {
    adjustmentFactor = 1 + (gradientPercent * 0.15);
    explanation = `每上升1%坡度，配速约慢15%`;
  } else if (gradientPercent < 0) {
    const absGradient = Math.abs(gradientPercent);
    adjustmentFactor = 1 - (absGradient * 0.08);
    explanation = `每下降1%坡度，配速约快8%`;
  } else {
    adjustmentFactor = 1;
    explanation = '平路，无需调整配速';
  }
  
  const adjustedPaceSeconds = basePaceSeconds * adjustmentFactor;
  const timeDiffSeconds = Math.abs(adjustedPaceSeconds - basePaceSeconds);
  
  return {
    adjustedPace: secondsToPace(adjustedPaceSeconds),
    adjustedPaceSeconds,
    timeDiff: timeDiffSeconds >= 60 
      ? `${Math.floor(timeDiffSeconds / 60)}分${Math.round(timeDiffSeconds % 60)}秒`
      : `${Math.round(timeDiffSeconds)}秒`,
    timeDiffSeconds,
    isSlower: gradientPercent > 0,
    explanation
  };
}

export function calculateEnvironmentAdjustment(
  basePaceSeconds: number,
  temperature: number,
  humidity: number
): {
  adjustedPace: string;
  adjustedPaceSeconds: number;
  heatIndex: number;
  adjustmentPercent: number;
  explanation: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'extreme';
} {
  if (!basePaceSeconds || basePaceSeconds <= 0) {
    return {
      adjustedPace: '--:--',
      adjustedPaceSeconds: 0,
      heatIndex: temperature || 0,
      adjustmentPercent: 0,
      explanation: '请输入有效的基础配速',
      riskLevel: 'low'
    };
  }
  
  const tempF = temperature * 9 / 5 + 32;
  const hum = Math.min(Math.max(humidity, 0), 100);
  
  let heatIndexF = tempF;
  if (tempF >= 80) {
    heatIndexF = -42.379 +
      2.04901523 * tempF +
      10.14333127 * hum -
      0.22475541 * tempF * hum -
      0.00683783 * tempF * tempF -
      0.05481717 * hum * hum +
      0.00122874 * tempF * tempF * hum +
      0.00085282 * tempF * hum * hum -
      0.00000199 * tempF * tempF * hum * hum;
  }
  
  const heatIndex = (heatIndexF - 32) * 5 / 9;
  
  let adjustmentPercent = 0;
  let explanation = '';
  let riskLevel: 'low' | 'moderate' | 'high' | 'extreme' = 'low';
  
  if (temperature < 10) {
    adjustmentPercent = -2;
    explanation = '低温环境，注意保暖，配速可小幅提升';
    riskLevel = 'low';
  } else if (temperature < 20) {
    adjustmentPercent = 0;
    explanation = '理想跑步温度';
    riskLevel = 'low';
  } else if (temperature < 25) {
    adjustmentPercent = 2 + (humidity / 100) * 3;
    explanation = '温度适中，高湿度可能略有影响';
    riskLevel = humidity > 70 ? 'moderate' : 'low';
  } else if (temperature < 30) {
    adjustmentPercent = 5 + (humidity / 100) * 5;
    explanation = '温度较高，注意补水和节奏';
    riskLevel = 'moderate';
  } else if (temperature < 35) {
    adjustmentPercent = 8 + (humidity / 100) * 7;
    explanation = '高温环境，建议降低配速并增加补给';
    riskLevel = 'high';
  } else {
    adjustmentPercent = 12 + (humidity / 100) * 8;
    explanation = '极端高温，建议缩短跑步距离或选择早晚时段';
    riskLevel = 'extreme';
  }
  
  const adjustedPaceSeconds = basePaceSeconds * (1 + adjustmentPercent / 100);
  
  return {
    adjustedPace: secondsToPace(adjustedPaceSeconds),
    adjustedPaceSeconds,
    heatIndex: Math.round(heatIndex * 10) / 10,
    adjustmentPercent: Math.round(adjustmentPercent * 10) / 10,
    explanation,
    riskLevel
  };
}

export function calculateSegmentStrategy(
  basePaceSeconds: number,
  distance: RaceDistance,
  strategy: 'negative' | 'positive' | 'even'
): {
  firstHalfPace: string;
  firstHalfPaceSeconds: number;
  secondHalfPace: string;
  secondHalfPaceSeconds: number;
  explanation: string;
} {
  let firstHalfPaceSeconds: number;
  let secondHalfPaceSeconds: number;
  let explanation: string;
  
  const distKm = DISTANCE_CONFIG[distance].km;
  const halfMark = distKm / 2;
  
  switch (strategy) {
    case 'negative':
      firstHalfPaceSeconds = basePaceSeconds * 1.02;
      secondHalfPaceSeconds = basePaceSeconds * 0.98;
      explanation = '负配速策略：前半程比平均配速慢2%，后半程快2%。适合有经验的跑者，可以有效防止撞墙。';
      break;
    case 'positive':
      firstHalfPaceSeconds = basePaceSeconds * 0.98;
      secondHalfPaceSeconds = basePaceSeconds * 1.02;
      explanation = '正配速策略：前半程比平均配速快2%，后半程慢2%。适合短距离比赛，不建议马拉松使用。';
      break;
    case 'even':
    default:
      firstHalfPaceSeconds = basePaceSeconds;
      secondHalfPaceSeconds = basePaceSeconds;
      explanation = '匀速策略：全程保持相同配速。适合初学者和追求稳定表现的跑者。';
      break;
  }
  
  return {
    firstHalfPace: secondsToPace(firstHalfPaceSeconds),
    firstHalfPaceSeconds,
    secondHalfPace: secondsToPace(secondHalfPaceSeconds),
    secondHalfPaceSeconds,
    explanation
  };
}

export function getEmergencyPlan(
  currentPace: number,
  distressLevel: 'mild' | 'moderate' | 'severe'
): {
  recommendedPace: string;
  recommendedPaceSeconds: number;
  actions: string[];
  warning: string;
} {
  let paceMultiplier: number;
  let actions: string[];
  let warning: string;
  
  switch (distressLevel) {
    case 'mild':
      paceMultiplier = 1.15;
      actions = [
        '降低配速15%',
        '加深呼吸，保持节奏',
        '检查补水和电解质',
        '如果持续不适，考虑步行休息'
      ];
      warning = '轻度不适，可调整后继续';
      break;
    case 'moderate':
      paceMultiplier = 1.25;
      actions = [
        '降低配速25%或改为快走',
        '立即补充能量胶和水分',
        '寻找阴凉处短暂休息',
        '监测心率，如果过高应停止'
      ];
      warning = '中度不适，建议降低强度';
      break;
    case 'severe':
      paceMultiplier = 0;
      actions = [
        '立即停止跑步',
        '坐下或躺下休息',
        '补充电解质饮料',
        '如果出现胸痛、呼吸困难等症状，请立即寻求医疗帮助'
      ];
      warning = '严重不适，请停止比赛';
      break;
  }
  
  return {
    recommendedPace: paceMultiplier > 0 ? secondsToPace(currentPace * paceMultiplier) : '停止',
    recommendedPaceSeconds: currentPace * paceMultiplier,
    actions,
    warning
  };
}

export function getSeasonalAdjustment(
  season: 'spring' | 'summer' | 'autumn' | 'winter',
  basePace: number
): {
  adjustmentPercent: number;
  adjustedPace: string;
  adjustedPaceSeconds: number;
  recommendations: string[];
} {
  let adjustmentPercent: number;
  let recommendations: string[];
  
  switch (season) {
    case 'spring':
      adjustmentPercent = 0;
      recommendations = [
        '春季是理想训练季节',
        '注意昼夜温差，适当增减衣物',
        '花粉季注意防护'
      ];
      break;
    case 'summer':
      adjustmentPercent = 8;
      recommendations = [
        '建议放宽配速8-10%',
        '选择清晨或傍晚训练',
        '增加补水和电解质摄入',
        '穿浅色透气衣物',
        '注意防晒'
      ];
      break;
    case 'autumn':
      adjustmentPercent = 0;
      recommendations = [
        '秋季是最佳比赛季节',
        '温度适宜，适合强度训练',
        '注意秋燥，补充水分'
      ];
      break;
    case 'winter':
      adjustmentPercent = 3;
      recommendations = [
        '建议小幅放宽配速3-5%',
        '热身时间延长5-10分钟',
        '多层穿搭，注意保暖',
        '避免冰冻路面',
        '注意手脚和耳朵保暖'
      ];
      break;
  }
  
  return {
    adjustmentPercent,
    adjustedPace: secondsToPace(basePace * (1 + adjustmentPercent / 100)),
    adjustedPaceSeconds: basePace * (1 + adjustmentPercent / 100),
    recommendations
  };
}
