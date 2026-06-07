export interface Project {
  id: string;
  name: string;
  description: string;
  address: string;
  totalArea: number;
  startDate: string;
  endDate: string;
  status: 'planning' | 'in_progress' | 'completed';
  progress: number;
  totalBudget: number;
  spentAmount: number;
  coverImage: string;
}

export interface Room {
  id: string;
  projectId: string;
  name: string;
  type: 'bedroom' | 'living_room' | 'bathroom' | 'kitchen' | 'balcony';
  area: number;
  floor: number;
  functionAreas: FunctionArea[];
}

export interface FunctionArea {
  id: string;
  roomId: string;
  name: string;
  type: string;
  area: number;
  color: string;
  description: string;
}

export interface DesignVersion {
  id: string;
  projectId: string;
  version: string;
  name: string;
  description: string;
  createdAt: string;
  createdBy: string;
  status: 'draft' | 'reviewing' | 'approved' | 'rejected';
  designElements: DesignElement[];
  inspirationImages: InspirationImage[];
}

export interface DesignElement {
  id: string;
  versionId: string;
  roomId: string;
  category: 'furniture' | 'decoration' | 'lighting' | 'textile' | 'appliance';
  name: string;
  quantity: number;
  unitPrice: number;
  brand: string;
  specifications: string;
  imageUrl: string;
}

export interface InspirationImage {
  id: string;
  versionId: string;
  roomId: string;
  url: string;
  tags: string[];
  description: string;
}

export interface BudgetCategory {
  id: string;
  projectId: string;
  name: string;
  budgetAmount: number;
  spentAmount: number;
  color: string;
  description: string;
}

export interface ExpenseRecord {
  id: string;
  categoryId: string;
  projectId: string;
  name: string;
  amount: number;
  date: string;
  payee: string;
  paymentMethod: string;
  invoiceNo: string;
  remarks: string;
}

export interface ConstructionTask {
  id: string;
  projectId: string;
  name: string;
  type: 'waterproof' | 'electrical' | 'masonry' | 'carpentry' | 'painting' | 'decoration';
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate: string | null;
  actualEndDate: string | null;
  progress: number;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  assignee: string;
  cost: number;
  description: string;
}

export interface ConstructionIssue {
  id: string;
  taskId: string;
  projectId: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  reportedDate: string;
  reportedBy: string;
  resolvedDate: string | null;
  imageUrls: string[];
  solution: string | null;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  address: string;
  category: string;
  rating: number;
  cooperationStatus: 'active' | 'inactive' | 'pending';
  quotations: Quotation[];
}

export interface Quotation {
  id: string;
  supplierId: string;
  projectId: string;
  itemName: string;
  specifications: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  quoteDate: string;
  validUntil: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  remarks: string;
}

export const project: Project = {
  id: 'proj-001',
  name: '西湖畔精品民宿改造项目',
  description: '位于杭州西湖景区的三层民居改造为精品民宿，包含5间客房、公共休息区、厨房餐厅等功能空间，整体风格为现代中式禅意风。',
  address: '浙江省杭州市西湖区龙井路88号',
  totalArea: 320,
  startDate: '2026-03-15',
  endDate: '2026-08-30',
  status: 'in_progress',
  progress: 45,
  totalBudget: 680000,
  spentAmount: 306000,
  coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20chinese%20style%20boutique%20hotel%20exterior%20with%20traditional%20roof%20and%20large%20windows%20surrounded%20by%20green%20bamboo&image_size=landscape_16_9'
};

export const rooms: Room[] = [
  {
    id: 'room-001',
    projectId: 'proj-001',
    name: '主卧套房',
    type: 'bedroom',
    area: 28,
    floor: 2,
    functionAreas: [
      {
        id: 'fa-001',
        roomId: 'room-001',
        name: '睡眠区',
        type: 'sleeping',
        area: 14,
        color: '#D4A574',
        description: '放置1.8米大床及床头柜，配备智能照明系统'
      },
      {
        id: 'fa-002',
        roomId: 'room-001',
        name: '休闲区',
        type: 'relaxation',
        area: 8,
        color: '#4ECDC4',
        description: '靠窗位置设置茶桌和两把椅子，可观赏湖景'
      },
      {
        id: 'fa-003',
        roomId: 'room-001',
        name: '更衣区',
        type: 'dressing',
        area: 6,
        color: '#FF6B6B',
        description: '定制步入式衣柜，配备全身镜和梳妆台'
      }
    ]
  },
  {
    id: 'room-002',
    projectId: 'proj-001',
    name: '公共客厅',
    type: 'living_room',
    area: 42,
    floor: 1,
    functionAreas: [
      {
        id: 'fa-004',
        roomId: 'room-002',
        name: '会客区',
        type: 'reception',
        area: 22,
        color: '#1E3A5F',
        description: 'L型布艺沙发组合，原木茶几，投影电视系统'
      },
      {
        id: 'fa-005',
        roomId: 'room-002',
        name: '阅读区',
        type: 'reading',
        area: 12,
        color: '#9B59B6',
        description: '整面书架墙，舒适单人沙发，可调式阅读灯'
      },
      {
        id: 'fa-006',
        roomId: 'room-002',
        name: '玄关过渡区',
        type: 'entrance',
        area: 8,
        color: '#F39C12',
        description: '换鞋凳、挂衣区、装饰端景台'
      }
    ]
  },
  {
    id: 'room-003',
    projectId: 'proj-001',
    name: '公共卫生间',
    type: 'bathroom',
    area: 12,
    floor: 1,
    functionAreas: [
      {
        id: 'fa-007',
        roomId: 'room-003',
        name: '洗漱区',
        type: 'washing',
        area: 5,
        color: '#3498DB',
        description: '双台盆设计，智能镜柜，大理石台面'
      },
      {
        id: 'fa-008',
        roomId: 'room-003',
        name: '如厕区',
        type: 'toilet',
        area: 3,
        color: '#E74C3C',
        description: '独立隔间，智能马桶，排气系统'
      },
      {
        id: 'fa-009',
        roomId: 'room-003',
        name: '淋浴区',
        type: 'shower',
        area: 4,
        color: '#2ECC71',
        description: '玻璃淋浴房，恒温花洒，大理石防滑地面'
      }
    ]
  }
];

