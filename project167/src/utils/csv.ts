import type { Observation, ParsedCSV } from '@/types';
import { checkQualityFlag } from './quality';

const CSV_HEADERS = [
  'datetime',
  'temperature',
  'humidity',
  'pressure',
  'windSpeed',
  'windDirection',
  'precipitation',
  'visibility',
  'instrumentId',
  'remark',
];

const HEADER_MAP: Record<string, string> = {
  datetime: 'datetime',
  date: 'datetime',
  time: 'datetime',
  temperature: 'temperature',
  temp: 'temperature',
  气温: 'temperature',
  humidity: 'humidity',
  rh: 'humidity',
  湿度: 'humidity',
  pressure: 'pressure',
  pres: 'pressure',
  气压: 'pressure',
  windspeed: 'windSpeed',
  wind_speed: 'windSpeed',
  wind: 'windSpeed',
  风速: 'windSpeed',
  winddirection: 'windDirection',
  wind_direction: 'windDirection',
  wd: 'windDirection',
  风向: 'windDirection',
  precipitation: 'precipitation',
  precip: 'precipitation',
  rain: 'precipitation',
  降水: 'precipitation',
  降水量: 'precipitation',
  visibility: 'visibility',
  vis: 'visibility',
  能见度: 'visibility',
  instrumentid: 'instrumentId',
  instrument_id: 'instrumentId',
  instrument: 'instrumentId',
  仪器: 'instrumentId',
  仪器编号: 'instrumentId',
  remark: 'remark',
  notes: 'remark',
  备注: 'remark',
};

function parseValue(value: string, field: string): number | null {
  if (!value || value.trim() === '' || value === 'NA' || value === 'NaN' || value === 'null') {
    return null;
  }

  const trimmed = value.trim();
  const num = parseFloat(trimmed);

  if (isNaN(num)) {
    return null;
  }

  return num;
}

function normalizeHeader(header: string): string {
  const lower = header.trim().toLowerCase().replace(/[\s_-]/g, '');
  return HEADER_MAP[lower] || HEADER_MAP[header.trim()] || header.trim();
}

export function parseCSV(content: string, defaultInstrumentId: string = 'INST-001'): ParsedCSV {
  const lines = content.split(/\r?\n/).filter((line) => line.trim() !== '');
  const errors: string[] = [];
  const warnings: string[] = [];
  const rows: Observation[] = [];

  if (lines.length < 2) {
    return {
      headers: [],
      rows: [],
      errors: ['CSV文件内容为空或只有表头'],
      warnings: [],
    };
  }

  const headerLine = lines[0];
  const rawHeaders = headerLine.split(',').map((h) => h.trim());
  const headers = rawHeaders.map(normalizeHeader);

  const missingHeaders: string[] = [];
  const requiredHeaders = ['datetime', 'temperature', 'humidity', 'pressure'];
  for (const req of requiredHeaders) {
    if (!headers.includes(req)) {
      missingHeaders.push(req);
    }
  }

  if (missingHeaders.length > 0) {
    warnings.push(`缺少以下推荐列: ${missingHeaders.join(', ')}，将使用默认值`);
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = line.split(',');

    if (values.length !== rawHeaders.length) {
      errors.push(`第 ${i + 1} 行: 列数不匹配 (期望 ${rawHeaders.length} 列, 实际 ${values.length} 列)`);
      continue;
    }

    const data: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      data[headers[j]] = values[j]?.trim() || '';
    }

    try {
      let datetime = data.datetime || '';

      if (!datetime) {
        if (data.date && data.time) {
          datetime = `${data.date} ${data.time}`;
        } else {
          errors.push(`第 ${i + 1} 行: 缺少观测时间`);
          continue;
        }
      }

      const dateCheck = new Date(datetime);
      if (isNaN(dateCheck.getTime())) {
        errors.push(`第 ${i + 1} 行: 无效的日期时间格式 "${datetime}"`);
        continue;
      }

      if (dateCheck > new Date()) {
        warnings.push(`第 ${i + 1} 行: 观测时间 ${datetime} 晚于当前时间`);
      }

      const temperature = parseValue(data.temperature, 'temperature');
      const humidity = parseValue(data.humidity, 'humidity');
      const pressure = parseValue(data.pressure, 'pressure');
      const windSpeed = parseValue(data.windSpeed, 'windSpeed');
      const windDirection = parseValue(data.windDirection, 'windDirection');
      const precipitation = parseValue(data.precipitation, 'precipitation');
      const visibility = parseValue(data.visibility, 'visibility');

      if (temperature === null && warnings.length < 50) {
        warnings.push(`第 ${i + 1} 行: 气温数据缺失`);
      }

      const instrumentId = data.instrumentId || defaultInstrumentId;

      const obs: Observation = {
        id: `CSV-${Date.now()}-${i}`,
        datetime: new Date(datetime).toISOString(),
        temperature,
        humidity,
        pressure,
        windSpeed,
        windDirection,
        precipitation,
        visibility,
        instrumentId,
        qualityFlag: 'normal',
        reviewStatus: 'pending',
        remark: data.remark,
      };

      obs.qualityFlag = checkQualityFlag(obs);
      rows.push(obs);
    } catch (e) {
      errors.push(`第 ${i + 1} 行: 解析错误 - ${(e as Error).message}`);
    }
  }

  return {
    headers,
    rows,
    errors,
    warnings,
  };
}

export function exportToCSV(observations: Observation[]): string {
  const headerRow = CSV_HEADERS.join(',');

  const dataRows = observations.map((obs) => {
    const formatNum = (n: number | null): string => (n === null ? '' : n.toString());
    const formatDate = (d: string): string => {
      const date = new Date(d);
      return date.toISOString().replace('T', ' ').substring(0, 19);
    };

    return [
      formatDate(obs.datetime),
      formatNum(obs.temperature),
      formatNum(obs.humidity),
      formatNum(obs.pressure),
      formatNum(obs.windSpeed),
      formatNum(obs.windDirection),
      formatNum(obs.precipitation),
      formatNum(obs.visibility),
      obs.instrumentId,
      obs.remark || '',
    ].join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateSampleCSV(): string {
  const headers = 'datetime,temperature,humidity,pressure,windSpeed,windDirection,precipitation,visibility,instrumentId,remark';

  const now = new Date();
  const rows: string[] = [];

  for (let i = 0; i < 10; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - (10 - i));
    d.setHours(8, 0, 0, 0);

    const temp = (15 + Math.random() * 15).toFixed(1);
    const hum = (40 + Math.random() * 40).toFixed(0);
    const pres = (1005 + Math.random() * 20).toFixed(1);
    const wind = (Math.random() * 10).toFixed(1);
    const dir = (Math.random() * 360).toFixed(0);
    const prec = (Math.random() > 0.7 ? (Math.random() * 20).toFixed(1) : '0.0');
    const vis = (5 + Math.random() * 20).toFixed(1);

    rows.push(
      `${d.toISOString().substring(0, 10)} 08:00:00,${temp},${hum},${pres},${wind},${dir},${prec},${vis},INST-001,示例数据`
    );
  }

  return [headers, ...rows].join('\n');
}
