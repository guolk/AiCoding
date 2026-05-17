import { addDays, parseISO, format } from 'date-fns';
import { TrainingPlan, TrainingDay, RaceGoal, UserProfile, RunType } from '../types';
import { generateId, getTrainingPace, calculatePace } from './helpers';

interface GeneratePlanOptions {
  raceGoal: RaceGoal;
  userProfile: UserProfile;
  totalWeeks: number;
}

const weeklyScheduleTemplate: { day: number; type: RunType; baseDistance: number }[][] = [
  [
    { day: 1, type: 'easy', baseDistance: 0.15 },
    { day: 2, type: 'rest', baseDistance: 0 },
    { day: 3, type: 'easy', baseDistance: 0.15 },
    { day: 4, type: 'interval', baseDistance: 0.2 },
    { day: 5, type: 'rest', baseDistance: 0 },
    { day: 6, type: 'easy', baseDistance: 0.15 },
    { day: 7, type: 'long', baseDistance: 0.35 }
  ]
];

export const generateTrainingPlan = (options: GeneratePlanOptions): TrainingPlan => {
  const { raceGoal, userProfile, totalWeeks } = options;
  const raceDate = parseISO(raceGoal.raceDate);
  const startDate = addDays(raceDate, -(totalWeeks * 7 - 1));
  
  const racePace = calculatePace(raceGoal.distance, raceGoal.targetTime);
  const targetWeeklyMileage = calculateTargetWeeklyMileage(userProfile, raceGoal, totalWeeks);
  
  const days: TrainingDay[] = [];
  
  for (let week = 1; week <= totalWeeks; week++) {
    const weekMultiplier = getWeekMultiplier(week, totalWeeks);
    const weeklyMileage = userProfile.currentWeeklyMileage + 
      (targetWeeklyMileage - userProfile.currentWeeklyMileage) * weekMultiplier;
    
    const weekDays = generateWeekSchedule(week, weeklyMileage, racePace, format(startDate, 'yyyy-MM-dd'));
    days.push(...weekDays);
  }
  
  const lastWeek = days.filter(d => d.weekNumber === totalWeeks);
  lastWeek.forEach(day => {
    if (day.dayOfWeek === 7) {
      day.type = 'race';
      day.distance = raceGoal.distance;
      day.description = `比赛日！目标完成 ${raceGoal.distance}公里，配速 ${Math.floor(racePace)}'${Math.round((racePace - Math.floor(racePace)) * 60)}"`;
    } else {
      day.type = 'rest';
      day.distance = 0;
      day.description = '赛前休息';
    }
  });
  
  return {
    id: generateId(),
    raceGoalId: raceGoal.id,
    startDate: format(startDate, 'yyyy-MM-dd'),
    totalWeeks,
    currentWeeklyMileage: userProfile.currentWeeklyMileage,
    days,
    createdAt: new Date().toISOString()
  };
};

const calculateTargetWeeklyMileage = (
  userProfile: UserProfile,
  raceGoal: RaceGoal,
  totalWeeks: number
): number => {
  const baseWeekly = raceGoal.distance * 1.5;
  
  const levelMultiplier = {
    beginner: 0.8,
    intermediate: 1.0,
    advanced: 1.2
  };
  
  return Math.min(
    baseWeekly * levelMultiplier[userProfile.experienceLevel],
    userProfile.currentWeeklyMileage * 2
  );
};

const getWeekMultiplier = (week: number, totalWeeks: number): number => {
  const taperWeeks = 2;
  const peakWeek = totalWeeks - taperWeeks;
  
  if (week <= peakWeek) {
    return (week - 1) / (peakWeek - 1);
  } else {
    const taperProgress = (week - peakWeek) / taperWeeks;
    return 1 - 0.5 * taperProgress;
  }
};

const generateWeekSchedule = (
  weekNumber: number,
  weeklyMileage: number,
  racePace: number,
  planStartDate: string
): TrainingDay[] => {
  const days: TrainingDay[] = [];
  const template = weeklyScheduleTemplate[0];
  
  template.forEach((item, index) => {
    const date = addDays(parseISO(planStartDate), (weekNumber - 1) * 7 + index);
    const distance = Math.round(weeklyMileage * item.baseDistance * 10) / 10;
    const trainingPace = getTrainingPace(racePace, item.type);
    const duration = item.type !== 'rest' ? Math.round(trainingPace * distance * 60) : undefined;
    
    days.push({
      id: generateId(),
      weekNumber,
      dayOfWeek: item.day,
      date: format(date, 'yyyy-MM-dd'),
      type: item.type,
      distance,
      duration,
      description: generateDescription(item.type, distance, trainingPace),
      completed: false
    });
  });
  
  return days;
};

