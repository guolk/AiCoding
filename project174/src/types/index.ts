export type TagCategory = 'birdsong' | 'water' | 'wind' | 'insects' | 'urban' | 'other';
export type RecordingType = 'field' | 'ambient' | 'hydrophone' | 'contact' | 'binaural';
export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'foggy' | 'windy' | 'snowy' | 'clear';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type TimeOfDay = 'dawn' | 'morning' | 'afternoon' | 'dusk' | 'night' | 'midnight';

export interface Tag {
  id: string;
  name: string;
  category: TagCategory;
  color: string;
}

export interface GPSLocation {
  id: string;
  recordingId: string;
  latitude: number;
  longitude: number;
  altitude?: number;
}

export interface AudioMetadata {
  id: string;
  recordingId: string;
  duration: number;
  sampleRate: number;
  bitDepth: number;
  channels: number;
  fileFormat: string;
  fileSize: number;
  bitRate: number;
}

export interface QualityAssessment {
  id: string;
  recordingId: string;
  signalToNoise: number;
  hasUnwantedNoise: boolean;
  noiseType?: string;
  overallRating: number;
  notes?: string;
}

export interface Spectrogram {
  id: string;
  recordingId: string;
  imageData: string;
  frequencyMin: number;
  frequencyMax: number;
}

export interface Story {
  id: string;
  recordingId: string;
  content: string;
  mood: string;
  season: Season;
  timeOfDay: TimeOfDay;
}

export interface Recording {
  id: string;
  title: string;
  recordTime: Date;
  locationName: string;
  weather: WeatherType;
  equipment: string;
  recordingType: RecordingType;
  description: string;
  filePath: string;
  audioUrl?: string;
  tags: Tag[];
  gpsLocation?: GPSLocation;
  audioMetadata?: AudioMetadata;
  qualityAssessment?: QualityAssessment;
  spectrogram?: Spectrogram;
  story?: Story;
  createdAt: Date;
  updatedAt: Date;
}

export interface Collection {
  id: string;
  name: string;
  theme: string;
  mood: string;
  description: string;
  recordingIds: string[];
  coverImage?: string;
  createdAt: Date;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
  recordingCount: number;
  speciesCount: number;
}

export interface TimeDistribution {
  hour: number;
  count: number;
  recordings: string[];
}

export interface AppState {
  recordings: Recording[];
  collections: Collection[];
  tags: Tag[];
  currentRecording: Recording | null;
  isPlaying: boolean;
  currentTime: number;
  activeTab: string;
  mapCenter: [number, number];
  mapZoom: number;
}

export const TAG_CATEGORIES: Record<TagCategory, { label: string; icon: string; color: string }> = {
  birdsong: { label: '鸟鸣', icon: 'bird', color: '#22c55e' },
  water: { label: '水声', icon: 'waves', color: '#3b82f6' },
  wind: { label: '风声', icon: 'wind', color: '#60a5fa' },
  insects: { label: '虫鸣', icon: 'bug', color: '#eab308' },
  urban: { label: '城市声景', icon: 'building', color: '#6b7280' },
  other: { label: '其他', icon: 'music', color: '#8b5cf6' },
};

export const RECORDING_TYPES: Record<RecordingType, { label: string; description: string }> = {
  field: { label: '野外录音', description: '使用麦克风在自然环境中录制' },
  ambient: { label: '环境声', description: '捕捉环境氛围和背景声' },
  hydrophone: { label: '水听器', description: '水下声音录制' },
  contact: { label: '接触式', description: '通过固体传导录制的声音' },
  binaural: { label: '双耳录音', description: '模拟人耳听觉的立体录音' },
};

export const WEATHER_TYPES: Record<WeatherType, { label: string; icon: string }> = {
  sunny: { label: '晴朗', icon: 'sun' },
  cloudy: { label: '多云', icon: 'cloud' },
  rainy: { label: '雨天', icon: 'cloud-rain' },
  foggy: { label: '有雾', icon: 'cloud-fog' },
  windy: { label: '大风', icon: 'wind' },
  snowy: { label: '雪天', icon: 'snowflake' },
  clear: { label: '晴夜', icon: 'moon' },
};

export const SEASONS: Record<Season, { label: string; color: string }> = {
  spring: { label: '春季', color: '#86efac' },
  summer: { label: '夏季', color: '#fde047' },
  autumn: { label: '秋季', color: '#fdba74' },
  winter: { label: '冬季', color: '#93c5fd' },
};

export const TIMES_OF_DAY: Record<TimeOfDay, { label: string; range: string }> = {
  dawn: { label: '黎明', range: '04:00-06:00' },
  morning: { label: '上午', range: '06:00-12:00' },
  afternoon: { label: '下午', range: '12:00-17:00' },
  dusk: { label: '黄昏', range: '17:00-19:00' },
  night: { label: '夜晚', range: '19:00-22:00' },
  midnight: { label: '深夜', range: '22:00-04:00' },
};