export const designVersions: DesignVersion[] = [
  {
    id: 'ver-001',
    projectId: 'proj-001',
    version: 'V1.0',
    name: '现代禅意方案',
    description: '以原木色调为主，搭配素雅软装，营造宁静自然的居住氛围。注重空间通透性和自然光利用。',
    createdAt: '2026-02-20',
    createdBy: '设计师李明',
    status: 'approved',
    designElements: [
      {
        id: 'de-001',
        versionId: 'ver-001',
        roomId: 'room-001',
        category: 'furniture',
        name: '实木双人床',
        quantity: 1,
        unitPrice: 12800,
        brand: '梵几',
        specifications: '1800x2000mm，黑胡桃木框架',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimalist%20solid%20wood%20bed%20frame%20walnut%20color%20japanese%20style&image_size=square'
      },
      {
        id: 'de-002',
        versionId: 'ver-001',
        roomId: 'room-001',
        category: 'lighting',
        name: '宣纸吊灯',
        quantity: 2,
        unitPrice: 1850,
        brand: '十竹九造',
        specifications: '直径400mm，宣纸灯罩',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=japanese%20style%20rice%20paper%20pendant%20light%20warm%20light&image_size=square'
      },
      {
        id: 'de-003',
        versionId: 'ver-001',
        roomId: 'room-001',
        category: 'textile',
        name: '棉麻床品四件套',
        quantity: 2,
        unitPrice: 1280,
        brand: '无印良品',
        specifications: '1.8米床，本白色',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=white%20cotton%20linen%20bedding%20set%20minimalist%20style&image_size=square'
      },
      {
        id: 'de-004',
        versionId: 'ver-001',
        roomId: 'room-002',
        category: 'furniture',
        name: 'L型布艺沙发',
        quantity: 1,
        unitPrice: 18600,
        brand: '吱音',
        specifications: '3200x1800mm，亚麻面料',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=L%20shaped%20linen%20sofa%20beige%20color%20modern%20minimalist&image_size=square'
      },
      {
        id: 'de-005',
        versionId: 'ver-001',
        roomId: 'room-002',
        category: 'furniture',
        name: '原木大茶几',
        quantity: 1,
        unitPrice: 4500,
        brand: '梵几',
        specifications: '1400x800x450mm，老榆木',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=solid%20wood%20coffee%20table%20natural%20elm%20wood%20rustic%20style&image_size=square'
      },
      {
        id: 'de-006',
        versionId: 'ver-001',
        roomId: 'room-002',
        category: 'decoration',
        name: '陶瓷花瓶摆件',
        quantity: 3,
        unitPrice: 680,
        brand: '景德镇',
        specifications: '手工青瓷，高度30-40cm',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20celadon%20ceramic%20vase%20handmade%20minimalist&image_size=square'
      },
      {
        id: 'de-007',
        versionId: 'ver-001',
        roomId: 'room-003',
        category: 'appliance',
        name: '智能马桶',
        quantity: 1,
        unitPrice: 8500,
        brand: 'TOTO',
        specifications: '卫洗丽系列，自动翻盖',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20smart%20toilet%20white%20ceramic%20bidet%20functions&image_size=square'
      },
      {
        id: 'de-008',
        versionId: 'ver-001',
        roomId: 'room-003',
        category: 'furniture',
        name: '双台盆浴室柜',
        quantity: 1,
        unitPrice: 9800,
        brand: '恒洁',
        specifications: '1500x600mm，岩板台面',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=double%20sink%20bathroom%20vanity%20marble%20countertop%20modern&image_size=square'
      }
    ],
    inspirationImages: [
      {
        id: 'img-001',
        versionId: 'ver-001',
        roomId: 'room-001',
        url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=japanese%20style%20bedroom%20with%20low%20platform%20bed%20tatami%20mats%20natural%20light%20bamboo%20decor&image_size=landscape_4_3',
        tags: ['日式', '原木', '简约', '自然'],
        description: '主卧睡眠区参考：低床架设计，配合柔和的间接照明'
      },
      {
        id: 'img-002',
        versionId: 'ver-001',
        roomId: 'room-001',
        url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cozy%20window%20seat%20tea%20table%20overlooking%20garden%20chinese%20style&image_size=landscape_4_3',
        tags: ['休闲', '窗景', '茶座', '禅意'],
        description: '休闲区参考：靠窗茶座，品茗观景'
      },
      {
        id: 'img-003',
        versionId: 'ver-001',
        roomId: 'room-002',
        url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20chinese%20living%20room%20with%20L%20shaped%20sofa%20wooden%20ceiling%20big%20windows&image_size=landscape_4_3',
        tags: ['新中式', '客厅', '挑高', '通透'],
        description: '客厅整体风格参考：挑高空间，原木梁结构'
      },
      {
        id: 'img-004',
        versionId: 'ver-001',
        roomId: 'room-002',
        url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=floor%20to%20ceiling%20bookshelf%20wall%20with%20reading%20nook%20comfortable%20armchair&image_size=landscape_4_3',
        tags: ['书架', '阅读', '收纳', '文化'],
        description: '阅读区参考：整面书墙，营造书香氛围'
      },
      {
        id: 'img-005',
        versionId: 'ver-001',
        roomId: 'room-003',
        url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=spa%20style%20bathroom%20with%20rain%20shower%20marble%20tiles%20glass%20enclosure&image_size=landscape_4_3',
        tags: ['卫浴', '水疗', '大理石', '轻奢'],
        description: '淋浴区参考：酒店级卫浴配置'
      },
      {
        id: 'img-006',
        versionId: 'ver-001',
        roomId: 'room-003',
        url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=double%20sink%20bathroom%20with%20backlit%20mirror%20marble%20countertop%20gold%20fixtures&image_size=landscape_4_3',
        tags: ['双台盆', '智能镜', '大理石', '现代'],
        description: '洗漱区参考：双台盆设计，提高使用效率'
      }
    ]
  },
  {
    id: 'ver-002',
    projectId: 'proj-001',
    version: 'V2.0',
    name: '轻奢宋韵方案',
    description: '在V1.0基础上提升品质感，融入宋代美学元素，采用更丰富的材质对比，增加金属和玻璃元素点缀，提升整体档次。',
    createdAt: '2026-03-10',
    createdBy: '设计师李明',
    status: 'reviewing',
    designElements: [
      {
        id: 'de-009',
        versionId: 'ver-002',
        roomId: 'room-001',
        category: 'furniture',
        name: '真皮软包床',
        quantity: 1,
        unitPrice: 22800,
        brand: 'Herman Miller',
        specifications: '1800x2000mm，进口头层牛皮',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20leather%20upholstered%20bed%20frame%20dark%20green%20modern&image_size=square'
      },
      {
        id: 'de-010',
        versionId: 'ver-002',
        roomId: 'room-001',
        category: 'lighting',
        name: '黄铜吊灯',
        quantity: 2,
        unitPrice: 3600,
        brand: 'FLOS',
        specifications: '直径450mm，黄铜拉丝',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=brass%20pendant%20light%20modern%20design%20warm%20glow&image_size=square'
      },
      {
        id: 'de-011',
        versionId: 'ver-002',
        roomId: 'room-001',
        category: 'decoration',
        name: '宋代山水挂画',
        quantity: 1,
        unitPrice: 15000,
        brand: '艺术家定制',
        specifications: '1200x800mm，丝绸装裱',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20landscape%20painting%20song%20dynasty%20style%20ink%20wash&image_size=square'
      },
      {
        id: 'de-012',
        versionId: 'ver-002',
        roomId: 'room-002',
        category: 'furniture',
        name: '真皮沙发组合',
        quantity: 1,
        unitPrice: 35000,
        brand: 'B&B Italia',
        specifications: '3500x2000mm，深灰色真皮',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20dark%20gray%20leather%20sofa%20modern%20designer%20furniture&image_size=square'
      },
      {
        id: 'de-013',
        versionId: 'ver-002',
        roomId: 'room-002',
        category: 'furniture',
        name: '大理石面茶几',
        quantity: 1,
        unitPrice: 8800,
        brand: 'Poltrona Frau',
        specifications: '1600x900x400mm，天然大理石',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=marble%20top%20coffee%20table%20brass%20base%20luxury%20modern&image_size=square'
      },
      {
        id: 'de-014',
        versionId: 'ver-002',
        roomId: 'room-002',
        category: 'lighting',
        name: '艺术落地灯',
        quantity: 2,
        unitPrice: 4200,
        brand: 'Artemide',
        specifications: '高度1800mm，可调节光源',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20artistic%20floor%20lamp%20black%20metal%20warm%20light&image_size=square'
      },
      {
        id: 'de-015',
        versionId: 'ver-002',
        roomId: 'room-003',
        category: 'appliance',
        name: '智能一体马桶',
        quantity: 1,
        unitPrice: 15800,
        brand: 'Duravit',
        specifications: '一体式，语音控制，杀菌功能',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=high%20end%20smart%20toilet%20modern%20design%20white%20ceramic&image_size=square'
      },
      {
        id: 'de-016',
        versionId: 'ver-002',
        roomId: 'room-003',
        category: 'decoration',
        name: '黄铜五金套件',
        quantity: 1,
        unitPrice: 6800,
        brand: 'Kohler',
        specifications: '龙头、花洒、挂件全套',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=brushed%20gold%20brass%20bathroom%20fixtures%20faucet%20shower%20set&image_size=square'
      }
    ],
    inspirationImages: [
      {
        id: 'img-007',
        versionId: 'ver-002',
        roomId: 'room-001',
        url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20hotel%20bedroom%20leather%20bed%20brass%20accent%20chinese%20artwork&image_size=landscape_4_3',
        tags: ['轻奢', '酒店', '真皮', '黄铜'],
        description: '主卧升级方案参考：高品质材质搭配'
      },
      {
        id: 'img-008',
        versionId: 'ver-002',
        roomId: 'room-001',
        url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=song%20dynasty%20style%20interior%20ink%20wash%20painting%20elegant%20minimalist&image_size=landscape_4_3',
        tags: ['宋韵', '挂画', '艺术', '优雅'],
        description: '宋韵美学元素融入：山水画作为视觉焦点'
      },
      {
        id: 'img-009',
        versionId: 'ver-002',
        roomId: 'room-002',
        url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20living%20room%20marble%20coffee%20table%20leather%20sofa%20brass%20lighting&image_size=landscape_4_3',
        tags: ['轻奢', '大理石', '真皮', '金属'],
        description: '客厅升级方案：材质对比提升档次'
      },
      {
        id: 'img-010',
        versionId: 'ver-002',
        roomId: 'room-002',
        url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20chinese%20style%20interior%20with%20traditional%20decor%20elegant&image_size=landscape_4_3',
        tags: ['新中式', '轻奢', '混搭', '精致'],
        description: '宋韵与现代融合的整体氛围参考'
      },
      {
        id: 'img-011',
        versionId: 'ver-002',
        roomId: 'room-003',
        url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20spa%20bathroom%20gold%20fixtures%20marble%20walls%20ambient%20lighting&image_size=landscape_4_3',
        tags: ['奢华', '五金', '大理石', '氛围灯'],
        description: '卫浴升级参考：五星级酒店标准'
      },
      {
        id: 'img-012',
        versionId: 'ver-002',
        roomId: 'room-003',
        url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20bathroom%20with%20gold%20faucet%20marble%20countertop%20backlit%20mirror&image_size=landscape_4_3',
        tags: ['黄铜', '智能镜', '轻奢', '现代'],
        description: '洗漱区细节参考：金色五金提升品质'
      }
    ]
  }
];

