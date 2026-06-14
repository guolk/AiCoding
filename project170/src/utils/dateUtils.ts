export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDaysBetween(dateStr1: string, dateStr2: string): number {
  if (!dateStr1 || !dateStr2) return 0;
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function isInCurrentYear(dateStr: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr).getFullYear() === getCurrentYear();
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getNowISO(): string {
  return new Date().toISOString();
}

export function formatCurrency(amount?: number, currency: string = 'CNY'): string {
  if (amount === undefined || amount === null) return '-';
  const symbol = currency === 'USD' ? '$' : '￥';
  return `${symbol}${amount.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`;
}

export function formatWeight(g?: number): string {
  if (g === undefined || g === null) return '-';
  if (g >= 1000) return `${(g / 1000).toFixed(2)} kg`;
  return `${g.toFixed(1)} g`;
}
