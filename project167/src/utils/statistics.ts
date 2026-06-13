import type {
  Observation,
  MonthlyStats,
  YearlyStats,
  TrendResult,
  ClimateExtremes,
  ClimateAnomaly,
  ClimateNormal,
  ElementKey,
} from '@/types';

export function mean(values: (number | null | undefined)[]): number {
  const valid = values.filter((v): v is number => v !== null && v !== undefined && !isNaN(v));
  if (valid.length === 0) return NaN;
  return valid.reduce((sum, v) => sum + v, 0) / valid.length;
}

export function max(values: (number | null | undefined)[]): number {
  const valid = values.filter((v): v is number => v !== null && v !== undefined && !isNaN(v));
  if (valid.length === 0) return NaN;
  return Math.max(...valid);
}

export function min(values: (number | null | undefined)[]): number {
  const valid = values.filter((v): v is number => v !== null && v !== undefined && !isNaN(v));
  if (valid.length === 0) return NaN;
  return Math.min(...valid);
}

export function sum(values: (number | null | undefined)[]): number {
  const valid = values.filter((v): v is number => v !== null && v !== undefined && !isNaN(v));
  return valid.reduce((s, v) => s + v, 0);
}

export function countValid(values: (number | null | undefined)[]): number {
  return values.filter((v) => v !== null && v !== undefined && !isNaN(v)).length;
}

export function standardDeviation(values: (number | null | undefined)[]): number {
  const valid = values.filter((v): v is number => v !== null && v !== undefined && !isNaN(v));
  if (valid.length < 2) return NaN;
  const m = mean(valid);
  const squaredDiffs = valid.map((v) => Math.pow(v - m, 2));
  return Math.sqrt(mean(squaredDiffs));
}