export const budgetCategories: BudgetCategory[] = [
  {
    id: 'bc-001',
    projectId: 'proj-001',
    name: '硬装工程',
    budgetAmount: 280000,
    spentAmount: 168000,
    color: '#1E3A5F',
    description: '包括拆改、水电、泥瓦、木工、油漆等基础工程费用'
  },
  {
    id: 'bc-002',
    projectId: 'proj-001',
    name: '软装家具',
    budgetAmount: 180000,
    spentAmount: 54000,
    color: '#D4A574',
    description: '包括活动家具、窗帘、床品、地毯、装饰画等'
  },
  {
    id: 'bc-003',
    projectId: 'proj-001',
    name: '厨房家电',
    budgetAmount: 80000,
    spentAmount: 32000,
    color: '#4ECDC4',
    description: '包括橱柜、油烟机、灶具、冰箱、洗衣机等'
  },
  {
    id: 'bc-004',
    projectId: 'proj-001',
    name: '卫浴洁具',
    budgetAmount: 70000,
    spentAmount: 38500,
    color: '#FF6B6B',
    description: '包括马桶、台盆、龙头、淋浴房、浴缸等'
  },
  {
    id: 'bc-005',
    projectId: 'proj-001',
    name: '装饰配饰',
    budgetAmount: 70000,
    spentAmount: 13500,
    color: '#9B59B6',
    description: '包括灯具、挂画、摆件、绿植、花艺等装饰物品'
  }
];

