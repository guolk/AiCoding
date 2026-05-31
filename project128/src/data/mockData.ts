
import { Jewelry, Valuation, Insurance, Certificate, Maintenance, Repair, Outfit, MaterialCare } from '../types';

export const mockJewelries: Jewelry[] = [
  {
    id: '1',
    name: '祖母绿戒指',
    type: 'ring',
    material: '18K白金',
    gemstone: '祖母绿 2.5ct',
    brand: 'Cartier',
    purchaseDate: '2023-05-15',
    purchasePrice: 88000,
    purchaseChannel: '巴黎专卖店',
    story: {
      giver: '丈夫',
      occasion: '结婚十周年纪念',
      meaning: '象征永恒的爱情，十年婚姻如宝石般珍贵璀璨'
    },
    suitableOccasions: ['formal', 'wedding', 'party'],
    photos: [
      { id: 'p1', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20emerald%20ring%20on%20velvet%20background%20jewelry%20photography&image_size=square_hd', type: 'detail', description: '戒指细节特写' },
      { id: 'p2', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hand%20wearing%20emerald%20diamond%20ring%20elegant%20jewelry&image_size=square_hd', type: 'wear', description: '佩戴效果' }
    ],
    tags: ['祖母绿', 'Cartier', '戒指', '收藏级'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-20T14:30:00Z',
    wearCount: 12,
    lastWornDate: '2024-05-20'
  },
  {
    id: '2',
    name: '钻石项链',
    type: 'necklace',
    material: 'Pt950铂金',
    gemstone: '钻石 1.2ct',
    brand: 'Tiffany & Co.',
    purchaseDate: '2022-12-25',
    purchasePrice: 128000,
    purchaseChannel: '纽约第五大道旗舰店',
    story: {
      giver: '自己',
      occasion: '升职奖励',
      meaning: '人生重要里程碑的纪念，努力工作的回报'
    },
    suitableOccasions: ['formal', 'wedding', 'business'],
    photos: [
      { id: 'p3', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20diamond%20necklace%20on%20black%20background%20luxury%20jewelry&image_size=square_hd', type: 'detail', description: '项链全景' }
    ],
    tags: ['钻石', 'Tiffany', '项链', '经典款'],
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-02-28T16:45:00Z',
    wearCount: 8,
    lastWornDate: '2024-04-15'
  },
  {
    id: '3',
    name: '珍珠耳环',
    type: 'earring',
    material: '18K黄金',
    gemstone: '南洋珍珠 12mm',
    brand: 'Mikimoto',
    purchaseDate: '2023-08-10',
    purchasePrice: 35000,
    purchaseChannel: '东京银座专卖店',
    story: {
      giver: '母亲',
      occasion: '30岁生日',
      meaning: '母亲的传家宝，承载着母爱与祝福'
    },
    suitableOccasions: ['daily', 'formal', 'business'],
    photos: [
      { id: 'p4', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=south%20sea%20pearl%20earrings%20gold%20setting%20luxury%20jewelry&image_size=square_hd', type: 'detail', description: '珍珠耳环特写' }
    ],
    tags: ['珍珠', 'Mikimoto', '耳环', '日常'],
    createdAt: '2024-02-05T12:00:00Z',
    updatedAt: '2024-04-10T09:20:00Z',
    wearCount: 25,
    lastWornDate: '2024-05-28'
  },
  {
    id: '4',
    name: '红宝石手链',
    type: 'bracelet',
    material: '18K玫瑰金',
    gemstone: '红宝石 3.0ct',
    brand: 'Bulgari',
    purchaseDate: '2022-06-18',
    purchasePrice: 156000,
    purchaseChannel: '罗马旗舰店',
    story: {
      giver: '闺蜜',
      occasion: '毕业典礼',
      meaning: '见证青春与友谊，开启人生新篇章'
    },
    suitableOccasions: ['party', 'formal', 'wedding'],
    photos: [
      { id: 'p5', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ruby%20bracelet%20rose%20gold%20luxury%20jewelry%20on%20velvet&image_size=square_hd', type: 'detail', description: '红宝石手链' }
    ],
    tags: ['红宝石', 'Bulgari', '手链', '晚宴'],
    createdAt: '2024-01-20T15:00:00Z',
    updatedAt: '2024-03-15T11:30:00Z',
    wearCount: 5,
    lastWornDate: '2024-03-01'
  },
  {
    id: '5',
    name: '蓝宝石胸针',
    type: 'brooch',
    material: '18K白金',
    gemstone: '蓝宝石 4.5ct',
    brand: 'Van Cleef & Arpels',
    purchaseDate: '2021-11-11',
    purchasePrice: 220000,
    purchaseChannel: '拍卖行',
    story: {
      giver: '祖父',
      occasion: '家族传承',
      meaning: '家族三代人的珍藏，见证家族历史'
    },
    suitableOccasions: ['formal', 'wedding', 'business'],
    photos: [
      { id: 'p6', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sapphire%20brooch%20vintage%20design%20luxury%20jewelry&image_size=square_hd', type: 'detail', description: '蓝宝石胸针' }
    ],
    tags: ['蓝宝石', 'VCA', '胸针', '古董'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
    wearCount: 3,
    lastWornDate: '2024-02-14'
  },
  {
    id: '6',
    name: '银饰手链',
    type: 'bracelet',
    material: '925纯银',
    gemstone: '无',
    brand: 'Pandora',
    purchaseDate: '2023-02-14',
    purchasePrice: 2800,
    purchaseChannel: '官网',
    story: {
      giver: '妹妹',
      occasion: '情人节',
      meaning: '姐妹情深，每年添加一颗串珠记录美好时光'
    },
    suitableOccasions: ['daily', 'party'],
    photos: [
      { id: 'p7', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=silver%20charm%20bracelet%20pandora%20style%20jewelry&image_size=square_hd', type: 'detail', description: '银饰手链' }
    ],
    tags: ['银饰', 'Pandora', '手链', '日常'],
    createdAt: '2024-03-01T14:00:00Z',
    updatedAt: '2024-05-01T16:00:00Z',
    wearCount: 45,
    lastWornDate: '2024-05-30'
  }
];

export const mockValuations: Valuation[] = [
  { id: 'v1', jewelryId: '1', value: 95000, date: '2023-06-01', source: 'Cartier官方估值', notes: '首次估值' },
  { id: 'v2', jewelryId: '1', value: 102000, date: '2023-12-01', source: '第三方鉴定机构', notes: '半年后市值上涨' },
  { id: 'v3', jewelryId: '1', value: 110000, date: '2024-05-01', source: '拍卖行预估价', notes: '市场需求强劲' },
  { id: 'v4', jewelryId: '2', value: 135000, date: '2023-06-01', source: 'Tiffany官方', notes: '' },
  { id: 'v5', jewelryId: '2', value: 142000, date: '2024-01-01', source: '第三方鉴定', notes: '' },
  { id: 'v6', jewelryId: '3', value: 38000, date: '2023-09-01', source: 'Mikimoto', notes: '' },
  { id: 'v7', jewelryId: '4', value: 165000, date: '2023-12-01', source: 'Bulgari', notes: '' },
  { id: 'v8', jewelryId: '5', value: 250000, date: '2024-03-01', source: '拍卖行', notes: '古董升值' }
];

export const mockInsurances: Insurance[] = [
  {
    id: 'i1',
    jewelryId: '1',
    policyNumber: 'INS-GEM-2023-001',
    coverage: 110000,
    startDate: '2023-06-01',
    endDate: '2024-05-31',
    provider: '平安保险',
    claims: []
  },
  {
    id: 'i2',
    jewelryId: '2',
    policyNumber: 'INS-GEM-2023-002',
    coverage: 140000,
    startDate: '2023-01-01',
    endDate: '2024-12-31',
    provider: '太平洋保险',
    claims: []
  },
  {
    id: 'i3',
    jewelryId: '5',
    policyNumber: 'INS-GEM-2022-001',
    coverage: 250000,
    startDate: '2022-01-01',
    endDate: '2024-12-31',
    provider: '友邦保险',
    claims: []
  }
];

export const mockCertificates: Certificate[] = [
  { id: 'c1', jewelryId: '1', type: 'GIA', number: 'GIA-2023-12345', issueDate: '2023-04-15', issuer: 'GIA', imageUrl: '' },
  { id: 'c2', jewelryId: '2', type: 'GIA', number: 'GIA-2022-67890', issueDate: '2022-11-20', issuer: 'GIA', imageUrl: '' },
  { id: 'c3', jewelryId: '3', type: 'NGTC', number: 'NGTC-2023-54321', issueDate: '2023-07-10', issuer: '国家珠宝玉石质量监督检验中心', imageUrl: '' },
  { id: 'c4', jewelryId: '5', type: 'IGI', number: 'IGI-2021-98765', issueDate: '2021-10-01', issuer: 'IGI', imageUrl: '' }
];

export const mockMaintenances: Maintenance[] = [
  { id: 'm1', jewelryId: '1', type: 'clean', date: '2024-04-15', method: '超声波清洗', notes: '定期清洁，检查镶爪', nextReminderDate: '2024-10-15' },
  { id: 'm2', jewelryId: '3', type: 'clean', date: '2024-03-20', method: '专业珠宝清洁液', notes: '珍珠保养，避免化学物质', nextReminderDate: '2024-06-20' },
  { id: 'm3', jewelryId: '2', type: 'inspection', date: '2024-02-01', method: 'Tiffany官方检查', notes: '检查链条磨损情况', nextReminderDate: '2024-08-01' },
  { id: 'm4', jewelryId: '6', type: 'polish', date: '2024-05-01', method: '擦银布抛光', notes: '去除氧化层', nextReminderDate: '2024-08-01' }
];

export const mockRepairs: Repair[] = [
  { id: 'r1', jewelryId: '1', description: '镶爪加固', date: '2024-01-15', cost: 800, notes: '专业珠宝师维修，更换18K金镶爪' },
  { id: 'r2', jewelryId: '6', description: '扣环修复', date: '2024-02-20', cost: 150, notes: '手链扣环松动修复' }
];

export const mockOutfits: Outfit[] = [
  {
    id: 'o1',
    name: '晚宴造型',
    occasion: 'formal',
    date: '2024-05-20',
    jewelryIds: ['1', '2'],
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20woman%20wearing%20diamond%20necklace%20and%20emerald%20ring%20evening%20gown&image_size=square_hd',
    notes: '搭配黑色晚礼服，优雅高贵',
    wearCount: 3,
    lastWornDate: '2024-05-20'
  },
  {
    id: 'o2',
    name: '日常通勤',
    occasion: 'daily',
    date: '2024-05-28',
    jewelryIds: ['3', '6'],
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20woman%20wearing%20pearl%20earrings%20office%20attire&image_size=square_hd',
    notes: '简约职业装，低调不失品味',
    wearCount: 15,
    lastWornDate: '2024-05-28'
  },
  {
    id: 'o3',
    name: '婚礼嘉宾',
    occasion: 'wedding',
    date: '2024-04-15',
    jewelryIds: ['2', '4'],
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=wedding%20guest%20wearing%20diamond%20necklace%20and%20ruby%20bracelet%20pink%20dress&image_size=square_hd',
    notes: '粉色连衣裙搭配，温婉动人',
    wearCount: 2,
    lastWornDate: '2024-04-15'
  }
];

export const materialCareData = [
  {
    material: '黄金',
    tips: [
      '避免接触水银、铅等金属',
      '佩戴后用软布擦拭表面',
      '避免与硬物摩擦碰撞',
      '定期专业清洁保养'
    ],
    warning: '避免接触漂白剂和含氯化学品，游泳时请取下',
    cleaningFrequency: '每3-6个月'
  },
  {
    material: '铂金',
    tips: [
      '定期用软布擦拭保持光泽',
      '避免接触化学品',
      '单独存放避免划痕',
      '专业抛光可恢复原有光泽'
    ],
    warning: '铂金虽然坚硬但仍会被钻石划伤，请单独存放',
    cleaningFrequency: '每6个月'
  },
  {
    material: '银饰',
    tips: [
      '佩戴后用擦银布擦拭',
      '不佩戴时放入密封袋',
      '避免接触温泉水和硫磺',
      '氧化时可用洗银水或牙膏清洁'
    ],
    warning: '银饰容易氧化变黑，避免与香水、化妆品直接接触',
    cleaningFrequency: '每月或氧化时'
  },
  {
    material: '珍珠',
    tips: [
      '最后佩戴，最先取下',
      '用柔软的干布擦拭',
      '避免接触香水、发胶等化学品',
      '佩戴后再化妆喷香水'
    ],
    warning: '珍珠硬度很低，避免与其他珠宝摩擦，切勿用超声波清洗',
    cleaningFrequency: '每次佩戴后擦拭'
  },
  {
    material: '钻石',
    tips: [
      '定期用温和的肥皂水清洁',
      '用软毛刷轻轻刷洗',
      '检查镶爪是否牢固',
      '避免剧烈撞击'
    ],
    warning: '钻石亲油，接触油污会失去光泽，烹饪时建议取下',
    cleaningFrequency: '每月'
  },
  {
    material: '祖母绿',
    tips: [
      '用温和的肥皂水清洁',
      '避免超声波和蒸汽清洁',
      '避免剧烈温度变化',
      '单独存放避免磕碰'
    ],
    warning: '祖母绿通常有内含物，脆性较大，避免撞击和高温',
    cleaningFrequency: '每3个月'
  }
];
