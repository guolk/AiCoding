import type {
  Specimen,
  Supplier,
  AcquisitionRecord,
  ScientificData,
  DisplayLocation,
  DisplayPlacement,
  LoanRecord,
  KnowledgeNote,
} from '@/types';

export const mockSpecimens: Specimen[] = [
  {
    id: 'spec-001',
    name: '石英晶体',
    specimenNo: 'MIN-2024-001',
    type: 'mineral',
    chemicalFormula: 'SiO₂',
    crystalSystem: 'trigonal',
    hardnessMin: 7,
    hardnessMax: 7,
    luster: 'vitreous',
    color: '无色透明',
    streak: '白色',
    cleavage: '无',
    fracture: '贝壳状断口',
    locality: '巴西，米纳斯吉拉斯州',
    collectionDate: '2024-03-15',
    weightG: 245.5,
    dimensionsMm: '85 x 62 x 45 mm',
    description: '优质的无色透明石英晶体，具有多个晶面，形态完整，内含少量气液包体。',
    variety: '水晶',
    transparency: 'transparent',
    photos: [
      {
        id: 'ph-001',
        url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=clear%20quartz%20crystal%20mineral%20specimen%20on%20white%20background%20professional%20photography&image_size=square_hd',
        caption: '石英晶体正视图',
        angle: '正面',
        isPrimary: true,
        uploadedAt: '2024-03-15T10:00:00Z',
      },
    ],
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
  },
  {
    id: 'spec-002',
    name: '黄铁矿',
    specimenNo: 'MIN-2024-002',
    type: 'mineral',
    chemicalFormula: 'FeS₂',
    crystalSystem: 'cubic',
    hardnessMin: 6,
    hardnessMax: 6.5,
    luster: 'metallic',
    color: '浅黄铜色',
    streak: '绿黑色',
    cleavage: '不完全',
    fracture: '贝壳状至参差状',
    locality: '中国，湖北，大冶',
    collectionDate: '2024-01-20',
    weightG: 380,
    dimensionsMm: '70 x 55 x 50 mm',
    description: '完美的立方体黄铁矿晶体集合体，晶面有典型的晶面条纹，金属光泽强烈。',
    variety: '愚人金',
    transparency: 'opaque',
    photos: [
      {
        id: 'ph-002',
        url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pyrite%20crystal%20cubes%20mineral%20specimen%20metallic%20golden%20color%20on%20white%20background&image_size=square_hd',
        caption: '黄铁矿立方体晶体',
        angle: '正面',
        isPrimary: true,
        uploadedAt: '2024-01-20T14:00:00Z',
      },
    ],
    createdAt: '2024-01-20T14:00:00Z',
    updatedAt: '2024-01-20T14:00:00Z',
  },
  {
    id: 'spec-003',
    name: 'NWA 869 球粒陨石',
    specimenNo: 'MET-2023-001',
    type: 'meteorite',
    chemicalFormula: '硅酸盐 + 铁镍金属',
    meteoriteClass: 'chondrite',
    subClassification: 'L3-6',
    fallType: 'find',
    findDate: '2000-07-01',
    parentBody: '小行星带 (推测)',
    shockStage: 'S3',
    weatheringGrade: 'W2',
    tkw: 100,
    locality: '摩洛哥 / 阿尔及利亚边境，西北非',
    collectionDate: '2023-08-10',
    weightG: 52.3,
    dimensionsMm: '42 x 35 x 18 mm',
    description: '典型的普通球粒陨石切片，可见清晰的球粒结构和金属铁镍颗粒，部分区域有熔壳残留。',
    photos: [
      {
        id: 'ph-003',
        url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chondrite%20meteorite%20slice%20showing%20chondrules%20and%20metal%20flecks%20polished%20section&image_size=square_hd',
        caption: 'NWA 869 陨石切片',
        angle: '光面',
        isPrimary: true,
        uploadedAt: '2023-08-10T09:30:00Z',
      },
    ],
    createdAt: '2023-08-10T09:30:00Z',
    updatedAt: '2023-08-10T09:30:00Z',
  },
  {
    id: 'spec-004',
    name: '孔雀石',
    specimenNo: 'MIN-2024-003',
    type: 'mineral',
    chemicalFormula: 'Cu₂(CO₃)(OH)₂',
    crystalSystem: 'monoclinic',
    hardnessMin: 3.5,
    hardnessMax: 4,
    luster: 'silky',
    color: '绿色，条带状',
    streak: '淡绿色',
    cleavage: '完全',
    fracture: '贝壳状至参差状',
    locality: '刚果民主共和国，加丹加省',
    collectionDate: '2024-02-08',
    weightG: 680,
    dimensionsMm: '120 x 85 x 40 mm',
    description: '大型肾状孔雀石标本，具有典型的同心环带结构，丝绢光泽，抛光面纹理优美。',
    transparency: 'opaque',
    photos: [
      {
        id: 'ph-004',
        url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=polished%20malachite%20mineral%20specimen%20green%20concentric%20bands%20kidney%20shape&image_size=square_hd',
        caption: '抛光孔雀石标本',
        angle: '正面',
        isPrimary: true,
        uploadedAt: '2024-02-08T11:00:00Z',
      },
    ],
    createdAt: '2024-02-08T11:00:00Z',
    updatedAt: '2024-02-08T11:00:00Z',
  },
  {
    id: 'spec-005',
    name: 'Muonionalusta 铁陨石',
    specimenNo: 'MET-2023-002',
    type: 'meteorite',
    chemicalFormula: 'Fe-Ni 合金 (约92% Fe, 8% Ni)',
    meteoriteClass: 'iron',
    subClassification: 'IVA, 八面体铁陨石',
    fallType: 'find',
    findDate: '1906-01-01',
    parentBody: '分化小行星核部',
    shockStage: 'S4',
    tkw: 230,
    locality: '瑞典，基律纳，穆奥尼奥',
    collectionDate: '2023-11-25',
    weightG: 125.8,
    dimensionsMm: '60 x 50 x 8 mm',
    description: '著名的Muonionalusta铁陨石蚀刻切片，显示美丽的维德曼交角花纹，是最古老的铁陨石之一，约45亿年。',
    photos: [
      {
        id: 'ph-005',
        url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=etched%20iron%20meteorite%20slice%20Widmanstatten%20pattern%20geometric%20crystal%20pattern&image_size=square_hd',
        caption: 'Muonionalusta铁陨石蚀刻切片',
        angle: '光面',
        isPrimary: true,
        uploadedAt: '2023-11-25T15:00:00Z',
      },
    ],
    createdAt: '2023-11-25T15:00:00Z',
    updatedAt: '2023-11-25T15:00:00Z',
  },
  {
    id: 'spec-006',
    name: '萤石',
    specimenNo: 'MIN-2024-004',
    type: 'mineral',
    chemicalFormula: 'CaF₂',
    crystalSystem: 'cubic',
    hardnessMin: 4,
    hardnessMax: 4,
    luster: 'vitreous',
    color: '紫色 / 绿色',
    streak: '白色',
    cleavage: '完全八面体解理',
    fracture: '贝壳状',
    locality: '中国，湖南，郴州市，柿竹园',
    collectionDate: '2024-04-02',
    weightG: 420,
    dimensionsMm: '90 x 70 x 55 mm',
    description: '双色萤石晶体，紫色与绿色相间，立方体形态，具有明显的分带现象，在紫外线下有强荧光。',
    variety: '紫绿萤石',
    transparency: 'translucent',
    photos: [
      {
        id: 'ph-006',
        url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=purple%20green%20cubic%20fluorite%20crystal%20cluster%20mineral%20specimen%20gemmy&image_size=square_hd',
        caption: '双色萤石晶体',
        angle: '正面',
        isPrimary: true,
        uploadedAt: '2024-04-02T10:00:00Z',
      },
    ],
    createdAt: '2024-04-02T10:00:00Z',
    updatedAt: '2024-04-02T10:00:00Z',
  },
];

