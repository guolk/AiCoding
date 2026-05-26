export interface MoodDimensions {
  pleasure: number;
  energy: number;
  anxiety: number;
  stress: number;
}

export type EmotionTag = 
  | '期待' 
  | '感激' 
  | '烦躁' 
  | '沮丧' 
  | '平静' 
  | '开心' 
  | '焦虑' 
  | '愤怒' 
  | '悲伤' 
  | '兴奋'
  | '疲惫'
  | '满足';

export type TriggerFactor = '工作' | '人际' | '健康' | '财务' | '未知';

export type SleepQuality = '很差' | '较差' | '一般' | '较好' | '很好';

export interface MoodRecord {
  id: string;
  timestamp: number;
  dimensions: MoodDimensions;
  emotions: EmotionTag[];
  triggers: TriggerFactor[];
  note?: string;
  sleepQuality?: SleepQuality;
}

export interface JournalEntry {
  id: string;
  moodRecordId?: string;
  timestamp: number;
  content: string;
  guidedPrompt?: string;
}

export interface CBTSession {
  id: string;
  timestamp: number;
  automaticThought: string;
  evidence: string;
  alternativeThought: string;
  outcome: string;
}

export interface StrategyEffect {
  id: string;
  timestamp: number;
  strategy: string;
  beforeMood: number;
  afterMood: number;
  effectiveness: number;
}

export interface AppState {
  moodRecords: MoodRecord[];
  journals: JournalEntry[];
  cbtSessions: CBTSession[];
  strategies: StrategyEffect[];
}
