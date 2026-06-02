import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Ride, RouteItem, Motorcycle, Maintenance, Fault, Gear, Reminder } from '../types';

interface AppState {
  rides: Ride[];
  routes: RouteItem[];
  motorcycle: Motorcycle | null;
  maintenances: Maintenance[];
  reminders: Reminder[];
  faults: Fault[];
  gears: Gear[];

  addRide: (ride: Omit<Ride, 'id' | 'createdAt'>) => void;
  updateRide: (id: string, ride: Partial<Ride>) => void;
  deleteRide: (id: string) => void;

  addRoute: (route: Omit<RouteItem, 'id' | 'createdAt'>) => void;
  updateRoute: (id: string, route: Partial<RouteItem>) => void;
  deleteRoute: (id: string) => void;

  setMotorcycle: (motorcycle: Motorcycle) => void;
  updateMotorcycle: (motorcycle: Partial<Motorcycle>) => void;

  addMaintenance: (maintenance: Omit<Maintenance, 'id'>) => void;
  updateMaintenance: (id: string, maintenance: Partial<Maintenance>) => void;
  deleteMaintenance: (id: string) => void;

  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  updateReminder: (id: string, reminder: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;

  addFault: (fault: Omit<Fault, 'id'>) => void;
  updateFault: (id: string, fault: Partial<Fault>) => void;
  deleteFault: (id: string) => void;

  addGear: (gear: Omit<Gear, 'id'>) => void;
  updateGear: (id: string, gear: Partial<Gear>) => void;
  deleteGear: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const mockRides: Ride[] = [
  {
    id: '1',
    date: '2026-05-28',
    routeName: '香山环山公路',
    distance: 85.5,
    duration: 180,
    weather: '晴朗',
    ridingBuddies: '张三, 李四',
    roadCondition: '山路弯道多，路面良好',
    notes: '风景优美，适合周末休闲骑行',
    photos: [],
    createdAt: '2026-05-28T10:00:00Z'
  },
  {
    id: '2',
    date: '2026-05-20',
    routeName: '怀柔百里画廊',
    distance: 156.2,
    duration: 270,
    weather: '多云',
    ridingBuddies: '王五',
    roadCondition: '部分路段施工，需减速',
    notes: '沿途风景秀丽，推荐春季前往',
    photos: [],
    createdAt: '2026-05-20T09:00:00Z'
  }
];

const mockRoutes: RouteItem[] = [
  {
    id: '1',
    name: '范崎路经典线',
    distance: 68,
    difficulty: 'medium',
    highlights: '连续弯道、山景、水库',
    gasStations: [
      { name: '中石油雁栖站', location: '起点10公里处' },
      { name: '中石化汤河口站', location: '终点5公里处' }
    ],
    recommendation: '北京经典跑山路，车流量适中，弯道质量高',
    bestSeason: '4-10月',
    isShared: true,
    createdAt: '2026-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: '红井路魔鬼公路',
    distance: 45,
    difficulty: 'hard',
    highlights: '发卡弯、盘山公路、俯瞰全景',
    gasStations: [
      { name: '中石化十渡站', location: '起点15公里处' }
    ],
    recommendation: '北京最险峻的山路，适合有经验的骑手挑战',
    bestSeason: '5-9月',
    isShared: true,
    createdAt: '2026-02-20T00:00:00Z'
  }
];

const mockMotorcycle: Motorcycle = {
  id: '1',
  brand: '本田',
  model: 'CB400X',
  year: 2023,
  displacement: 399,
  vin: 'LWBPCK408P1234567',
  purchaseDate: '2023-06-15',
  currentMileage: 12580,
  insuranceExpiry: '2027-06-14',
  inspectionExpiry: '2025-06-14',
  modifications: [
    {
      id: '1',
      name: '加高风挡',
      date: '2023-08-20',
      cost: 580,
      notes: 'GIVI品牌，高速风阻明显减小'
    },
    {
      id: '2',
      name: '发动机护杠',
      date: '2023-07-10',
      cost: 860,
      notes: '不锈钢材质，防摔保护'
    }
  ]
};

const mockMaintenances: Maintenance[] = [
  {
    id: '1',
    type: 'oil',
    date: '2026-05-10',
    mileage: 12000,
    description: '更换机油机滤',
    cost: 450,
    notes: '使用原厂全合成机油'
  },
  {
    id: '2',
    type: 'chain',
    date: '2026-04-15',
    mileage: 10500,
    description: '链条清洗润滑',
    cost: 80,
    notes: '链条松弛度调整至2cm'
  }
];

const mockReminders: Reminder[] = [
  { id: '1', type: '下次机油保养', nextMileage: 15000, isActive: true },
  { id: '2', type: '轮胎检查', nextMileage: 18000, isActive: true }
];

const mockFaults: Fault[] = [
  {
    id: '1',
    description: '怠速不稳，冷车易熄火',
    date: '2026-03-20',
    solution: '清洗节气门，调整怠速',
    cost: 200
  }
];

const mockGears: Gear[] = [
  {
    id: '1',
    category: 'helmet',
    brand: 'SHOEI',
    model: 'Z-8',
    purchaseDate: '2023-06-15',
    status: 'good',
    notes: '全盔，通勤主力'
  },
  {
    id: '2',
    category: 'jacket',
    brand: 'REVIT',
    model: 'Sand 4',
    purchaseDate: '2023-07-01',
    status: 'good',
    notes: '四季骑行服，带护具'
  },
  {
    id: '3',
    category: 'gloves',
    brand: 'A星',
    model: 'SP-8',
    purchaseDate: '2023-08-10',
    status: 'worn',
    notes: '皮质手套，掌部磨损'
  },
  {
    id: '4',
    category: 'boots',
    brand: 'SIDI',
    model: 'Adventure 2',
    purchaseDate: '2023-09-05',
    status: 'new',
    notes: '拉力靴，防水效果好'
  }
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      rides: mockRides,
      routes: mockRoutes,
      motorcycle: mockMotorcycle,
      maintenances: mockMaintenances,
      reminders: mockReminders,
      faults: mockFaults,
      gears: mockGears,

      addRide: (ride) =>
        set((state) => ({
          rides: [{ ...ride, id: generateId(), createdAt: new Date().toISOString() }, ...state.rides]
        })),
      updateRide: (id, ride) =>
        set((state) => ({
          rides: state.rides.map((r) => (r.id === id ? { ...r, ...ride } : r))
        })),
      deleteRide: (id) =>
        set((state) => ({
          rides: state.rides.filter((r) => r.id !== id)
        })),

      addRoute: (route) =>
        set((state) => ({
          routes: [{ ...route, id: generateId(), createdAt: new Date().toISOString() }, ...state.routes]
        })),
      updateRoute: (id, route) =>
        set((state) => ({
          routes: state.routes.map((r) => (r.id === id ? { ...r, ...route } : r))
        })),
      deleteRoute: (id) =>
        set((state) => ({
          routes: state.routes.filter((r) => r.id !== id)
        })),

      setMotorcycle: (motorcycle) => set({ motorcycle }),
      updateMotorcycle: (motorcycle) =>
        set((state) => ({
          motorcycle: state.motorcycle ? { ...state.motorcycle, ...motorcycle } : null
        })),

      addMaintenance: (maintenance) =>
        set((state) => ({
          maintenances: [{ ...maintenance, id: generateId() }, ...state.maintenances]
        })),
      updateMaintenance: (id, maintenance) =>
        set((state) => ({
          maintenances: state.maintenances.map((m) => (m.id === id ? { ...m, ...maintenance } : m))
        })),
      deleteMaintenance: (id) =>
        set((state) => ({
          maintenances: state.maintenances.filter((m) => m.id !== id)
        })),

      addReminder: (reminder) =>
        set((state) => ({
          reminders: [{ ...reminder, id: generateId() }, ...state.reminders]
        })),
      updateReminder: (id, reminder) =>
        set((state) => ({
          reminders: state.reminders.map((r) => (r.id === id ? { ...r, ...reminder } : r))
        })),
      deleteReminder: (id) =>
        set((state) => ({
          reminders: state.reminders.filter((r) => r.id !== id)
        })),

      addFault: (fault) =>
        set((state) => ({
          faults: [{ ...fault, id: generateId() }, ...state.faults]
        })),
      updateFault: (id, fault) =>
        set((state) => ({
          faults: state.faults.map((f) => (f.id === id ? { ...f, ...fault } : f))
        })),
      deleteFault: (id) =>
        set((state) => ({
          faults: state.faults.filter((f) => f.id !== id)
        })),

      addGear: (gear) =>
        set((state) => ({
          gears: [{ ...gear, id: generateId() }, ...state.gears]
        })),
      updateGear: (id, gear) =>
        set((state) => ({
          gears: state.gears.map((g) => (g.id === id ? { ...g, ...gear } : g))
        })),
      deleteGear: (id) =>
        set((state) => ({
          gears: state.gears.filter((g) => g.id !== id)
        }))
    }),
    {
      name: 'motorcycle-journal-storage'
    }
  )
);
