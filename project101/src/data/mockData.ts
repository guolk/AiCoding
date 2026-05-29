import {
  Property, PriceRule, Booking, Customer, Review,
  CleaningTask, InventoryItem, MaintenanceTask, PlatformCommission
} from '../types';

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

export const mockProperties: Property[] = [
  {
    id: 'p1',
    name: '温馨一居室公寓（市中心）',
    address: {
      province: '上海市',
      city: '上海市',
      district: '黄浦区',
      street: '南京东路',
      detail: '100号15楼1503室'
    },
    layout: { bedrooms: 1, livingRooms: 1, bathrooms: 1 },
    area: 45,
    maxGuests: 2,
    facilities: ['WiFi', '空调', '电视', '洗衣机', '厨房', '电梯'],
    features: ['近地铁', '市中心位置', '安静', '新装修'],
    photos: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20cozy%20one%20bedroom%20apartment%20interior%20design%20with%20wooden%20floor%20and%20natural%20light&image_size=square_hd',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=clean%20modern%20bathroom%20with%20white%20tiles%20and%20rainfall%20shower&image_size=square_hd'
    ],
    basePrice: 299,
    weekendPrice: 399,
    rules: {
      minNights: 1,
      checkInTime: '14:00',
      checkOutTime: '12:00',
      allowPets: false,
      allowSmoking: false,
      cancellationPolicy: '入住前7天可免费取消'
    },
    status: 'available',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'p2',
    name: '豪华海景两居室',
    address: {
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      street: '滨海大道',
      detail: '888号海景花园A座28楼'
    },
    layout: { bedrooms: 2, livingRooms: 1, bathrooms: 2 },
    area: 90,
    maxGuests: 4,
    facilities: ['WiFi', '空调', '电视', '洗衣机', '烘干机', '厨房', '停车位', '电梯', '泳池', '健身房'],
    features: ['无敌海景', '豪华装修', '智能家居', '24小时安保'],
    photos: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20seaview%20apartment%20living%20room%20with%20floor%20to%20ceiling%20windows&image_size=square_hd'
    ],
    basePrice: 699,
    weekendPrice: 899,
    rules: {
      minNights: 2,
      checkInTime: '15:00',
      checkOutTime: '12:00',
      allowPets: true,
      allowSmoking: false,
      cancellationPolicy: '入住前14天可免费取消'
    },
    status: 'available',
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-02-20T10:00:00Z'
  },
  {
    id: 'p3',
    name: '花园别墅三居室',
    address: {
      province: '浙江省',
      city: '杭州市',
      district: '西湖区',
      street: '龙井路',
      detail: '168号花园别墅'
    },
    layout: { bedrooms: 3, livingRooms: 2, bathrooms: 2 },
    area: 180,
    maxGuests: 6,
    facilities: ['WiFi', '空调', '电视', '洗衣机', '厨房', '停车位', '花园', '烧烤设施'],
    features: ['西湖边', '私家花园', '独立别墅', '适合家庭'],
    photos: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20garden%20villa%20exterior%20with%20green%20lawn%20and%20trees&image_size=square_hd'
    ],
    basePrice: 1299,
    weekendPrice: 1599,
    rules: {
      minNights: 2,
      checkInTime: '14:00',
      checkOutTime: '11:00',
      allowPets: true,
      allowSmoking: true,
      cancellationPolicy: '入住前7天可免费取消'
    },
    status: 'available',
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-03-10T10:00:00Z'
  },
  {
    id: 'p4',
    name: '现代Loft工作室',
    address: {
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      street: '建国路',
      detail: '88号SOHO现代城B座1205'
    },
    layout: { bedrooms: 1, livingRooms: 1, bathrooms: 1 },
    area: 55,
    maxGuests: 2,
    facilities: ['WiFi', '空调', '电视', '洗衣机', '厨房', '电梯', '健身房'],
    features: ['CBD位置', '工业风设计', '高挑高', '适合商务出行'],
    photos: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20loft%20studio%20apartment%20industrial%20style%20with%20exposed%20brick&image_size=square_hd'
    ],
    basePrice: 359,
    weekendPrice: 459,
    rules: {
      minNights: 1,
      checkInTime: '14:00',
      checkOutTime: '12:00',
      allowPets: false,
      allowSmoking: false,
      cancellationPolicy: '入住前3天可免费取消'
    },
    status: 'occupied',
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-01-25T10:00:00Z'
  }
];

