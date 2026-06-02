import type { ConstitutionType } from "./questionnaire";

export interface QuestionnaireRecord {
  id: number;
  date: string;
  scores: Record<ConstitutionType, number>;
  result: ConstitutionType;
  note?: string;
}

export interface DailyRecord {
  id: number;
  date: string;
  diet: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks?: string;
  };
  sleep: {
    bedtime: string;
    wakeup: string;
    quality: 1 | 2 | 3 | 4 | 5;
    duration: number;
  };
  energy: 1 | 2 | 3 | 4 | 5;
  mood: string;
  waterIntake: number;
  exercise?: string;
  note?: string;
}

export interface MedicationRecord {
  id: number;
  name: string;
  type: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  reason: string;
  note?: string;
}

export interface SymptomRecord {
  id: number;
  date: string;
  name: string;
  location?: string;
  severity: 1 | 2 | 3 | 4 | 5;
  duration: string;
  description?: string;
  note?: string;
}

export const QUESTIONNAIRE_RECORDS: QuestionnaireRecord[] = [
  {
    id: 1,
    date: "2026-05-15",
    scores: {
      "平和质": 28,
      "气虚质": 18,
      "阳虚质": 12,
      "阴虚质": 15,
      "痰湿质": 20,
      "湿热质": 16,
      "血瘀质": 14,
      "气郁质": 22,
      "特禀质": 10,
    },
    result: "气郁质",
    note: "近期工作压力大，情绪波动明显",
  },
  {
    id: 2,
    date: "2026-04-10",
    scores: {
      "平和质": 30,
      "气虚质": 24,
      "阳虚质": 15,
      "阴虚质": 18,
      "痰湿质": 16,
      "湿热质": 14,
      "血瘀质": 12,
      "气郁质": 18,
      "特禀质": 12,
    },
    result: "气虚质",
    note: "换季期间容易感冒，精力不足",
  },
  {
    id: 3,
    date: "2026-03-05",
    scores: {
      "平和质": 32,
      "气虚质": 16,
      "阳虚质": 10,
      "阴虚质": 22,
      "痰湿质": 14,
      "湿热质": 18,
      "血瘀质": 12,
      "气郁质": 16,
      "特禀质": 10,
    },
    result: "阴虚质",
    note: "春季干燥，常感口干舌燥",
  },
];

