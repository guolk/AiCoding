import { Recording, WeatherType, RecordingType, Season, TimeOfDay } from '@/types';
import { defaultTags } from './tags';

const generateId = () => Math.random().toString(36).substr(2, 9);

const createMockRecording = (
  title: string,
  locationName: string,
  lat: number,
  lng: number,
  date: string,
  weather: WeatherType,
  recordingType: RecordingType,
  season: Season,
  timeOfDay: TimeOfDay,
  tagIds: string[],
  duration: number,
  snr: number,
  rating: number,
  hasNoise: boolean,
  storyContent: string,
  mood: string
): Recording => {
  const id = generateId();
  const tags = defaultTags.filter(t => tagIds.includes(t.id));
  
  return {
    id,
    title,
    recordTime: new Date(date),
    locationName,
    weather,
    equipment: 'Zoom H6 + Sennheiser MKH 416',
    recordingType,
    description: `${title}录音，在${locationName}录制。`,
    filePath: `/audio/${id}.wav`,
    audioUrl: `https://www.soundjay.com/nature/sounds/rain-01.mp3`,
    tags,
    gpsLocation: {
      id: generateId(),
      recordingId: id,
      latitude: lat,
      longitude: lng,
      altitude: Math.floor(Math.random() * 500) + 50,
    },
    audioMetadata: {
      id: generateId(),
      recordingId: id,
      duration,
      sampleRate: 48000,
      bitDepth: 24,
      channels: 2,
      fileFormat: 'WAV',
      fileSize: Math.floor(duration * 288),
      bitRate: 2304,
    },
    qualityAssessment: {
      id: generateId(),
      recordingId: id,
      signalToNoise: snr,
      hasUnwantedNoise: hasNoise,
      noiseType: hasNoise ? '远处交通声' : undefined,
      overallRating: rating,
      notes: hasNoise ? '注意背景中有微弱的交通噪音' : '录音质量优秀，无明显干扰',
    },
    spectrogram: {
      id: generateId(),
      recordingId: id,
      imageData: '',
      frequencyMin: 20,
      frequencyMax: 20000,
    },
    story: {
      id: generateId(),
      recordingId: id,
      content: storyContent,
      mood,
      season,
      timeOfDay,
    },
    createdAt: new Date(date),
    updatedAt: new Date(),
  };
};