export const mockSuppliers: Supplier[] = [
  {
    id: 'sup-001',
    name: '晶石阁矿物贸易',
    contactPerson: '李明',
    email: 'contact@jingshige.com',
    phone: '0086-138-0000-1234',
    address: '上海市浦东新区张江路88号',
    website: 'https://www.jingshige.com',
    reputation: 5,
    notes: '专业矿物标本供应商，货源稳定，品质可靠。与多家国际矿商有合作关系。',
    createdAt: '2023-01-15T09:00:00Z',
  },
  {
    id: 'sup-002',
    name: 'Meteorite Gallery International',
    contactPerson: 'Dr. Ahmed Hassan',
    email: 'sales@meteoritegallery.com',
    phone: '+212-522-123-456',
    address: 'Casablanca, Morocco',
    website: 'https://www.meteoritegallery.com',
    reputation: 4,
    notes: '专注陨石销售的国际供应商，提供NWA系列和各类稀有陨石。可出具国际陨石学会认证。',
    createdAt: '2023-03-20T14:00:00Z',
  },
  {
    id: 'sup-003',
    name: '北京地质标本厂',
    contactPerson: '王建国',
    email: 'sales@bjgeology.com.cn',
    phone: '010-8888-6666',
    address: '北京市海淀区学院路29号',
    reputation: 4,
    notes: '老牌国营企业，主要销售教学用矿物和岩石标本，价格合理。',
    createdAt: '2023-06-10T08:30:00Z',
  },
  {
    id: 'sup-004',
    name: 'Asteroid Auction House',
    contactPerson: 'Sarah Chen',
    email: 'auctions@asteroidhouse.com',
    phone: '+1-212-555-0123',
    address: 'New York, NY, USA',
    website: 'https://www.asteroidhouse.com',
    reputation: 5,
    notes: '知名陨石和稀有矿物拍卖行，每年举办数次专场拍卖。成交记录公开透明。',
    createdAt: '2023-09-05T11:00:00Z',
  },
];

