import { generateId } from '../../shared/types';
import type {
  Project,
  Observation,
  SpatialAnalysis,
  PedestrianStudy,
  CaseStudy,
  Comparison,
} from '../../shared/types';

export const mockProjects: Project[] = [
  {
    id: 'proj-001',
    title: '南京西路历史街区研究',
    description: '对上海南京西路历史街区进行系统性的城市观察与空间品质评估，重点关注历史建筑保护与现代生活的融合。',
    createdAt: '2025-03-15T09:00:00Z',
    updatedAt: '2025-06-01T14:30:00Z',
  },
  {
    id: 'proj-002',
    title: '城市滨水空间对比研究',
    description: '对比上海黄浦江与苏州河沿岸的公共空间设计，分析不同滨水地带的空间活力与使用模式。',
    createdAt: '2025-04-10T11:00:00Z',
    updatedAt: '2025-05-28T16:45:00Z',
  },
  {
    id: 'proj-003',
    title: '老旧社区微更新观察',
    description: '跟踪记录多个老旧社区的微更新项目，评估改造对居民生活质量的实际影响。',
    createdAt: '2025-05-01T08:30:00Z',
    updatedAt: '2025-06-05T10:20:00Z',
  },
];

export const mockObservations: Observation[] = [
  {
    id: 'obs-001',
    projectId: 'proj-001',
    title: '南京西路沿街立面观察',
    description: '记录了南京西路从石门一路到陕西北路段的沿街建筑界面特征，包括历史保护建筑与现代商业建筑的并置关系。',
    observationTime: '2025-03-20T14:00:00Z',
    season: 'spring',
    markers: [
      {
        id: 'm-001',
        lat: 31.2304,
        lng: 121.4512,
        address: '南京西路1266号',
        streetName: '南京西路',
      },
      {
        id: 'm-002',
        lat: 31.2298,
        lng: 121.4489,
        address: '南京西路1081弄',
        streetName: '南京西路',
      },
    ],
    media: [
      {
        id: 'med-001',
        type: 'photo',
        url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shanghai%20nanjing%20road%20west%20historic%20building%20facade%20art%20deco%20style%20street%20photography&image_size=landscape_16_9',
        caption: '历史建筑沿街立面',
      },
      {
        id: 'med-002',
        type: 'text',
        content: '下午2点的阳光正好照射在建筑立面上，石材的纹理清晰可见。行人速度普遍较快，很少有人驻足欣赏建筑细节。',
        caption: '观察笔记',
      },
    ],
  },
  {
    id: 'obs-002',
    projectId: 'proj-001',
    title: '夏季午后街道活动观察',
    description: '夏季高温时段街道空间的使用情况观察，记录遮阳设施、绿化与行人活动的关系。',
    observationTime: '2025-07-22T14:00:00Z',
    season: 'summer',
    markers: [
      {
        id: 'm-003',
        lat: 31.2304,
        lng: 121.4512,
        address: '南京西路1266号',
        streetName: '南京西路',
      },
    ],
    media: [
      {
        id: 'med-003',
        type: 'photo',
        url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=summer%20afternoon%20city%20street%20pedestrians%20seeking%20shade%20under%20trees%20urban%20scene&image_size=landscape_16_9',
        caption: '夏季午后的街道',
      },
    ],
  },
  {
    id: 'obs-003',
    projectId: 'proj-002',
    title: '外滩滨水空间观察',
    description: '外滩观景平台的空间使用情况，包括游客行为模式、设施分布与视线廊道。',
    observationTime: '2025-05-15T18:00:00Z',
    season: 'spring',
    markers: [
      {
        id: 'm-004',
        lat: 31.2397,
        lng: 121.4908,
        address: '中山东一路',
        streetName: '中山东一路',
      },
    ],
    media: [
      {
        id: 'med-004',
        type: 'photo',
        url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shanghai%20bund%20waterfront%20promenade%20at%20sunset%20tourists%20enjoying%20view&image_size=landscape_16_9',
        caption: '外滩滨水空间',
      },
    ],
  },
];

