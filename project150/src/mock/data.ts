import type {
  PlatformInfo,
  Store,
  SalesData,
  Product,
  KeywordRank,
  NegativeReview,
  AdCampaign,
  KeywordBid,
  Inventory,
  Shipment,
  PriceAdjustment,
  Promotion,
  DashboardSummary,
  AlertItem,
} from '@/../shared/types';

const PLATFORMS: PlatformInfo[] = [
  { id: 'amazon', name: 'Amazon', code: 'amazon', color: '#FF9900' },
  { id: 'ebay', name: 'eBay', code: 'ebay', color: '#E53238' },
  { id: 'shopify', name: 'Shopify', code: 'shopify', color: '#96BF48' },
];

const STORES: Store[] = [
  { id: 's1', platformId: 'amazon', platform: 'amazon', name: '亚马逊旗舰店', sellerId: 'A1B2C3D4', status: 'active', createdAt: '2024-01-15' },
  { id: 's2', platformId: 'amazon', platform: 'amazon', name: '亚马逊欧洲站', sellerId: 'E5F6G7H8', status: 'active', createdAt: '2024-02-20' },
  { id: 's3', platformId: 'ebay', platform: 'ebay', name: 'eBay优品店', sellerId: 'ebay_seller_001', status: 'active', createdAt: '2024-03-10' },
  { id: 's4', platformId: 'shopify', platform: 'shopify', name: '独立站官网', sellerId: 'shopify_001', status: 'active', createdAt: '2024-01-25' },
];