export const mockPriceRules: PriceRule[] = [
  {
    id: 'pr1',
    propertyId: 'p1',
    type: 'holiday',
    name: '春节假期',
    startDate: new Date(today.getFullYear(), 0, 28).toISOString().split('T')[0],
    endDate: new Date(today.getFullYear(), 1, 4).toISOString().split('T')[0],
    price: 599,
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 'pr2',
    propertyId: 'p2',
    type: 'holiday',
    name: '国庆假期',
    startDate: new Date(today.getFullYear(), 9, 1).toISOString().split('T')[0],
    endDate: new Date(today.getFullYear(), 9, 7).toISOString().split('T')[0],
    price: 1299,
    createdAt: '2024-02-15T10:00:00Z'
  }
];

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const mockBookings: Booking[] = [
  {
    id: 'b1',
    propertyId: 'p1',
    customerId: 'c1',
    customerName: '张三',
    customerPhone: '13800138001',
    customerIdNo: '310101199001010001',
    checkIn: addDays(today, 2).toISOString().split('T')[0],
    checkOut: addDays(today, 5).toISOString().split('T')[0],
    nights: 3,
    platform: 'airbnb',
    status: 'confirmed',
    totalAmount: 897,
    commission: 26.91,
    platformCommissionRate: 0.03,
    notes: '客人需要额外的毛巾',
    createdAt: '2024-05-20T10:00:00Z',
    updatedAt: '2024-05-20T10:00:00Z'
  },
  {
    id: 'b2',
    propertyId: 'p2',
    customerId: 'c2',
    customerName: '李四',
    customerPhone: '13800138002',
    customerIdNo: '440301198505050002',
    checkIn: addDays(today, -3).toISOString().split('T')[0],
    checkOut: addDays(today, 1).toISOString().split('T')[0],
    nights: 4,
    platform: 'meituan',
    status: 'checked-in',
    totalAmount: 2796,
    commission: 279.6,
    platformCommissionRate: 0.1,
    createdAt: '2024-05-22T10:00:00Z',
    updatedAt: addDays(today, -3).toISOString()
  },
  {
    id: 'b3',
    propertyId: 'p4',
    customerId: 'c3',
    customerName: '王五',
    customerPhone: '13800138003',
    customerIdNo: '110101198808080003',
    checkIn: today.toISOString().split('T')[0],
    checkOut: addDays(today, 3).toISOString().split('T')[0],
    nights: 3,
    platform: 'direct',
    status: 'checked-in',
    totalAmount: 1077,
    commission: 0,
    platformCommissionRate: 0,
    notes: '商务出行，需要安静',
    createdAt: '2024-05-25T10:00:00Z',
    updatedAt: today.toISOString()
  },
  {
    id: 'b4',
    propertyId: 'p3',
    customerId: 'c1',
    customerName: '张三',
    customerPhone: '13800138001',
    customerIdNo: '310101199001010001',
    checkIn: addDays(today, 10).toISOString().split('T')[0],
    checkOut: addDays(today, 14).toISOString().split('T')[0],
    nights: 4,
    platform: 'tujia',
    status: 'pending',
    totalAmount: 5196,
    commission: 415.68,
    platformCommissionRate: 0.08,
    createdAt: '2024-05-28T10:00:00Z',
    updatedAt: '2024-05-28T10:00:00Z'
  },
  {
    id: 'b5',
    propertyId: 'p1',
    customerId: 'c4',
    customerName: '赵六',
    customerPhone: '13800138004',
    customerIdNo: '320101199202020004',
    checkIn: addDays(today, -10).toISOString().split('T')[0],
    checkOut: addDays(today, -7).toISOString().split('T')[0],
    nights: 3,
    platform: 'ctrip',
    status: 'checked-out',
    totalAmount: 897,
    commission: 71.76,
    platformCommissionRate: 0.08,
    createdAt: '2024-05-15T10:00:00Z',
    updatedAt: addDays(today, -7).toISOString()
  }
];

export const mockCustomers: Customer[] = [
  {
    id: 'c1',
    name: '张三',
    phone: '13800138001',
    email: 'zhangsan@example.com',
    idNo: '310101199001010001',
    tags: ['vip', 'returning'],
    totalBookings: 5,
    totalSpent: 15890,
    avgRating: 5,
    notes: '非常优质的客户，每次入住都很准时',
    discount: 0.1,
    createdAt: '2023-06-10T10:00:00Z'
  },
  {
    id: 'c2',
    name: '李四',
    phone: '13800138002',
    email: 'lisi@example.com',
    idNo: '440301198505050002',
    tags: ['returning'],
    totalBookings: 2,
    totalSpent: 4500,
    avgRating: 4,
    discount: 0.05,
    createdAt: '2024-02-15T10:00:00Z'
  },
  {
    id: 'c3',
    name: '王五',
    phone: '13800138003',
    email: 'wangwu@example.com',
    idNo: '110101198808080003',
    tags: [],
    totalBookings: 1,
    totalSpent: 1077,
    avgRating: 5,
    discount: 0,
    createdAt: '2024-05-25T10:00:00Z'
  },
  {
    id: 'c4',
    name: '赵六',
    phone: '13800138004',
    tags: ['blacklist'],
    totalBookings: 1,
    totalSpent: 897,
    avgRating: 1,
    notes: '上次入住损坏了家具，拒绝赔偿',
    discount: 0,
    createdAt: '2024-05-10T10:00:00Z'
  },
  {
    id: 'c5',
    name: '陈七',
    phone: '13800138005',
    email: 'chenqi@example.com',
    tags: ['vip'],
    totalBookings: 8,
    totalSpent: 28000,
    avgRating: 5,
    notes: '企业客户，长期合作',
    discount: 0.15,
    createdAt: '2023-03-20T10:00:00Z'
  }
];