export const mockAnalyses: SpatialAnalysis[] = [
  {
    id: 'ana-001',
    projectId: 'proj-001',
    location: '南京西路（陕西北路-石门一路）',
    scores: {
      safety: 85,
      vitality: 92,
      accessibility: 78,
      comfort: 72,
    },
    elements: [
      {
        id: 'e-001',
        category: 'furniture',
        description: '统一设计的金属座椅，沿人行道间隔布置，材质为铸铁与木材结合。',
        photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=urban%20street%20furniture%20bench%20modern%20design%20cast%20iron%20wood&image_size=square',
      },
      {
        id: 'e-002',
        category: 'signage',
        description: '多语言导视系统，包括历史建筑解说牌、商业指示牌、地铁导向标识。',
      },
      {
        id: 'e-003',
        category: 'vegetation',
        description: '法国梧桐树阵，夏季遮荫效果良好，但冬季枝干形态有待优化。',
        photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=plane%20trees%20along%20city%20street%20summer%20green%20canopy%20shade&image_size=square',
      },
      {
        id: 'e-004',
        category: 'building',
        description: 'Art Deco风格历史建筑立面，保存状况良好，底层为高端商业店铺。',
      },
    ],
    problems: [
      {
        id: 'p-001',
        description: '部分路段人行道被共享单车占用，行人通行空间不足。',
        severity: 'high',
        suggestion: '设置规范的共享单车停放区域，加强管理引导。',
      },
      {
        id: 'p-002',
        description: '路口过街信号灯时间过短，老年人过街困难。',
        severity: 'medium',
        suggestion: '延长信号灯过街时间，或设置二次过街安全岛。',
      },
      {
        id: 'p-003',
        description: '部分历史建筑缺乏解说标识，游客难以了解其历史价值。',
        severity: 'low',
        suggestion: '增设历史建筑解说二维码或小型解说牌。',
      },
    ],
  },
  {
    id: 'ana-002',
    projectId: 'proj-002',
    location: '外滩观景平台',
    scores: {
      safety: 90,
      vitality: 95,
      accessibility: 88,
      comfort: 65,
    },
    elements: [
      {
        id: 'e-005',
        category: 'activity',
        description: '大型观景平台，容量充足，是重要的城市活动场所。',
      },
      {
        id: 'e-006',
        category: 'furniture',
        description: '低矮石质护栏，兼具安全防护与座椅功能。',
      },
    ],
    problems: [
      {
        id: 'p-004',
        description: '高峰时段人流过于密集，存在安全隐患。',
        severity: 'high',
        suggestion: '实施人流管控措施，设置单向通行路线。',
      },
      {
        id: 'p-005',
        description: '遮阳设施不足，夏季白天使用体验较差。',
        severity: 'medium',
        suggestion: '增设可移动遮阳伞或景观遮阳棚架。',
      },
    ],
  },
];

