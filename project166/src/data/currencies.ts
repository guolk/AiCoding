import type { Currency, FinanceTx } from '@/types';

export const CURRENCIES: Currency[] = [
  { code: 'USD', name: '美元', symbol: '$', usdRate: 1, flag: '🇺🇸' },
  { code: 'EUR', name: '欧元', symbol: '€', usdRate: 1.08, flag: '🇪🇺' },
  { code: 'GBP', name: '英镑', symbol: '£', usdRate: 1.27, flag: '🇬🇧' },
  { code: 'CNY', name: '人民币', symbol: '¥', usdRate: 0.14, flag: '🇨🇳' },
  { code: 'JPY', name: '日元', symbol: '¥', usdRate: 0.0067, flag: '🇯🇵' },
  { code: 'THB', name: '泰铢', symbol: '฿', usdRate: 0.028, flag: '🇹🇭' },
  { code: 'IDR', name: '印尼盾', symbol: 'Rp', usdRate: 0.000064, flag: '🇮🇩' },
  { code: 'VND', name: '越南盾', symbol: '₫', usdRate: 0.000042, flag: '🇻🇳' },
  { code: 'MYR', name: '马来西亚林吉特', symbol: 'RM', usdRate: 0.21, flag: '🇲🇾' },
  { code: 'SGD', name: '新加坡元', symbol: 'S$', usdRate: 0.74, flag: '🇸🇬' },
  { code: 'KRW', name: '韩元', symbol: '₩', usdRate: 0.00074, flag: '🇰🇷' },
  { code: 'TWD', name: '新台币', symbol: 'NT$', usdRate: 0.031, flag: '🇹🇼' },
  { code: 'MXN', name: '墨西哥比索', symbol: '$', usdRate: 0.059, flag: '🇲🇽' },
  { code: 'BRL', name: '巴西雷亚尔', symbol: 'R$', usdRate: 0.20, flag: '🇧🇷' },
  { code: 'ARS', name: '阿根廷比索', symbol: '$', usdRate: 0.0011, flag: '🇦🇷' },
  { code: 'COP', name: '哥伦比亚比索', symbol: '$', usdRate: 0.00026, flag: '🇨🇴' },
  { code: 'ZAR', name: '南非兰特', symbol: 'R', usdRate: 0.056, flag: '🇿🇦' },
  { code: 'TRY', name: '土耳其里拉', symbol: '₺', usdRate: 0.029, flag: '🇹🇷' },
  { code: 'AED', name: '迪拉姆', symbol: 'د.إ', usdRate: 0.27, flag: '🇦🇪' },
  { code: 'GEL', name: '格鲁吉亚拉里', symbol: '₾', usdRate: 0.37, flag: '🇬🇪' },
];

export function getCurrency(code: string): Currency | undefined {
  return CURRENCIES.find(c => c.code === code);
}

export function convertToUSD(amount: number, currencyCode: string): number {
  const currency = getCurrency(currencyCode);
  if (!currency) return amount;
  return amount * currency.usdRate;
}

export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = getCurrency(currencyCode);
  const symbol = currency?.symbol || currencyCode;
  return `${symbol}${amount.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`;
}

export const INITIAL_TXS: FinanceTx[] = [
  {
    id: 'tx1',
    date: '2026-06-01',
    type: 'income',
    amount: 4500,
    currency: 'USD',
    category: '薪资',
    notes: '6月远程工作薪资',
  },
  {
    id: 'tx2',
    date: '2026-06-03',
    type: 'expense',
    amount: 18000,
    currency: 'THB',
    category: '住宿',
    cityId: 'chiang-mai',
    notes: '清迈公寓月租',
  },
  {
    id: 'tx3',
    date: '2026-06-05',
    type: 'expense',
    amount: 3500,
    currency: 'THB',
    category: '餐饮',
    cityId: 'chiang-mai',
    notes: '本周餐饮',
  },
  {
    id: 'tx4',
    date: '2026-06-08',
    type: 'expense',
    amount: 499,
    currency: 'THB',
    category: '工作空间',
    cityId: 'chiang-mai',
    notes: 'Punspace月费',
  },
  {
    id: 'tx5',
    date: '2026-06-10',
    type: 'expense',
    amount: 8500,
    currency: 'THB',
    category: '交通',
    notes: '清迈→巴厘岛单程机票',
  },
  {
    id: 'tx6',
    date: '2026-06-12',
    type: 'income',
    amount: 1200,
    currency: 'EUR',
    category: '自由职业',
    notes: '设计项目尾款',
  },
  {
    id: 'tx7',
    date: '2026-06-15',
    type: 'expense',
    amount: 2000,
    currency: 'CNY',
    category: '订阅',
    notes: '各类SaaS工具年费',
  },
];