const generateDescription = (type: RunType, distance: number, pace: number): string => {
  const paceMin = Math.floor(pace);
  const paceSec = Math.round((pace - paceMin) * 60);
  const paceStr = `${paceMin}'${paceSec}"`;
  
  switch (type) {
    case 'easy':
      return `轻松跑 ${distance}公里，配速 ${paceStr} 左右，保持可以交谈的节奏`;
    case 'tempo':
      return `节奏跑 ${distance}公里，配速 ${paceStr}，保持乳酸阈值强度`;
    case 'interval':
      return `间歇训练：${Math.ceil(distance / 0.4)}组 x 400米，配速 ${paceStr}，组间休息2分钟`;
    case 'long':
      return `长距离慢跑 ${distance}公里，配速 ${paceStr}，注意补水和能量补充`;
    case 'race':
      return `比赛配速跑 ${distance}公里，配速 ${paceStr}`;
    case 'rest':
      return '休息日：可以进行拉伸、瑜伽或完全休息';
    default:
      return '';
  }
};

export const adjustTrainingPlan = (
  plan: TrainingPlan,
  adjustedDayId: string,
  newType: RunType,
  newDistance: number
): TrainingPlan => {
  const dayIndex = plan.days.findIndex(d => d.id === adjustedDayId);
  if (dayIndex === -1) return plan;
  
  const adjustedDay = plan.days[dayIndex];
  const distanceDiff = newDistance - adjustedDay.distance;
  
  const newDays = [...plan.days];
  newDays[dayIndex] = {
    ...adjustedDay,
    type: newType,
    distance: newDistance,
    notes: `已调整：原${adjustedDay.distance}km ${getRunTypeLabel(adjustedDay.type)} → ${newDistance}km ${getRunTypeLabel(newType)}`
  };
  
  if (Math.abs(distanceDiff) > 1) {
    redistributeDistance(newDays, dayIndex, distanceDiff);
  }
  
  return {
    ...plan,
    days: newDays
  };
};

const redistributeDistance = (
  days: TrainingDay[],
  adjustedIndex: number,
  distanceDiff: number
): void => {
  const adjustedWeek = days[adjustedIndex].weekNumber;
  const weekDays = days.filter(d => d.weekNumber === adjustedWeek && d.id !== days[adjustedIndex].id);
  const adjustableDays = weekDays.filter(d => d.type === 'easy' || d.type === 'long');
  
  if (adjustableDays.length === 0) return;
  
  const perDayAdjustment = distanceDiff / adjustableDays.length;
  adjustableDays.forEach(day => {
    const index = days.findIndex(d => d.id === day.id);
    days[index] = {
      ...day,
      distance: Math.max(0, Math.round((day.distance - perDayAdjustment) * 10) / 10)
    };
  });
};

export const generateTaperPlan = (
  raceGoal: RaceGoal,
  currentWeeklyMileage: number
): TrainingDay[] => {
  const raceDate = parseISO(raceGoal.raceDate);
  const days: TrainingDay[] = [];
  const racePace = calculatePace(raceGoal.distance, raceGoal.targetTime);
  
  for (let i = 13; i >= 0; i--) {
    const date = addDays(raceDate, -i);
    const dayOfWeek = date.getDay() || 7;
    const weekNumber = i > 7 ? 1 : 2;
    
    let type: RunType = 'easy';
    let distance = 0;
    let description = '';
    
    if (i === 0) {
      type = 'race';
      distance = raceGoal.distance;
      description = '比赛日！按照配速策略完成比赛';
    } else if (i === 1) {
      type = 'rest';
      description = '赛前一天：完全休息，做好赛前准备';
    } else if (i === 2) {
      type = 'easy';
      distance = 3;
      description = '赛前慢跑3公里，活动筋骨';
    } else if (weekNumber === 2) {
      if (dayOfWeek === 7) {
        type = 'long';
        distance = Math.round(currentWeeklyMileage * 0.5);
        description = `减量周长距离 ${distance}公里`;
      } else if (dayOfWeek === 3 || dayOfWeek === 4) {
        type = 'tempo';
        distance = 6;
        description = '节奏跑保持状态';
      } else {
        type = 'easy';
        distance = 5;
        description = '轻松跑恢复';
      }
    } else {
      if (dayOfWeek === 7) {
        type = 'long';
        distance = Math.round(currentWeeklyMileage * 0.3);
        description = `最后长距离 ${distance}公里`;
      } else if (dayOfWeek === 4) {
        type = 'interval';
        distance = 4;
        description = '轻量间歇保持速度感';
      } else {
        type = 'easy';
        distance = 4;
        description = '轻松跑';
      }
    }
    
    days.push({
      id: generateId(),
      weekNumber,
      dayOfWeek,
      date: format(date, 'yyyy-MM-dd'),
      type,
      distance,
      description,
      completed: false
    });
  }
  
  return days;
};

const getRunTypeLabel = (type: RunType): string => {
  const labels: Record<RunType, string> = {
    easy: '轻松跑',
    tempo: '节奏跑',
    interval: '间歇训练',
    long: '长距离慢跑',
    race: '比赛',
    rest: '休息'
  };
  return labels[type];
};
