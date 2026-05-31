import { MediaItem, WishlistItem, Shelf } from '@/types'
import { generateId } from '@/utils/helpers'

export const mockMedia: MediaItem[] = [
  {
    id: generateId(),
    title: '星际穿越',
    mediaType: 'bluray',
    barcode: '1234567890123',
    director: '克里斯托弗·诺兰',
    releaseYear: 2014,
    genre: ['科幻', '冒险', '剧情'],
    duration: 169,
    description: '一队探险家利用他们针对虫洞的新发现，超越人类对于太空旅行的极限，从而开始在广袤的宇宙中进行星际航行的故事。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Interstellar%20movie%20bluray%20cover%20with%20space%20scene%20and%20blackhole&image_size=portrait_4_3',
    region: 'A区',
    edition: 'limited',
    editionDescription: '铁盒限定版',
    editionFeatures: ['导演评论音轨', '幕后花絮', '删除场景'],
    condition: {
      cover: 'near_mint',
      disc: 'mint',
      booklet: 'very_good',
      overall: 'near_mint',
      notes: '铁盒有轻微划痕'
    },
    location: {
      shelf: 1,
      layer: 2,
      position: 5,
      notes: '正面朝外'
    },
    value: {
      purchasePrice: 280,
      purchaseDate: '2023-06-15',
      purchaseChannel: '京东',
      purchaseNotes: '618促销价',
      currentEstimate: 350,
      lastUpdated: '2024-03-01',
      valueHistory: [
        { id: generateId(), mediaId: '', estimate: 280, source: '购入价', date: '2023-06-15' },
        { id: generateId(), mediaId: '', estimate: 320, source: '闲鱼', date: '2023-12-01' },
        { id: generateId(), mediaId: '', estimate: 350, source: 'eBay', date: '2024-03-01' }
      ]
    },
    lending: {
      status: 'available'
    },
    rating: {
      personalScore: 9.5,
      review: '诺兰的经典之作，画面震撼，剧情发人深省。铁盒版制作精良，值得收藏。',
      isRecommended: true,
      recommendedTo: ['张三', '李四'],
      lastUpdated: '2024-02-10'
    },
    createdAt: '2023-06-15T10:00:00Z',
    updatedAt: '2024-03-01T14:30:00Z'
  },
  {
    id: generateId(),
    title: '肖申克的救赎',
    mediaType: 'dvd',
    barcode: '9876543210987',
    director: '弗兰克·德拉邦特',
    releaseYear: 1994,
    genre: ['剧情', '犯罪'],
    duration: 142,
    description: '银行家安迪被冤枉杀害妻子及其情人，被判处终身监禁。在肖申克监狱中，他结识了瑞德，两人结下了深厚的友谊。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Shawshank%20Redemption%20DVD%20cover%20with%20prison%20scene&image_size=portrait_4_3',
    edition: 'standard',
    editionDescription: '普通版',
    condition: {
      cover: 'good',
      disc: 'very_good',
      booklet: 'good',
      overall: 'good'
    },
    location: {
      shelf: 1,
      layer: 1,
      position: 3
    },
    value: {
      purchasePrice: 50,
      purchaseDate: '2022-03-20',
      purchaseChannel: '淘宝',
      currentEstimate: 45,
      lastUpdated: '2024-01-15',
      valueHistory: [
        { id: generateId(), mediaId: '', estimate: 50, source: '购入价', date: '2022-03-20' },
        { id: generateId(), mediaId: '', estimate: 45, source: '孔夫子', date: '2024-01-15' }
      ]
    },
    lending: {
      status: 'lent',
      borrower: '王五',
      borrowDate: '2024-02-01',
      expectedReturnDate: '2024-03-01',
      notes: '周末观看'
    },
    rating: {
      personalScore: 10,
      review: '影史经典，百看不厌。',
      isRecommended: true,
      recommendedTo: [],
      lastUpdated: '2023-08-20'
    },
    createdAt: '2022-03-20T09:00:00Z',
    updatedAt: '2024-02-01T11:00:00Z'
  },
  {
    id: generateId(),
    title: 'Dark Side of the Moon',
    mediaType: 'vinyl',
    barcode: '1112223334445',
    artist: 'Pink Floyd',
    releaseYear: 1973,
    genre: ['摇滚', '前卫摇滚'],
    description: 'Pink Floyd的经典专辑，被认为是摇滚史上最伟大的专辑之一。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Pink%20Floyd%20Dark%20Side%20of%20the%20Moon%20vinyl%20record%20cover%20with%20prism%20and%20rainbow&image_size=portrait_4_3',
    edition: 'collector',
    editionDescription: '180g重制版',
    editionFeatures: ['180克黑胶', '原封套复刻', '附赠海报'],
    condition: {
      cover: 'very_good',
      disc: 'near_mint',
      booklet: 'good',
      overall: 'very_good',
      notes: '封套边角有轻微磨损'
    },
    location: {
      shelf: 2,
      layer: 1,
      position: 8
    },
    value: {
      purchasePrice: 320,
      purchaseDate: '2023-01-10',
      purchaseChannel: 'Discogs',
      currentEstimate: 450,
      lastUpdated: '2024-02-20',
      valueHistory: [
        { id: generateId(), mediaId: '', estimate: 320, source: '购入价', date: '2023-01-10' },
        { id: generateId(), mediaId: '', estimate: 400, source: 'Discogs', date: '2023-08-15' },
        { id: generateId(), mediaId: '', estimate: 450, source: 'Discogs', date: '2024-02-20' }
      ]
    },
    lending: {
      status: 'available'
    },
    rating: {
      personalScore: 9.8,
      review: '音质极佳，经典中的经典。',
      isRecommended: true,
      recommendedTo: ['赵六'],
      lastUpdated: '2023-11-10'
    },
    createdAt: '2023-01-10T16:00:00Z',
    updatedAt: '2024-02-20T10:00:00Z'
  },
  {
    id: generateId(),
    title: '塞尔达传说：王国之泪',
    mediaType: 'game',
    barcode: '5556667778889',
    publisher: '任天堂',
    releaseYear: 2023,
    genre: ['动作冒险', '开放世界'],
    duration: 0,
    description: '林克的全新冒险，探索广阔的海拉鲁王国天空和地底世界。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Zelda%20Tears%20of%20the%20Kingdom%20Nintendo%20Switch%20game%20cover%20with%20Link%20and%20sky%20islands&image_size=portrait_4_3',
    region: '港版',
    edition: 'standard',
    editionDescription: '普通版',
    condition: {
      cover: 'near_mint',
      disc: 'mint',
      booklet: 'mint',
      overall: 'near_mint',
      notes: '仅拆封，几乎全新'
    },
    location: {
      shelf: 3,
      layer: 2,
      position: 2
    },
    value: {
      purchasePrice: 420,
      purchaseDate: '2023-05-12',
      purchaseChannel: 'Switch官方店',
      purchaseNotes: '首发日购入',
      currentEstimate: 380,
      lastUpdated: '2024-02-10',
      valueHistory: [
        { id: generateId(), mediaId: '', estimate: 420, source: '购入价', date: '2023-05-12' },
        { id: generateId(), mediaId: '', estimate: 380, source: '闲鱼', date: '2024-02-10' }
      ]
    },
    lending: {
      status: 'available'
    },
    rating: {
      personalScore: 9.7,
      review: '神作续作，游戏性爆表。',
      isRecommended: true,
      recommendedTo: [],
      lastUpdated: '2023-12-25'
    },
    createdAt: '2023-05-12T14:00:00Z',
    updatedAt: '2024-02-10T09:00:00Z'
  },
  {
    id: generateId(),
    title: '周杰伦：范特西',
    mediaType: 'cd',
    barcode: '9998887776665',
    artist: '周杰伦',
    releaseYear: 2001,
    genre: ['华语流行', 'R&B'],
    description: '周杰伦的第二张专辑，收录了《双截棍》《爱在西元前》等经典歌曲。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Jay%20Chou%20Fantasy%20album%20CD%20cover%20art%20with%20Chinese%20style&image_size=portrait_4_3',
    edition: 'special',
    editionDescription: '精装版',
    editionFeatures: ['精装纸盒', '写真册', 'MV VCD'],
    condition: {
      cover: 'good',
      disc: 'very_good',
      booklet: 'fair',
      overall: 'good',
      notes: '纸盒有轻微褪色'
    },
    location: {
      shelf: 2,
      layer: 3,
      position: 12
    },
    value: {
      purchasePrice: 120,
      purchaseDate: '2010-08-15',
      purchaseChannel: '当当网',
      currentEstimate: 580,
      lastUpdated: '2024-03-01',
      valueHistory: [
        { id: generateId(), mediaId: '', estimate: 120, source: '购入价', date: '2010-08-15' },
        { id: generateId(), mediaId: '', estimate: 350, source: '闲鱼', date: '2022-06-01' },
        { id: generateId(), mediaId: '', estimate: 580, source: '孔夫子', date: '2024-03-01' }
      ]
    },
    lending: {
      status: 'available'
    },
    rating: {
      personalScore: 9.2,
      review: '周董的巅峰之作，每首歌都经典。',
      isRecommended: true,
      recommendedTo: ['小明', '小红'],
      lastUpdated: '2023-09-15'
    },
    createdAt: '2010-08-15T20:00:00Z',
    updatedAt: '2024-03-01T16:00:00Z'
  }
]