export const mockAcquisitionRecords: AcquisitionRecord[] = [
  {
    id: 'acq-001',
    specimenId: 'spec-001',
    sourceType: 'purchase',
    sourceDate: '2024-03-15',
    purchasePrice: 1200,
    currency: 'CNY',
    currentValuation: 1500,
    supplierId: 'sup-001',
    notes: '在晶石阁春季矿物展会上购入，品相完美，有较大的收藏价值。',
    createdAt: '2024-03-15T10:30:00Z',
    updatedAt: '2024-06-01T09:00:00Z',
  },
  {
    id: 'acq-002',
    specimenId: 'spec-002',
    sourceType: 'purchase',
    sourceDate: '2024-01-20',
    purchasePrice: 850,
    currency: 'CNY',
    currentValuation: 950,
    supplierId: 'sup-003',
    notes: '立方体形态标准，是教学收藏的佳品。',
    createdAt: '2024-01-20T15:00:00Z',
    updatedAt: '2024-01-20T15:00:00Z',
  },
  {
    id: 'acq-003',
    specimenId: 'spec-003',
    sourceType: 'purchase',
    sourceDate: '2023-08-10',
    purchasePrice: 680,
    currency: 'USD',
    currentValuation: 750,
    supplierId: 'sup-002',
    notes: '附有分类证书，是L型球粒陨石的典型代表。',
    createdAt: '2023-08-10T10:00:00Z',
    updatedAt: '2023-08-10T10:00:00Z',
  },
  {
    id: 'acq-004',
    specimenId: 'spec-004',
    sourceType: 'auction',
    sourceDate: '2024-02-08',
    purchasePrice: 2800,
    currency: 'CNY',
    currentValuation: 3500,
    auctionHouse: '晶石阁2024迎春拍',
    lotNumber: 'LOT-156',
    notes: '以起拍价2500元购得，估价在3000-4000元之间，品相极佳。',
    createdAt: '2024-02-08T16:00:00Z',
    updatedAt: '2024-02-08T16:00:00Z',
  },
  {
    id: 'acq-005',
    specimenId: 'spec-005',
    sourceType: 'purchase',
    sourceDate: '2023-11-25',
    purchasePrice: 1890,
    currency: 'USD',
    currentValuation: 2200,
    supplierId: 'sup-004',
    notes: '经典铁陨石品种，蚀刻效果好，花纹清晰。附带完整的来源证书。',
    createdAt: '2023-11-25T15:30:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
  },
  {
    id: 'acq-006',
    specimenId: 'spec-006',
    sourceType: 'field-collection',
    sourceDate: '2024-04-02',
    donorName: '中国地质大学考察队',
    notes: '2024年春季湘南地质考察中采集，由中国地质大学考察队友情赠送。',
    createdAt: '2024-04-02T11:00:00Z',
    updatedAt: '2024-04-02T11:00:00Z',
  },
];