export const mockReviews: Review[] = [
  {
    id: 'r1',
    customerId: 'c1',
    bookingId: 'b5',
    propertyId: 'p1',
    rating: 5,
    comment: '位置非常好，交通便利，房间干净整洁，下次还会再来！',
    reply: '感谢您的好评，期待您的再次光临！',
    createdAt: '2024-05-18T10:00:00Z'
  },
  {
    id: 'r2',
    customerId: 'c4',
    bookingId: 'b5',
    propertyId: 'p1',
    rating: 1,
    comment: '房间太小，不值这个价格',
    createdAt: '2024-05-20T10:00:00Z'
  }
];

export const mockCleaningTasks: CleaningTask[] = [
  {
    id: 'ct1',
    propertyId: 'p1',
    bookingId: 'b5',
    status: 'completed',
    assignee: '张阿姨',
    scheduledAt: addDays(today, -7).toISOString().split('T')[0],
    completedAt: addDays(today, -7).toISOString().split('T')[0],
    cost: 80,
    notes: '退房清洁',
    createdAt: addDays(today, -8).toISOString()
  },
  {
    id: 'ct2',
    propertyId: 'p2',
    status: 'pending',
    scheduledAt: addDays(today, 1).toISOString().split('T')[0],
    cost: 150,
    notes: '退房清洁（预订b2）',
    createdAt: '2024-05-22T10:00:00Z'
  },
  {
    id: 'ct3',
    propertyId: 'p4',
    status: 'in-progress',
    assignee: '李阿姨',
    scheduledAt: addDays(today, 3).toISOString().split('T')[0],
    cost: 100,
    notes: '退房清洁（预订b3）',
    createdAt: '2024-05-25T10:00:00Z'
  }
];

export const mockInventoryItems: InventoryItem[] = [
  { id: 'i1', name: '一次性拖鞋', category: 'toiletries', quantity: 50, minStock: 20, unit: '双' },
  { id: 'i2', name: '洗发水', category: 'toiletries', quantity: 30, minStock: 15, unit: '瓶' },
  { id: 'i3', name: '沐浴露', category: 'toiletries', quantity: 25, minStock: 15, unit: '瓶' },
  { id: 'i4', name: '浴巾', category: 'bedding', quantity: 8, minStock: 10, unit: '条' },
  { id: 'i5', name: '床单', category: 'bedding', quantity: 12, minStock: 10, unit: '套' },
  { id: 'i6', name: '枕套', category: 'bedding', quantity: 15, minStock: 10, unit: '个' },
  { id: 'i7', name: '消毒液', category: 'cleaning', quantity: 5, minStock: 3, unit: '瓶' },
  { id: 'i8', name: '洗衣液', category: 'cleaning', quantity: 2, minStock: 5, unit: '瓶', lastRestockedAt: addDays(today, -30).toISOString().split('T')[0] },
  { id: 'i9', name: '纸巾', category: 'other', quantity: 3, minStock: 10, unit: '包' },
];

export const mockMaintenanceTasks: MaintenanceTask[] = [
  {
    id: 'mt1',
    propertyId: 'p1',
    title: '空调维修',
    description: '客厅空调制冷效果不好，需要检修',
    priority: 'high',
    status: 'pending',
    cost: 0,
    notes: '客人反馈空调不制冷',
    createdAt: '2024-05-28T10:00:00Z'
  },
  {
    id: 'mt2',
    propertyId: 'p2',
    title: '水龙头漏水',
    description: '主卧卫生间水龙头滴水',
    priority: 'medium',
    status: 'in-progress',
    assignee: '王师傅',
    cost: 200,
    createdAt: '2024-05-25T10:00:00Z'
  },
  {
    id: 'mt3',
    propertyId: 'p4',
    title: '灯泡更换',
    description: '客厅灯泡烧坏',
    priority: 'low',
    status: 'completed',
    assignee: '李师傅',
    cost: 50,
    completedAt: '2024-05-20T10:00:00Z',
    createdAt: '2024-05-18T10:00:00Z'
  }
];

export const mockPlatformCommissions: PlatformCommission[] = [
  { platform: 'airbnb', rate: 0.03 },
  { platform: 'tujia', rate: 0.08 },
  { platform: 'meituan', rate: 0.10 },
  { platform: 'ctrip', rate: 0.08 },
  { platform: 'booking', rate: 0.15 },
  { platform: 'direct', rate: 0 }
];
