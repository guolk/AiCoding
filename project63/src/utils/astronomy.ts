import { CelestialObject, PlanetPosition, MoonPhase, AstronomicalEvent, ObservationTarget, UserLocation } from '../types';

export const julianDate = (date: Date): number => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate() + date.getUTCHours() / 24 + date.getUTCMinutes() / 1440;
  
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  
  let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  return jd;
};

export const calculateLocalSiderealTime = (date: Date, longitude: number): number => {
  const jd = julianDate(date);
  const t = (jd - 2451545.0) / 36525.0;
  
  let gst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * t * t - t * t * t / 38710000.0;
  gst = gst % 360;
  if (gst < 0) gst += 360;
  
  let lst = gst + longitude;
  lst = lst % 360;
  if (lst < 0) lst += 360;
  
  return lst;
};

export const raDecToAltAz = (ra: number, dec: number, date: Date, latitude: number, longitude: number): { altitude: number; azimuth: number } => {
  const lst = calculateLocalSiderealTime(date, longitude);
  const hourAngle = (lst - ra + 360) % 360;
  
  const raRad = (ra * Math.PI) / 180;
  const decRad = (dec * Math.PI) / 180;
  const haRad = (hourAngle * Math.PI) / 180;
  const latRad = (latitude * Math.PI) / 180;
  
  const sinAlt = Math.sin(decRad) * Math.sin(latRad) + Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad);
  let altitude = (Math.asin(sinAlt) * 180) / Math.PI;
  
  const cosAz = (Math.sin(decRad) - Math.sin(latRad) * sinAlt) / (Math.cos(latRad) * Math.cos(Math.asin(sinAlt)));
  let azimuth = (Math.acos(Math.max(-1, Math.min(1, cosAz))) * 180) / Math.PI;
  
  if (Math.sin(haRad) > 0) {
    azimuth = 360 - azimuth;
  }
  
  return { altitude, azimuth };
};

export const calculateMoonPhase = (date: Date): MoonPhase => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  let c, e, jd, b;
  
  if (month < 3) {
    c = year - 1;
    e = month + 12;
  } else {
    c = year;
    e = month;
  }
  
  jd = Math.floor(365.25 * c) + Math.floor(30.6001 * (e + 1)) + day - 694039.09;
  jd /= 29.53058867;
  b = Math.floor(jd);
  jd -= b;
  b = Math.round(jd * 8);
  if (b >= 8) b = 0;
  
  const phase = jd;
  const illumination = (1 - Math.cos(phase * 2 * Math.PI)) / 2;
  
  const phaseNames = ['新月', '娥眉月', '上弦月', '盈凸月', '满月', '亏凸月', '下弦月', '残月'];
  const phaseIndex = Math.floor(phase * 8) % 8;
  
  return {
    phase,
    phaseName: phaseNames[phaseIndex],
    illumination: illumination * 100,
    age: phase * 29.53,
    riseTime: new Date(date.getTime() + phaseIndex * 3 * 3600000),
    setTime: new Date(date.getTime() + (phaseIndex * 3 + 12) * 3600000),
  };
};

export const calculatePlanetPositions = (date: Date, location: UserLocation): PlanetPosition[] => {
  const planets = ['水星', '金星', '火星', '木星', '土星', '天王星', '海王星'];
  const magnitudes = [-1.9, -4.7, -2.9, -2.9, 0.5, 5.7, 7.8];
  const baseRa = [48.5, 228.5, 328.5, 168.5, 288.5, 28.5, 348.5];
  const baseDec = [18.5, -13.5, -1.5, -5.5, -18.5, 15.5, -5.5];
  
  return planets.map((planet, index) => {
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const ra = (baseRa[index] + dayOfYear * (index + 1) * 0.1) % 360;
    const dec = baseDec[index] + Math.sin(dayOfYear * 0.05) * 5;
    const { altitude, azimuth } = raDecToAltAz(ra, dec, date, location.latitude, location.longitude);
    
    const riseTime = new Date(date.getTime() + 18 * 3600000 + index * 1800000);
    const setTime = new Date(date.getTime() + 6 * 3600000 + index * 1800000 + 24 * 3600000);
    
    return {
      planet,
      ra,
      dec,
      altitude: Math.round(altitude * 10) / 10,
      azimuth: Math.round(azimuth * 10) / 10,
      magnitude: magnitudes[index],
      riseTime,
      setTime,
      visible: altitude > 10,
    };
  });
};

