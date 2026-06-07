export function formatCurrency(amount: number, currency: string = 'CNY'): string {
  try {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function formatPercent(value: number): string {
  try {
    return new Intl.NumberFormat('zh-CN', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (error) {
    console.error('Error formatting percent:', error);
    return `${(value * 100).toFixed(2)}%`;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  try {
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  } catch (error) {
    console.error('Error formatting file size:', error);
    return `${bytes} B`;
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length === 0) return '';
  if (text.length <= maxLength) return text;

  return `${text.slice(0, maxLength)}...`;
}

export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart1 = Math.random().toString(36).substring(2, 10);
  const randomPart2 = Math.random().toString(36).substring(2, 6);
  return `${timestamp}-${randomPart1}-${randomPart2}`;
}