export const expenseRecords: ExpenseRecord[] = [
  {
    id: 'exp-001',
    categoryId: 'bc-001',
    projectId: 'proj-001',
    name: '拆除工程首付款',
    amount: 28000,
    date: '2026-03-18',
    payee: '杭州诚信拆除工程有限公司',
    paymentMethod: '银行转账',
    invoiceNo: 'FP20260318001',
    remarks: '含原有墙体、地面、吊顶拆除及垃圾清运'
  },
  {
    id: 'exp-002',
    categoryId: 'bc-001',
    projectId: 'proj-001',
    name: '水电材料采购',
    amount: 45000,
    date: '2026-03-28',
    payee: '浙江中财管道科技股份有限公司',
    paymentMethod: '银行转账',
    invoiceNo: 'FP20260328003',
    remarks: 'PPR水管、电线、穿线管、接线盒等全套水电材料'
  },
  {
    id: 'exp-003',
    categoryId: 'bc-001',
    projectId: 'proj-001',
    name: '水电施工人工费',
    amount: 35000,
    date: '2026-04-10',
    payee: '李师傅水电施工队',
    paymentMethod: '银行转账',
    invoiceNo: 'FP20260410007',
    remarks: '3个工人，施工周期15天'
  },
  {
    id: 'exp-004',
    categoryId: 'bc-001',
    projectId: 'proj-001',
    name: '瓷砖采购',
    amount: 60000,
    date: '2026-04-18',
    payee: '杭州诺贝尔瓷砖专卖店',
    paymentMethod: '银行转账',
    invoiceNo: 'FP20260418012',
    remarks: '客厅800x800地砖，卫生间300x600墙砖，厨房防滑地砖'
  },
  {
    id: 'exp-005',
    categoryId: 'bc-004',
    projectId: 'proj-001',
    name: 'TOTO智能马桶定金',
    amount: 8500,
    date: '2026-04-22',
    payee: 'TOTO卫浴杭州旗舰店',
    paymentMethod: '刷卡',
    invoiceNo: 'FP20260422005',
    remarks: '卫洗丽CES9433CS型号，含安装'
  },
  {
    id: 'exp-006',
    categoryId: 'bc-004',
    projectId: 'proj-001',
    name: '浴室柜定制定金',
    amount: 30000,
    date: '2026-04-25',
    payee: '恒洁卫浴杭州经销商',
    paymentMethod: '银行转账',
    invoiceNo: 'FP20260425008',
    remarks: '5个卫生间浴室柜定制，岩板台面'
  },
  {
    id: 'exp-007',
    categoryId: 'bc-003',
    projectId: 'proj-001',
    name: '整体橱柜定金',
    amount: 32000,
    date: '2026-05-02',
    payee: '杭州志邦橱柜有限公司',
    paymentMethod: '银行转账',
    invoiceNo: 'FP20260502003',
    remarks: '实木多层板柜体，石英石台面，含五金配件'
  },
  {
    id: 'exp-008',
    categoryId: 'bc-001',
    projectId: 'proj-001',
    name: '木工人工费',
    amount: 45000,
    date: '2026-05-08',
    payee: '王师傅木工团队',
    paymentMethod: '现金',
    invoiceNo: 'FP20260508010',
    remarks: '4个工人，吊顶、隔墙、衣柜基层制作，施工周期20天'
  },
  {
    id: 'exp-009',
    categoryId: 'bc-005',
    projectId: 'proj-001',
    name: '灯具采购定金',
    amount: 13500,
    date: '2026-05-15',
    payee: '杭州星光灯饰城',
    paymentMethod: '刷卡',
    invoiceNo: 'FP20260515006',
    remarks: '客厅大灯、卧室吸顶灯、筒灯射灯等，预付30%'
  },
  {
    id: 'exp-010',
    categoryId: 'bc-002',
    projectId: 'proj-001',
    name: '梵几家具定金',
    amount: 54000,
    date: '2026-05-20',
    payee: '梵几家居杭州展厅',
    paymentMethod: '银行转账',
    invoiceNo: 'FP20260520011',
    remarks: '床、茶几、餐桌椅等，预付30%，定制周期45天'
  }
];