export const mockWishlist: WishlistItem[] = [
  {
    id: generateId(),
    title: '盗梦空间 4K UHD',
    mediaType: 'bluray',
    targetPrice: {
      min: 200,
      max: 280
    },
    currentMarketPrice: 320,
    priority: 'high',
    notes: '想要收藏铁盒版',
    bidHistory: [
      { id: generateId(), wishlistId: '', price: 250, source: '闲鱼', date: '2024-02-15', status: 'lost' },
      { id: generateId(), wishlistId: '', price: 270, source: '淘宝', date: '2024-03-01', status: 'active' }
    ],
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-03-01T08:00:00Z'
  },
  {
    id: generateId(),
    title: 'The Beatles - Abbey Road',
    mediaType: 'vinyl',
    targetPrice: {
      min: 300,
      max: 400
    },
    currentMarketPrice: 450,
    priority: 'medium',
    notes: '寻找原版压制',
    bidHistory: [],
    createdAt: '2024-02-10T14:00:00Z',
    updatedAt: '2024-02-10T14:00:00Z'
  }
]

export const mockShelves: Shelf[] = [
  {
    id: generateId(),
    name: '电影收藏架',
    layers: 5,
    positionsPerLayer: 20,
    notes: '主要存放DVD和蓝光'
  },
  {
    id: generateId(),
    name: '音乐收藏架',
    layers: 4,
    positionsPerLayer: 30,
    notes: '存放黑胶和CD'
  },
  {
    id: generateId(),
    name: '游戏收藏架',
    layers: 3,
    positionsPerLayer: 15,
    notes: '存放游戏卡带和主机游戏'
  }
]
