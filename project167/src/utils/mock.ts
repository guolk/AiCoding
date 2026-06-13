import type { Observation, Instrument } from '@/types';

function seededRandom(seed: number): () => number {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateTemperature(dayOfYear: number, hour: number, random: () => number): number {
  const seasonal = 15 + 15 * Math.sin(((dayOfYear - 80) / 365) * 2 * Math.PI);
  const daily = 5 * Math.sin(((hour - 6) / 24) * 2 * Math.PI);
  const noise = (random() - 0.5) * 4;
  return Math.round((seasonal + daily + noise) * 10) / 10;
}

function generateHumidity(temperature: number, random: () => number): number {
  const base = 80 - (temperature - 15) * 1.5;
  const noise = (random() - 0.5) * 15;
  return Math.max(10, Math.min(100, Math.round(base + noise)));
}

function generatePressure(dayOfYear: number, random: () => number): number {
  const seasonal = 1013 - 5 * Math.cos(((dayOfYear - 20) / 365) * 2 * Math.PI);
  const noise = (random() - 0.5) * 8;
  return Math.round((seasonal + noise) * 10) / 10;
}

function generateWindSpeed(random: () => number): number {
  const base = Math.pow(random() * 3, 1.5);
  return Math.round(base * 10) / 10;
}

function generateWindDirection(random: () => number): number {
  return Math.round(random() * 360);
}

function generatePrecipitation(random: () => number): number {
  if (random() > 0.75) {
    return Math.round(Math.pow(random() * 8, 1.8) * 10) / 10;
  }
  return 0;
}

function generateVisibility(humidity: number, precipitation: number, random: () => number): number {
  let base = 20 - humidity * 0.1 - precipitation * 2;
  if (random() > 0.9) base *= 0.3;
  return Math.max(0.1, Math.min(50, Math.round(base * 10) / 10));
}

export function generateMockObservations(startDate: Date, endDate: Date, instrumentId: string = 'INST-001'): Observation[] {
  const observations: Observation[] = [];
  const random = seededRandom(12345);

  const current = new Date(startDate);
  current.setHours(8, 0, 0, 0);

  let id = 1;

  while (current <= endDate) {
    for (const hour of [8, 14, 20]) {
      const obsTime = new Date(current);
      obsTime.setHours(hour, 0, 0, 0);

      if (obsTime > endDate) break;

      const dayOfYear =
        Math.floor(
          (obsTime.getTime() - new Date(obsTime.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;

      const temp = generateTemperature(dayOfYear, hour, random);
      const hum = generateHumidity(temp, random);
      const pres = generatePressure(dayOfYear, random);
      const windSpd = generateWindSpeed(random);
      const windDir = generateWindDirection(random);
      const prec = generatePrecipitation(random);
      const vis = generateVisibility(hum, prec, random);

      const obs: Observation = {
        id: `OBS-${id.toString().padStart(6, '0')}`,
        datetime: obsTime.toISOString(),
        temperature: temp,
        humidity: hum,
        pressure: pres,
        windSpeed: windSpd,
        windDirection: windDir,
        precipitation: prec,
        visibility: vis,
        instrumentId,
        qualityFlag: 'normal',
        reviewStatus: 'approved',
        remark: '',
      };

      if (random() > 0.98) {
        obs.temperature = temp + 20;
        obs.qualityFlag = 'out_of_range';
        obs.reviewStatus = 'pending';
      } else if (random() > 0.95) {
        obs.qualityFlag = 'suspect';
        obs.reviewStatus = 'pending';
      } else if (random() > 0.97) {
        obs.temperature = null;
        obs.qualityFlag = 'missing';
        obs.reviewStatus = 'pending';
      }

      observations.push(obs);
      id++;
    }

    current.setDate(current.getDate() + 1);
  }

  return observations;
}

export function generateMockInstruments(): Instrument[] {
  return [
    {
      id: 'INST-001',
      name: '自动气象站A',
      type: '综合观测站',
      model: 'AWS-2000',
      serialNumber: 'SN20230001',
      calibrationDate: '2025-01-15',
      nextCalibrationDate: '2026-01-15',
      tempError: 0.2,
      humidityError: 2,
      pressureError: 0.5,
      windSpeedError: 0.3,
      precipitationError: 0.1,
      isActive: true,
    },
    {
      id: 'INST-002',
      name: '自动气象站B',
      type: '综合观测站',
      model: 'AWS-2000',
      serialNumber: 'SN20230002',
      calibrationDate: '2025-03-20',
      nextCalibrationDate: '2026-03-20',
      tempError: 0.15,
      humidityError: 1.5,
      pressureError: 0.4,
      windSpeedError: 0.25,
      precipitationError: 0.08,
      isActive: true,
    },
    {
      id: 'INST-003',
      name: '备用观测站',
      type: '便携式站',
      model: 'PortaMet-100',
      serialNumber: 'SN20220156',
      calibrationDate: '2024-09-10',
      nextCalibrationDate: '2025-09-10',
      tempError: 0.5,
      humidityError: 3,
      pressureError: 1.0,
      windSpeedError: 0.5,
      precipitationError: 0.2,
      isActive: false,
    },
  ];
}

export function getDefaultMockData(): { observations: Observation[]; instruments: Instrument[] } {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 3);
  startDate.setMonth(0, 1);
  startDate.setHours(0, 0, 0, 0);

  const instruments = generateMockInstruments();
  const observations = generateMockObservations(startDate, endDate, instruments[0].id);

  return { observations, instruments };
}