export const constructionTasks: ConstructionTask[] = [
  {
    id: 'task-001',
    projectId: 'proj-001',
    name: '防水工程',
    type: 'waterproof',
    plannedStartDate: '2026-04-01',
    plannedEndDate: '2026-04-10',
    actualStartDate: '2026-04-03',
    actualEndDate: '2026-04-14',
    progress: 100,
    status: 'completed',
    assignee: '张工（防水）',
    cost: 28000,
    description: '卫生间、厨房、阳台防水处理，采用东方雨虹防水材料，闭水试验48小时'
  },
  {
    id: 'task-002',
    projectId: 'proj-001',
    name: '电路改造',
    type: 'electrical',
    plannedStartDate: '2026-04-12',
    plannedEndDate: '2026-04-28',
    actualStartDate: '2026-04-15',
    actualEndDate: null,
    progress: 75,
    status: 'in_progress',
    assignee: '李工（水电）',
    cost: 68000,
    description: '全屋强电弱电改造，智能布线，开关插座点位布置，弱电箱更换'
  },
  {
    id: 'task-003',
    projectId: 'proj-001',
    name: '瓦工铺贴',
    type: 'masonry',
    plannedStartDate: '2026-05-01',
    plannedEndDate: '2026-05-25',
    actualStartDate: '2026-05-03',
    actualEndDate: null,
    progress: 60,
    status: 'in_progress',
    assignee: '王师傅（瓦工）',
    cost: 85000,
    description: '墙地砖铺贴、窗台石安装、门槛石安装、勾缝美缝处理'
  },
  {
    id: 'task-004',
    projectId: 'proj-001',
    name: '木工制作',
    type: 'carpentry',
    plannedStartDate: '2026-05-26',
    plannedEndDate: '2026-06-18',
    actualStartDate: null,
    actualEndDate: null,
    progress: 0,
    status: 'pending',
    assignee: '陈师傅（木工）',
    cost: 95000,
    description: '吊顶制作、隔墙、定制衣柜基层、门套基层、背景墙基础'
  },
  {
    id: 'task-005',
    projectId: 'proj-001',
    name: '油漆工程',
    type: 'painting',
    plannedStartDate: '2026-06-20',
    plannedEndDate: '2026-07-15',
    actualStartDate: null,
    actualEndDate: null,
    progress: 0,
    status: 'pending',
    assignee: '刘师傅（油漆）',
    cost: 52000,
    description: '墙面批灰、乳胶漆涂刷、木器漆、墙纸铺贴、艺术涂料'
  },
  {
    id: 'task-006',
    projectId: 'proj-001',
    name: '软装安装',
    type: 'decoration',
    plannedStartDate: '2026-07-20',
    plannedEndDate: '2026-08-25',
    actualStartDate: null,
    actualEndDate: null,
    progress: 0,
    status: 'pending',
    assignee: '软装公司',
    cost: 120000,
    description: '灯具安装、洁具安装、家具进场、窗帘安装、挂画配饰、开荒保洁'
  }
];

