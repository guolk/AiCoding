import type {
  Aquarium,
  WaterTest,
  Plant,
  Fish,
  Photo,
  WaterChange,
  Fertilization,
  CO2Log,
  EquipmentMaintenance,
  Anomaly,
  GrowthLog,
  DiseaseRecord,
  BreedingRecord,
} from '@/types';

const generateDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const mockAquariums: Aquarium[] = [
  {
    id: 'tank-001',
    name: '草缸·绿意盎然',
    length: 60,
    width: 30,
    height: 36,
    volume: 65,
    filterType: '滤筒 + 前置过滤',
    lighting: 'LED水草灯 60W',
    substrate: 'ADA水草泥 + 化妆沙',
    aquascapeStyle: '荷兰式造景',
    setupDate: generateDate(90),
    status: 'running',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=aquarium%20planted%20tank%20with%20lush%20green%20plants%20and%20small%20colorful%20fish%20clear%20water%20professional%20aquascape&image_size=landscape_16_9',
  },
  {
    id: 'tank-002',
    name: '三湖·岩栖天堂',
    length: 90,
    width: 45,
    height: 45,
    volume: 182,
    filterType: '底滤 + 造浪泵',
    lighting: 'LED潜水灯 80W',
    substrate: '珊瑚砂 + 菲律宾沙',
    aquascapeStyle: '三湖岩栖造景',
    setupDate: generateDate(180),
    status: 'running',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=malawi%20cichlid%20aquarium%20with%20rocky%20landscape%20colorful%20african%20cichlids%20sand%20substrate&image_size=landscape_16_9',
  },
];

const generateWaterTests = (tankId: string, days: number): WaterTest[] => {
  const tests: WaterTest[] = [];
  for (let i = days; i >= 0; i -= 3) {
    const baseVariation = Math.sin(i / 7) * 0.2;
    tests.push({
      id: `wt-${tankId}-${i}`,
      tankId,
      testDate: generateDate(i),
      ph: 6.8 + baseVariation + (i > 20 ? 0.3 : 0),
      ammonia: Math.max(0, 0.05 + Math.random() * 0.15 - (i > 30 ? 0 : 0.1)),
      nitrite: Math.max(0, 0.02 + Math.random() * 0.1 - (i > 30 ? 0 : 0.05)),
      nitrate: 15 + Math.sin(i / 5) * 8 + (i > 10 ? 5 : 0),
      gh: 8 + baseVariation * 2,
      kh: 5 + baseVariation,
      notes: i === 15 ? '换水后测量' : i === 25 ? '发现氨氮偏高' : undefined,
    });
  }
  return tests;
};

export const mockWaterTests: WaterTest[] = [
  ...generateWaterTests('tank-001', 60),
  ...generateWaterTests('tank-002', 90),
];

export const mockPlants: Plant[] = [
  {
    id: 'plant-001',
    tankId: 'tank-001',
    name: '矮珍珠',
    scientificName: 'Micranthemum tweediei',
    quantity: 3,
    addDate: generateDate(85),
    source: '水草玩家处购买',
    status: 'growing',
  },
  {
    id: 'plant-002',
    tankId: 'tank-001',
    name: '血心兰',
    scientificName: 'Alternanthera reineckii',
    quantity: 5,
    addDate: generateDate(80),
    source: '本地水族店',
    status: 'healthy',
  },
  {
    id: 'plant-003',
    tankId: 'tank-001',
    name: '水榕',
    scientificName: 'Anubias barteri',
    quantity: 2,
    addDate: generateDate(90),
    source: '网购',
    status: 'healthy',
  },
  {
    id: 'plant-004',
    tankId: 'tank-001',
    name: '莫斯',
    scientificName: 'Vesicularia dubyana',
    quantity: 1,
    addDate: generateDate(70),
    source: '水草玩家赠送',
    status: 'growing',
  },
  {
    id: 'plant-005',
    tankId: 'tank-001',
    name: '宫廷草',
    scientificName: 'Rotala rotundifolia',
    quantity: 10,
    addDate: generateDate(60),
    source: '本地水族店',
    status: 'growing',
  },
  {
    id: 'plant-006',
    tankId: 'tank-002',
    name: '水兰',
    scientificName: 'Vallisneria americana',
    quantity: 6,
    addDate: generateDate(170),
    source: '网购',
    status: 'healthy',
  },
  {
    id: 'plant-007',
    tankId: 'tank-002',
    name: '铁皇冠',
    scientificName: 'Microsorum pteropus',
    quantity: 2,
    addDate: generateDate(180),
    source: '本地水族店',
    status: 'healthy',
  },
];