export const getAstronomicalEvents = (year: number): AstronomicalEvent[] => {
  const events: AstronomicalEvent[] = [
    {
      id: '1',
      date: new Date(year, 0, 4),
      type: 'meteor_shower',
      name: '象限仪座流星雨极大',
      description: '象限仪座流星雨达到峰值，ZHR约120颗/小时',
      zenithHourlyRate: 120,
      visibility: '全国可见',
    },
    {
      id: '2',
      date: new Date(year, 3, 22),
      type: 'meteor_shower',
      name: '天琴座流星雨极大',
      description: '天琴座流星雨达到峰值，ZHR约18颗/小时',
      zenithHourlyRate: 18,
      visibility: '全国可见',
    },
    {
      id: '3',
      date: new Date(year, 7, 13),
      type: 'meteor_shower',
      name: '英仙座流星雨极大',
      description: '英仙座流星雨达到峰值，ZHR约100颗/小时',
      zenithHourlyRate: 100,
      visibility: '全国可见',
    },
    {
      id: '4',
      date: new Date(year, 9, 21),
      type: 'meteor_shower',
      name: '猎户座流星雨极大',
      description: '猎户座流星雨达到峰值，ZHR约20颗/小时',
      zenithHourlyRate: 20,
      visibility: '全国可见',
    },
    {
      id: '5',
      date: new Date(year, 11, 14),
      type: 'meteor_shower',
      name: '双子座流星雨极大',
      description: '双子座流星雨达到峰值，ZHR约150颗/小时',
      zenithHourlyRate: 150,
      visibility: '全国可见',
    },
    {
      id: '6',
      date: new Date(year, 0, 20),
      type: 'planetary_opposition',
      name: '火星冲日',
      description: '火星运行至与太阳相对的位置，整夜可见',
      visibility: '全国可见',
    },
    {
      id: '7',
      date: new Date(year, 2, 8),
      type: 'planetary_opposition',
      name: '木星冲日',
      description: '木星运行至与太阳相对的位置，整夜可见',
      visibility: '全国可见',
    },
    {
      id: '8',
      date: new Date(year, 5, 15),
      type: 'planetary_opposition',
      name: '土星冲日',
      description: '土星运行至与太阳相对的位置，整夜可见',
      visibility: '全国可见',
    },
    {
      id: '9',
      date: new Date(year, 3, 8),
      type: 'eclipse',
      name: '日全食',
      description: '罕见的日全食天象，我国部分地区可见',
      visibility: '我国西南部可见',
    },
    {
      id: '10',
      date: new Date(year, 8, 17),
      type: 'eclipse',
      name: '月偏食',
      description: '月偏食天象，我国全境可见全过程',
      visibility: '全国可见',
    },
  ];
  
  return events;
};

export const getMessierObjects = (): CelestialObject[] => {
  return [
    { id: 'M1', name: 'M1 蟹状星云', type: 'nebula', catalog: 'Messier', catalogNumber: 'M1', ra: 83.63, dec: 22.01, magnitude: 8.4, constellation: '金牛座', description: '超新星遗迹，公元1054年超新星爆发的产物', observed: false },
    { id: 'M31', name: 'M31 仙女座大星系', type: 'galaxy', catalog: 'Messier', catalogNumber: 'M31', ra: 10.68, dec: 41.27, magnitude: 3.4, constellation: '仙女座', description: '距离银河系最近的大型星系，肉眼可见', observed: true, observedDates: ['2024-08-15'] },
    { id: 'M42', name: 'M42 猎户座大星云', type: 'nebula', catalog: 'Messier', catalogNumber: 'M42', ra: 83.82, dec: -5.39, magnitude: 4.0, constellation: '猎户座', description: '最明亮的弥漫星云，恒星形成区', observed: true, observedDates: ['2024-01-20', '2024-02-15'] },
    { id: 'M45', name: 'M45 昴星团', type: 'cluster', catalog: 'Messier', catalogNumber: 'M45', ra: 56.75, dec: 24.12, magnitude: 1.6, constellation: '金牛座', description: '最著名的疏散星团，肉眼可见', observed: true, observedDates: ['2023-12-10'] },
    { id: 'M51', name: 'M51 涡状星系', type: 'galaxy', catalog: 'Messier', catalogNumber: 'M51', ra: 202.47, dec: 47.20, magnitude: 8.4, constellation: '猎犬座', description: '著名的相互作用星系对', observed: false },
    { id: 'M81', name: 'M81 波德星系', type: 'galaxy', catalog: 'Messier', catalogNumber: 'M81', ra: 148.89, dec: 69.07, magnitude: 6.9, constellation: '大熊座', description: '明亮的Sb型旋涡星系', observed: false },
    { id: 'M82', name: 'M82 雪茄星系', type: 'galaxy', catalog: 'Messier', catalogNumber: 'M82', ra: 148.97, dec: 69.68, magnitude: 8.4, constellation: '大熊座', description: '著名的星暴星系', observed: false },
    { id: 'M101', name: 'M101 风车星系', type: 'galaxy', catalog: 'Messier', catalogNumber: 'M101', ra: 210.80, dec: 54.35, magnitude: 7.9, constellation: '大熊座', description: '正面朝向地球的旋涡星系', observed: false },
  ];
};