export const mockScientificData: ScientificData[] = [
  {
    id: 'sci-001',
    specimenId: 'spec-001',
    densityGcm3: 2.65,
    refractiveIndexMin: 1.544,
    refractiveIndexMax: 1.553,
    birefringence: 0.009,
    pleochroism: '无',
    magneticProperty: 'none',
    fluorescenceUV: 'weak',
    fluorescenceUVColor: '淡紫色',
    fluorescenceLW: 'weak',
    fluorescenceSW: 'none',
    rarity: 'common',
    rarityNotes: '石英是地壳中第二丰富的矿物，分布极为广泛。高品质无色透明晶体具有一定观赏价值。',
    xrdAnalysis: {
      analyzed: false,
    },
    testDate: '2024-03-20',
    labName: '本中心实验室',
    notes: '标准石英参数，与文献值一致。',
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'sci-002',
    specimenId: 'spec-002',
    densityGcm3: 5.01,
    magneticProperty: 'weak',
    fluorescenceUV: 'none',
    rarity: 'common',
    rarityNotes: '黄铁矿是分布最广的硫化物矿物，成因多样。大尺寸完美晶体较具收藏价值。',
    xrdAnalysis: {
      analyzed: true,
      analysisDate: '2024-01-25',
      labName: '本中心实验室',
      peaks: '2θ=28.5°, 33.1°, 37.1°, 40.8°, 47.4°, 56.3°',
      mineralIdentified: 'FeS₂, 黄铁矿 (Pyrite)',
      notes: 'XRD图谱与PDF卡片03-065-0262完美匹配，确认为纯黄铁矿。',
    },
    testDate: '2024-01-25',
    notes: '硬度测试使用莫氏硬度标准矿物套，测得硬度约6-6.5。',
    createdAt: '2024-01-25T14:00:00Z',
    updatedAt: '2024-01-25T14:00:00Z',
  },
  {
    id: 'sci-003',
    specimenId: 'spec-003',
    densityGcm3: 3.22,
    magneticProperty: 'moderate',
    fluorescenceUV: 'none',
    rarity: 'uncommon',
    rarityNotes: '普通球粒陨石虽然在陨石分类中较常见，但完整切片仍具有一定的收藏和科学价值。',
    chemicalAnalysis: {
      method: 'EDX能谱分析',
      results: '主要元素: Si, Mg, Fe, O, S; 次要元素: Al, Ca, Na, K; 金属相: Fe-Ni合金 (~8%)',
      labName: '中国科学院地质与地球物理研究所',
      analysisDate: '2023-09-15',
    },
    testDate: '2023-09-15',
    labName: '中国科学院地质与地球物理研究所',
    notes: '目视估计金属含量约8%，符合L型球粒陨石特征。球粒保存良好，类型估计3-6型。',
    createdAt: '2023-09-15T09:00:00Z',
    updatedAt: '2023-09-15T09:00:00Z',
  },
  {
    id: 'sci-004',
    specimenId: 'spec-004',
    densityGcm3: 3.95,
    magneticProperty: 'none',
    fluorescenceUV: 'none',
    rarity: 'uncommon',
    rarityNotes: '高品质大尺寸孔雀石具有观赏和装饰价值，顶级品质标本较为稀有。',
    testDate: '2024-02-15',
    labName: '本中心实验室',
    notes: '条带状结构明显，抛光后光泽温润，具有典型的肾状构造。',
    xrdAnalysis: {
      analyzed: false,
    },
    createdAt: '2024-02-15T11:00:00Z',
    updatedAt: '2024-02-15T11:00:00Z',
  },
  {
    id: 'sci-005',
    specimenId: 'spec-005',
    densityGcm3: 7.9,
    magneticProperty: 'strong',
    fluorescenceUV: 'none',
    rarity: 'rare',
    rarityNotes: 'Muonionalusta是知名的IVA铁陨石，具有美丽的维德曼花纹，历史悠久（约45亿年），收藏价值较高。',
    chemicalAnalysis: {
      method: 'ICP-MS',
      results: 'Fe: ~92.3%, Ni: 7.1%, Co: 0.5%, P: 0.15%, Ge: 295 ppm, Ga: 16 ppm, Ir: 1.2 ppm',
      labName: 'University of Arizona, Lunar and Planetary Laboratory',
      analysisDate: '2023-12-10',
    },
    testDate: '2023-12-10',
    notes: '蚀刻使用硝酸酒精溶液（2% Nital），蚀刻时间约30秒，维德曼花纹清晰。',
    xrdAnalysis: {
      analyzed: true,
      analysisDate: '2023-12-10',
      labName: 'University of Arizona',
      mineralIdentified: 'Fe-Ni合金 (锥纹石 + 镍纹石)',
      notes: '典型的八面体铁陨石结构，锥纹石带宽约1.2mm，分类为IVA。',
    },
    createdAt: '2023-12-10T14:00:00Z',
    updatedAt: '2023-12-10T14:00:00Z',
  },
  {
    id: 'sci-006',
    specimenId: 'spec-006',
    densityGcm3: 3.18,
    refractiveIndexMin: 1.434,
    refractiveIndexMax: 1.434,
    magneticProperty: 'none',
    fluorescenceUV: 'strong',
    fluorescenceUVColor: '蓝紫色 / 白色',
    fluorescenceLW: 'strong',
    fluorescenceSW: 'moderate',
    rarity: 'uncommon',
    rarityNotes: '双色萤石晶体较具观赏价值，柿竹园产高品质标本具有一定市场价值。',
    testDate: '2024-04-10',
    labName: '本中心实验室',
    notes: '短波紫外线下呈现蓝白色荧光，长波紫外线下呈现蓝紫色荧光。分带现象明显。',
    xrdAnalysis: {
      analyzed: false,
    },
    createdAt: '2024-04-10T10:00:00Z',
    updatedAt: '2024-04-10T10:00:00Z',
  },
];