export function linearRegression(x: number[], y: number[]): TrendResult {
  if (x.length !== y.length || x.length < 2) {
    return { slope: 0, intercept: 0, rSquared: 0, trendPerDecade: 0 };
  }

  const validPairs: [number, number][] = [];
  for (let i = 0; i < x.length; i++) {
    if (x[i] !== null && !isNaN(x[i]) && y[i] !== null && !isNaN(y[i])) {
      validPairs.push([x[i], y[i]]);
    }
  }

  if (validPairs.length < 2) {
    return { slope: 0, intercept: 0, rSquared: 0, trendPerDecade: 0 };
  }

  const n = validPairs.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (const [xi, yi] of validPairs) {
    sumX += xi;
    sumY += yi;
    sumXY += xi * yi;
    sumX2 += xi * xi;
    sumY2 += yi * yi;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const trendPerDecade = slope * 10;

  const ssTotal = sumY2 - (sumY * sumY) / n;
  const ssResidual = sumY2 - slope * sumXY - intercept * sumY;
  const rSquared = ssTotal === 0 ? 0 : 1 - ssResidual / ssTotal;

  return { slope, intercept, rSquared, trendPerDecade };
}

export function calculateMonthlyStats(
  observations: Observation[],
  year: number,
  month: number
): MonthlyStats {
  const filtered = observations.filter((obs) => {
    const d = new Date(obs.datetime);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });

  return {
    year,
    month,
    avgTemperature: mean(filtered.map((o) => o.temperature)),
    avgHumidity: mean(filtered.map((o) => o.humidity)),
    avgPressure: mean(filtered.map((o) => o.pressure)),
    avgWindSpeed: mean(filtered.map((o) => o.windSpeed)),
    totalPrecipitation: sum(filtered.map((o) => o.precipitation)),
    maxTemperature: max(filtered.map((o) => o.temperature)),
    minTemperature: min(filtered.map((o) => o.temperature)),
    avgVisibility: mean(filtered.map((o) => o.visibility)),
    observationCount: filtered.length,
  };
}

export function calculateYearlyStats(observations: Observation[], year: number): YearlyStats {
  const monthlyStats: MonthlyStats[] = [];
  for (let m = 1; m <= 12; m++) {
    monthlyStats.push(calculateMonthlyStats(observations, year, m));
  }

  const yearFiltered = observations.filter((obs) => {
    const d = new Date(obs.datetime);
    return d.getFullYear() === year;
  });

  return {
    year,
    avgTemperature: mean(yearFiltered.map((o) => o.temperature)),
    avgHumidity: mean(yearFiltered.map((o) => o.humidity)),
    avgPressure: mean(yearFiltered.map((o) => o.pressure)),
    avgWindSpeed: mean(yearFiltered.map((o) => o.windSpeed)),
    totalPrecipitation: sum(yearFiltered.map((o) => o.precipitation)),
    maxTemperature: max(yearFiltered.map((o) => o.temperature)),
    minTemperature: min(yearFiltered.map((o) => o.temperature)),
    avgVisibility: mean(yearFiltered.map((o) => o.visibility)),
    observationCount: yearFiltered.length,
    monthlyStats,
  };
}

export function calculateAllYearlyStats(observations: Observation[]): YearlyStats[] {
  const years = new Set(observations.map((o) => new Date(o.datetime).getFullYear()));
  return Array.from(years)
    .sort((a, b) => a - b)
    .map((y) => calculateYearlyStats(observations, y));
}

export function calculateClimateExtremes(observations: Observation[]): ClimateExtremes {
  let maxTemp = -Infinity;
  let minTemp = Infinity;
  let maxPrec = -Infinity;
  let maxWind = -Infinity;
  let minVis = Infinity;

  let maxTempDate = '';
  let minTempDate = '';
  let maxPrecDate = '';
  let maxWindDate = '';
  let minVisDate = '';

  for (const obs of observations) {
    if (obs.temperature !== null && obs.temperature > maxTemp) {
      maxTemp = obs.temperature;
      maxTempDate = obs.datetime;
    }
    if (obs.temperature !== null && obs.temperature < minTemp) {
      minTemp = obs.temperature;
      minTempDate = obs.datetime;
    }
    if (obs.precipitation !== null && obs.precipitation > maxPrec) {
      maxPrec = obs.precipitation;
      maxPrecDate = obs.datetime;
    }
    if (obs.windSpeed !== null && obs.windSpeed > maxWind) {
      maxWind = obs.windSpeed;
      maxWindDate = obs.datetime;
    }
    if (obs.visibility !== null && obs.visibility < minVis) {
      minVis = obs.visibility;
      minVisDate = obs.datetime;
    }
  }

  return {
    maxTemperature: { value: maxTemp, datetime: maxTempDate },
    minTemperature: { value: minTemp, datetime: minTempDate },
    maxPrecipitation: { value: maxPrec, datetime: maxPrecDate },
    maxWindSpeed: { value: maxWind, datetime: maxWindDate },
    minVisibility: { value: minVis, datetime: minVisDate },
  };
}

export function calculateClimateNormals(
  observations: Observation[],
  baselineStartYear?: number,
  baselineEndYear?: number
): ClimateNormal[] {
  const normals: ClimateNormal[] = [];
  const availableYears = getAvailableYears(observations);
  
  if (availableYears.length === 0) {
    for (let month = 1; month <= 12; month++) {
      normals.push({
        month,
        avgTemperature: NaN,
        avgHighTemp: NaN,
        avgLowTemp: NaN,
        avgHumidity: NaN,
        avgPressure: NaN,
        totalPrecipitation: NaN,
        avgVisibility: NaN,
        years: [],
      });
    }
    return normals;
  }

  const startYear = baselineStartYear ?? availableYears[0];
  const endYear = baselineEndYear ?? availableYears[availableYears.length - 1];

  for (let month = 1; month <= 12; month++) {
    const monthlyTemps: number[] = [];
    const monthlyHighs: number[] = [];
    const monthlyLows: number[] = [];
    const monthlyHumidities: number[] = [];
    const monthlyPressures: number[] = [];
    const monthlyPrecipitations: number[] = [];
    const monthlyVisibilities: number[] = [];
    const yearsWithData: number[] = [];

    for (let year = startYear; year <= endYear; year++) {
      const monthData = observations.filter((obs) => {
        const d = new Date(obs.datetime);
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      });

      if (monthData.length > 0) {
        const avgTemp = mean(monthData.map((o) => o.temperature));
        if (!isNaN(avgTemp)) monthlyTemps.push(avgTemp);
        const high = max(monthData.map((o) => o.temperature));
        if (!isNaN(high)) monthlyHighs.push(high);
        const low = min(monthData.map((o) => o.temperature));
        if (!isNaN(low)) monthlyLows.push(low);
        const hum = mean(monthData.map((o) => o.humidity));
        if (!isNaN(hum)) monthlyHumidities.push(hum);
        const pres = mean(monthData.map((o) => o.pressure));
        if (!isNaN(pres)) monthlyPressures.push(pres);
        const prec = sum(monthData.map((o) => o.precipitation));
        if (!isNaN(prec)) monthlyPrecipitations.push(prec);
        const vis = mean(monthData.map((o) => o.visibility));
        if (!isNaN(vis)) monthlyVisibilities.push(vis);
        yearsWithData.push(year);
      }
    }

    normals.push({
      month,
      avgTemperature: mean(monthlyTemps),
      avgHighTemp: mean(monthlyHighs),
      avgLowTemp: mean(monthlyLows),
      avgHumidity: mean(monthlyHumidities),
      avgPressure: mean(monthlyPressures),
      totalPrecipitation: mean(monthlyPrecipitations),
      avgVisibility: mean(monthlyVisibilities),
      years: yearsWithData,
    });
  }

  return normals;
}

export function calculateAnomaly(
  observations: Observation[],
  normals: ClimateNormal[],
  year: number,
  month: number,
  element: ElementKey
): ClimateAnomaly | null {
  const normal = normals.find((n) => n.month === month);
  if (!normal) return null;

  const monthData = observations.filter((obs) => {
    const d = new Date(obs.datetime);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });

  if (monthData.length === 0) return null;

  const normalValueMap: Record<ElementKey, keyof ClimateNormal> = {
    temperature: 'avgTemperature',
    humidity: 'avgHumidity',
    pressure: 'avgPressure',
    windSpeed: 'avgTemperature',
    precipitation: 'totalPrecipitation',
    visibility: 'avgVisibility',
  };

  const normalKey = normalValueMap[element];
  const baseline = (normal[normalKey] as number) || 0;

  let currentValue: number;
  if (element === 'precipitation') {
    currentValue = sum(monthData.map((o) => o[element]));
  } else {
    currentValue = mean(monthData.map((o) => o[element]));
  }

  if (isNaN(currentValue) || isNaN(baseline)) return null;

  const anomaly = currentValue - baseline;
  const anomalyPercent = baseline === 0 ? 0 : (anomaly / baseline) * 100;

  return {
    year,
    month,
    value: currentValue,
    baseline,
    anomaly,
    anomalyPercent,
  };
}

export function getAvailableYears(observations: Observation[]): number[] {
  const years = new Set(observations.map((o) => new Date(o.datetime).getFullYear()));
  return Array.from(years).sort((a, b) => a - b);
}

export function getDailyData(
  observations: Observation[],
  element: ElementKey
): { date: string; value: number }[] {
  const dailyMap = new Map<string, number[]>();

  for (const obs of observations) {
    const date = obs.datetime.split('T')[0];
    const value = obs[element];
    if (value !== null && !isNaN(value)) {
      if (!dailyMap.has(date)) dailyMap.set(date, []);
      dailyMap.get(date)!.push(value);
    }
  }

  return Array.from(dailyMap.entries())
    .map(([date, values]) => ({
      date,
      value: element === 'precipitation' ? sum(values) : mean(values),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