export const getNGCObjects = (): CelestialObject[] => {
  return [
    { id: 'NGC224', name: 'NGC224 仙女座大星系', type: 'galaxy', catalog: 'NGC', catalogNumber: 'NGC224', ra: 10.68, dec: 41.27, magnitude: 3.4, constellation: '仙女座', description: '距离银河系最近的大型星系', observed: true, observedDates: ['2024-08-15'] },
    { id: 'NGC7000', name: 'NGC7000 北美星云', type: 'nebula', catalog: 'NGC', catalogNumber: 'NGC7000', ra: 307.50, dec: 44.00, magnitude: 4.0, constellation: '天鹅座', description: '巨大的发射星云，形状酷似北美洲', observed: false },
    { id: 'NGC6611', name: 'NGC6611 鹰状星云', type: 'nebula', catalog: 'NGC', catalogNumber: 'NGC6611', ra: 274.70, dec: -13.81, magnitude: 6.0, constellation: '巨蛇座', description: '著名的恒星形成区，内含创生之柱', observed: false },
    { id: 'NGC5128', name: 'NGC5128 半人马座A', type: 'galaxy', catalog: 'NGC', catalogNumber: 'NGC5128', ra: 201.37, dec: -43.02, magnitude: 7.0, constellation: '半人马座', description: '特殊的射电星系', observed: false },
  ];
};

export const calculateBestObservationTime = (obj: CelestialObject, date: Date, location: UserLocation): ObservationTarget | null => {
  const sunset = new Date(date);
  sunset.setHours(18, 30, 0, 0);
  
  const sunrise = new Date(date);
  sunrise.setDate(sunrise.getDate() + 1);
  sunrise.setHours(5, 30, 0, 0);
  
  let bestStartTime = sunset;
  let bestEndTime = sunrise;
  let maxAltitude = 0;
  
  for (let t = sunset.getTime(); t < sunrise.getTime(); t += 3600000) {
    const currentTime = new Date(t);
    const { altitude } = raDecToAltAz(obj.ra, obj.dec, currentTime, location.latitude, location.longitude);
    if (altitude > maxAltitude) {
      maxAltitude = altitude;
    }
  }
  
  if (maxAltitude < 15) {
    return null;
  }
  
  const startTime = new Date(sunset.getTime() + 3600000);
  const endTime = new Date(sunrise.getTime() - 3600000);
  
  let priority: 'high' | 'medium' | 'low' = 'medium';
  if (obj.magnitude < 6 && maxAltitude > 40) {
    priority = 'high';
  } else if (obj.magnitude > 10 || maxAltitude < 25) {
    priority = 'low';
  }
  
  return {
    objectId: obj.id,
    objectName: obj.name,
    bestStartTime: startTime,
    bestEndTime: endTime,
    maxAltitude: Math.round(maxAltitude * 10) / 10,
    priority,
    notes: `最大地平高度: ${Math.round(maxAltitude)}°`,
  };
};

export const calculateMagnification = (telescopeFocalLength: number, eyepieceFocalLength: number, barlowMultiplier: number = 1): number => {
  return (telescopeFocalLength / eyepieceFocalLength) * barlowMultiplier;
};

export const getRecommendedMagnification = (objectType: string, telescopeAperture: number): number[] => {
  const baseMagnification = telescopeAperture * 0.5;
  
  switch (objectType) {
    case 'planet':
      return [baseMagnification * 2, baseMagnification * 3, baseMagnification * 4];
    case 'galaxy':
    case 'nebula':
      return [baseMagnification * 0.5, baseMagnification, baseMagnification * 1.5];
    case 'cluster':
      return [baseMagnification * 0.3, baseMagnification * 0.6, baseMagnification];
    case 'star':
      return [baseMagnification * 0.8, baseMagnification * 1.2, baseMagnification * 1.5];
    default:
      return [baseMagnification * 0.5, baseMagnification, baseMagnification * 2];
  }
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
};