export const mockDisplayLocations: DisplayLocation[] = [
  {
    id: 'loc-001',
    name: '主展柜 A',
    type: 'cabinet',
    locationCode: 'CAB-A',
    description: '客厅主展示墙左侧展柜，四层玻璃门展柜，LED照明。',
    capacity: 50,
  },
  {
    id: 'loc-002',
    name: '主展柜 B',
    type: 'cabinet',
    locationCode: 'CAB-B',
    description: '客厅主展示墙右侧展柜，四层玻璃门展柜，LED照明。',
    capacity: 50,
  },
  {
    id: 'loc-003',
    name: '陨石展柜',
    type: 'cabinet',
    locationCode: 'CAB-MET',
    description: '书房独立展柜，专门用于陨石收藏展示。',
    capacity: 30,
  },
  {
    id: 'loc-004',
    name: '抽屉 1-A',
    type: 'drawer',
    locationCode: 'DRW-1-A',
    description: '储物柜第一层A抽屉，带分隔，用于小型标本储存。',
    capacity: 100,
    parentId: 'loc-001',
  },
  {
    id: 'loc-005',
    name: '抽屉 1-B',
    type: 'drawer',
    locationCode: 'DRW-1-B',
    description: '储物柜第一层B抽屉，带分隔，用于小型标本储存。',
    capacity: 100,
    parentId: 'loc-001',
  },
  {
    id: 'loc-006',
    name: '储存盒 A-01',
    type: 'storage-box',
    locationCode: 'BOX-A-01',
    description: '中号亚克力储存盒，带海绵内衬。',
    capacity: 20,
    parentId: 'loc-004',
  },
];

export const mockDisplayPlacements: DisplayPlacement[] = [
  {
    id: 'dpl-001',
    specimenId: 'spec-001',
    locationId: 'loc-001',
    positionIndex: 1,
    displayOrder: 1,
    categoryLabel: '硅酸盐矿物 - 架状硅酸盐',
    onDisplay: true,
    arrangementNotes: '放置于主展柜A第二层中央位置，搭配标签卡说明。',
    placedAt: '2024-03-16T10:00:00Z',
    updatedAt: '2024-03-16T10:00:00Z',
  },
  {
    id: 'dpl-002',
    specimenId: 'spec-002',
    locationId: 'loc-001',
    positionIndex: 2,
    displayOrder: 2,
    categoryLabel: '硫化物矿物',
    onDisplay: true,
    arrangementNotes: '放置于主展柜A第二层右侧。',
    placedAt: '2024-01-21T10:00:00Z',
    updatedAt: '2024-01-21T10:00:00Z',
  },
  {
    id: 'dpl-003',
    specimenId: 'spec-003',
    locationId: 'loc-003',
    positionIndex: 1,
    displayOrder: 1,
    categoryLabel: '球粒陨石 - L型',
    onDisplay: true,
    arrangementNotes: '陨石展柜第一层，展示陨石光面并附带分类标签。',
    placedAt: '2023-08-11T10:00:00Z',
    updatedAt: '2023-08-11T10:00:00Z',
  },
  {
    id: 'dpl-004',
    specimenId: 'spec-004',
    locationId: 'loc-002',
    positionIndex: 1,
    displayOrder: 1,
    categoryLabel: '碳酸盐矿物',
    onDisplay: true,
    arrangementNotes: '主展柜B第一层中央，重点展示位置。',
    placedAt: '2024-02-09T10:00:00Z',
    updatedAt: '2024-02-09T10:00:00Z',
  },
  {
    id: 'dpl-005',
    specimenId: 'spec-005',
    locationId: 'loc-003',
    positionIndex: 2,
    displayOrder: 2,
    categoryLabel: '铁陨石 - IVA群',
    onDisplay: true,
    arrangementNotes: '陨石展柜第一层右侧，展示维德曼花纹。',
    placedAt: '2023-11-26T10:00:00Z',
    updatedAt: '2023-11-26T10:00:00Z',
  },
  {
    id: 'dpl-006',
    specimenId: 'spec-006',
    locationId: 'loc-002',
    positionIndex: 2,
    displayOrder: 2,
    categoryLabel: '卤化物矿物',
    onDisplay: false,
    arrangementNotes: '主展柜B第二层，待调整位置。',
    placedAt: '2024-04-03T10:00:00Z',
    updatedAt: '2024-05-01T10:00:00Z',
  },
];

export const mockLoanRecords: LoanRecord[] = [
  {
    id: 'loan-001',
    specimenIds: ['spec-005'],
    borrowerType: 'museum',
    borrowerName: '上海天文博物馆',
    institution: '上海科技馆分馆',
    contactPerson: '张博士',
    contactEmail: 'zhang@shanghaitianwen.org.cn',
    contactPhone: '021-5555-8888',
    loanDate: '2024-04-01',
    expectedReturnDate: '2024-07-01',
    actualReturnDate: '2024-06-28',
    status: 'returned',
    purpose: '临时展览',
    exhibitionName: '天外来客 - 陨石的奥秘特展',
    exhibitionLocation: '上海天文博物馆，第三展厅',
    conditions: '恒温恒湿环境，专人看护，展柜锁定。保险金额：￥18,000',
    insuranceAmount: 18000,
    notes: '展览期间标本状况良好，按时归还，无损坏。',
    createdAt: '2024-03-25T09:00:00Z',
    updatedAt: '2024-06-28T16:00:00Z',
  },
  {
    id: 'loan-002',
    specimenIds: ['spec-001', 'spec-002'],
    borrowerType: 'exhibition',
    borrowerName: '2024国际矿物宝石博览会',
    institution: '中国矿物收藏家协会',
    contactPerson: '刘主任',
    contactEmail: 'liu@mineralexpo.org.cn',
    loanDate: '2024-05-10',
    expectedReturnDate: '2024-05-25',
    status: 'on-loan',
    purpose: '公开展览',
    exhibitionName: '第十届中国（长沙）国际矿物宝石博览会',
    exhibitionLocation: '长沙国际会展中心，精品展区A3展位',
    conditions: '三层展柜，24小时安保和监控，全额保险。',
    insuranceAmount: 8000,
    notes: '作为协会会员出借，配合个人收藏专题展示。',
    createdAt: '2024-05-05T14:00:00Z',
    updatedAt: '2024-05-10T09:00:00Z',
  },
];

