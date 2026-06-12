import { CURRENCIES } from '@/data/currencies';
import type { Currency } from '@/types';

export function getCurrency(code: string): Currency | undefined {
  return CURRENCIES.find(c => c.code === code);
}

export function convertToUSD(amount: number, currencyCode: string): number {
  const currency = getCurrency(currencyCode);
  if (!currency) return amount;
  return amount * currency.usdRate;
}

export function convertCurrency(amount: number, fromCode: string, toCode: string): number {
  const fromCurrency = getCurrency(fromCode);
  const toCurrency = getCurrency(toCode);
  if (!fromCurrency || !toCurrency) return amount;
  const usdAmount = amount * fromCurrency.usdRate;
  return usdAmount / toCurrency.usdRate;
}

export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = getCurrency(currencyCode);
  const symbol = currency?.symbol || currencyCode;
  return `${symbol}${amount.toLocaleString('zh-CN', { maximumFractionDigits: 2, minimumFractionDigits: 0 })}`;
}

export function formatUSD(amount: number): string {
  return formatCurrency(amount, 'USD');
}