export const mockPedestrianStudies: PedestrianStudy[] = [
  {
    id: 'ped-001',
    projectId: 'proj-001',
    location: '南京西路/陕西北路交叉口',
    studyDate: '2025-03-25T00:00:00Z',
    flowCounts: [
      { id: 'fc-001', startTime: '08:00', endTime: '08:15', pedestrianCount: 187, bicycleCount: 42 },
      { id: 'fc-002', startTime: '08:15', endTime: '08:30', pedestrianCount: 203, bicycleCount: 48 },
      { id: 'fc-003', startTime: '08:30', endTime: '08:45', pedestrianCount: 245, bicycleCount: 56 },
      { id: 'fc-004', startTime: '08:45', endTime: '09:00', pedestrianCount: 278, bicycleCount: 63 },
      { id: 'fc-005', startTime: '12:00', endTime: '12:15', pedestrianCount: 312, bicycleCount: 38 },
      { id: 'fc-006', startTime: '12:15', endTime: '12:30', pedestrianCount: 356, bicycleCount: 45 },
      { id: 'fc-007', startTime: '18:00', endTime: '18:15', pedestrianCount: 289, bicycleCount: 72 },
      { id: 'fc-008', startTime: '18:15', endTime: '18:30', pedestrianCount: 267, bicycleCount: 68 },
    ],
    activities: [
      { id: 'a-001', type: 'walk', count: 623, description: '快速通过的通勤行人，以年轻人为主' },
      { id: 'a-002', type: 'stay', count: 87, description: '在街边座椅休息的人群，包括老年人和游客' },
      { id: 'a-003', type: 'consume', count: 156, description: '进出咖啡店、餐厅的消费者' },
      { id: 'a-004', type: 'social', count: 45, description: '朋友结伴逛街、拍照的人群' },
    ],
    paths: [
      {
        id: 'path-001',
        type: 'designed',
        coordinates: [
          { lat: 31.2304, lng: 121.4512 },
          { lat: 31.2305, lng: 121.4508 },
          { lat: 31.2306, lng: 121.4504 },
          { lat: 31.2307, lng: 121.4500 },
        ],
      },
      {
        id: 'path-002',
        type: 'actual',
        coordinates: [
          { lat: 31.2304, lng: 121.4512 },
          { lat: 31.2302, lng: 121.4510 },
          { lat: 31.2300, lng: 121.4508 },
          { lat: 31.2298, lng: 121.4506 },
          { lat: 31.2297, lng: 121.4504 },
          { lat: 31.2298, lng: 121.4500 },
        ],
      },
    ],
  },
  {
    id: 'ped-002',
    projectId: 'proj-002',
    location: '外滩观景平台南段',
    studyDate: '2025-05-20T00:00:00Z',
    flowCounts: [
      { id: 'fc-009', startTime: '17:00', endTime: '17:15', pedestrianCount: 412, bicycleCount: 8 },
      { id: 'fc-010', startTime: '17:15', endTime: '17:30', pedestrianCount: 489, bicycleCount: 12 },
      { id: 'fc-011', startTime: '17:30', endTime: '17:45', pedestrianCount: 567, bicycleCount: 15 },
      { id: 'fc-012', startTime: '17:45', endTime: '18:00', pedestrianCount: 623, bicycleCount: 18 },
    ],
    activities: [
      { id: 'a-005', type: 'walk', count: 342, description: '沿观景平台漫步观光的游客' },
      { id: 'a-006', type: 'stay', count: 856, description: '倚靠护栏观赏江景、拍照的游客' },
      { id: 'a-007', type: 'consume', count: 78, description: '购买饮料、零食的游客' },
      { id: 'a-008', type: 'social', count: 234, description: '家庭出游、朋友结伴的团体' },
    ],
    paths: [],
  },
];