export const mockKnowledgeNotes: KnowledgeNote[] = [
  {
    id: 'note-001',
    title: '七大晶系概述',
    category: 'crystallography',
    content: `# 晶体的七大晶系

晶体根据其宏观对称性可分为七大晶系，每个晶系具有特定的晶胞参数和对称元素。

## 1. 等轴晶系 (Cubic / Isometric)
- 晶胞参数：a = b = c，α = β = γ = 90°
- 最高对称性，具有4个三次对称轴
- 代表矿物：萤石、黄铁矿、石榴石、金刚石

## 2. 四方晶系 (Tetragonal)
- 晶胞参数：a = b ≠ c，α = β = γ = 90°
- 具有1个四次对称轴
- 代表矿物：锆石、金红石、锐钛矿

## 3. 斜方晶系 (Orthorhombic)
- 晶胞参数：a ≠ b ≠ c，α = β = γ = 90°
- 具有3个互相垂直的二次对称轴
- 代表矿物：橄榄石、黄玉、霰石

## 4. 六方晶系 (Hexagonal)
- 晶胞参数：a = b ≠ c，α = β = 90°，γ = 120°
- 具有1个六次对称轴
- 代表矿物：磷灰石、绿柱石、铍

## 5. 三方晶系 (Trigonal)
- 有时归入六方晶系作为一个亚族
- 具有1个三次对称轴
- 代表矿物：石英、方解石、刚玉

## 6. 单斜晶系 (Monoclinic)
- 晶胞参数：a ≠ b ≠ c，α = γ = 90°，β ≠ 90°
- 具有1个二次对称轴或一个对称面
- 代表矿物：石膏、正长石、角闪石、孔雀石

## 7. 三斜晶系 (Triclinic)
- 晶胞参数：a ≠ b ≠ c，α ≠ β ≠ γ ≠ 90°
- 仅具有对称中心或完全没有对称元素
- 代表矿物：斜长石、蓝晶石、硅灰石

## 研究方法
晶系的确定通常通过X射线衍射分析（XRD），测量晶胞参数和对称元素。偏光显微镜下观察晶体的消光特征也是重要辅助手段。`,
    tags: ['晶系', '晶体化学', '对称', 'XRD'],
    relatedSpecimenIds: ['spec-001', 'spec-002', 'spec-004', 'spec-006'],
    references: '《结晶学及矿物学》(第三版)，赵珊茸等编，高等教育出版社；《Manual of Mineralogy》，Klein & Hurlbut',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-02-15T14:30:00Z',
  },
  {
    id: 'note-002',
    title: '矿物的生成环境与成因类型',
    category: 'formation',
    content: `# 矿物的生成环境与成因类型

矿物的形成与地质作用密切相关，根据成因可分为以下几大类：

## 一、内生作用 (Endogenic Processes)

### 1. 岩浆作用
- 温度范围：600°C ~ 1300°C
- 形成矿物：橄榄石、辉石、角闪石、长石、石英、云母
- 典型岩石：超基性岩、基性岩、中性岩、酸性岩
- 有用矿产：铬铁矿（超基性岩）、钒钛磁铁矿（基性岩）

### 2. 伟晶作用
- 温度范围：400°C ~ 600°C
- 特点：矿物颗粒粗大，稀有元素富集
- 形成矿物：绿柱石、电气石、黄玉、锂辉石、铯榴石
- 产地实例：新疆阿尔泰、四川甲基卡

### 3. 接触变质作用
- 发生在侵入体与围岩接触带
- 形成矿物：石榴石、透辉石、硅灰石、符山石
- 矽卡岩型矿床：铁、铜、钨、锡等

### 4. 区域变质作用
- 温度压力范围广
- 形成矿物：红柱石/蓝晶石/矽线石（Al₂SiO₅同质多象）、十字石、堇青石

## 二、外生作用 (Exogenic Processes)

### 1. 风化作用
- 氧化带矿物：褐铁矿、硬锰矿、孔雀石、蓝铜矿
- 淋积作用：高岭石、多水高岭石

### 2. 沉积作用
- 机械沉积：砂金、金刚石、锡石（砂矿）
- 化学沉积：石膏、石盐、钾盐（蒸发岩）
- 生物沉积：煤、油页岩、硅藻土、磷块岩

## 三、变质作用与成矿序列
根据PT条件递增的区域变质序列：
**浊沸石相 → 葡萄石-绿纤石相 → 绿片岩相 → 角闪岩相 → 麻粒岩相 → 榴辉岩相**

## 实例分析
**孔雀石 (Cu₂(CO₃)(OH)₂)**
- 典型的氧化带次生矿物
- 由含铜硫化物矿床风化后，经碳酸水溶液作用沉淀形成
- 常与蓝铜矿、赤铜矿、自然铜共生
- 产地：刚果（金）加丹加、中国广东石菉、湖北铜绿山`,
    tags: ['矿床学', '岩石学', '成因矿物学', '变质作用', '岩浆作用'],
    relatedSpecimenIds: ['spec-004'],
    references: '《矿床学》，翟裕生主编，地质出版社；《成因矿物学概论》，陈光远',
    createdAt: '2024-02-20T09:00:00Z',
    updatedAt: '2024-03-10T16:00:00Z',
  },
  {
    id: 'note-003',
    title: '陨石分类体系详解',
    category: 'meteorite-science',
    content: `# 陨石分类体系详解

陨石是来自太阳系小天体的碎片，根据其成分、结构和成因可分为三大类，每类又有详细的细分。

## 一、球粒陨石 (Chondrites)

最常见的陨石类型，约占目击降落的80%以上。特征是含有球粒（毫米级的球形硅酸盐颗粒）。

### 1. 普通球粒陨石 (Ordinary Chondrites)
占球粒陨石的~80%，分为三个化学群：
- **H群**（高铁型）：金属含量15-20%，总铁约27%
- **L群**（低铁型）：金属含量4-10%，总铁约22%
- **LL群**（低铁低金属型）：金属含量1-3%，总铁约20%

每个群按岩石学类型分为3-7型：
- 3型：最原始，球粒保存完好
- 4-6型：热变质程度递增，球粒逐渐模糊
- 7型：强变质，接近熔融

### 2. 碳质球粒陨石 (Carbonaceous Chondrites)
含有机化合物和水，代表最原始的太阳系物质：
- CI群：I型碳质球粒，化学成分代表太阳系原始成分
- CM群：Murchison型，含丰富的氨基酸等有机物
- CV群：Vigarano型，含富铝包体（CAI）
- CO群：Ornans型
- CR群：Renazzo型

### 3. 顽火辉石球粒陨石 (Enstatite Chondrites)
高度还原环境形成，含有硫化亚硅等还原矿物。

## 二、无球粒陨石 (Achondrites)

经历过熔融分异，无球粒结构，类似地球上的火成岩。

### 1. 原始无球粒陨石
- 古铜辉石无球粒陨石（Aubrites）
- 顽火辉石无球粒陨石（Angrites）

### 2. 分异型无球粒陨石
- HED族：来自灶神星（Vesta）
  - 古铜钙长无球粒陨石（Howardites）
  - 钙长辉长无球粒陨石（Eucrites）
  - 古铜辉石无球粒陨石（Diogenites）
- 火星陨石（SNC族）：Shergottites, Nakhlites, Chassignites
- 月球陨石：来自月球，有长石角砾岩、玄武岩等类型

## 三、铁陨石 (Iron Meteorites)

主要由铁镍合金组成，按化学成分和结构分类：

### 结构分类
- **六面体铁陨石**（Hexahedrites）：几乎全为锥纹石
- **八面体铁陨石**（Octahedrites）：锥纹石+镍纹石，显示维德曼花纹
  - 按带宽细分：极细粒(Ogg)→细粒(Og)→中等(Om)→粗粒(Oc)→极粗粒(Ogg)
- **富镍中陨铁**（Ataxites）：无明显结构，镍含量>16%

### 化学分类（Ge-Ga分类法）
IAB、IC、IIAB、IIC、IID、IIE、IIG、IIIAB、IIIE、IIIF、IVA、IVB 等共13个化学群。

**示例：Muonionalusta (IVA 八面体铁陨石)**
- 瑞典发现，1906年首次记录
- 铁纹石带宽约1.2mm，属于中粒八面体
- 年龄约45亿年，是已知最古老的陨石之一

## 四、石铁陨石 (Stony-iron Meteorites)

铁镍金属和硅酸盐大致各占一半：
- **橄榄陨铁（Pallasites）**：橄榄石晶体嵌布在铁镍金属中，最美丽的陨石类型
- **中铁陨石（Mesosiderites）**：角砾状结构，硅酸盐+金属

## 五、陨石鉴定要点

1. **熔壳**：黑色/深褐色的玻璃质表层，约1mm厚
2. **气印**：表面拇指按压状的凹坑
3. **磁性**：大部分球粒陨石和铁陨石具有磁性
4. **密度**：铁陨石7-8 g/cm³，球粒陨石3-3.8 g/cm³
5. **切面特征**：球粒结构、金属颗粒、维德曼花纹（需蚀刻）
6. **元素分析**：Ni含量（>5%可疑为铁陨石）、Ir等铂族元素异常
`,
    tags: ['陨石学', '行星科学', '分类学', '球粒', '维德曼花纹', '碳质球粒陨石'],
    relatedSpecimenIds: ['spec-003', 'spec-005'],
    references: '《Meteorites Classification and Properties》，Weiss et al.；《陨石学》，王道德等；Meteoritical Bulletin Database',
    createdAt: '2023-09-20T10:00:00Z',
    updatedAt: '2024-01-05T15:00:00Z',
  },
  {
    id: 'note-004',
    title: '莫氏硬度及实用测试方法',
    category: 'mineral-properties',
    content: `# 莫氏硬度及实用测试方法

硬度是矿物抵抗外力机械作用的强度，是矿物鉴定中最实用的物理性质之一。

## 莫氏硬度标准（Friedrich Mohs, 1822）

| 硬度等级 | 标准矿物 | 化学式 | 简易替代物 |
|---------|---------|--------|----------|
| 1 | 滑石 | Mg₃Si₄O₁₀(OH)₂ | 石墨、皮肤（~1.5） |
| 2 | 石膏 | CaSO₄·2H₂O | 指甲（~2.5） |
| 3 | 方解石 | CaCO₃ | 铜币（~3.5） |
| 4 | 萤石 | CaF₂ | 铁钉（~4） |
| 5 | 磷灰石 | Ca₅(PO₄)₃(F,Cl,OH) | 小刀/钢锉（~5.5） |
| 6 | 正长石 | KAlSi₃O₈ | 玻璃片（~5.5-6） |
| 7 | 石英 | SiO₂ | 钢锉（~6.5-7） |
| 8 | 黄玉 | Al₂SiO₄(F,OH)₂ | 碳化硅砂纸（~8-9） |
| 9 | 刚玉 | Al₂O₃ | 碳化钨（~9） |
| 10 | 金刚石 | C | 钻石工具 |

## 测试方法与注意事项

### 1. 刻划法（标准方法）
- **原则**：硬度大的矿物可以刻划硬度小的矿物，反之则不能
- **操作**：选择矿物上新鲜、平整的面，用标准矿物（或工具）轻划
- **判断**：
  - 留下刻痕 = 被测矿物 < 标准矿物
  - 无痕迹 = 被测矿物 ≥ 标准矿物
  - 粉末痕迹 = 需要用手擦拭判断

### 2. 避免误判的关键点
- ⚠️ 不要在风化面上测试
- ⚠️ 注意区分刻痕和矿物脱落产生的粉末
- ⚠️ 沿解理面方向可能显示较低的硬度
- ⚠️ 某些矿物具有各向异性硬度（如蓝晶石：平行延长=4.5，垂直=7）

### 3. 常见矿物硬度速查

| 矿物 | 硬度 | 矿物 | 硬度 |
|-----|-----|-----|-----|
| 石墨 | 1-2 | 黄铁矿 | 6-6.5 |
| 自然硫 | 1.5-2.5 | 电气石 | 7-7.5 |
| 孔雀石 | 3.5-4 | 锆石 | 7.5 |
| 萤石 | 4 | 尖晶石 | 7.5-8 |
| 磷氯铅矿 | 3.5-4 | 刚玉 | 9 |
| 磁铁矿 | 5.5-6.5 | 金刚石 | 10 |

## 本收藏标本实测记录

| 标本 | 实测硬度 | 文献值 |
|-----|---------|-------|
| 石英晶体 (spec-001) | 7 | 7 |
| 黄铁矿 (spec-002) | 6-6.5 | 6-6.5 |
| 孔雀石 (spec-004) | 3.5-4 | 3.5-4 |
| 萤石 (spec-006) | 4 | 4 |

## 绝对硬度与莫氏硬度的关系

莫氏硬度是相对硬度（刻划硬度），与绝对硬度（压入硬度，维氏硬度计测量）不成线性关系：

- 莫氏 1-2 相当于维氏 ~1-65 HV
- 莫氏 5-6 相当于维氏 ~530-800 HV
- 莫氏 9-10 差距最大，相当于维氏 2100-10000 HV

金刚石（10）的绝对硬度约为刚玉（9）的4倍以上！`,
    tags: ['矿物鉴定', '物理性质', '硬度', '莫氏硬度计'],
    relatedSpecimenIds: ['spec-001', 'spec-002', 'spec-004', 'spec-006'],
    references: '《矿物学简明教程》，戈定夷；《Descriptive Mineralogy》，Klein & Dutrow',
    createdAt: '2024-03-05T11:00:00Z',
    updatedAt: '2024-04-20T13:00:00Z',
  },
];
