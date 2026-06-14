export const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  unit: 'km' | 'm' | 'mi' = 'km'
): number => {
  const R = unit === 'km' ? 6371 : unit === 'm' ? 6371000 : 3956;
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

export const formatCoordinates = (lat: number, lng: number): string => {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
};

export const decimalToDMS = (decimal: number): { degrees: number; minutes: number; seconds: number; direction: string } => {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesDecimal = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = Math.round((minutesDecimal - minutes) * 60 * 100) / 100;
  const direction = decimal >= 0 ? (Math.abs(decimal) === decimal ? 'N' : 'E') : (Math.abs(decimal) === -decimal ? 'S' : 'W');
  
  return { degrees, minutes, seconds, direction };
};

export const formatDMS = (lat: number, lng: number): string => {
  const latDMS = decimalToDMS(lat);
  const lngDMS = decimalToDMS(lng);
  
  return (
    `${latDMS.degrees}°${latDMS.minutes}'${latDMS.seconds}"${latDMS.direction} ` +
    `${lngDMS.degrees}°${lngDMS.minutes}'${lngDMS.seconds}"${lngDMS.direction}`
  );
};

export const getBounds = (points: { lat: number; lng: number }[]): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} => {
  if (points.length === 0) {
    return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
  }
  
  let minLat = Infinity, maxLat = -Infinity;
  let minLng = Infinity, maxLng = -Infinity;
  
  points.forEach(p => {
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
    minLng = Math.min(minLng, p.lng);
    maxLng = Math.max(maxLng, p.lng);
  });
  
  return { minLat, maxLat, minLng, maxLng };
};

export const getCenter = (points: { lat: number; lng: number }[]): [number, number] => {
  if (points.length === 0) return [0, 0];
  
  const bounds = getBounds(points);
  return [
    (bounds.minLat + bounds.maxLat) / 2,
    (bounds.minLng + bounds.maxLng) / 2
  ];
};

export const calculateZoomLevel = (bounds: {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}, mapWidth: number = 1000, mapHeight: number = 600): number => {
  const WORLD_DIM = { height: 256, width: 256 };
  const ZOOM_MAX = 21;
  
  const latFraction = (latRad(bounds.maxLat) - latRad(bounds.minLat)) / Math.PI;
  const lngDiff = bounds.maxLng - bounds.minLng;
  const lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;
  
  const latZoom = zoom(mapHeight, WORLD_DIM.height, latFraction);
  const lngZoom = zoom(mapWidth, WORLD_DIM.width, lngFraction);
  
  return Math.min(latZoom, lngZoom, ZOOM_MAX);
};

const latRad = (lat: number): number => {
  const sin = Math.sin(lat * Math.PI / 180);
  const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
  return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
};

const zoom = (mapPx: number, worldPx: number, fraction: number): number => {
  return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
};

export const getGeoHash = (lat: number, lng: number, precision: number = 12): string => {
  const BITS = [16, 8, 4, 2, 1];
  const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  
  let geohash = '';
  let isEven = true;
  let bit = 0;
  let ch = 0;
  
  const latRange = [-90.0, 90.0];
  const lngRange = [-180.0, 180.0];
  
  while (geohash.length < precision) {
    if (isEven) {
      const mid = (lngRange[0] + lngRange[1]) / 2;
      if (lng > mid) {
        ch |= BITS[bit];
        lngRange[0] = mid;
      } else {
        lngRange[1] = mid;
      }
    } else {
      const mid = (latRange[0] + latRange[1]) / 2;
      if (lat > mid) {
        ch |= BITS[bit];
        latRange[0] = mid;
      } else {
        latRange[1] = mid;
      }
    }
    
    isEven = !isEven;
    
    if (bit < 4) {
      bit++;
    } else {
      geohash += BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }
  
  return geohash;
};

export const parseGeoHash = (geohash: string): { lat: number; lng: number; latError: number; lngError: number } => {
  const BITS = [16, 8, 4, 2, 1];
  const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  
  let isEven = true;
  const latRange = [-90.0, 90.0];
  const lngRange = [-180.0, 180.0];
  let latError = 90.0;
  let lngError = 180.0;
  
  for (let i = 0; i < geohash.length; i++) {
    const ch = BASE32.indexOf(geohash[i]);
    
    for (let j = 0; j < 5; j++) {
      const mask = BITS[j];
      
      if (isEven) {
        lngError /= 2;
        if ((ch & mask) !== 0) {
          lngRange[0] = (lngRange[0] + lngRange[1]) / 2;
        } else {
          lngRange[1] = (lngRange[0] + lngRange[1]) / 2;
        }
      } else {
        latError /= 2;
        if ((ch & mask) !== 0) {
          latRange[0] = (latRange[0] + latRange[1]) / 2;
        } else {
          latRange[1] = (latRange[0] + latRange[1]) / 2;
        }
      }
      
      isEven = !isEven;
    }
  }
  
  return {
    lat: (latRange[0] + latRange[1]) / 2,
    lng: (lngRange[0] + lngRange[1]) / 2,
    latError,
    lngError
  };
};
