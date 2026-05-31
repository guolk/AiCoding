import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, UserProfile, TrainingRecord, RaceReview, RacePlan } from '@/types';

const defaultUserProfile: UserProfile = {
  restingHeartRate: 60,
  maxHeartRate: 185,
  age: 30,
  weight: 70,
  vdot: 45
};

const defaultTrainingRecords: TrainingRecord[] = [
  {
    id: 'demo1',
    date: '2026-05-28',
    type: 'easy',
    typeName: '轻松跑',
    distance: 8,
    targetPace: '6:00',
    targetPaceSeconds: 360,
    actualPace: '5:55',
    actualPaceSeconds: 355,
    targetHeartRate: 140,
    actualHeartRate: 138,
    notes: '恢复跑，感觉轻松'
  },
  {
    id: 'demo2',
    date: '2026-05-25',
    type: 'interval',
    typeName: '间歇跑',
    distance: 10,
    targetPace: '4:30',
    targetPaceSeconds: 270,
    actualPace: '4:25',
    actualPaceSeconds: 265,
    targetHeartRate: 170,
    actualHeartRate: 172,
    notes: '8x1km间歇，配速稳定'
  },
  {
    id: 'demo3',
    date: '2026-05-21',
    type: 'long',
    typeName: '长距离',
    distance: 18,
    targetPace: '5:45',
    targetPaceSeconds: 345,
    actualPace: '5:50',
    actualPaceSeconds: 350,
    targetHeartRate: 145,
    actualHeartRate: 148,
    notes: 'LSD，后半程略慢'
  }
];

const defaultRaceReviews: RaceReview[] = [
  {
    id: 'race1',
    date: '2026-05-01',
    raceName: '北京半程马拉松',
    distance: 'half',
    distanceName: '半程马拉松',
    totalTime: '1:45:30',
    totalTimeSeconds: 6330,
    averagePace: '5:00',
    fastestKm: { km: 5, pace: '4:45' },
    slowestKm: { km: 21, pace: '5:30' },
    weather: {
      temperature: 18,
      humidity: 55
    },
    strategyNotes: '前半程配速4:50，后半程略有掉速',
    lessonsLearned: '最后一公里需要更多练习',
    splits: [
      { km: 1, time: '4:50', timeInSeconds: 290, pace: '4:50', paceInSeconds: 290, elevation: 10, heartRate: 155 },
      { km: 2, time: '4:48', timeInSeconds: 288, pace: '4:48', paceInSeconds: 288, elevation: 5, heartRate: 158 },
      { km: 3, time: '4:52', timeInSeconds: 292, pace: '4:52', paceInSeconds: 292, elevation: -5, heartRate: 160 },
      { km: 4, time: '4:49', timeInSeconds: 289, pace: '4:49', paceInSeconds: 289, elevation: 0, heartRate: 162 },
      { km: 5, time: '4:45', timeInSeconds: 285, pace: '4:45', paceInSeconds: 285, elevation: 8, heartRate: 165 },
      { km: 6, time: '4:47', timeInSeconds: 287, pace: '4:47', paceInSeconds: 287, elevation: 3, heartRate: 166 },
      { km: 7, time: '4:51', timeInSeconds: 291, pace: '4:51', paceInSeconds: 291, elevation: -3, heartRate: 168 },
      { km: 8, time: '4:53', timeInSeconds: 293, pace: '4:53', paceInSeconds: 293, elevation: 5, heartRate: 170 },
      { km: 9, time: '4:55', timeInSeconds: 295, pace: '4:55', paceInSeconds: 295, elevation: 12, heartRate: 171 },
      { km: 10, time: '4:58', timeInSeconds: 298, pace: '4:58', paceInSeconds: 298, elevation: 2, heartRate: 172 }
    ]
  }
];

