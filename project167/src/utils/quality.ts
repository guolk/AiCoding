import type { Observation, QualityRanges, ValidationResult } from '@/types';

export const DEFAULT_QUALITY_RANGES: QualityRanges = {
  temperature: { min: -40, max: 50 },
  humidity: { min: 0, max: 100 },
  pressure: { min: 870, max: 1080 },
  windSpeed: { min: 0, max: 100 },
  precipitation: { min: 0, max: 1000 },
  visibility: { min: 0, max: 50 },
};

export function validateObservation(
  observation: Partial<Observation>,
  ranges: QualityRanges = DEFAULT_QUALITY_RANGES
): ValidationResult {
  const issues: string[] = [];
  const flaggedFields: string[] = [];

  if (!observation.datetime) {
    issues.push('观测时间不能为空');
    flaggedFields.push('datetime');
  } else {
    const date = new Date(observation.datetime);
    if (isNaN(date.getTime())) {
      issues.push('观测时间格式无效');
      flaggedFields.push('datetime');
    } else if (date > new Date()) {
      issues.push('观测时间不能晚于当前时间');
      flaggedFields.push('datetime');
    }
  }

  if (!observation.instrumentId) {
    issues.push('请选择观测仪器');
    flaggedFields.push('instrumentId');
  }

  const fieldsToCheck: Array<keyof QualityRanges> = [
    'temperature',
    'humidity',
    'pressure',
    'windSpeed',
    'precipitation',
    'visibility',
  ];

  for (const field of fieldsToCheck) {
    const value = observation[field];
    if (value !== null && value !== undefined && !isNaN(value)) {
      const range = ranges[field];
      if (value < range.min || value > range.max) {
        issues.push(`${field} 值 ${value} 超出正常范围 [${range.min}, ${range.max}]`);
        flaggedFields.push(field);
      }
    }
  }

  if (observation.windDirection !== null && observation.windDirection !== undefined) {
    const wd = observation.windDirection;
    if (!isNaN(wd) && (wd < 0 || wd > 360)) {
      issues.push(`风向角度 ${wd} 超出正常范围 [0, 360]`);
      flaggedFields.push('windDirection');
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    flaggedFields,
  };
}

export function checkQualityFlag(
  observation: Observation,
  ranges: QualityRanges = DEFAULT_QUALITY_RANGES
): Observation['qualityFlag'] {
  const hasMissing =
    observation.temperature === null ||
    observation.humidity === null ||
    observation.pressure === null ||
    observation.windSpeed === null ||
    observation.precipitation === null ||
    observation.visibility === null;

  if (hasMissing) return 'missing';

  const hasOutOfRange =
    (observation.temperature !== null &&
      (observation.temperature < ranges.temperature.min ||
        observation.temperature > ranges.temperature.max)) ||
    (observation.humidity !== null &&
      (observation.humidity < ranges.humidity.min ||
        observation.humidity > ranges.humidity.max)) ||
    (observation.pressure !== null &&
      (observation.pressure < ranges.pressure.min ||
        observation.pressure > ranges.pressure.max)) ||
    (observation.windSpeed !== null &&
      (observation.windSpeed < ranges.windSpeed.min ||
        observation.windSpeed > ranges.windSpeed.max)) ||
    (observation.precipitation !== null &&
      (observation.precipitation < ranges.precipitation.min ||
        observation.precipitation > ranges.precipitation.max)) ||
    (observation.visibility !== null &&
      (observation.visibility < ranges.visibility.min ||
        observation.visibility > ranges.visibility.max));

  if (hasOutOfRange) return 'out_of_range';

  const isSuspicious = checkSuspiciousValues(observation);
  if (isSuspicious) return 'suspect';

  return 'normal';
}

function checkSuspiciousValues(observation: Observation): boolean {
  if (
    observation.temperature !== null &&
    observation.humidity !== null &&
    observation.temperature > 35 &&
    observation.humidity > 90
  ) {
    return true;
  }

  if (
    observation.temperature !== null &&
    observation.humidity !== null &&
    observation.temperature < -10 &&
    observation.humidity < 10
  ) {
    return true;
  }

  if (
    observation.visibility !== null &&
    observation.humidity !== null &&
    observation.visibility < 1 &&
    observation.humidity < 50
  ) {
    return true;
  }

  if (
    observation.windSpeed !== null &&
    observation.windDirection !== null &&
    observation.windSpeed > 30 &&
    observation.visibility !== null &&
    observation.visibility > 10
  ) {
    return false;
  }

  return false;
}

export function batchQualityCheck(
  observations: Observation[],
  ranges: QualityRanges = DEFAULT_QUALITY_RANGES
): Observation[] {
  return observations.map((obs) => ({
    ...obs,
    qualityFlag: checkQualityFlag(obs, ranges),
  }));
}

export function getQualityFlagColor(flag: string): string {
  switch (flag) {
    case 'normal':
      return 'text-emerald-600 bg-emerald-50';
    case 'out_of_range':
      return 'text-red-600 bg-red-50';
    case 'suspect':
      return 'text-amber-600 bg-amber-50';
    case 'missing':
      return 'text-gray-500 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

export function getQualityFlagLabel(flag: string): string {
  switch (flag) {
    case 'normal':
      return '正常';
    case 'out_of_range':
      return '超范围';
    case 'suspect':
      return '可疑';
    case 'missing':
      return '缺失';
    default:
      return '未知';
  }
}

export function getReviewStatusColor(status: string): string {
  switch (status) {
    case 'approved':
      return 'text-emerald-600 bg-emerald-50';
    case 'rejected':
      return 'text-red-600 bg-red-50';
    case 'pending':
      return 'text-amber-600 bg-amber-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

export function getReviewStatusLabel(status: string): string {
  switch (status) {
    case 'approved':
      return '已通过';
    case 'rejected':
      return '已拒绝';
    case 'pending':
      return '待审核';
    default:
      return '未知';
  }
}
