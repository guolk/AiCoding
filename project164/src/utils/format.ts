export const formatCurrency = (
  amount: number,
  currency: string = "USD",
  locale: string = "zh-CN"
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
};

export const formatNumber = (
  num: number,
  minimumFractionDigits: number = 0,
  maximumFractionDigits: number = 2
): string => {
  return num.toLocaleString("zh-CN", {
    minimumFractionDigits,
    maximumFractionDigits,
  });
};

export const formatPercent = (percent: number): string => {
  return `${percent.toFixed(0)}%`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export const capitalizeFirst = (text: string): string => {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
};