export const constructionIssues: ConstructionIssue[] = [
  {
    id: 'issue-001',
    taskId: 'task-002',
    projectId: 'proj-001',
    title: '客厅电路点位与设计不符',
    description: '客厅电视背景墙的插座位置比设计图纸低了15cm，后期安装电视柜会遮挡插座，需要重新调整。',
    severity: 'medium',
    status: 'in_progress',
    reportedDate: '2026-04-20',
    reportedBy: '监理王工',
    resolvedDate: null,
    imageUrls: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=electrical%20outlet%20installed%20too%20low%20on%20wall%20construction%20site&image_size=square',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=electrical%20wiring%20in%20wall%20construction%20issue%20measurement&image_size=square'
    ],
    solution: '重新开槽，将插座位置上移15cm，修补墙面'
  },
  {
    id: 'issue-002',
    taskId: 'task-001',
    projectId: 'proj-001',
    title: '主卫生间防水闭水试验漏水',
    description: '主卫生间闭水试验48小时后，发现楼下对应位置天花板有渗水痕迹，需要重新做防水。',
    severity: 'critical',
    status: 'resolved',
    reportedDate: '2026-04-10',
    reportedBy: '监理王工',
    resolvedDate: '2026-04-14',
    imageUrls: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bathroom%20water%20leakage%20on%20ceiling%20waterproofing%20failure&image_size=square',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=applying%20waterproof%20coating%20on%20bathroom%20floor%20repair&image_size=square'
    ],
    solution: '铲除原有防水层，重新涂刷2遍东方雨虹K11防水涂料，重点加强管道根部和墙角处理，重新做闭水试验'
  },
  {
    id: 'issue-003',
    taskId: 'task-003',
    projectId: 'proj-001',
    title: '客厅地砖色差问题',
    description: '客厅地砖铺贴完成后，发现部分瓷砖存在明显色差，约有8片颜色与其他不一致，影响整体美观。',
    severity: 'high',
    status: 'open',
    reportedDate: '2026-05-12',
    reportedBy: '设计师李明',
    resolvedDate: null,
    imageUrls: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=floor%20tiles%20color%20difference%20quality%20issue%20construction&image_size=square'
    ],
    solution: null
  },
  {
    id: 'issue-004',
    taskId: 'task-003',
    projectId: 'proj-001',
    title: '厨房墙砖空鼓',
    description: '厨房墙砖验收时发现约有5%的砖存在空鼓情况，主要集中在烟道附近，需要返工处理。',
    severity: 'medium',
    status: 'open',
    reportedDate: '2026-05-18',
    reportedBy: '监理王工',
    resolvedDate: null,
    imageUrls: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hollow%20wall%20tiles%20inspection%20hammer%20testing%20construction%20quality&image_size=square'
    ],
    solution: null
  }
];

