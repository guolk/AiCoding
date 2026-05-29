import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(dateStr: string, format: 'YYYY-MM-DD' | 'MM月DD日' = 'MM月DD日'): string {
  const date = new Date(dateStr);
  
  if (format === 'YYYY-MM-DD') {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } else {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  }
}

export function formatPercent(value: number, decimalPlaces: number = 1): string {
  return `${value.toFixed(decimalPlaces)}%`;
}
