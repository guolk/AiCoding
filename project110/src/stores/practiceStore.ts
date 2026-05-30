import { create } from 'zustand';
import { 
  PracticeRecord, 
  PoseProgress, 
  FlexibilityTest, 
  WellnessAssessment,
  MasteryLevel,
  PracticeStatistics,
  FlexibilityMeasurement
} from '@/types';
import { getLocalStorage, setLocalStorage, STORAGE_KEYS } from '@/utils/storage';
import { generateId, getToday, calculateStreak, calculateLongestStreak } from '@/utils';

interface PracticeStore {
  records: PracticeRecord[];
  poseProgress: Record<string, PoseProgress>;
  flexibilityTests: FlexibilityTest[];
  assessments: WellnessAssessment[];
  
  loadData: () => void;
  
  addRecord: (record: Omit<PracticeRecord, 'id' | 'createdAt'>) => void;
  getRecords: () => PracticeRecord[];
  getRecentRecords: (limit?: number) => PracticeRecord[];
  
  updatePoseProgress: (poseId: string, updates: Partial<PoseProgress>) => void;
  getPoseProgress: (poseId: string) => PoseProgress;
  incrementPosePractice: (poseId: string) => void;
  setMasteryLevel: (poseId: string, level: MasteryLevel) => void;
  
  addFlexibilityTest: (measurements: FlexibilityMeasurement, notes?: string) => void;
  getFlexibilityTrend: () => FlexibilityTest[];
  
  addAssessment: (type: 'post-practice' | 'daily', ratings: WellnessAssessment['ratings'], notes?: string) => void;
  getAssessmentTrend: () => WellnessAssessment[];
  
  getStatistics: () => PracticeStatistics;
}

const defaultPoseProgress: PoseProgress = {
  poseId: '',
  masteryLevel: 'first-contact',
  practiceCount: 0,
};