export const suppliers: Supplier[] = [
  {
    id: 'sup-001',
    name: '杭州诺贝尔瓷砖专卖店',
    contactPerson: '张经理',
    phone: '13805712345',
    address: '杭州市西湖区古墩路888号新时代家居广场1楼',
    category: '瓷砖建材',
    rating: 4.8,
    cooperationStatus: 'active',
    quotations: [
      {
        id: 'quote-001',
        supplierId: 'sup-001',
        projectId: 'proj-001',
        itemName: '诺贝尔抛釉砖（客厅地面）',
        specifications: '800x800mm，浅灰色，型号RS80716',
        quantity: 180,
        unitPrice: 280,
        totalPrice: 50400,
        quoteDate: '2026-03-25',
        validUntil: '2026-04-25',
        status: 'accepted',
        remarks: '含上楼搬运，不含铺贴，可免费退换货一次'
      },
      {
        id: 'quote-002',
        supplierId: 'sup-001',
        projectId: 'proj-001',
        itemName: '诺贝尔瓷片（卫生间墙面）',
        specifications: '300x600mm，米白色，型号W30601',
        quantity: 320,
        unitPrice: 85,
        totalPrice: 27200,
        quoteDate: '2026-03-25',
        validUntil: '2026-04-25',
        status: 'accepted',
        remarks: '配套花片和腰线另计'
      },
      {
        id: 'quote-003',
        supplierId: 'sup-001',
        projectId: 'proj-001',
        itemName: '诺贝尔防滑砖（厨房阳台）',
        specifications: '600x600mm，水泥灰，型号RS60312',
        quantity: 120,
        unitPrice: 120,
        totalPrice: 14400,
        quoteDate: '2026-03-25',
        validUntil: '2026-04-25',
        status: 'pending',
        remarks: '防滑系数R11，适合厨房和阳台'
      }
    ]
  },
  {
    id: 'sup-002',
    name: 'TOTO卫浴杭州旗舰店',
    contactPerson: '王经理',
    phone: '13905716789',
    address: '杭州市上城区秋涛北路120号佳好佳居饰商城',
    category: '卫浴洁具',
    rating: 4.9,
    cooperationStatus: 'active',
    quotations: [
      {
        id: 'quote-004',
        supplierId: 'sup-002',
        projectId: 'proj-001',
        itemName: 'TOTO智能一体马桶',
        specifications: 'CES9433CS，卫洗丽系列，自动翻盖',
        quantity: 5,
        unitPrice: 8500,
        totalPrice: 42500,
        quoteDate: '2026-04-10',
        validUntil: '2026-05-10',
        status: 'accepted',
        remarks: '含免费安装和送货，质保5年'
      },
      {
        id: 'quote-005',
        supplierId: 'sup-002',
        projectId: 'proj-001',
        itemName: 'TOTO恒温淋浴花洒',
        specifications: 'TBW01407B，恒温控制，空气注入',
        quantity: 4,
        unitPrice: 3200,
        totalPrice: 12800,
        quoteDate: '2026-04-10',
        validUntil: '2026-05-10',
        status: 'pending',
        remarks: '铜质主体，陶瓷阀芯'
      },
      {
        id: 'quote-006',
        supplierId: 'sup-002',
        projectId: 'proj-001',
        itemName: 'TOTO台下盆',
        specifications: 'LW548B，椭圆形，智洁釉面',
        quantity: 6,
        unitPrice: 1200,
        totalPrice: 7200,
        quoteDate: '2026-04-10',
        validUntil: '2026-05-10',
        status: 'pending',
        remarks: '不含龙头和下水配件'
      }
    ]
  },
  {
    id: 'sup-003',
    name: '杭州志邦橱柜有限公司',
    contactPerson: '李设计师',
    phone: '13705713456',
    address: '杭州市余杭区良渚街道亿丰时代广场',
    category: '橱柜定制',
    rating: 4.7,
    cooperationStatus: 'active',
    quotations: [
      {
        id: 'quote-007',
        supplierId: 'sup-003',
        projectId: 'proj-001',
        itemName: '整体厨房橱柜',
        specifications: 'L型，地柜6.8米，吊柜3.5米，石英石台面',
        quantity: 1,
        unitPrice: 86800,
        totalPrice: 86800,
        quoteDate: '2026-04-20',
        validUntil: '2026-05-20',
        status: 'accepted',
        remarks: '实木多层板柜体，模压门板，含 Blum 五金配件'
      },
      {
        id: 'quote-008',
        supplierId: 'sup-003',
        projectId: 'proj-001',
        itemName: '吧台柜',
        specifications: '2.4米长，1.1米高，含石材台面',
        quantity: 1,
        unitPrice: 18000,
        totalPrice: 18000,
        quoteDate: '2026-04-20',
        validUntil: '2026-05-20',
        status: 'pending',
        remarks: '与橱柜同材质，含两个高脚凳'
      }
    ]
  },
  {
    id: 'sup-004',
    name: '梵几家居杭州展厅',
    contactPerson: '陈顾问',
    phone: '13605717890',
    address: '杭州市西湖区文一西路26号梵几客厅',
    category: '实木家具',
    rating: 4.9,
    cooperationStatus: 'active',
    quotations: [
      {
        id: 'quote-009',
        supplierId: 'sup-004',
        projectId: 'proj-001',
        itemName: '黑胡桃木双人床',
        specifications: '1800x2000mm，框架结构，榫卯工艺',
        quantity: 5,
        unitPrice: 12800,
        totalPrice: 64000,
        quoteDate: '2026-05-05',
        validUntil: '2026-06-05',
        status: 'accepted',
        remarks: '定制周期45天，含送货安装，质保3年'
      },
      {
        id: 'quote-010',
        supplierId: 'sup-004',
        projectId: 'proj-001',
        itemName: '老榆木餐桌椅套装',
        specifications: '餐桌1600x850mm，餐椅6把',
        quantity: 1,
        unitPrice: 28000,
        totalPrice: 28000,
        quoteDate: '2026-05-05',
        validUntil: '2026-06-05',
        status: 'pending',
        remarks: '传统榫卯结构，原木打蜡处理'
      },
      {
        id: 'quote-011',
        supplierId: 'sup-004',
        projectId: 'proj-001',
        itemName: '大茶几',
        specifications: '1400x800x450mm，黑胡桃木',
        quantity: 1,
        unitPrice: 4500,
        totalPrice: 4500,
        quoteDate: '2026-05-05',
        validUntil: '2026-06-05',
        status: 'pending',
        remarks: '可与沙发组合优惠'
      }
    ]
  },
  {
    id: 'sup-005',
    name: '杭州星光灯饰有限公司',
    contactPerson: '刘经理',
    phone: '13505714567',
    address: '杭州市拱墅区沈半路91号杭州灯具市场',
    category: '灯具照明',
    rating: 4.6,
    cooperationStatus: 'active',
    quotations: [
      {
        id: 'quote-012',
        supplierId: 'sup-005',
        projectId: 'proj-001',
        itemName: '客厅主灯（新中式吊灯）',
        specifications: '直径1200mm，黑胡桃木框架，LED光源',
        quantity: 1,
        unitPrice: 8800,
        totalPrice: 8800,
        quoteDate: '2026-05-10',
        validUntil: '2026-06-10',
        status: 'accepted',
        remarks: '含安装，质保2年，可上门维修'
      },
      {
        id: 'quote-013',
        supplierId: 'sup-005',
        projectId: 'proj-001',
        itemName: '卧室吸顶灯',
        specifications: '直径500mm，无极调光，遥控控制',
        quantity: 5,
        unitPrice: 1200,
        totalPrice: 6000,
        quoteDate: '2026-05-10',
        validUntil: '2026-06-10',
        status: 'accepted',
        remarks: '原木边框，亚麻灯罩，与整体风格统一'
      },
      {
        id: 'quote-014',
        supplierId: 'sup-005',
        projectId: 'proj-001',
        itemName: 'LED筒灯射灯',
        specifications: '7W，4000K中性光，防眩光',
        quantity: 60,
        unitPrice: 120,
        totalPrice: 7200,
        quoteDate: '2026-05-10',
        validUntil: '2026-06-10',
        status: 'pending',
        remarks: '科锐芯片，质保5年'
      }
    ]
  }
];