export const mockFishes: Fish[] = [
  {
    id: 'fish-001',
    tankId: 'tank-001',
    name: '宝莲灯',
    scientificName: 'Paracheirodon axelrodi',
    quantity: 20,
    addDate: generateDate(60),
    source: '本地水族店',
    status: 'healthy',
  },
  {
    id: 'fish-002',
    tankId: 'tank-001',
    name: '小精灵',
    scientificName: 'Otocinclus affinis',
    quantity: 3,
    addDate: generateDate(55),
    source: '网购',
    status: 'healthy',
  },
  {
    id: 'fish-003',
    tankId: 'tank-001',
    name: '黑壳虾',
    scientificName: 'Neocaridina davidi',
    quantity: 30,
    addDate: generateDate(80),
    source: '水草玩家处购买',
    status: 'healthy',
  },
  {
    id: 'fish-004',
    tankId: 'tank-001',
    name: '三角灯',
    scientificName: 'Trigonostigma heteromorpha',
    quantity: 8,
    addDate: generateDate(50),
    source: '本地水族店',
    status: 'healthy',
  },
  {
    id: 'fish-005',
    tankId: 'tank-002',
    name: '非洲王子',
    scientificName: 'Labidochromis caeruleus',
    quantity: 6,
    addDate: generateDate(150),
    source: '专业繁殖场',
    status: 'healthy',
  },
  {
    id: 'fish-006',
    tankId: 'tank-002',
    name: '雪中红',
    scientificName: 'Pseudotropheus zebra',
    quantity: 4,
    addDate: generateDate(140),
    source: '专业繁殖场',
    status: 'observing',
  },
  {
    id: 'fish-007',
    tankId: 'tank-002',
    name: '蓝茉莉',
    scientificName: 'Cyrtocara moorii',
    quantity: 2,
    addDate: generateDate(120),
    source: '网购',
    status: 'healthy',
  },
  {
    id: 'fish-008',
    tankId: 'tank-002',
    name: '清道夫',
    scientificName: 'Plecostomus',
    quantity: 1,
    addDate: generateDate(170),
    source: '本地水族店',
    status: 'healthy',
  },
];

export const mockPhotos: Photo[] = [
  {
    id: 'photo-001',
    tankId: 'tank-001',
    url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=newly%20setup%20aquarium%20with%20substrate%20and%20hardscape%20no%20plants%20empty%20tank&image_size=square',
    date: generateDate(90),
    notes: '开缸第一天，铺设底床和造景',
  },
  {
    id: 'photo-002',
    tankId: 'tank-001',
    url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=aquarium%20one%20week%20old%20newly%20planted%20small%20plants%20cloudy%20water&image_size=square',
    date: generateDate(83),
    notes: '种植水草一周，水草开始扎根',
  },
  {
    id: 'photo-003',
    tankId: 'tank-001',
    url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=aquarium%20one%20month%20old%20growing%20plants%20clear%20water%20first%20fish&image_size=square',
    date: generateDate(60),
    notes: '满一个月，水草长势良好，放入第一批鱼',
  },
  {
    id: 'photo-004',
    tankId: 'tank-001',
    url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=aquarium%20two%20months%20old%20lush%20green%20plants%20schooling%20fish%20beautiful%20aquascape&image_size=square',
    date: generateDate(30),
    notes: '两个月，水草成景，状态极佳',
  },
  {
    id: 'photo-005',
    tankId: 'tank-001',
    url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mature%20planted%20aquarium%203%20months%20old%20dense%20growth%20colorful%20fish%20crystal%20clear%20water&image_size=square',
    date: generateDate(7),
    notes: '最新状态，修剪后重新布局',
  },
  {
    id: 'photo-006',
    tankId: 'tank-002',
    url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=malawi%20cichlid%20tank%20setup%20rocks%20and%20sand%20no%20fish&image_size=square',
    date: generateDate(180),
    notes: '开缸，搭建岩石景观',
  },
  {
    id: 'photo-007',
    tankId: 'tank-002',
    url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=malawi%20cichlid%20tank%20with%20colorful%20fish%20swimming%20among%20rocks&image_size=square',
    date: generateDate(120),
    notes: '鱼只状态稳定，开始发色',
  },
  {
    id: 'photo-008',
    tankId: 'tank-002',
    url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=large%20cichlid%20aquarium%20with%20colorful%20african%20cichlids%20mature%20tank&image_size=square',
    date: generateDate(30),
    notes: '最新状态，鱼儿色彩艳丽',
  },
];