export const mockCaseStudies: CaseStudy[] = [
  {
    id: 'case-001',
    projectId: 'proj-002',
    title: '纽约高线公园',
    location: '美国纽约',
    description: '将废弃高架铁路改造为线性城市公园的经典案例，通过景观设计激活周边区域，成为城市更新的典范。项目保留了原有铁路结构，融合了自然景观与现代设计，为市民提供了独特的公共空间体验。',
    rating: 5,
    sourceUrl: 'https://www.thehighline.org/',
    dimensions: {
      safety: 9,
      liveliness: 10,
      accessibility: 8,
      comfort: 8,
    },
    highlights: [
      { id: 'h-001', content: '保留原有铁路结构，融入自然景观' },
      { id: 'h-002', content: '分段式设计，提供多样化的空间体验' },
      { id: 'h-003', content: '成功带动周边地产价值提升' },
    ],
    improvements: [
      { id: 'i-001', content: '部分区段无障碍设施可以进一步优化' },
      { id: 'i-002', content: '高峰时段人流过于密集，可考虑限流措施' },
    ],
    createdAt: '2025-04-15T10:00:00Z',
  },
  {
    id: 'case-002',
    projectId: 'proj-002',
    title: '首尔清溪川复兴',
    location: '韩国首尔',
    description: '将城市中心的高架道路拆除，恢复自然河道的生态修复项目，极大改善了城市微气候与公共空间品质。项目拆除了5.8公里的高架路，恢复了自然河道，成为城市生态修复的标杆案例。',
    rating: 5,
    dimensions: {
      safety: 8,
      liveliness: 9,
      accessibility: 9,
      comfort: 9,
    },
    highlights: [
      { id: 'h-003', content: '拆除5.8公里高架路，恢复自然河道' },
      { id: 'h-004', content: '城市热岛效应降低约2℃' },
      { id: 'h-005', content: '沿线生物多样性显著提升' },
    ],
    improvements: [
      { id: 'i-003', content: '冬季枯水期景观效果有待提升' },
    ],
    createdAt: '2025-05-10T14:00:00Z',
  },
  {
    id: 'case-003',
    title: '哥本哈根自行车道网络',
    location: '丹麦哥本哈根',
    description: '世界领先的自行车友好城市案例，完善的自行车基础设施网络使得自行车出行比例超过50%。哥本哈根的自行车系统包括专用车道、优先信号灯、冬季清扫等全方位保障。',
    rating: 5,
    sourceUrl: 'https://www.cyclingembassy.dk/',
    dimensions: {
      safety: 10,
      liveliness: 9,
      accessibility: 10,
      comfort: 9,
    },
    highlights: [
      { id: 'h-006', content: '超过400公里专用自行车道' },
      { id: 'h-007', content: '自行车优先的交通信号灯系统' },
      { id: 'h-008', content: '与公共交通系统的无缝衔接' },
    ],
    improvements: [
      { id: 'i-004', content: '雨雪天气防滑措施可以进一步加强' },
    ],
    createdAt: '2025-05-25T09:30:00Z',
  },
];

export const mockComparisons: Comparison[] = [
  {
    id: 'comp-001',
    title: '历史街区 vs 现代商圈步行空间对比',
    description: '对比南京西路历史街区与陆家嘴现代商圈的步行空间设计特点，分析不同空间形态对行人行为的影响。',
    caseIds: ['case-001', 'case-002'],
    notes: [
      {
        id: 'n-001',
        title: '空间尺度对比',
        content: '南京西路的街道尺度亲切宜人，适合步行；陆家嘴的街道尺度宏大，步行体验较差。',
      },
      {
        id: 'n-002',
        title: '临街界面对比',
        content: '南京西路的临街界面通透、功能混合，充满活力；陆家嘴的临街界面多为封闭的建筑界面，缺乏活力。',
      },
    ],
    createdAt: '2025-05-20T10:00:00Z',
  },
  {
    id: 'comp-002',
    title: '国内外城市更新案例对比',
    description: '对比纽约高线公园与首尔清溪川复兴两个国际城市更新案例，总结可借鉴的经验。',
    caseIds: ['case-001', 'case-002', 'case-003'],
    notes: [
      {
        id: 'n-003',
        title: '生态修复经验',
        content: '清溪川的生态修复模式值得借鉴，通过恢复自然水系改善城市微气候。',
      },
      {
        id: 'n-004',
        title: '交通系统启示',
        content: '哥本哈根的自行车系统证明，完善的基础设施可以极大改变居民出行方式。',
      },
    ],
    createdAt: '2025-06-01T14:00:00Z',
  },
];

export const seedDatabase = async (): Promise<void> => {
  const { projectDB, observationDB, analysisDB, pedestrianStudyDB, comparisonDB, caseStudyDB } = await import('./db');

  const existingProjects = await projectDB.getAll();
  if (existingProjects.length > 0) return;

  for (const project of mockProjects) {
    await projectDB.create(project);
  }

  for (const observation of mockObservations) {
    await observationDB.create(observation);
  }

  for (const analysis of mockAnalyses) {
    await analysisDB.create(analysis);
  }

  for (const study of mockPedestrianStudies) {
    await pedestrianStudyDB.create(study);
  }

  for (const comparison of mockComparisons) {
    await comparisonDB.create(comparison);
  }

  for (const caseStudy of mockCaseStudies) {
    await caseStudyDB.create(caseStudy);
  }
};

export { generateId };
