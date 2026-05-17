import { addDays, subDays, format, parseISO } from 'date-fns';
import {
  RaceGoal,
  TrainingPlan,
  TrainingDay,
  RunRecord,
  InjuryRecord,
  UserProfile,
  RunType
} from '../types';
import { generateId, calculatePace } from './helpers';

export const generateTestData = () => {
  const today = new Date();
  
  const userProfile: UserProfile = {
    name: '测试跑者',
    currentWeeklyMileage: 30,
    experienceLevel: 'intermediate',
    birthDate: '1990-01-15',
    gender: 'male',
    height: 175,
    weight: 68,
    maxHeartRate: 188,
    restingHeartRate: 58
  };
  
  const raceDate = addDays(today, 84);
  
  const raceGoal: RaceGoal = {
    id: generateId(),
    name: '北京马拉松',
    raceDate: format(raceDate, 'yyyy-MM-dd'),
    targetTime: 240,
    distance: 42.195,
    createdAt: new Date().toISOString()
  };
  
  const trainingPlan = generateTrainingPlan(raceGoal, userProfile);
  const runRecords = generateRunRecords();
  const injuries = generateInjuries();
  
  return {
    userProfile,
    raceGoal,
    trainingPlan,
    runRecords,
    injuries
  };
};

const generateTrainingPlan = (raceGoal: RaceGoal, userProfile: UserProfile): TrainingPlan => {
  const totalWeeks = 12;
  const raceDate = parseISO(raceGoal.raceDate);
  const startDate = addDays(raceDate, -(totalWeeks * 7 - 1));
  
  const days: TrainingDay[] = [];
  const runTypes: RunType[] = ['easy', 'tempo', 'interval', 'long', 'easy', 'rest'];
  const baseMileage = userProfile.currentWeeklyMileage;
  
  for (let week = 1; week <= totalWeeks; week++) {
    const weekMultiplier = 1 + (week / totalWeeks) * 0.5;
    const weeklyMileage = baseMileage * weekMultiplier;
    
    for (let day = 0; day < 7; day++) {
      const date = addDays(startDate, (week - 1) * 7 + day);
      const runType = runTypes[day % runTypes.length];
      let distance = 0;
      
      if (runType === 'long') {
        distance = Math.round(weeklyMileage * 0.35 * 10) / 10;
      } else if (runType === 'interval') {
        distance = Math.round(weeklyMileage * 0.2 * 10) / 10;
      } else if (runType === 'tempo') {
        distance = Math.round(weeklyMileage * 0.15 * 10) / 10;
      } else if (runType === 'easy') {
        distance = Math.round(weeklyMileage * 0.15 * 10) / 10;
      }
      
      days.push({
        id: generateId(),
        weekNumber: week,
        dayOfWeek: day + 1,
        date: format(date, 'yyyy-MM-dd'),
        type: runType,
        distance,
        duration: distance > 0 ? Math.round(distance * 5.5 * 60) : undefined,
        description: getTrainingDescription(runType, distance),
        completed: date < new Date() && Math.random() > 0.2
      });
    }
  }
  
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

const getTrainingDescription = (type: RunType, distance: number): string => {
  const descriptions: Record<RunType, string> = {
    easy: `轻松跑 ${distance}公里，保持呼吸平稳`,
    tempo: `节奏跑 ${distance}公里，保持乳酸阈值强度`,
    interval: `间歇训练 ${distance}公里，组间休息2分钟`,
    long: `长距离慢跑 ${distance}公里，注意补水`,
    race: `比赛配速跑 ${distance}公里`,
    rest: '休息日，可进行拉伸或瑜伽'
  };
  return descriptions[type];
};

const generateRunRecords = (): RunRecord[] => {
  const records: RunRecord[] = [];
  const today = new Date();
  
  const runTypes: { type: RunType; distanceRange: [number, number]; paceRange: [number, number] }[] = [
    { type: 'easy', distanceRange: [5, 10], paceRange: [5.2, 5.8] },
    { type: 'tempo', distanceRange: [8, 12], paceRange: [4.5, 4.9] },
    { type: 'interval', distanceRange: [6, 10], paceRange: [4.2, 4.6] },
    { type: 'long', distanceRange: [15, 25], paceRange: [5.4, 6.0] }
  ];
  
  for (let i = 0; i < 30; i++) {
    const runInfo = runTypes[Math.floor(Math.random() * runTypes.length)];
    const distance = Math.round((runInfo.distanceRange[0] + Math.random() * (runInfo.distanceRange[1] - runInfo.distanceRange[0])) * 10) / 10;
    const pace = runInfo.paceRange[0] + Math.random() * (runInfo.paceRange[1] - runInfo.paceRange[0]);
    const duration = Math.round(pace * distance * 60);
    const date = subDays(today, Math.floor(Math.random() * 90));
    
    const feelings = ['excellent', 'good', 'good', 'normal', 'tired'];
    const weathers = ['sunny', 'cloudy', 'sunny', 'cloudy', 'windy'];
    
    records.push({
      id: generateId(),
      date: format(date, 'yyyy-MM-dd'),
      distance,
      duration,
      pace: calculatePace(distance, duration),
      avgHeartRate: Math.round(130 + Math.random() * 40),
      maxHeartRate: Math.round(150 + Math.random() * 30),
      type: runInfo.type,
      feelings: feelings[Math.floor(Math.random() * feelings.length)],
      weather: weathers[Math.floor(Math.random() * weathers.length)],
      temperature: Math.round(15 + Math.random() * 15),
      notes: getRandomNote(runInfo.type),
      createdAt: new Date().toISOString()
    });
  }
  
  return records.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
};

const getRandomNote = (type: RunType): string => {
  const notes: Record<RunType, string[]> = {
    easy: [
      '今天状态不错，跑得很轻松',
      '最后一公里有点累',
      '天气很好，跑得很舒服',
      '配速稳定，呼吸平稳'
    ],
    tempo: [
      '节奏跑强度适中，感觉很好',
      '后程有点吃力但坚持下来了',
      '乳酸阈值训练，下次可以再快点',
      '状态不错，节奏保持得很好'
    ],
    interval: [
      '间歇训练完成！组间休息充分',
      '速度训练，最后一组差点放弃',
      '今天间歇跑得很顺利',
      '高强度训练，出了很多汗'
    ],
    long: [
      '长距离完成，补水及时',
      '30公里后有点撞墙感',
      '长距离慢跑，享受跑步的过程',
      '补给策略调整得不错'
    ],
    race: ['比赛日！', ''],
    rest: ['休息恢复', '']
  };
  
  const typeNotes = notes[type] || notes.easy;
  return typeNotes[Math.floor(Math.random() * typeNotes.length)];
};

const generateInjuries = (): InjuryRecord[] => {
  const today = new Date();
  
  return [
    {
      id: generateId(),
      startDate: format(subDays(today, 30), 'yyyy-MM-dd'),
      endDate: format(subDays(today, 10), 'yyyy-MM-dd'),
      type: '胫骨内侧应力综合征',
      severity: 'mild',
      description: '小腿内侧疼痛，尤其是跑步后加重，休息后缓解',
      recommendations: '减少跑量50%，避免硬地跑步，加强小腿肌肉力量训练，每次跑步后冰敷15分钟。每天进行小腿拉伸。',
      active: false
    },
    {
      id: generateId(),
      startDate: format(subDays(today, 7), 'yyyy-MM-dd'),
      type: '跑步膝（髌股关节疼痛综合征）',
      severity: 'mild',
      description: '膝盖前方轻微疼痛，下楼梯时明显',
      recommendations: '减少跑量，避免下坡跑，加强股四头肌力量训练（靠墙静蹲），检查跑鞋是否磨损严重。',
      active: true
    }
  ];
};
