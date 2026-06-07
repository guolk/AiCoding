export interface City {
  name: string;
  lat?: number;
  lng?: number;
}

export interface RouteResult {
  route: City[];
  optimizedRoute: City[];
  totalDistance: number;
  originalDistance: number;
  improvement: number;
  estimatedTime: string;
}

const EARTH_RADIUS = 6371;
const AVERAGE_SPEED = 80;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function calculateDistance(city1: City, city2: City): number {
  if (!city1.lat || !city1.lng || !city2.lat || !city2.lng) {
    return 0;
  }

  const dLat = toRadians(city2.lat - city1.lat);
  const dLng = toRadians(city2.lng - city1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(city1.lat)) * Math.cos(toRadians(city2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS * c;
}

export function nearestNeighbor(cities: City[], startCity?: City): City[] {
  if (cities.length === 0) return [];
  if (cities.length === 1) return [...cities];

  const unvisited = [...cities];
  const route: City[] = [];

  let currentCity = startCity && unvisited.some(c => c.name === startCity.name)
    ? unvisited.splice(unvisited.findIndex(c => c.name === startCity.name), 1)[0]
    : unvisited.shift()!;

  route.push(currentCity);

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const distance = calculateDistance(currentCity, unvisited[i]);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    currentCity = unvisited.splice(nearestIndex, 1)[0];
    route.push(currentCity);
  }

  return route;
}

function calculateRouteDistance(route: City[]): number {
  let totalDistance = 0;
  for (let i = 0; i < route.length - 1; i++) {
    totalDistance += calculateDistance(route[i], route[i + 1]);
  }
  return totalDistance;
}

export function twoOptOptimization(route: City[]): City[] {
  if (route.length <= 3) return [...route];

  let bestRoute = [...route];
  let bestDistance = calculateRouteDistance(bestRoute);
  let improved = true;

  while (improved) {
    improved = false;

    for (let i = 1; i < bestRoute.length - 2; i++) {
      for (let j = i + 1; j < bestRoute.length - 1; j++) {
        const newRoute = [
          ...bestRoute.slice(0, i),
          ...bestRoute.slice(i, j + 1).reverse(),
          ...bestRoute.slice(j + 1)
        ];

        const newDistance = calculateRouteDistance(newRoute);

        if (newDistance < bestDistance) {
          bestRoute = newRoute;
          bestDistance = newDistance;
          improved = true;
        }
      }
    }
  }

  return bestRoute;
}

export function optimizeRoute(cities: City[], startCity?: City): RouteResult {
  if (cities.length === 0) {
    return {
      route: [],
      optimizedRoute: [],
      totalDistance: 0,
      originalDistance: 0,
      improvement: 0,
      estimatedTime: '0小时'
    };
  }

  const initialRoute = nearestNeighbor(cities, startCity);
  const originalDistance = calculateRouteDistance(initialRoute);
  const optimizedRoute = twoOptOptimization(initialRoute);
  const totalDistance = calculateRouteDistance(optimizedRoute);
  const improvement = originalDistance > 0 ? (originalDistance - totalDistance) / originalDistance : 0;

  const hours = Math.floor(totalDistance / AVERAGE_SPEED);
  const minutes = Math.round((totalDistance % AVERAGE_SPEED) / AVERAGE_SPEED * 60);

  let estimatedTime = '';
  if (hours > 0) {
    estimatedTime += `${hours}小时`;
  }
  if (minutes > 0) {
    estimatedTime += `${minutes}分钟`;
  }
  if (estimatedTime === '') {
    estimatedTime = '0小时';
  }

  return {
    route: initialRoute,
    optimizedRoute,
    totalDistance: Math.round(totalDistance * 100) / 100,
    originalDistance: Math.round(originalDistance * 100) / 100,
    improvement: Math.round(improvement * 10000) / 10000,
    estimatedTime
  };
}
