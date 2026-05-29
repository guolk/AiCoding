export interface Property {
  id: string;
  name: string;
  address: {
    province: string;
    city: string;
    district: string;
    street: string;
    detail: string;
  };
  layout: {
    bedrooms: number;
    livingRooms: number;
    bathrooms: number;
  };
  area: number;
  maxGuests: number;
  facilities: string[];
  features: string[];
  photos: string[];
  basePrice: number;
  weekendPrice: number;
  rules: {
    minNights: number;
    checkInTime: string;
    checkOutTime: string;
    allowPets: boolean;
    allowSmoking: boolean;
    cancellationPolicy: string;
  };
  status: 'available' | 'occupied' | 'maintenance';
  createdAt: string;
  updatedAt: string;
}

export interface PriceRule {
  id: string;
  propertyId: string;
  type: 'holiday' | 'custom';
  name: string;
  startDate: string;
  endDate: string;
  price: number;
  createdAt: string;
}

export type BookingPlatform = 'airbnb' | 'tujia' | 'meituan' | 'ctrip' | 'booking' | 'direct';
export type BookingStatus = 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';

export interface Booking {
  id: string;
  propertyId: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerIdNo?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  platform: BookingPlatform;
  status: BookingStatus;
  totalAmount: number;
  commission: number;
  platformCommissionRate: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CustomerTag = 'vip' | 'returning' | 'blacklist';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  idNo?: string;
  tags: CustomerTag[];
  totalBookings: number;
  totalSpent: number;
  avgRating: number;
  notes?: string;
  discount: number;
  createdAt: string;
}

export interface Review {
  id: string;
  customerId: string;
  bookingId: string;
  propertyId: string;
  rating: number;
  comment: string;
  reply?: string;
  createdAt: string;
}

export type CleaningTaskStatus = 'pending' | 'assigned' | 'in-progress' | 'completed';

export interface CleaningTask {
  id: string;
  propertyId: string;
  bookingId?: string;
  status: CleaningTaskStatus;
  assignee?: string;
  scheduledAt: string;
  completedAt?: string;
  cost: number;
  notes?: string;
  createdAt: string;
}

export type InventoryCategory = 'toiletries' | 'bedding' | 'cleaning' | 'other';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  minStock: number;
  unit: string;
  lastRestockedAt?: string;
  notes?: string;
}

export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';
export type MaintenanceStatus = 'pending' | 'in-progress' | 'completed';

export interface MaintenanceTask {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  assignee?: string;
  cost: number;
  completedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface PlatformCommission {
  platform: BookingPlatform;
  rate: number;
}

export interface FinanceSummary {
  totalRevenue: number;
  totalNights: number;
  occupancyRate: number;
  avgDailyRate: number;
  totalCommission: number;
  netRevenue: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  nights: number;
  bookings: number;
}

export interface PropertyRevenue {
  propertyId: string;
  propertyName: string;
  revenue: number;
  nights: number;
  bookings: number;
}

export interface PlatformRevenue {
  platform: BookingPlatform;
  revenue: number;
  bookings: number;
  commission: number;
}

export interface AnnualReport {
  year: number;
  totalRevenue: number;
  totalNights: number;
  occupancyRate: number;
  avgDailyRate: number;
  totalCommission: number;
  netRevenue: number;
  totalBookings: number;
  monthlyData: MonthlyRevenue[];
  propertyData: PropertyRevenue[];
  platformData: PlatformRevenue[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const PLATFORM_LABELS: Record<BookingPlatform, string> = {
  airbnb: 'Airbnb',
  tujia: '途家',
  meituan: '美团',
  ctrip: '携程',
  booking: 'Booking.com',
  direct: '直接预订',
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: '待确认',
  confirmed: '已确认',
  'checked-in': '入住中',
  'checked-out': '已退房',
  cancelled: '已取消',
};

export const CUSTOMER_TAG_LABELS: Record<CustomerTag, string> = {
  vip: 'VIP客户',
  returning: '回头客',
  blacklist: '黑名单',
};

export const INVENTORY_CATEGORY_LABELS: Record<InventoryCategory, string> = {
  toiletries: '洗漱用品',
  bedding: '床品',
  cleaning: '清洁剂',
  other: '其他',
};

export const MAINTENANCE_PRIORITY_LABELS: Record<MaintenancePriority, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
};

export const FACILITIES_OPTIONS = [
  'WiFi', '空调', '电视', '洗衣机', '烘干机', '冰箱',
  '微波炉', '烤箱', '洗碗机', '厨房', '停车位', '电梯',
  '泳池', '健身房', '热水浴缸', '阳台', '花园', '烧烤设施',
  '儿童设施', '宠物友好', '无障碍设施', '24小时入住',
];
