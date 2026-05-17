export interface GpxPoint {
  lat: number;
  lng: number;
  elevation?: number;
  time?: string;
}

export interface GpxData {
  name?: string;
  time?: string;
  distance: number;
  duration: number;
  points: GpxPoint[];
  avgPace: number;
  totalAscent: number;
  totalDescent: number;
}

export const parseGpx = (xmlString: string): GpxData => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  
  const parseError = xmlDoc.querySelector('parsererror');
  if (parseError) {
    throw new Error('GPX文件解析失败');
  }
  
  const trkpts = Array.from(xmlDoc.getElementsByTagName('trkpt'));
  const points: GpxPoint[] = [];
  
  trkpts.forEach(pt => {
    const lat = parseFloat(pt.getAttribute('lat') || '0');
    const lng = parseFloat(pt.getAttribute('lon') || '0');
    const ele = pt.getElementsByTagName('ele')[0];
    const time = pt.getElementsByTagName('time')[0];
    
    points.push({
      lat,
      lng,
      elevation: ele ? parseFloat(ele.textContent || '0') : undefined,
      time: time ? time.textContent || undefined : undefined
    });
  });
  
  if (points.length < 2) {
    throw new Error('GPX文件中没有足够的轨迹点');
  }
  
  const distance = calculateTotalDistance(points);
  const duration = calculateDuration(points);
  const avgPace = duration > 0 ? (duration / 60) / (distance / 1000) : 0;
  const { totalAscent, totalDescent } = calculateElevation(points);
  
  const nameElement = xmlDoc.querySelector('name');
  const timeElement = xmlDoc.querySelector('metadata > time');
  
  return {
    name: nameElement?.textContent || undefined,
    time: timeElement?.textContent || undefined,
    distance: Math.round(distance) / 1000,
    duration: Math.round(duration),
    points,
    avgPace,
    totalAscent: Math.round(totalAscent),
    totalDescent: Math.round(totalDescent)
  };
};

const calculateDistance = (p1: GpxPoint, p2: GpxPoint): number => {
  const R = 6371000;
  const dLat = toRad(p2.lat - p1.lat);
  const dLon = toRad(p2.lng - p1.lng);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

const calculateTotalDistance = (points: GpxPoint[]): number => {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += calculateDistance(points[i - 1], points[i]);
  }
  return total;
};

const calculateDuration = (points: GpxPoint[]): number => {
  if (points.length < 2) return 0;
  
  const firstTime = points[0].time ? new Date(points[0].time).getTime() : 0;
  const lastPointTime = points[points.length - 1].time;
  const lastTime = lastPointTime ? new Date(lastPointTime).getTime() : 0;
  
  if (firstTime && lastTime) {
    return (lastTime - firstTime) / 1000;
  }
  
  return points.length * 5;
};

const calculateElevation = (points: GpxPoint[]): { totalAscent: number; totalDescent: number } => {
  let totalAscent = 0;
  let totalDescent = 0;
  
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1].elevation;
    const curr = points[i].elevation;
    
    if (prev !== undefined && curr !== undefined) {
      const diff = curr - prev;
      if (diff > 0) {
        totalAscent += diff;
      } else {
        totalDescent += Math.abs(diff);
      }
    }
  }
  
  return { totalAscent, totalDescent };
};

export const simplifyPoints = (points: GpxPoint[], maxPoints: number = 100): GpxPoint[] => {
  if (points.length <= maxPoints) return points;
  
  const step = Math.ceil(points.length / maxPoints);
  return points.filter((_, index) => index % step === 0 || index === points.length - 1);
};