const generateDateRange = (days: number) => {
  const dates: string[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};

const dates30 = generateDateRange(30);
const dates60 = generateDateRange(60);

const SALES_DATA: SalesData[] = [
  ...dates30.map((date, i) => ({
    id: `sd1-${i}`,
    storeId: 's1',
    platform: 'amazon' as const,
    storeName: '亚马逊旗舰店',
    date,
    salesAmount: Math.round(25000 + Math.sin(i / 5) * 5000 + Math.random() * 3000),
    orderCount: Math.round(120 + Math.sin(i / 5) * 25 + Math.random() * 20),
    refundCount: Math.round(3 + Math.random() * 2),
    refundRate: +(2 + Math.random() * 1.5).toFixed(2),
    reviewScore: +(4.2 + Math.random() * 0.5).toFixed(1),
    adSpend: Math.round(3000 + Math.random() * 1000),
    profit: Math.round(8000 + Math.sin(i / 5) * 2000 + Math.random() * 1500),
    createdAt: date,
  })),
  ...dates30.map((date, i) => ({
    id: `sd2-${i}`,
    storeId: 's2',
    platform: 'amazon' as const,
    storeName: '亚马逊欧洲站',
    date,
    salesAmount: Math.round(18000 + Math.cos(i / 4) * 4000 + Math.random() * 2500),
    orderCount: Math.round(85 + Math.cos(i / 4) * 20 + Math.random() * 15),
    refundCount: Math.round(2 + Math.random() * 2),
    refundRate: +(1.8 + Math.random() * 1.2).toFixed(2),
    reviewScore: +(4.3 + Math.random() * 0.4).toFixed(1),
    adSpend: Math.round(2500 + Math.random() * 800),
    profit: Math.round(5500 + Math.cos(i / 4) * 1500 + Math.random() * 1000),
    createdAt: date,
  })),
  ...dates30.map((date, i) => ({
    id: `sd3-${i}`,
    storeId: 's3',
    platform: 'ebay' as const,
    storeName: 'eBay优品店',
    date,
    salesAmount: Math.round(12000 + Math.sin(i / 6) * 3000 + Math.random() * 2000),
    orderCount: Math.round(60 + Math.sin(i / 6) * 15 + Math.random() * 12),
    refundCount: Math.round(1 + Math.random() * 2),
    refundRate: +(1.5 + Math.random() * 1).toFixed(2),
    reviewScore: +(4.5 + Math.random() * 0.3).toFixed(1),
    adSpend: Math.round(1500 + Math.random() * 500),
    profit: Math.round(4000 + Math.sin(i / 6) * 1200 + Math.random() * 800),
    createdAt: date,
  })),
  ...dates30.map((date, i) => ({
    id: `sd4-${i}`,
    storeId: 's4',
    platform: 'shopify' as const,
    storeName: '独立站官网',
    date,
    salesAmount: Math.round(35000 + Math.cos(i / 3) * 8000 + Math.random() * 4000),
    orderCount: Math.round(95 + Math.cos(i / 3) * 25 + Math.random() * 18),
    refundCount: Math.round(2 + Math.random() * 2),
    refundRate: +(1.2 + Math.random() * 0.8).toFixed(2),
    reviewScore: +(4.6 + Math.random() * 0.2).toFixed(1),
    adSpend: Math.round(5000 + Math.random() * 1500),
    profit: Math.round(12000 + Math.cos(i / 3) * 3000 + Math.random() * 2000),
    createdAt: date,
  })),
];

const PRODUCTS: Product[] = [
  { id: 'p1', sku: 'SKU-001', name: '无线蓝牙耳机 Pro', platform: 'amazon', platformId: 'amazon', asin: 'B09XYZ1234', status: 'promoting', price: 79.99, cost: 28.5, imageUrl: '', listedAt: '2024-01-10', createdAt: '2024-01-10' },
  { id: 'p2', sku: 'SKU-002', name: '智能运动手表 V2', platform: 'amazon', platformId: 'amazon', asin: 'B08ABC5678', status: 'promoting', price: 129.99, cost: 45.0, imageUrl: '', listedAt: '2024-02-05', createdAt: '2024-02-05' },
  { id: 'p3', sku: 'SKU-003', name: '便携式蓝牙音箱', platform: 'ebay', platformId: 'ebay', status: 'listing', price: 45.99, cost: 18.0, imageUrl: '', listedAt: '2024-03-15', createdAt: '2024-03-15' },
  { id: 'p4', sku: 'SKU-004', name: '手机支架套装', platform: 'shopify', platformId: 'shopify', status: 'slow_selling', price: 25.99, cost: 8.5, imageUrl: '', listedAt: '2024-01-20', createdAt: '2024-01-20' },
  { id: 'p5', sku: 'SKU-005', name: 'Type-C 快充数据线 2米', platform: 'amazon', platformId: 'amazon', asin: 'B07DEF9012', status: 'clearing', price: 15.99, cost: 3.5, imageUrl: '', listedAt: '2023-11-10', createdAt: '2023-11-10' },
  { id: 'p6', sku: 'SKU-006', name: '无线充电器 15W', platform: 'amazon', platformId: 'amazon', asin: 'B09GHI3456', status: 'promoting', price: 32.99, cost: 12.0, imageUrl: '', listedAt: '2024-03-01', createdAt: '2024-03-01' },
  { id: 'p7', sku: 'SKU-007', name: '笔记本电脑散热支架', platform: 'ebay', platformId: 'ebay', status: 'listing', price: 39.99, cost: 15.0, imageUrl: '', listedAt: '2024-04-10', createdAt: '2024-04-10' },
  { id: 'p8', sku: 'SKU-008', name: 'RGB 游戏键盘', platform: 'shopify', platformId: 'shopify', status: 'promoting', price: 89.99, cost: 35.0, imageUrl: '', listedAt: '2024-02-15', createdAt: '2024-02-15' },
];

const KEYWORD_RANKS: KeywordRank[] = [
  ...dates60.map((date, i) => ({
    id: `kr1-${i}`,
    productId: 'p1',
    keyword: 'wireless earbuds noise cancelling',
    platform: 'amazon' as const,
    rank: Math.max(1, Math.round(25 - i * 0.3 + Math.sin(i / 3) * 5 + Math.random() * 3)),
    targetRank: 10,
    date,
    createdAt: date,
  })),
  ...dates60.map((date, i) => ({
    id: `kr2-${i}`,
    productId: 'p1',
    keyword: 'bluetooth earbuds waterproof',
    platform: 'amazon' as const,
    rank: Math.max(1, Math.round(45 - i * 0.2 + Math.cos(i / 4) * 4 + Math.random() * 3)),
    targetRank: 20,
    date,
    createdAt: date,
  })),
  ...dates60.map((date, i) => ({
    id: `kr3-${i}`,
    productId: 'p2',
    keyword: 'smart watch fitness tracker',
    platform: 'amazon' as const,
    rank: Math.max(1, Math.round(18 - i * 0.15 + Math.sin(i / 5) * 3 + Math.random() * 2)),
    targetRank: 5,
    date,
    createdAt: date,
  })),
];

const NEGATIVE_REVIEWS: NegativeReview[] = [
  { id: 'nr1', productId: 'p1', platform: 'amazon', rating: 2, content: '音质不错但是佩戴不太舒适，戴久了耳朵疼。包装也有些破损。', reviewer: 'Amazon Customer', date: '2024-05-15', reasonCategory: '佩戴舒适度', responseStrategy: '已联系客户提供全额退款+赠品补偿，邀请重新评测', responseDate: '2024-05-16', status: 'resolved', createdAt: '2024-05-15' },
  { id: 'nr2', productId: 'p1', platform: 'amazon', rating: 1, content: '用了不到一个月就坏了，充电时发热严重，很失望。', reviewer: 'John D.', date: '2024-05-20', reasonCategory: '质量问题', responseStrategy: '已安排补发新品，承诺延长保修期', responseDate: '2024-05-21', status: 'responded', createdAt: '2024-05-20' },
  { id: 'nr3', productId: 'p2', platform: 'amazon', rating: 3, content: '功能还可以，但续航比描述的短了约20%。', reviewer: 'TechReviewer', date: '2024-05-18', reasonCategory: '续航问题', responseStrategy: '已在详情页更新实际续航数据，赠送优惠券致歉', responseDate: '2024-05-19', status: 'resolved', createdAt: '2024-05-18' },
  { id: 'nr4', productId: 'p4', platform: 'shopify', rating: 2, content: '收到的产品和图片不一样，材质看起来很廉价。', reviewer: 'Shopify Buyer', date: '2024-05-22', reasonCategory: '图文不符', status: 'pending', createdAt: '2024-05-22' },
  { id: 'nr5', productId: 'p5', platform: 'amazon', rating: 1, content: '数据线用了两周就断了，质量太差了！', reviewer: 'Unhappy User', date: '2024-05-25', reasonCategory: '质量问题', status: 'pending', createdAt: '2024-05-25' },
];

const AD_CAMPAIGNS: AdCampaign[] = [
  { id: 'ad1', name: '耳机Pro-新品推广', platform: 'amazon', type: 'SP', budget: 5000, dailyBudget: 200, acos: 28.5, impressions: 125000, clicks: 4200, cpc: 1.15, sales: 16800, orders: 210, startDate: '2024-04-01', endDate: '2024-06-30', status: 'active', notes: '核心关键词广告', createdAt: '2024-04-01' },
  { id: 'ad2', name: '智能手表-品牌推广', platform: 'amazon', type: 'SB', budget: 8000, dailyBudget: 300, acos: 35.2, impressions: 250000, clicks: 6800, cpc: 1.35, sales: 26500, orders: 204, startDate: '2024-03-15', endDate: '2024-06-15', status: 'active', notes: '品牌旗舰店广告', createdAt: '2024-03-15' },
  { id: 'ad3', name: 'eBay店铺引流', platform: 'ebay', type: 'Promoted Listings', budget: 2000, dailyBudget: 80, acos: 18.5, impressions: 85000, clicks: 2100, cpc: 0.75, sales: 8500, orders: 185, startDate: '2024-04-10', status: 'active', createdAt: '2024-04-10' },
  { id: 'ad4', name: 'Google Shopping', platform: 'shopify', type: 'Shopping Ads', budget: 6000, dailyBudget: 250, acos: 42.3, impressions: 320000, clicks: 9500, cpc: 1.80, sales: 39800, orders: 415, startDate: '2024-03-01', status: 'active', notes: '独立站主要流量来源', createdAt: '2024-03-01' },
  { id: 'ad5', name: '清仓促销-数据线', platform: 'amazon', type: 'SP', budget: 500, dailyBudget: 50, acos: 55.0, impressions: 15000, clicks: 600, cpc: 0.80, sales: 870, orders: 55, startDate: '2024-05-01', endDate: '2024-05-31', status: 'completed', notes: '清库存专用', createdAt: '2024-05-01' },
];

const KEYWORD_BIDS: KeywordBid[] = [
  { id: 'kb1', campaignId: 'ad1', keyword: 'wireless earbuds', oldBid: 1.20, newBid: 1.50, date: '2024-05-10', reason: '排名下滑，需提高出价抢位置', effect7dAcos: 26.5, effect7dSales: 3200, createdAt: '2024-05-10' },
  { id: 'kb2', campaignId: 'ad1', keyword: 'noise cancelling earbuds', oldBid: 1.80, newBid: 1.60, date: '2024-05-12', reason: 'ACOS过高，降低出价优化', effect7dAcos: 30.2, effect7dSales: 1850, createdAt: '2024-05-12' },
  { id: 'kb3', campaignId: 'ad2', keyword: 'fitness smart watch', oldBid: 2.00, newBid: 2.30, date: '2024-05-08', reason: '竞品活动期间，保持曝光', effect7dAcos: 32.8, effect7dSales: 4200, createdAt: '2024-05-08' },
  { id: 'kb4', campaignId: 'ad4', keyword: 'wireless gaming keyboard', oldBid: 1.50, newBid: 1.75, date: '2024-05-15', reason: '新品推广期，加大投入', effect7dAcos: 38.5, effect7dSales: 2100, createdAt: '2024-05-15' },
];

const INVENTORY: Inventory[] = [
  { id: 'inv1', productId: 'p1', platform: 'amazon', warehouse: 'US-West', currentStock: 450, reservedStock: 28, dailySalesRate: 15, safetyStock: 100, leadTimeDays: 45, restockDate: '2024-06-15', createdAt: '2024-01-10', updatedAt: '2024-06-01' },
  { id: 'inv2', productId: 'p1', platform: 'amazon', warehouse: 'EU-Germany', currentStock: 120, reservedStock: 12, dailySalesRate: 8, safetyStock: 60, leadTimeDays: 60, restockDate: '2024-06-05', createdAt: '2024-02-20', updatedAt: '2024-06-01' },
  { id: 'inv3', productId: 'p2', platform: 'amazon', warehouse: 'US-West', currentStock: 280, reservedStock: 15, dailySalesRate: 10, safetyStock: 80, leadTimeDays: 45, restockDate: '2024-06-20', createdAt: '2024-02-05', updatedAt: '2024-06-01' },
  { id: 'inv4', productId: 'p3', platform: 'ebay', warehouse: 'US-East', currentStock: 85, reservedStock: 5, dailySalesRate: 4, safetyStock: 30, leadTimeDays: 35, restockDate: '2024-06-10', createdAt: '2024-03-15', updatedAt: '2024-06-01' },
  { id: 'inv5', productId: 'p4', platform: 'shopify', warehouse: 'US-West', currentStock: 420, reservedStock: 8, dailySalesRate: 3, safetyStock: 30, leadTimeDays: 30, createdAt: '2024-01-20', updatedAt: '2024-06-01' },
  { id: 'inv6', productId: 'p5', platform: 'amazon', warehouse: 'US-West', currentStock: 35, reservedStock: 2, dailySalesRate: 5, safetyStock: 50, leadTimeDays: 45, createdAt: '2023-11-10', updatedAt: '2024-06-01' },
  { id: 'inv7', productId: 'p6', platform: 'amazon', warehouse: 'US-West', currentStock: 195, reservedStock: 10, dailySalesRate: 7, safetyStock: 50, leadTimeDays: 45, restockDate: '2024-06-18', createdAt: '2024-03-01', updatedAt: '2024-06-01' },
  { id: 'inv8', productId: 'p8', platform: 'shopify', warehouse: 'US-West', currentStock: 8, reservedStock: 3, dailySalesRate: 6, safetyStock: 40, leadTimeDays: 40, restockDate: '2024-06-02', createdAt: '2024-02-15', updatedAt: '2024-06-01' },
];

const SHIPMENTS: Shipment[] = [
  {
    id: 'sh1', batchNo: 'BATCH-2024-0515', origin: '深圳', destination: 'LA', shippingMethod: '海运',
    departureDate: '2024-05-15', estimatedArrival: '2024-06-20', cost: 12500, status: 'shipping', trackingNo: 'MSKU1234567890',
    items: [
      { id: 'shi1', shipmentId: 'sh1', productId: 'p1', productName: '无线蓝牙耳机 Pro', sku: 'SKU-001', quantity: 500, unitCost: 28.5, createdAt: '2024-05-15' },
      { id: 'shi2', shipmentId: 'sh1', productId: 'p6', productName: '无线充电器 15W', sku: 'SKU-006', quantity: 300, unitCost: 12.0, createdAt: '2024-05-15' },
    ],
    createdAt: '2024-05-15'
  },
  {
    id: 'sh2', batchNo: 'BATCH-2024-0520', origin: '广州', destination: 'Hamburg', shippingMethod: '铁路',
    departureDate: '2024-05-20', estimatedArrival: '2024-07-05', cost: 9800, status: 'shipping', trackingNo: 'RAIL9876543210',
    items: [
      { id: 'shi3', shipmentId: 'sh2', productId: 'p2', productName: '智能运动手表 V2', sku: 'SKU-002', quantity: 200, unitCost: 45.0, createdAt: '2024-05-20' },
    ],
    createdAt: '2024-05-20'
  },
  {
    id: 'sh3', batchNo: 'BATCH-2024-0501', origin: '深圳', destination: 'LA', shippingMethod: '空运',
    departureDate: '2024-05-01', estimatedArrival: '2024-05-08', actualArrival: '2024-05-07', cost: 6500, status: 'warehoused', trackingNo: 'FDX1122334455',
    items: [
      { id: 'shi4', shipmentId: 'sh3', productId: 'p8', productName: 'RGB 游戏键盘', sku: 'SKU-008', quantity: 100, unitCost: 35.0, createdAt: '2024-05-01' },
    ],
    createdAt: '2024-05-01'
  },
  {
    id: 'sh4', batchNo: 'BATCH-2024-0410', origin: '东莞', destination: 'NY', shippingMethod: '海运',
    departureDate: '2024-04-10', estimatedArrival: '2024-05-15', actualArrival: '2024-05-18', cost: 8200, status: 'warehoused', trackingNo: 'MSKU0987654321',
    items: [
      { id: 'shi5', shipmentId: 'sh4', productId: 'p3', productName: '便携式蓝牙音箱', sku: 'SKU-003', quantity: 400, unitCost: 18.0, createdAt: '2024-04-10' },
      { id: 'shi6', shipmentId: 'sh4', productId: 'p4', productName: '手机支架套装', sku: 'SKU-004', quantity: 600, unitCost: 8.5, createdAt: '2024-04-10' },
    ],
    createdAt: '2024-04-10'
  },
];

const PRICE_ADJUSTMENTS: PriceAdjustment[] = [
  { id: 'pa1', productId: 'p1', productName: '无线蓝牙耳机 Pro', sku: 'SKU-001', oldPrice: 89.99, newPrice: 79.99, date: '2024-05-01', reason: '竞品降价，保持竞争力', effectDays: 7, salesBefore: 85, salesAfter: 112, createdAt: '2024-05-01' },
  { id: 'pa2', productId: 'p2', productName: '智能运动手表 V2', sku: 'SKU-002', oldPrice: 149.99, newPrice: 129.99, date: '2024-04-15', reason: '新品推广期结束，正常定价', effectDays: 7, salesBefore: 62, salesAfter: 78, createdAt: '2024-04-15' },
  { id: 'pa3', productId: 'p5', productName: 'Type-C 快充数据线 2米', sku: 'SKU-005', oldPrice: 22.99, newPrice: 15.99, date: '2024-05-10', reason: '清库存促销', effectDays: 7, salesBefore: 12, salesAfter: 38, createdAt: '2024-05-10' },
  { id: 'pa4', productId: 'p6', productName: '无线充电器 15W', sku: 'SKU-006', oldPrice: 39.99, newPrice: 32.99, date: '2024-05-20', reason: '成本下降，让利用户', effectDays: 7, salesBefore: 45, salesAfter: 52, createdAt: '2024-05-20' },
];

const PROMOTIONS: Promotion[] = [
  { id: 'promo1', name: '五一劳动节大促', platform: 'amazon', type: 'LD', startDate: '2024-05-01', endDate: '2024-05-03', discountDescription: '满100减20，8折优惠', budget: 5000, targetSales: 50000, actualSales: 58200, roi: 11.64, reviewNotes: '效果超预期，ROI达11.6，建议同类节日重复此策略', createdAt: '2024-04-25' },
  { id: 'promo2', name: '母亲节特惠', platform: 'shopify', type: 'Sitewide', startDate: '2024-05-08', endDate: '2024-05-12', discountDescription: '全场85折+包邮', budget: 3000, targetSales: 35000, actualSales: 32100, roi: 10.7, reviewNotes: '略低于目标，主要是流量获取成本偏高', createdAt: '2024-05-01' },
  { id: 'promo3', name: '618年中大促', platform: 'amazon', type: '7DD', startDate: '2024-06-18', endDate: '2024-06-24', discountDescription: '直降30%+Coupon叠加', budget: 10000, targetSales: 120000, createdAt: '2024-05-15' },
  { id: 'promo4', name: 'Prime Day 筹备', platform: 'amazon', type: 'PD', startDate: '2024-07-15', endDate: '2024-07-16', discountDescription: '50% OFF 限时秒杀', budget: 15000, targetSales: 200000, createdAt: '2024-05-20' },
];

const ALERTS: AlertItem[] = [
  { id: 'a1', type: 'danger', message: 'SKU-008 库存告急！当前库存仅8件，预计2天内断货', link: '/inventory/stock', createdAt: '2024-06-01' },
  { id: 'a2', type: 'danger', message: 'SKU-002 欧洲站库存低于安全线，请及时补货', link: '/inventory/stock', createdAt: '2024-06-01' },
  { id: 'a3', type: 'warning', message: '广告活动 "耳机Pro-新品推广" ACOS上升至28.5%，建议优化关键词', link: '/advertising/campaigns', createdAt: '2024-06-01' },
  { id: 'a4', type: 'warning', message: '发现2条待处理差评，请及时回复', link: '/products/reviews', createdAt: '2024-06-01' },
  { id: 'a5', type: 'warning', message: '关键词 "bluetooth earbuds waterproof" 排名跌至45名，未达目标', link: '/products/keywords', createdAt: '2024-06-01' },
  { id: 'a6', type: 'info', message: '批次 BATCH-2024-0515 预计6月20日到港', link: '/inventory/logistics', createdAt: '2024-06-01' },
];

const SALES_TREND = dates30.map(date => ({
  date,
  amount: SALES_DATA.filter(s => s.date === date).reduce((sum, s) => sum + s.salesAmount, 0),
}));

const PLATFORM_COMPARISON = [
  { platform: 'amazon' as const, name: 'Amazon', sales: 1285000, profit: 405000, roi: 3.25 },
  { platform: 'ebay' as const, name: 'eBay', sales: 420000, profit: 140000, roi: 3.50 },
  { platform: 'shopify' as const, name: 'Shopify', sales: 1350000, profit: 472500, roi: 2.85 },
];

export const mockData = {
  platforms: PLATFORMS,
  stores: STORES,
  salesData: SALES_DATA,
  products: PRODUCTS,
  keywordRanks: KEYWORD_RANKS,
  negativeReviews: NEGATIVE_REVIEWS,
  adCampaigns: AD_CAMPAIGNS,
  keywordBids: KEYWORD_BIDS,
  inventory: INVENTORY,
  shipments: SHIPMENTS,
  priceAdjustments: PRICE_ADJUSTMENTS,
  promotions: PROMOTIONS,
  alerts: ALERTS,
  salesTrend: SALES_TREND,
  platformComparison: PLATFORM_COMPARISON,
  dates30,
  dates60,
};

export function getDashboardSummary(): DashboardSummary {
  const latestSales = SALES_DATA.filter(s => s.date === dates30[dates30.length - 1]);
  const totalSales = latestSales.reduce((sum, s) => sum + s.salesAmount, 0) * 30;
  const totalOrders = latestSales.reduce((sum, s) => sum + s.orderCount, 0) * 30;
  const avgRefundRate = +(latestSales.reduce((sum, s) => sum + s.refundRate, 0) / latestSales.length).toFixed(2);
  const avgReviewScore = +(latestSales.reduce((sum, s) => sum + (s.reviewScore || 0), 0) / latestSales.length).toFixed(1);

  return {
    totalSales,
    totalOrders,
    avgRefundRate,
    avgReviewScore,
    salesTrend: SALES_TREND,
    platformComparison: PLATFORM_COMPARISON,
    alerts: ALERTS,
  };
}

export function getSalesTrend(platform?: string) {
  if (!platform || platform === 'all') {
    return SALES_TREND;
  }
  return dates30.map(date => ({
    date,
    amount: SALES_DATA.filter(s => s.date === date && s.platform === platform).reduce((sum, s) => sum + s.salesAmount, 0),
  }));
}

export function getROIChartData() {
  return dates30.map(date => {
    const dayData = SALES_DATA.filter(s => s.date === date);
    const adSpend = dayData.reduce((sum, s) => sum + s.adSpend, 0);
    const sales = dayData.reduce((sum, s) => sum + s.salesAmount, 0);
    return {
      date,
      adSpend,
      sales,
      roi: +((sales - adSpend) / adSpend).toFixed(2),
    };
  });
}
