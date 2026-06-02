export interface ConstitutionScores {
  pinghe: number;
  qixu: number;
  yangxu: number;
  yinxu: number;
  tanshi: number;
  shire: number;
  xueyu: number;
  qiyu: number;
  tebing: number;
}

export interface ConstitutionResult {
  id: string;
  date: string;
  scores: ConstitutionScores;
  mainType: string;
  subTypes: string[];
  notes: string;
}

export interface DietRecord {
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
  compliance: number;
}

export interface SleepRecord {
  quality: number;
  duration: number;
  bedtime: string;
  wakeTime: string;
}

export interface EnergyRecord {
  morning: number;
  afternoon: number;
  evening: number;
}

export interface Symptom {
  id: string;
  name: string;
  date: string;
  severity: number;
  location: string;
  relatedConstitution: string;
  notes: string;
}

export interface DailyRecord {
  id: string;
  date: string;
  diet: DietRecord;
  sleep: SleepRecord;
  energy: EnergyRecord;
  symptoms: Symptom[];
}

export interface Medicine {
  id: string;
  name: string;
  type: string;
  dosage: string;
  startDate: string;
  endDate: string;
  effect: string;
  notes: string;
  isActive: boolean;
}

export interface FoodItem {
  id: string;
  name: string;
  nature: string;
  flavor: string;
  meridian: string;
  effects: string;
  usage: string;
  isFavorite: boolean;
}

export interface Acupoint {
  id: string;
  name: string;
  pinyin: string;
  location: string;
  method: string;
  indications: string;
  constitutionTypes: string[];
}

export interface SeasonalAdvice {
  spring: string[];
  summer: string[];
  autumn: string[];
  winter: string[];
}

export interface HealthAdvice {
  constitution: string;
  diet: string[];
  lifestyle: string[];
  exercise: string[];
  emotion: string[];
  acupoints: string[];
  seasonal: SeasonalAdvice;
}

export interface KnowledgeCategory {
  id: string;
  name: string;
  icon: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  categoryId: string;
  content: string;
  isFavorite: boolean;
  readProgress?: number;
}