const defaultRacePlans: RacePlan[] = [
  {
    id: 'plan1',
    raceName: '上海国际马拉松',
    date: '2026-11-20',
    distance: 'full',
    distanceName: '全程马拉松',
    targetFinishTime: '3:45:00',
    targetFinishTimeSeconds: 13500,
    averagePace: '5:20',
    strategy: 'negative',
    strategyName: '负配速',
    createdAt: new Date().toISOString(),
    segments: [
      { name: '热身段', startKm: 0, endKm: 5, targetPace: '5:30', targetPaceSeconds: 330, notes: '保持轻松，不要快' },
      { name: '稳定段', startKm: 5, endKm: 20, targetPace: '5:22', targetPaceSeconds: 322, notes: '找到节奏' },
      { name: '半程点', startKm: 20, endKm: 25, targetPace: '5:20', targetPaceSeconds: 320, notes: '检查能量补给' },
      { name: '关键段', startKm: 25, endKm: 35, targetPace: '5:18', targetPaceSeconds: 318, notes: '心理临界点' },
      { name: '冲刺段', startKm: 35, endKm: 42.195, targetPace: '5:15', targetPaceSeconds: 315, notes: '保持专注到终点' }
    ],
    aidStations: [
      { km: 5, water: true, gel: false, electrolytes: false, notes: '补水点' },
      { km: 10, water: true, gel: true, electrolytes: true, notes: '第一个能量胶' },
      { km: 15, water: true, gel: false, electrolytes: false, notes: '补水' },
      { km: 20, water: true, gel: true, electrolytes: true, notes: '第二个能量胶' },
      { km: 25, water: true, gel: false, electrolytes: false, notes: '补水' },
      { km: 30, water: true, gel: true, electrolytes: true, notes: '第三个能量胶' },
      { km: 35, water: true, gel: false, electrolytes: false, notes: '补水' },
      { km: 40, water: true, gel: true, electrolytes: true, notes: '最后冲刺能量' }
    ],
    emergencyPlan: '如果感觉状态不佳，每公里降速10秒；如果出现胸痛或呼吸困难，立即停止比赛寻求医疗帮助。'
  }
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      userProfile: defaultUserProfile,
      trainingRecords: defaultTrainingRecords,
      raceReviews: defaultRaceReviews,
      racePlans: defaultRacePlans,
      
      updateUserProfile: (profile) => 
        set((state) => ({
          userProfile: { ...state.userProfile, ...profile }
        })),
      
      addTrainingRecord: (record) =>
        set((state) => ({
          trainingRecords: [record, ...(state.trainingRecords || [])]
        })),
      
      updateTrainingRecord: (id, record) =>
        set((state) => ({
          trainingRecords: (state.trainingRecords || []).map(r =>
            r.id === id ? { ...r, ...record } : r
          )
        })),
      
      deleteTrainingRecord: (id) =>
        set((state) => ({
          trainingRecords: (state.trainingRecords || []).filter(r => r.id !== id)
        })),
      
      addRaceReview: (review) =>
        set((state) => ({
          raceReviews: [review, ...(state.raceReviews || [])]
        })),
      
      updateRaceReview: (id, review) =>
        set((state) => ({
          raceReviews: (state.raceReviews || []).map(r =>
            r.id === id ? { ...r, ...review } : r
          )
        })),
      
      deleteRaceReview: (id) =>
        set((state) => ({
          raceReviews: (state.raceReviews || []).filter(r => r.id !== id)
        })),
      
      addRacePlan: (plan) =>
        set((state) => ({
          racePlans: [plan, ...(state.racePlans || [])]
        })),
      
      updateRacePlan: (id, plan) =>
        set((state) => ({
          racePlans: (state.racePlans || []).map(p =>
            p.id === id ? { ...p, ...plan } : p
          )
        })),
      
      deleteRacePlan: (id) =>
        set((state) => ({
          racePlans: (state.racePlans || []).filter(p => p.id !== id)
        }))
    }),
    {
      name: 'running-app-storage-v2',
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        if (version < 2) {
          return {
            userProfile: defaultUserProfile,
            trainingRecords: defaultTrainingRecords,
            raceReviews: defaultRaceReviews,
            racePlans: defaultRacePlans
          };
        }
        return persistedState as Partial<AppState>;
      },
      partialize: (state) => ({
        userProfile: state.userProfile,
        trainingRecords: state.trainingRecords,
        raceReviews: state.raceReviews,
        racePlans: state.racePlans
      })
    }
  )
);