export const DAILY_RECORDS: DailyRecord[] = [
  {
    id: 1,
    date: "2026-06-01",
    diet: {
      breakfast: "小米粥、包子、鸡蛋",
      lunch: "米饭、炒青菜、清蒸鱼",
      dinner: "面条、凉拌黄瓜",
      snacks: "苹果、核桃",
    },
    sleep: {
      bedtime: "23:00",
      wakeup: "07:00",
      quality: 4,
      duration: 8,
    },
    energy: 4,
    mood: "愉快",
    waterIntake: 1800,
    exercise: "散步30分钟",
    note: "今天精神状态不错",
  },
  {
    id: 2,
    date: "2026-05-31",
    diet: {
      breakfast: "豆浆、油条",
      lunch: "米饭、红烧肉、炒豆角",
      dinner: "粥、馒头、炒土豆丝",
      snacks: "香蕉",
    },
    sleep: {
      bedtime: "23:30",
      wakeup: "07:00",
      quality: 3,
      duration: 7.5,
    },
    energy: 3,
    mood: "一般",
    waterIntake: 1500,
    exercise: "未运动",
    note: "下午有些犯困",
  },
  {
    id: 3,
    date: "2026-05-30",
    diet: {
      breakfast: "燕麦粥、煮鸡蛋",
      lunch: "米饭、番茄炒蛋、西兰花",
      dinner: "馄饨、凉拌木耳",
      snacks: "酸奶、杏仁",
    },
    sleep: {
      bedtime: "22:30",
      wakeup: "06:30",
      quality: 5,
      duration: 8,
    },
    energy: 5,
    mood: "愉悦",
    waterIntake: 2000,
    exercise: "跑步40分钟",
    note: "早起运动后一整天都很有精神",
  },
  {
    id: 4,
    date: "2026-05-29",
    diet: {
      breakfast: "面包、牛奶",
      lunch: "外卖快餐、炸鸡",
      dinner: "火锅",
      snacks: "薯片、可乐",
    },
    sleep: {
      bedtime: "00:30",
      wakeup: "08:00",
      quality: 2,
      duration: 7.5,
    },
    energy: 2,
    mood: "疲惫",
    waterIntake: 1000,
    exercise: "未运动",
    note: "昨晚吃火锅后肠胃不适，睡眠不好",
  },
  {
    id: 5,
    date: "2026-05-28",
    diet: {
      breakfast: "粥、咸菜、包子",
      lunch: "米饭、宫保鸡丁、炒菠菜",
      dinner: "水饺",
      snacks: "橙子",
    },
    sleep: {
      bedtime: "23:00",
      wakeup: "07:00",
      quality: 4,
      duration: 8,
    },
    energy: 4,
    mood: "平静",
    waterIntake: 1600,
    exercise: "太极拳20分钟",
    note: "练习太极后感觉身心放松",
  },
  {
    id: 6,
    date: "2026-05-27",
    diet: {
      breakfast: "鸡蛋饼、豆浆",
      lunch: "米饭、鱼香肉丝、凉拌海带",
      dinner: "面条、炒白菜",
      snacks: "猕猴桃",
    },
    sleep: {
      bedtime: "22:45",
      wakeup: "06:45",
      quality: 4,
      duration: 8,
    },
    energy: 4,
    mood: "舒畅",
    waterIntake: 1700,
    exercise: "游泳1小时",
    note: "今天工作效率很高",
  },
  {
    id: 7,
    date: "2026-05-26",
    diet: {
      breakfast: "小米粥、馒头、煮蛋",
      lunch: "米饭、炖排骨、炒油麦菜",
      dinner: "粥、包子、凉拌黄瓜",
      snacks: "红枣、枸杞茶",
    },
    sleep: {
      bedtime: "23:15",
      wakeup: "07:15",
      quality: 3,
      duration: 8,
    },
    energy: 3,
    mood: "有些烦躁",
    waterIntake: 1400,
    exercise: "散步20分钟",
    note: "下午开会有些紧张，喝了些枸杞茶舒缓",
  },
];

export const MEDICATION_RECORDS: MedicationRecord[] = [
  {
    id: 1,
    name: "感冒清热颗粒",
    type: "中成药",
    dosage: "1袋/次",
    frequency: "每日3次",
    startDate: "2026-05-25",
    endDate: "2026-05-28",
    reason: "风寒感冒，头痛鼻塞",
    note: "服用后症状明显缓解",
  },
  {
    id: 2,
    name: "复合维生素B",
    type: "保健品",
    dosage: "1片/次",
    frequency: "每日1次",
    startDate: "2026-04-01",
    reason: "补充维生素，改善皮肤状况",
    note: "早餐后服用",
  },
];

export const SYMPTOM_RECORDS: SymptomRecord[] = [
  {
    id: 1,
    date: "2026-05-29",
    name: "胃痛",
    location: "上腹部",
    severity: 3,
    duration: "2小时",
    description: "食用辛辣食物后出现胃部灼热感，伴有轻微恶心",
    note: "服用胃药后缓解，近期注意饮食清淡",
  },
  {
    id: 2,
    date: "2026-05-27",
    name: "失眠",
    severity: 2,
    duration: "1周",
    description: "入睡困难，夜间易醒，多梦",
    note: "可能与工作压力有关，尝试睡前泡脚放松",
  },
  {
    id: 3,
    date: "2026-05-24",
    name: "头痛",
    location: "右侧太阳穴",
    severity: 3,
    duration: "半天",
    description: "搏动性疼痛，伴有轻微头晕",
    note: "休息后缓解，可能与睡眠不足有关",
  },
];

export interface MockData {
  questionnaireRecords: QuestionnaireRecord[];
  dailyRecords: DailyRecord[];
  medicationRecords: MedicationRecord[];
  symptomRecords: SymptomRecord[];
}

export const MOCK_RECORDS: MockData = {
  questionnaireRecords: QUESTIONNAIRE_RECORDS,
  dailyRecords: DAILY_RECORDS,
  medicationRecords: MEDICATION_RECORDS,
  symptomRecords: SYMPTOM_RECORDS,
};
