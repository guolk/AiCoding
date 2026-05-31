// 项目
export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  currentVersion: string;
}

// 剧本基础信息
export interface ScriptInfo {
  title: string;
  background: string;
  era: string;
  scenes: string[];
  playerCount: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  duration: number;
  description: string;
}

// 角色
export interface Character {
  id: string;
  name: string;
  identity: string;
  personality: string;
  motivation: string;
  secrets: string;
  relationships: CharacterRelationship[];
  avatar?: string;
}

// 角色关系
export interface CharacterRelationship {
  targetId: string;
  relationshipType: string;
  description: string;
}

// 时间线节点
export interface TimelineNode {
  id: string;
  time: string;
  title: string;
  description: string;
  characterIds: string[];
  location?: string;
}

// 线索
export interface Clue {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'hidden' | 'evidence';
  round: number;
  location?: string;
  relatedTruthIds: string[];
  relatedCharacterIds: string[];
  imageUrl?: string;
}

// 真相节点
export interface TruthNode {
  id: string;
  title: string;
  description: string;
  importance: number;
}

// 试玩记录
export interface PlaytestRecord {
  id: string;
  date: string;
  players: PlayerInfo[];
  duration: number;
  finalConclusion: string;
  correctRate: number;
  notes: string;
}

// 玩家信息
export interface PlayerInfo {
  name: string;
  characterId: string;
  role: string;
}

// 玩家反馈
export interface PlayerFeedback {
  id: string;
  playtestId: string;
  category: 'clue_obvious' | 'clue_obscure' | 'character_boring' | 'timeline_confusing' | 'other';
  content: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: string;
}

// 版本历史
export interface Version {
  id: string;
  versionNumber: string;
  timestamp: string;
  changes: string;
  dataSnapshot: ProjectDataSnapshot;
}

// DM手册
export interface DMHandbook {
  introduction: string;
  preparationGuide: string;
  flowGuide: string[];
  tips: string[];
  emergencyGuide: string;
}

// FAQ
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// 真相揭晓
export interface TruthReveal {
  summary: string;
  fullStory: string;
  characterTruths: CharacterTruth[];
  keyClues: string[];
  timeline: TimelineNode[];
}

// 角色真相
export interface CharacterTruth {
  characterId: string;
  trueIdentity?: string;
  realMotivation: string;
  keyActions: string[];
  secretRevealed: string;
}

// 完整项目数据快照
export interface ProjectDataSnapshot {
  scriptInfo: ScriptInfo;
  characters: Character[];
  timeline: TimelineNode[];
  clues: Clue[];
  truthNodes: TruthNode[];
  playtestRecords: PlaytestRecord[];
  feedbacks: PlayerFeedback[];
  versions: Version[];
  dmHandbook: DMHandbook;
  faqs: FAQ[];
  truthReveal: TruthReveal;
}

// 完整项目数据
export interface ProjectData extends Project {
  data: ProjectDataSnapshot;
}

// 难度映射
export const DIFFICULTY_MAP = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
  expert: '专家'
} as const;

// 线索类型映射
export const CLUE_TYPE_MAP = {
  public: '公开线索',
  hidden: '隐藏线索',
  evidence: '证据物件'
} as const;

// 反馈分类映射
export const FEEDBACK_CATEGORY_MAP = {
  clue_obvious: '线索太明显',
  clue_obscure: '线索太隐晦',
  character_boring: '角色不够有趣',
  timeline_confusing: '时间线混乱',
  other: '其他'
} as const;

// 严重程度映射
export const SEVERITY_MAP = {
  low: '低',
  medium: '中',
  high: '高'
} as const;

// 难度颜色
export const DIFFICULTY_COLORS = {
  easy: 'success',
  medium: 'warning',
  hard: 'danger',
  expert: 'primary'
} as const;

// 线索类型颜色
export const CLUE_TYPE_COLORS = {
  public: 'gold',
  hidden: 'primary',
  evidence: 'success'
} as const;