export const projects: Project[] = [
  project,
  {
    id: 'proj-002',
    name: '洱海湖畔度假民宿改造',
    description: '云南大理洱海畔的白族民居改造为度假民宿，保留传统建筑元素，融入现代舒适设施。',
    address: '云南省大理市大理镇才村码头12号',
    totalArea: 450,
    startDate: '2026-01-10',
    endDate: '2026-06-20',
    status: 'completed',
    progress: 100,
    totalBudget: 920000,
    spentAmount: 898000,
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20bai%20ethnic%20house%20erhai%20lake%20yunnan%20province%20chinese%20architecture&image_size=landscape_16_9'
  },
  {
    id: 'proj-003',
    name: '莫干山竹林隐居民宿',
    description: '浙江莫干山竹林中的老房子改造为高端隐居民宿，强调与自然融合的设计理念。',
    address: '浙江省湖州市德清县莫干山镇筏头村',
    totalArea: 280,
    startDate: '2026-05-01',
    endDate: '2026-11-30',
    status: 'planning',
    progress: 15,
    totalBudget: 580000,
    spentAmount: 87000,
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20minimalist%20house%20in%20bamboo%20forest%20moganshan%20china%20natural%20light&image_size=landscape_16_9'
  },
  {
    id: 'proj-004',
    name: '鼓浪屿老别墅修缮项目',
    description: '厦门鼓浪屿历史风貌别墅修缮改造为精品文化民宿，严格保护建筑外观，内部现代化升级。',
    address: '福建省厦门市思明区鼓浪屿泉州路58号',
    totalArea: 380,
    startDate: '2026-02-20',
    endDate: '2026-09-15',
    status: 'in_progress',
    progress: 62,
    totalBudget: 1250000,
    spentAmount: 775000,
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=historic%20colonial%20villa%20gulangyu%20island%20xiamen%20chinese%20western%20fusion%20architecture&image_size=landscape_16_9'
  },
  {
    id: 'proj-005',
    name: '丽江古城纳西庭院改造',
    description: '丽江古城内的纳西族传统四合院改造为文化主题民宿，传承纳西建筑艺术。',
    address: '云南省丽江市古城区七一街八一上段36号',
    totalArea: 320,
    startDate: '2026-04-01',
    endDate: '2026-10-31',
    status: 'in_progress',
    progress: 35,
    totalBudget: 750000,
    spentAmount: 262500,
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20naxi%20courtyard%20house%20lijiang%20old%20town%20yunnan%20chinese%20architecture&image_size=landscape_16_9'
  }
];

export interface MockData {
  project: Project;
  projects: Project[];
  rooms: Room[];
  designVersions: DesignVersion[];
  budgetCategories: BudgetCategory[];
  expenseRecords: ExpenseRecord[];
  constructionTasks: ConstructionTask[];
  constructionIssues: ConstructionIssue[];
  suppliers: Supplier[];
}

export const mockData: MockData = {
  project,
  projects,
  rooms,
  designVersions,
  budgetCategories,
  expenseRecords,
  constructionTasks,
  constructionIssues,
  suppliers
};

export default mockData;