export const mockRecordings: Recording[] = [
  createMockRecording(
    '黄山清晨鸟鸣',
    '安徽黄山',
    30.1200,
    118.1700,
    '2024-05-15T05:30:00',
    'sunny',
    'field',
    'spring',
    'dawn',
    ['t1', 't4', 't6'],
    180,
    42,
    5,
    false,
    '清晨5点半，黄山始信峰的树林里传来此起彼伏的鸟鸣。画眉鸟的歌声穿透薄雾，啄木鸟敲击树干的节奏仿佛是大自然的节拍器。这是我在黄山最美的听觉记忆之一。',
    '宁静'
  ),
  createMockRecording(
    '黄果树瀑布',
    '贵州安顺',
    25.9888,
    105.6770,
    '2024-07-20T14:00:00',
    'cloudy',
    'field',
    'summer',
    'afternoon',
    ['t8', 't13'],
    240,
    58,
    4,
    false,
    '站在黄果树瀑布前，巨大的水流量发出震撼的轰鸣声。水雾扑面而来，空气中弥漫着湿润的气息。这股自然的力量让人感到自己的渺小。',
    '震撼'
  ),
  createMockRecording(
    '杭州西湖雨声',
    '浙江杭州',
    30.2741,
    120.1551,
    '2024-03-10T09:15:00',
    'rainy',
    'ambient',
    'spring',
    'morning',
    ['t10', 't15'],
    300,
    35,
    4,
    false,
    '春雨中的西湖别有一番韵味。雨滴打在荷叶上的沙沙声，与远处传来的钟声交织在一起。撑着伞漫步在苏堤，时间仿佛都慢了下来。',
    '诗意'
  ),
  createMockRecording(
    '鼓浪屿海浪',
    '福建厦门',
    24.4456,
    118.0775,
    '2024-08-05T18:30:00',
    'sunny',
    'field',
    'summer',
    'dusk',
    ['t9', 't13'],
    210,
    48,
    5,
    false,
    '黄昏时分，鼓浪屿的沙滩上几乎没有游客。海浪有节奏地拍打着礁石，远处归航的渔船鸣响汽笛。夕阳把海面染成金色，这声音里满是温柔。',
    '浪漫'
  ),
  createMockRecording(
    '四川卧龙蝉鸣',
    '四川卧龙',
    30.9100,
    103.1500,
    '2024-06-25T13:00:00',
    'sunny',
    'field',
    'summer',
    'afternoon',
    ['t16', 't3'],
    150,
    45,
    4,
    false,
    '卧龙自然保护区的午后，蝉鸣声震耳欲聋。成千上万只蝉在树上齐声歌唱，这是属于盛夏的交响曲。偶尔传来的布谷鸟叫声为这单调的节奏增添了变化。',
    '热烈'
  ),
  createMockRecording(
    '北京香山秋风',
    '北京香山',
    39.9930,
    116.1890,
    '2024-10-28T10:00:00',
    'windy',
    'ambient',
    'autumn',
    'morning',
    ['t15', 't4'],
    180,
    38,
    4,
    false,
    '深秋的香山，满山红叶在风中摇曳。秋风穿过树林，发出哗哗的声响。偶尔有熟透的果实掉落，引来几只麻雀的叽叽喳喳。空气中满是秋天特有的清爽气息。',
    '清爽'
  ),
  createMockRecording(
    '长白山雪地',
    '吉林长白山',
    42.0170,
    128.0670,
    '2024-01-15T07:00:00',
    'snowy',
    'field',
    'winter',
    'dawn',
    ['t13'],
    120,
    32,
    5,
    false,
    '零下二十度的清晨，长白山的雪地有一种奇异的静谧。雪落下的声音几乎听不见，但偶尔的风吹过雪面，发出沙沙的声响。在这片白色的世界里，声音似乎都变得纯净了。',
    '纯净'
  ),
  createMockRecording(
    '上海外滩夜景',
    '上海外滩',
    31.2304,
    121.4737,
    '2024-09-10T21:00:00',
    'cloudy',
    'ambient',
    'autumn',
    'night',
    ['t19', 't20'],
    240,
    28,
    3,
    true,
    '外滩的夜晚永远不会安静。黄浦江上来往船只的汽笛声，观光游客的喧闹声，还有远处的钟声。这是属于城市的声音，喧嚣却充满活力。',
    '喧嚣'
  ),
  createMockRecording(
    '张家界溪流',
    '湖南张家界',
    29.1170,
    110.4790,
    '2024-04-22T11:30:00',
    'foggy',
    'hydrophone',
    'spring',
    'morning',
    ['t7', 't12', 't1'],
    200,
    52,
    5,
    false,
    '金鞭溪的水清澈见底，水流在鹅卵石间穿梭，发出叮咚的声响。雾气弥漫的山谷中，偶尔传来画眉鸟的歌声。这里的声音仿佛经过了大自然的过滤，格外纯净。',
    '空灵'
  ),
  createMockRecording(
    '内蒙古草原夜',
    '内蒙古呼伦贝尔',
    49.2000,
    119.7500,
    '2024-07-30T23:00:00',
    'clear',
    'field',
    'summer',
    'midnight',
    ['t17', 't18', 't24'],
    360,
    44,
    5,
    false,
    '草原的夏夜是属于虫鸣的。蟋蟀和各种不知名的昆虫组成了庞大的合唱团。远处传来牧民家狗的叫声，在广阔的草原上回荡。躺在草地上仰望星空，这声音让人沉醉。',
    '沉醉'
  ),
  createMockRecording(
    '泰山日出风声',
    '山东泰山',
    36.2520,
    117.1030,
    '2024-08-15T05:00:00',
    'windy',
    'binaural',
    'summer',
    'dawn',
    ['t14', 't4'],
    180,
    36,
    4,
    false,
    '在泰山之巅等待日出，山风呼啸，几乎要把人吹走。但当第一缕阳光穿透云层，几只麻雀开始歌唱，那一刻所有的寒冷和疲惫都值得了。风声中夹杂着兴奋的低语。',
    '壮丽'
  ),
  createMockRecording(
    '苏州园林钟声',
    '江苏苏州',
    31.3200,
    120.6200,
    '2024-02-14T16:00:00',
    'cloudy',
    'ambient',
    'winter',
    'afternoon',
    ['t22', 't15'],
    150,
    40,
    5,
    false,
    '留园的午后，安静得能听到树叶落下的声音。突然，远处寒山寺的钟声响起，回荡在亭台楼阁之间。这钟声穿越千年，带着历史的厚重感。',
    '悠远'
  ),
];

export const generateMockTimeDistribution = (recordings: Recording[]) => {
  const distribution: { hour: number; count: number; recordings: string[] }[] = [];
  
  for (let hour = 0; hour < 24; hour++) {
    const hourRecordings = recordings.filter(r => {
      const rHour = new Date(r.recordTime).getHours();
      return rHour >= hour && rHour < hour + 1;
    });
    
    distribution.push({
      hour,
      count: hourRecordings.length,
      recordings: hourRecordings.map(r => r.id),
    });
  }
  
  return distribution;
};

export const generateHeatmapData = (recordings: Recording[]) => {
  const locationMap = new Map<string, { lat: number; lng: number; count: number; tags: Set<string> }>();
  
  recordings.forEach(r => {
    if (r.gpsLocation) {
      const key = `${Math.round(r.gpsLocation.latitude * 100) / 100},${Math.round(r.gpsLocation.longitude * 100) / 100}`;
      const existing = locationMap.get(key) || { 
        lat: r.gpsLocation.latitude, 
        lng: r.gpsLocation.longitude, 
        count: 0, 
        tags: new Set() 
      };
      existing.count++;
      r.tags.forEach(t => existing.tags.add(t.id));
      locationMap.set(key, existing);
    }
  });
  
  return Array.from(locationMap.values()).map(v => ({
    lat: v.lat,
    lng: v.lng,
    intensity: Math.min(v.count * 20 + v.tags.size * 10, 100),
    recordingCount: v.count,
    speciesCount: v.tags.size,
  }));
};