export const mockWaterChanges: WaterChange[] = [
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `wc-001-${i}`,
    tankId: 'tank-001',
    date: generateDate(i * 7),
    amount: 20,
    waterSource: 'RO水 + 赫根',
    notes: i % 2 === 0 ? '添加硝化细菌' : undefined,
  })),
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `wc-002-${i}`,
    tankId: 'tank-002',
    date: generateDate(i * 9),
    amount: 45,
    waterSource: '自来水曝气24小时',
    notes: undefined,
  })),
];

export const mockFertilizations: Fertilization[] = [
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `fert-001-${i}`,
    tankId: 'tank-001',
    date: generateDate(i * 4),
    fertilizerType: i % 3 === 0 ? '综合液肥' : i % 3 === 1 ? '铁肥' : '钾肥',
    dosage: i % 3 === 0 ? 5 : 3,
    notes: i % 3 === 0 ? '按照说明书剂量' : undefined,
  })),
];

export const mockCO2Logs: CO2Log[] = [
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `co2-001-${i}`,
    tankId: 'tank-001',
    date: generateDate(i * 3),
    bubblesPerSecond: i < 10 ? 1 : 1.5,
    durationHours: 8,
    effect: i < 5 ? '一般' : i < 15 ? '良好' : '极佳',
    notes: i === 10 ? '调大供应量' : undefined,
  })),
];

export const mockEquipmentMaintenances: EquipmentMaintenance[] = [
  {
    id: 'eq-001',
    tankId: 'tank-001',
    date: generateDate(60),
    equipment: '过滤桶',
    action: '清洗过滤棉',
    notes: '用原缸水清洗，避免硝化细菌流失',
  },
  {
    id: 'eq-002',
    tankId: 'tank-001',
    date: generateDate(45),
    equipment: '细化器',
    action: '清洗CO2细化器',
    notes: '用柠檬酸浸泡2小时',
  },
  {
    id: 'eq-003',
    tankId: 'tank-001',
    date: generateDate(30),
    equipment: '过滤桶',
    action: '更换过滤材料',
    notes: '更换了一半陶瓷环',
  },
  {
    id: 'eq-004',
    tankId: 'tank-002',
    date: generateDate(90),
    equipment: '造浪泵',
    action: '清洗转子',
    notes: '去除钙质沉积',
  },
  {
    id: 'eq-005',
    tankId: 'tank-002',
    date: generateDate(60),
    equipment: '加热棒',
    action: '校准温度',
    notes: '实际温度比显示高0.5度',
  },
];