export const usePracticeStore = create<PracticeStore>((set, get) => ({
  records: [],
  poseProgress: {},
  flexibilityTests: [],
  assessments: [],
  
  loadData: () => {
    const records = getLocalStorage<PracticeRecord[]>(STORAGE_KEYS.PRACTICE_RECORDS, []);
    const poseProgress = getLocalStorage<Record<string, PoseProgress>>(STORAGE_KEYS.POSE_PROGRESS, {});
    const flexibilityTests = getLocalStorage<FlexibilityTest[]>(STORAGE_KEYS.FLEXIBILITY_TESTS, []);
    const assessments = getLocalStorage<WellnessAssessment[]>(STORAGE_KEYS.WELLNESS_ASSESSMENTS, []);
    
    set({ records, poseProgress, flexibilityTests, assessments });
  },
  
  addRecord: (recordData) => {
    const newRecord: PracticeRecord = {
      ...recordData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    const records = [...get().records, newRecord];
    setLocalStorage(STORAGE_KEYS.PRACTICE_RECORDS, records);
    set({ records });
    
    recordData.completedPoses.forEach(poseId => {
      get().incrementPosePractice(poseId);
    });
  },
  
  getRecords: () => {
    return [...get().records].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
  
  getRecentRecords: (limit = 10) => {
    return get().getRecords().slice(0, limit);
  },
  
  updatePoseProgress: (poseId, updates) => {
    const { poseProgress } = get();
    const current = poseProgress[poseId] || { ...defaultPoseProgress, poseId };
    const updated = { ...current, ...updates };
    
    const newPoseProgress = {
      ...poseProgress,
      [poseId]: updated
    };
    
    setLocalStorage(STORAGE_KEYS.POSE_PROGRESS, newPoseProgress);
    set({ poseProgress: newPoseProgress });
  },
  
  getPoseProgress: (poseId) => {
    return get().poseProgress[poseId] || { ...defaultPoseProgress, poseId };
  },
  
  incrementPosePractice: (poseId) => {
    const progress = get().getPoseProgress(poseId);
    const newCount = progress.practiceCount + 1;
    
    let newLevel: MasteryLevel = progress.masteryLevel;
    if (newCount >= 20 && progress.masteryLevel === 'improving') newLevel = 'stable';
    else if (newCount >= 10 && progress.masteryLevel === 'practicing') newLevel = 'improving';
    else if (newCount >= 5 && progress.masteryLevel === 'learning') newLevel = 'practicing';
    else if (newCount >= 2 && progress.masteryLevel === 'first-contact') newLevel = 'learning';
    
    get().updatePoseProgress(poseId, {
      practiceCount: newCount,
      masteryLevel: newLevel,
      lastPracticed: new Date().toISOString(),
    });
  },
  
  setMasteryLevel: (poseId, level) => {
    get().updatePoseProgress(poseId, { masteryLevel: level });
  },
  
  addFlexibilityTest: (measurements, notes) => {
    const values = Object.values(measurements);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    let overallRating: FlexibilityTest['overallRating'] = 'fair';
    if (avg >= 80) overallRating = 'excellent';
    else if (avg >= 60) overallRating = 'good';
    else if (avg >= 40) overallRating = 'fair';
    else overallRating = 'poor';
    
    const newTest: FlexibilityTest = {
      id: generateId(),
      date: getToday(),
      measurements,
      overallRating,
      notes,
    };
    
    const tests = [...get().flexibilityTests, newTest];
    setLocalStorage(STORAGE_KEYS.FLEXIBILITY_TESTS, tests);
    set({ flexibilityTests: tests });
  },
  
  getFlexibilityTrend: () => {
    return [...get().flexibilityTests].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },
  
  addAssessment: (type, ratings, notes) => {
    const newAssessment: WellnessAssessment = {
      id: generateId(),
      date: getToday(),
      type,
      ratings,
      notes,
    };
    
    const assessments = [...get().assessments, newAssessment];
    setLocalStorage(STORAGE_KEYS.WELLNESS_ASSESSMENTS, assessments);
    set({ assessments });
  },
  
  getAssessmentTrend: () => {
    return [...get().assessments].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },
  
  getStatistics: () => {
    const { records, poseProgress } = get();
    
    const totalPractices = records.length;
    const totalMinutes = records.reduce((sum, r) => sum + Math.floor(r.duration / 60), 0);
    
    const practiceDates = records.map(r => r.date);
    const currentStreak = calculateStreak(practiceDates);
    const longestStreak = calculateLongestStreak(practiceDates);
    
    const weeklyAverage = practiceDates.length > 0 
      ? practiceDates.length / Math.ceil((
          new Date().getTime() - new Date(practiceDates[practiceDates.length - 1]).getTime()
        ) / (7 * 24 * 60 * 60 * 1000)) 
      : 0;
    
    const sequenceCounts: Record<string, number> = {};
    records.forEach(r => {
      sequenceCounts[r.sequenceName] = (sequenceCounts[r.sequenceName] || 0) + 1;
    });
    const favoriteSequence = Object.entries(sequenceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    
    const poseCounts: Record<string, number> = {};
    Object.values(poseProgress).forEach(p => {
      poseCounts[p.poseId] = p.practiceCount;
    });
    const mostPracticedPose = Object.entries(poseCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    
    const progressByLevel = {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
    };
    
    const levelOrder: MasteryLevel[] = ['first-contact', 'learning', 'practicing', 'improving', 'stable'];
    Object.values(poseProgress).forEach(p => {
      const index = levelOrder.indexOf(p.masteryLevel);
      if (index < 2) progressByLevel.beginner++;
      else if (index < 4) progressByLevel.intermediate++;
      else progressByLevel.advanced++;
    });
    
    return {
      totalPractices,
      totalMinutes,
      currentStreak,
      longestStreak,
      weeklyAverage,
      favoriteSequence,
      mostPracticedPose,
      progressByLevel,
    };
  },
}));
