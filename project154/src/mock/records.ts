import type { RideRecord } from '@/types/record';
import { mockRoutes } from './routes';

const generateSpeedData = (avgSpeed: number, duration: number) => {
  const data = [];
  for (let i = 0; i <= 60; i += 5) {
    data.push({
      time: i,
      speed: avgSpeed + (Math.random() - 0.5) * 8,
    });
  }
  return data;
};

export const mockRecords: RideRecord[] = [
  {
    id: 'record-1',
    routeId: 'route-1',
    route: mockRoutes[0],
    userId: 'user-1',
    rideDate: '2024-06-10',
    weather: 'sunny',
    roadCondition: 'dry',
    avgSpeed: 22.5,
    maxSpeed: 35.2,
    duration: 22,
    calories: 320,
    feeling: '非常棒',
    notes: '今天状态很好，一路顺风，感觉很畅快！',
    speedData: generateSpeedData(22.5, 22),
    createdAt: '2024-06-10T08:30:00Z',
  },
  {
    id: 'record-2',
    routeId: 'route-1',
    route: mockRoutes[0],
    userId: 'user-1',
    rideDate: '2024-06-12',
    weather: 'rainy',
    roadCondition: 'wet',
    avgSpeed: 18.3,
    maxSpeed: 28.7,
    duration: 28,
    calories: 290,
    feeling: '还不错',
    notes: '下雨了，路面湿滑，放慢了速度，不过雨中骑行别有一番风味。',
    speedData: generateSpeedData(18.3, 28),
    createdAt: '2024-06-12T18:45:00Z',
  },
  {
    id: 'record-3',
    routeId: 'route-2',
    route: mockRoutes[1],
    userId: 'user-1',
    rideDate: '2024-06-08',
    weather: 'sunny',
    roadCondition: 'dry',
    avgSpeed: 24.1,
    maxSpeed: 38.5,
    duration: 25,
    calories: 450,
    feeling: '非常棒',
    notes: '周末早上奥森人不多，骑了两圈20公里，状态不错！',
    speedData: generateSpeedData(24.1, 50),
    createdAt: '2024-06-08T07:30:00Z',
  },
  {
    id: 'record-4',
    routeId: 'route-2',
    route: mockRoutes[1],
    userId: 'user-1',
    rideDate: '2024-06-15',
    weather: 'hot',
    roadCondition: 'dry',
    avgSpeed: 21.8,
    maxSpeed: 32.4,
    duration: 28,
    calories: 480,
    feeling: '有点累',
    notes: '今天太热了，骑一圈就汗流浃背了，补水很重要！',
    speedData: generateSpeedData(21.8, 28),
    createdAt: '2024-06-15T10:00:00Z',
  },
  {
    id: 'record-5',
    routeId: 'route-3',
    route: mockRoutes[2],
    userId: 'user-1',
    rideDate: '2024-05-25',
    weather: 'cloudy',
    roadCondition: 'dry',
    avgSpeed: 15.2,
    maxSpeed: 42.8,
    duration: 83,
    calories: 1250,
    feeling: '非常累',
    notes: '终于征服妙峰山！虽然累但是很有成就感！山顶风景太美了！',
    speedData: generateSpeedData(15.2, 83),
    createdAt: '2024-05-25T06:00:00Z',
  },
  {
    id: 'record-6',
    routeId: 'route-5',
    route: mockRoutes[4],
    userId: 'user-1',
    rideDate: '2024-06-11',
    weather: 'windy',
    roadCondition: 'dry',
    avgSpeed: 19.6,
    maxSpeed: 31.2,
    duration: 22,
    calories: 280,
    feeling: '还不错',
    notes: '逆风骑车上班，风有点大，不过还好，坚持就是胜利！',
    speedData: generateSpeedData(19.6, 22),
    createdAt: '2024-06-11T08:00:00Z',
  },
  {
    id: 'record-7',
    routeId: 'route-4',
    route: mockRoutes[3],
    userId: 'user-1',
    rideDate: '2024-06-01',
    weather: 'sunny',
    roadCondition: 'dry',
    avgSpeed: 20.3,
    maxSpeed: 33.6,
    duration: 103,
    calories: 1100,
    feeling: '非常棒',
    notes: '温榆河风景真的太美了，一路沿着河边骑行，心情舒畅！下次还要来！',
    speedData: generateSpeedData(20.3, 103),
    createdAt: '2024-06-01T09:00:00Z',
  },
  {
    id: 'record-8',
    routeId: 'route-1',
    route: mockRoutes[0],
    userId: 'user-1',
    rideDate: '2024-06-09',
    weather: 'cloudy',
    roadCondition: 'dry',
    avgSpeed: 23.8,
    maxSpeed: 36.1,
    duration: 21,
    calories: 340,
    feeling: '感觉很好',
    notes: '天气不错，骑得很舒服。',
    speedData: generateSpeedData(23.8, 21),
    createdAt: '2024-06-09T18:30:00Z',
  },
];

export const getRecordsByRouteId = (routeId: string): RideRecord[] => {
  return mockRecords.filter(record => record.routeId === routeId);
};

export const getRecordById = (id: string): RideRecord | undefined => {
  return mockRecords.find(record => record.id === id);
};

export const getBestTimeByRouteId = (routeId: string): number | null => {
  const routeRecords = mockRecords.filter(r => r.routeId === routeId);
  if (routeRecords.length === 0) return null;
  return Math.min(...routeRecords.map(r => r.duration));
};