export const mockAnomalies: Anomaly[] = [
  {
    id: 'anomaly-001',
    tankId: 'tank-001',
    detectDate: generateDate(25),
    description: '硝酸盐偏高，达到35ppm',
    severity: 'medium',
    status: 'resolved',
    steps: [
      {
        id: 'step-001',
        stage: 'detection',
        content: '例行水质检测发现硝酸盐达到35ppm，超过正常范围',
        date: generateDate(25),
        result: '确认异常',
      },
      {
        id: 'step-002',
        stage: 'analysis',
        content: '分析原因：近期喂食量增加，换水频率保持不变，导致硝酸盐累积',
        date: generateDate(25),
        result: '确定为喂食过量导致',
      },
      {
        id: 'step-003',
        stage: 'action',
        content: '采取措施：1. 减少30%喂食量；2. 增加换水量至30%每周；3. 添加硝化细菌',
        date: generateDate(24),
        result: '措施已执行',
      },
      {
        id: 'step-004',
        stage: 'verification',
        content: '一周后检测硝酸盐降至18ppm，恢复正常范围',
        date: generateDate(17),
        result: '问题已解决',
      },
    ],
  },
  {
    id: 'anomaly-002',
    tankId: 'tank-002',
    detectDate: generateDate(10),
    description: '发现一条雪中红鱼鳍有破损，精神萎靡',
    severity: 'high',
    status: 'treating',
    steps: [
      {
        id: 'step-005',
        stage: 'detection',
        content: '喂食时发现一条雪中红鱼鳍有破损，游动迟缓',
        date: generateDate(10),
        result: '确认异常',
      },
      {
        id: 'step-006',
        stage: 'analysis',
        content: '观察分析：鱼鳍有白边，可能是打斗受伤引起的细菌感染',
        date: generateDate(10),
        result: '初步判断为细菌感染',
      },
      {
        id: 'step-007',
        stage: 'action',
        content: '采取措施：1. 隔离观察；2. 黄粉药浴；3. 升温至28度；4. 爆氧',
        date: generateDate(9),
        result: '正在治疗中',
      },
    ],
  },
];

export const mockGrowthLogs: GrowthLog[] = [
  {
    id: 'growth-001',
    plantId: 'plant-001',
    date: generateDate(50),
    eventType: 'new_leaf',
    description: '矮珍珠开始爬地，长出很多新叶',
  },
  {
    id: 'growth-002',
    plantId: 'plant-002',
    date: generateDate(45),
    eventType: 'new_leaf',
    description: '血心兰新叶发色良好，呈现艳红色',
  },
  {
    id: 'growth-003',
    plantId: 'plant-004',
    date: generateDate(40),
    eventType: 'propagation',
    description: '莫斯生长迅速，已经覆盖沉木的80%',
  },
  {
    id: 'growth-004',
    plantId: 'plant-005',
    date: generateDate(30),
    eventType: 'propagation',
    description: '宫廷草长出很多侧芽，需要打头',
  },
  {
    id: 'growth-005',
    plantId: 'plant-005',
    date: generateDate(20),
    eventType: 'pruning',
    description: '修剪宫廷草，打头约5cm',
  },
  {
    id: 'growth-006',
    plantId: 'plant-001',
    date: generateDate(15),
    eventType: 'new_leaf',
    description: '矮珍珠已经完全覆盖前景，形成草坪',
  },
  {
    id: 'growth-007',
    plantId: 'plant-006',
    date: generateDate(100),
    eventType: 'propagation',
    description: '水兰长出新的植株，已经繁殖了3棵',
  },
];

export const mockDiseaseRecords: DiseaseRecord[] = [
  {
    id: 'disease-001',
    fishId: 'fish-002',
    detectDate: generateDate(35),
    symptoms: '一条小精灵鱼腹部凹陷，摄食减少',
    diagnosis: '内寄（体内寄生虫）',
    medication: '甲硝唑药浴，连续3天',
    recoverDate: generateDate(28),
    result: 'recovered',
  },
  {
    id: 'disease-002',
    fishId: 'fish-006',
    detectDate: generateDate(10),
    symptoms: '鱼鳍破损，有白边，游动迟缓',
    diagnosis: '打斗受伤引起的细菌感染',
    medication: '黄粉药浴，每天换水1/3',
    result: 'ongoing',
  },
];

export const mockBreedingRecords: BreedingRecord[] = [
  {
    id: 'breed-001',
    fishId: 'fish-003',
    spawnDate: generateDate(45),
    eggCount: 50,
    hatchDays: 14,
    fryCount: 20,
    survivalCount: 12,
    notes: '黑壳虾自然繁殖，幼虾已能独立生活',
  },
  {
    id: 'breed-002',
    fishId: 'fish-005',
    spawnDate: generateDate(30),
    eggCount: 30,
    hatchDays: 21,
    fryCount: 8,
    survivalCount: 3,
    notes: '非洲王子口孵繁殖，已隔离幼鱼',
  },
];
